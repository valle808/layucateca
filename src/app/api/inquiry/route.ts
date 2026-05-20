import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, phone, service, message, budget } = await req.json();

    if (!name || !email || !service || !message) {
      return NextResponse.json(
        { error: "Los campos obligatorios están incompletos." },
        { status: 400 }
      );
    }

    const inquiry = await (prisma as any).inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        service,
        message,
        budget: budget || null,
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("[INQUIRY API ERROR]", error);
    return NextResponse.json(
      { error: "Ocurrió un error al enviar tu solicitud de cotización." },
      { status: 500 }
    );
  }
}
