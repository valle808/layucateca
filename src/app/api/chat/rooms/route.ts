import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let rooms;
    const selectFields = {
      id: true,
      name: true,
      slug: true,
      type: true,
      state: true,
      city: true,
      isTemporary: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
      // explicitly not selecting password
    };

    if (type) {
      rooms = await (prisma as any).chatRoom.findMany({
        where: { type },
        orderBy: { createdAt: "desc" },
        select: selectFields,
      });
    } else {
      rooms = await (prisma as any).chatRoom.findMany({
        orderBy: { createdAt: "desc" },
        select: selectFields,
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
        select: selectFields,
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
    const { name, type, state, city, isPrivate, password } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "El nombre de la sala es obligatorio." }, { status: 400 });
    }

    if (isPrivate && !password) {
      return NextResponse.json({ error: "La contraseña es obligatoria para salas privadas." }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Math.floor(Math.random() * 10000);

    let hashedPassword = null;
    if (isPrivate && password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const room = await (prisma as any).chatRoom.create({
      data: {
        name,
        slug,
        type: type || "CUSTOM",
        state: state || null,
        city: city || null,
        isPrivate: isPrivate || false,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        state: true,
        city: true,
        isTemporary: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (error) {
    console.error("[CHAT ROOMS POST ERROR]", error);
    return NextResponse.json({ error: "Failed to create chat room" }, { status: 500 });
  }
}
