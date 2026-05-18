import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const metadata = {
  title: "La Yucateca — Noticias y Portal de Diseño Web || La Yucateca — News & Web Design Portal",
  description:
    "Tu fuente principal de noticias y servicios profesionales de diseño web a medida. || Your premier source for news and professional bespoke web design services.",
};

export default async function HomePage() {
  const recentPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const featuredPortfolio = await prisma.portfolioItem.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Serialize dates to prevent hydration warnings/errors with custom date classes
  const serializedPosts = recentPosts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <HomeClient
      recentPosts={serializedPosts}
      featuredPortfolio={featuredPortfolio}
    />
  );
}
