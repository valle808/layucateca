import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let alerts = await (prisma as any).emergencyAlert.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    // Seed default emergency warning alert if empty
    if (alerts.length === 0) {
      const defaultAlert = await (prisma as any).emergencyAlert.create({
        data: {
          title: "⚠️ AVISO METEOROLÓGICO: ALERTA DE ONDA DE CALOR EXTREMA",
          message: "Se registran temperaturas de hasta 43°C en la península de Yucatán. Evite exponerse directamente al sol entre 11 AM y 4 PM.",
          level: "WARNING",
          location: "Yucatán",
          active: true,
        },
      });
      alerts = [defaultAlert];
    }

    return NextResponse.json({ success: true, alerts });
  } catch (error) {
    console.error("[ALERTS GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
