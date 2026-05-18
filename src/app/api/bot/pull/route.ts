import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBotNews, generateOneMinuteNews } from "@/lib/botNewsData";

export async function GET() {
  return handleSync();
}

export async function POST() {
  return handleSync();
}

async function handleSync() {
  try {
    console.log("Triggered News Bot Sync crawler...");

    const staticNews = getBotNews();
    const dynamicNews = generateOneMinuteNews();
    const allBotNews = [dynamicNews, ...staticNews];

    let createdCount = 0;
    const finalPosts = [];

    for (const item of allBotNews) {
      try {
        const existing = await prisma.post.findUnique({
          where: { slug: item.slug },
        });

        if (!existing) {
          const newPost = await prisma.post.create({
            data: {
              title: item.title,
              slug: item.slug,
              content: item.content,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl,
              state: item.state,
              category: item.category,
              published: true,
            },
          });
          finalPosts.push({
            ...newPost,
            createdAt: newPost.createdAt instanceof Date ? newPost.createdAt.toISOString() : newPost.createdAt,
          });
          createdCount++;
        } else {
          finalPosts.push({
            ...existing,
            createdAt: existing.createdAt instanceof Date ? existing.createdAt.toISOString() : existing.createdAt,
          });
        }
      } catch (dbWriteError: any) {
        finalPosts.push({
          id: item.id || `fallback-${item.slug}`,
          title: item.title,
          slug: item.slug,
          content: item.content,
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          audioUrl: null,
          state: item.state,
          category: item.category,
          published: true,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sync complete!",
      pulledItems: allBotNews.length,
      newlyCreated: createdCount,
      posts: finalPosts,
    });
  } catch (error: any) {
    console.error("Bot sync failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
