import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let rooms;
    if (type) {
      rooms = await (prisma as any).chatRoom.findMany({
        where: { type },
        orderBy: { createdAt: "desc" },
      });
    } else {
      rooms = await (prisma as any).chatRoom.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    // Seed default rooms if none exist
    if (rooms.length === 0) {
      const defaults = [
        { name: "Sala General 🌐", slug: "general", type: "PUBLIC" },
        { name: "Mérida Al Día 🏢", slug: "merida", type: "REGIONAL", state: "Yucatán", city: "Mérida" },
        { name: "Valladolid Conecta ⛪", slug: "valladolid", type: "REGIONAL", state: "Yucatán", city: "Valladolid" },
      ];

      for (const item of defaults) {
        await (prisma as any).chatRoom.create({ data: item });
      }

      rooms = await (prisma as any).chatRoom.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("[CHAT ROOMS GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, type, state, city } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "El nombre de la sala es obligatorio." }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Math.floor(Math.random() * 10000);

    const room = await (prisma as any).chatRoom.create({
      data: {
        name,
        slug,
        type: type || "CUSTOM",
        state: state || null,
        city: city || null,
      },
    });

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (error) {
    console.error("[CHAT ROOMS POST ERROR]", error);
    return NextResponse.json({ error: "Failed to create chat room" }, { status: 500 });
  }
}
