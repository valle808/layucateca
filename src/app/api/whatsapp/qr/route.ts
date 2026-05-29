import { NextResponse } from "next/server";
import { getWaManager } from "@/lib/whatsapp-manager";

export const dynamic = "force-dynamic";

export async function GET() {
  const manager = getWaManager();
  const state = manager.getState();

  if (!state.qrBase64) {
    return NextResponse.json({ qr: null, status: state.status });
  }

  return NextResponse.json({
    qr: state.qrBase64,
    status: state.status,
  });
}
