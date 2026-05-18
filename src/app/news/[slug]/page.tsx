import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsArticleClient from "@/components/NewsArticleClient";
import { getBotNewsBySlug } from "@/lib/botNewsData";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  let post = null;
  try {
    post = await prisma.post.findUnique({ where: { slug } });
  } catch (e) {
    // DB error fallback
  }
  if (!post) {
    post = getBotNewsBySlug(slug) as any;
  }
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title.split(" || ")[0]} — La Yucateca`,
    description: post.content.split(" || ")[0].slice(0, 160),
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  let post = null;
  try {
    post = await prisma.post.findUnique({ where: { slug, published: true } });
  } catch (e) {
    // DB error fallback
  }

  let serializedPost: any = null;

  if (post) {
    serializedPost = {
      ...post,
      createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    };
  } else {
    const botItem = getBotNewsBySlug(slug);
    if (botItem) {
      serializedPost = {
        ...botItem,
        videoUrl: botItem.videoUrl || null,
        audioUrl: botItem.audioUrl || null,
      };
    }
  }

  if (!serializedPost) notFound();

  return <NewsArticleClient post={serializedPost} />;
}
