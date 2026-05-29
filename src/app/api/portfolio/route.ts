import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.portfolioItem.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, slug, description, imageUrl, liveUrl, price, published } = body;
  const item = await prisma.portfolioItem.create({
    data: { title, slug, description, imageUrl, liveUrl, price, published: published ?? false },
  });
  return NextResponse.json(item, { status: 201 });
}
