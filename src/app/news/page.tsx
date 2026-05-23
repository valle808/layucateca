import { supabase } from "@/lib/supabaseClient";
import NewsClient from "@/components/NewsClient";

export const metadata = {
  title: "Noticias — La Yucateca || News — La Yucateca",
  description: "Mantente al día con las últimas noticias de La Yucateca. || Stay up to date with the latest news.",
};

export const revalidate = 60;

export default async function NewsPage() {
  let posts: any[] = [];
  try {
    const { data, error } = await supabase
      .from('Post')
      .select('*')
      .eq('published', true)
      .order('createdAt', { ascending: false });
    
    if (error) {
      throw error;
    }
    posts = data || [];
  } catch (error) {
    console.error("DB error in NewsPage:", error);
  }

  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt).toISOString(),
  }));

  return <NewsClient posts={serializedPosts} />;
}
