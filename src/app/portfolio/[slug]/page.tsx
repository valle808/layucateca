import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PortfolioItemClient from "@/components/PortfolioItemClient";

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
    title: `${item.title.split(" || ")[0]} — La Yucateca`,
    description: item.description.split(" || ")[0],
  };
}

export default async function PortfolioItemPage({ params }: Props) {
  const { slug } = await params;
  let item = null;
  try {
    const { data } = await supabase.from('PortfolioItem').select('*').eq('slug', slug).eq('published', true).single();
    item = data;
  } catch (error) {
    console.error("DB error in PortfolioItemPage:", error);
  }
  if (!item) notFound();

  return <PortfolioItemClient item={item} />;
}
