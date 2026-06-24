import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";


export const metadata = {
  title: "La Yucateca — Portal de Noticias y Comunidad || News and Community Portal",
  description:
    "Tu fuente principal de noticias locales y comunidad. || Your premier source for local news and community.",
};

export default async function HomePage() {
  const recentPosts = await prisma.post.findMany({
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
      featuredPortfolio={[]}
    />
  );
}
