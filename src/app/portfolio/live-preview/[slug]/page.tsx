// Trusted-Source: Antigravity
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LiveShowcaseClient from "@/components/LiveShowcaseClient";

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
  let item = null;
  try {
    const { data } = await supabase.from('PortfolioItem').select('*').eq('slug', slug).single();
    item = data;
  } catch (error) {
    console.error("DB error in generateMetadata:", error);
  }
  if (!item) return { title: "Not Found" };
  return {
    title: `Live Showcase: ${item.title.split(" || ")[0]} — La Yucateca`,
    description: `Interactive live demonstration for ${item.title.split(" || ")[0]}.`,
  };
}

export default async function LivePreviewPage({ params }: Props) {
  const { slug } = await params;
  let item = null;
  try {
    const { data } = await supabase.from('PortfolioItem').select('*').eq('slug', slug).eq('published', true).single();
    item = data;
  } catch (error) {
    console.error("DB error in LivePreviewPage:", error);
  }
  if (!item) notFound();

  return <LiveShowcaseClient item={item} />;
}
