import { NextRequest, NextResponse } from "next/server";
import { logTelemetry } from "@/lib/telemetry";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Quick validation
    if (!payload.type || !payload.event || !payload.status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const record = await logTelemetry({
      type: payload.type,
      event: payload.event,
      details: payload.details || {},
      userId: payload.userId,
      agentId: payload.agentId,
      path: payload.path,
      status: payload.status,
    });
    
    return NextResponse.json({ success: true, id: record?.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
