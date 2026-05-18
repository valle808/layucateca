import { prisma } from "@/lib/prisma";
import NewsClient from "@/components/NewsClient";

export const metadata = {
  title: "Noticias — La Yucateca || News — La Yucateca",
  description: "Mantente al día con las últimas noticias de La Yucateca. || Stay up to date with the latest news.",
};

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return <NewsClient posts={serializedPosts} />;
}
