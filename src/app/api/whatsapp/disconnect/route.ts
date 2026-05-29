import { NextResponse } from "next/server";
import { getWaManager } from "@/lib/whatsapp-manager";

export const dynamic = "force-dynamic";

export async function POST() {
  const manager = getWaManager();
  await manager.disconnect();
  return NextResponse.json({ ok: true, message: "Disconnected" });
}
