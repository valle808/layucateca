import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await (prisma as any).marketplaceItem.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[MERCADITO GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, price, location, imageUrl, category, authorId } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const item = await (prisma as any).marketplaceItem.create({
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        location: location || "Mérida, Yucatán",
        imageUrl: imageUrl || null,
        category: category || "General",
        published: true,
        authorId: authorId || null,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("[MERCADITO POST ERROR]", error);
    return NextResponse.json({ error: "Failed to create mercadito item" }, { status: 500 });
  }
}
