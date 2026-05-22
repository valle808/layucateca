import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logTelemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await (prisma as any).marketplaceItem.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("[MARKETPLACE GET ERROR]", error);
    await logTelemetry({
      type: "ERROR",
      event: "marketplace_items_fetch_error",
      details: { error: error.message },
      path: "/api/marketplace",
      status: "FAILED",
    });
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, price, location, imageUrl, category, authorId } = await req.json();

    await logTelemetry({
      type: "USER_ACTION",
      event: "marketplace_item_creation_attempt",
      details: { title, price, category, location },
      userId: authorId || undefined,
      path: "/api/marketplace",
      status: "INFO",
    });

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

    await logTelemetry({
      type: "DATA_MUTATION",
      event: "marketplace_item_created",
      details: { id: item.id, title: item.title, category: item.category },
      userId: authorId || undefined,
      path: "/api/marketplace",
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    console.error("[MARKETPLACE POST ERROR]", error);
    await logTelemetry({
      type: "ERROR",
      event: "marketplace_item_creation_error",
      details: { error: error.message },
      path: "/api/marketplace",
      status: "FAILED",
    });
    return NextResponse.json({ error: "Failed to create marketplace item" }, { status: 500 });
  }
}
