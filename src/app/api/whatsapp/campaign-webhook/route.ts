import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/whatsapp/campaign-webhook
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { campaignId, sentCount, failedCount, status } = body;

  if (!campaignId) {
    return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
  }

  await prisma.waCampaign.update({
    where: { id: campaignId },
    data: {
      sentCount,
      failedCount,
      status,
      completedAt: status === "COMPLETED" || status === "FAILED" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
