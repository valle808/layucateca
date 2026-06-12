import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Fetch admin links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");

    const where: any = {};
    if (category) where.category = category;
    if (active !== null && active !== "") {
      where.active = active === "true";
    }

    const links = await prisma.adminLink.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const categories = await prisma.adminLink.findMany({
      distinct: ["category"],
      select: { category: true },
    });

    return NextResponse.json({
      links,
      categories: categories.map((c) => c.category),
      stats: {
        total: await prisma.adminLink.count(),
        active: await prisma.adminLink.count({ where: { active: true } }),
      },
    });
  } catch (error: any) {
    console.error("Links GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, category, active } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!url || !url.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const maxOrder = await prisma.adminLink.aggregate({
      _max: { order: true },
    });

    const link = await prisma.adminLink.create({
      data: {
        title: title.trim(),
        url: url.trim(),
        category: category?.trim() || "general",
        active: active !== false,
        order: (maxOrder._max?.order || 0) + 1,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error: any) {
    console.error("Links POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update link
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, category, active, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.adminLink.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (url !== undefined) {
      try {
        new URL(url);
        updateData.url = url.trim();
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
    }
    if (category !== undefined) updateData.category = category.trim();
    if (active !== undefined) updateData.active = active;
    if (order !== undefined) updateData.order = order;

    const link = await prisma.adminLink.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ link });
  } catch (error: any) {
    console.error("Links PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.adminLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Links DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
