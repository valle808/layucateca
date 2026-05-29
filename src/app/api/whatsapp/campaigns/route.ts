import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWaManager } from "@/lib/whatsapp-manager";

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
    // Fire and forget — send messages in background
    sendCampaignMessages(campaign.id, recipients, message, mediaType, mediaUrl)
      .catch(console.error);
  }

  return NextResponse.json(campaign, { status: 201 });
}

// Background campaign sending
async function sendCampaignMessages(
  campaignId: string,
  recipients: string[],
  message: string,
  mediaType?: string,
  mediaUrl?: string
) {
  const manager = getWaManager();
  let sent = 0;
  let failed = 0;

  for (const jid of recipients) {
    try {
      const msgType = mediaType as any ?? "text";
      let mediaData: string | undefined;

      if (mediaUrl && mediaType && mediaType !== "text") {
        // Fetch media and convert to base64
        const res = await fetch(mediaUrl);
        const buf = await res.arrayBuffer();
        mediaData = Buffer.from(buf).toString("base64");
      }

      await manager.sendMessage(jid, {
        type: mediaData ? msgType : "text",
        text: message,
        mediaData,
        mimetype: mediaType === "image" ? "image/jpeg"
          : mediaType === "video" ? "video/mp4"
          : mediaType === "audio" ? "audio/ogg"
          : undefined,
      });

      sent++;
      await new Promise((r) => setTimeout(r, 1500)); // Rate limit: 1 msg/1.5s
    } catch (_) {
      failed++;
    }

    // Update progress every 10 messages
    if ((sent + failed) % 10 === 0) {
      await prisma.waCampaign.update({
        where: { id: campaignId },
        data: { sentCount: sent, failedCount: failed },
      });
    }
  }

  await prisma.waCampaign.update({
    where: { id: campaignId },
    data: {
      status: failed === recipients.length ? "FAILED" : "COMPLETED",
      sentCount: sent,
      failedCount: failed,
      completedAt: new Date(),
    },
  });
}
