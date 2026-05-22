import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch initial telemetry records
    const logs = await prisma.telemetry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Calculate counts/KPIs
    const totalLogs = await prisma.telemetry.count();
    const errorCount = await prisma.telemetry.count({
      where: { status: "FAILED" },
    });
    const userActions = await prisma.telemetry.count({
      where: { type: "USER_ACTION" },
    });
    const agentActions = await prisma.telemetry.count({
      where: { type: "AGENT_ACTION" },
    });

    const serializedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      logs: serializedLogs,
      kpis: {
        totalLogs,
        errorCount,
        userActions,
        agentActions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
