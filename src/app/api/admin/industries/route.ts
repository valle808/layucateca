import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Fetch industries with search and filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const active = searchParams.get("active");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (active !== null && active !== "") {
      where.active = active === "true";
    }

    const industries = await prisma.industry.findMany({
      where,
      orderBy: [{ active: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    const stats = {
      total: await prisma.industry.count(),
      active: await prisma.industry.count({ where: { active: true } }),
    };

    return NextResponse.json({ industries, stats });
  } catch (error: any) {
    console.error("Industries GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new industry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^\w-]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.industry.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Industry already exists" }, { status: 400 });
    }

    const industry = await prisma.industry.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || "",
        icon: icon || "briefcase",
        active: active !== false,
        order: (await prisma.industry.count()) + 1,
      },
    });

    return NextResponse.json({ industry }, { status: 201 });
  } catch (error: any) {
    console.error("Industries POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update industry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon, active, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.industry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Industry not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name.trim();
      const slug = name
        .toLowerCase()
        .replace(/[^\w-]+/g, "-")
        .replace(/^-|-$/g, "");
      const duplicate = await prisma.industry.findFirst({
        where: { slug, id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Name already in use" }, { status: 400 });
      }
      updateData.slug = slug;
    }
    if (description !== undefined) updateData.description = description.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (active !== undefined) updateData.active = active;
    if (order !== undefined) updateData.order = order;

    const industry = await prisma.industry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ industry });
  } catch (error: any) {
    console.error("Industries PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete industry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.industry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Industries DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
