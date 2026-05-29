import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });

    // Serialize dates for secure client parsing
    const serializedPosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
    }));

    return NextResponse.json(serializedPosts);
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
