import { NextResponse } from "next/server";
import { getWaManager } from "@/lib/whatsapp-manager";

export const dynamic = "force-dynamic";

export async function GET() {
  const manager = getWaManager();
  const state = manager.getState();
  return NextResponse.json({
    status: state.status,
    phone: state.phone,
    name: state.name,
    contactCount: state.contacts.length,
    groupCount: state.groups.length,
    error: state.error,
    qrAvailable: !!state.qrBase64,
  });
}
