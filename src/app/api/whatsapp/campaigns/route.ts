import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/whatsapp/campaigns
export async function GET() {
  const campaigns = await prisma.waCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { template: { select: { name: true, category: true } } },
  });
  return NextResponse.json(campaigns);
}

// POST /api/whatsapp/campaigns — create and optionally send campaign
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    templateId,
    message,
    mediaUrl,
    mediaType,
    recipients, // array of JIDs
    recipientType,
    sendNow,
    scheduledAt,
  } = body;

  if (!name || !message) {
    return NextResponse.json(
      { error: "name and message are required" },
      { status: 400 }
    );
  }
  if (!recipients || recipients.length === 0) {
    return NextResponse.json(
      { error: "At least one recipient required" },
      { status: 400 }
    );
  }

  const campaign = await prisma.waCampaign.create({
    data: {
      name,
      templateId: templateId ?? null,
      message,
      mediaUrl: mediaUrl ?? null,
      mediaType: mediaType ?? null,
      recipients: JSON.stringify(recipients),
      recipientType: recipientType ?? "contacts",
      status: sendNow ? "RUNNING" : scheduledAt ? "SCHEDULED" : "DRAFT",
      totalCount: recipients.length,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      startedAt: sendNow ? new Date() : null,
    },
  });

  if (sendNow) {
    const serviceUrl = process.env.WHATSAPP_SERVICE_URL || "http://localhost:4000";
    const webhookUrl = `${req.nextUrl.origin}/api/whatsapp/campaign-webhook`;
    
    // Ping microservice to start background sending
    fetch(`${serviceUrl}/campaign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: campaign.id,
        recipients,
        message: {
          type: mediaType ?? "text",
          text: message,
          mediaUrl,
        },
        webhookUrl,
      })
    }).catch(console.error);
  }

  return NextResponse.json(campaign, { status: 201 });
}
