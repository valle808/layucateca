import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (post && (post as any).base64Image) {
      const cleanBase64 = (post as any).base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        status: 200,
      });
    }
  } catch (error) {
    console.error(`[IMAGE ROUTE] Error loading image for slug ${slug}:`, error);
  }

  // If post not found or missing image, return 404 JSON response
  return new NextResponse(JSON.stringify({ error: "Image not found" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
}
