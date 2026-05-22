import { prisma } from "./prisma";

export type TelemetryType = "USER_ACTION" | "AGENT_ACTION" | "ERROR" | "DATA_MUTATION";
export type TelemetryStatus = "SUCCESS" | "FAILED" | "INFO";

interface TelemetryPayload {
  type: TelemetryType;
  event: string;
  details: Record<string, any>;
  userId?: string;
  agentId?: string;
  path?: string;
  status: TelemetryStatus;
}

export async function logTelemetry(payload: TelemetryPayload) {
  try {
    const data = {
      type: payload.type,
      event: payload.event,
      details: JSON.stringify(payload.details),
      userId: payload.userId || null,
      agentId: payload.agentId || null,
      path: payload.path || null,
      status: payload.status,
    };
    
    // Log to DB
    const record = await prisma.telemetry.create({ data });
    
    // Silent console log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Telemetry] [${payload.type}] [${payload.status}] ${payload.event} - path: ${payload.path}`);
    }
    
    return record;
  } catch (error) {
    console.error("[Telemetry Log Error]", error);
  }
}
