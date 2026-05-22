import { prisma } from "@/lib/prisma";
import TelemetryDashboardClient from "./TelemetryDashboardClient";

export const metadata = {
  title: "Admin Observability & AI Telemetry Dashboard || Panel de Observabilidad y Telemetría IA",
  description: "Real-time AI agent orchestration metrics, user interactions, and telemetry logs for La Yucateca.",
};

export const dynamic = "force-dynamic";

export default async function TelemetryDashboardPage() {
  // Fetch initial telemetry records
  const initialLogs = await prisma.telemetry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Calculate some initial counts/KPIs
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

  const serializedLogs = initialLogs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <TelemetryDashboardClient
      initialLogs={serializedLogs}
      initialKPIs={{
        totalLogs,
        errorCount,
        userActions,
        agentActions,
      }}
    />
  );
}
