import { supabase } from "@/lib/supabaseClient";
import HomeClient from "@/components/HomeClient";

export const metadata = {
  title: "La Yucateca — Noticias y Portal de Diseño Web || La Yucateca — News & Web Design Portal",
  description:
    "Tu fuente principal de noticias y servicios profesionales de diseño web a medida. || Your premier source for news and professional bespoke web design services.",
};

// Revalidate this page every 60 seconds (ISR)
export const revalidate = 60;

export default async function HomePage() {
  let recentPosts: any[] = [];
  try {
    const { data, error } = await supabase
      .from('Post')
      .select('*')
      .eq('published', true)
      .order('createdAt', { ascending: false })
      .limit(3);

    if (error) {
      throw error;
    }
    recentPosts = data || [];
  } catch (error) {
    console.error("Failed to fetch posts from DB:", error);
    // Return empty fallback array
  }

  // Serialize dates to prevent hydration warnings/errors with custom date classes
  const serializedPosts = recentPosts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt).toISOString(),
  }));

  return (
    <HomeClient
      recentPosts={serializedPosts}
      featuredPortfolio={[]}
    />
  );
}
