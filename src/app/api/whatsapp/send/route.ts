import { NextRequest, NextResponse } from "next/server";
import { getWaManager } from "@/lib/whatsapp-manager";

export const dynamic = "force-dynamic";

// POST /api/whatsapp/send — send a single message directly
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { jid, text, mediaType, mediaData, mimetype, fileName } = body;

  if (!jid) {
    return NextResponse.json({ error: "jid required" }, { status: 400 });
  }
  if (!text && !mediaData) {
    return NextResponse.json(
      { error: "text or mediaData required" },
      { status: 400 }
    );
  }

  const manager = getWaManager();

  if (!manager.isConnected()) {
    return NextResponse.json(
      { error: "WhatsApp not connected" },
      { status: 503 }
    );
  }

  const success = await manager.sendMessage(jid, {
    type: mediaType ?? "text",
    text,
    mediaData,
    mimetype,
    fileName,
  });

  return NextResponse.json({ ok: success });
}
