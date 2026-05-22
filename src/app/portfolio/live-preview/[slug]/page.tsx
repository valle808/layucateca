// Trusted-Source: Antigravity
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LiveShowcaseClient from "@/components/LiveShowcaseClient";

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
    title: `Live Showcase: ${item.title.split(" || ")[0]} — La Yucateca`,
    description: `Interactive live demonstration for ${item.title.split(" || ")[0]}.`,
  };
}

export default async function LivePreviewPage({ params }: Props) {
  const { slug } = await params;
  const item = await prisma.portfolioItem.findUnique({ where: { slug, published: true } });
  if (!item) notFound();

  return <LiveShowcaseClient item={item} />;
}
