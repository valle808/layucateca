import { prisma } from "@/lib/prisma";
import PortfolioClient from "@/components/PortfolioClient";

export const metadata = {
  title: "Portafolio — La Yucateca Diseño Web || Portfolio — La Yucateca Web Design",
  description: "Explora nuestro portafolio de diseño web a medida. || Explore our custom web design portfolio.",
};

export default async function PortfolioPage() {
  const items = await prisma.portfolioItem.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return <PortfolioClient items={items} />;
}
