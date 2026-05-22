import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PortfolioItemClient from "@/components/PortfolioItemClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await prisma.portfolioItem.findUnique({ where: { slug } });
  if (!item) return { title: "Not Found" };
  return {
    title: `${item.title.split(" || ")[0]} — La Yucateca`,
    description: item.description.split(" || ")[0],
  };
}

export default async function PortfolioItemPage({ params }: Props) {
  const { slug } = await params;
  const item = await prisma.portfolioItem.findUnique({ where: { slug, published: true } });
  if (!item) notFound();

  return <PortfolioItemClient item={item} />;
}
