import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NewsArticleClient from "@/components/NewsArticleClient";
import { getBotNewsBySlug } from "@/lib/botNewsData";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  let post = null;
  try {
    const { data } = await supabase.from('Post').select('*').eq('slug', slug).single();
    post = data;
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
    const { data } = await supabase.from('Post').select('*').eq('slug', slug).eq('published', true).single();
    post = data;
  } catch (e) {
    // DB error fallback
  }

  let serializedPost: any = null;

  if (post) {
    serializedPost = {
      ...post,
      createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : post.createdAt,
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
