import { prisma } from "@/lib/prisma";
import SolucionesDigitalesClient from "@/components/SolucionesDigitalesClient";

export const metadata = {
  title: "Soluciones Digitales y Portafolio — La Yucateca || Digital Solutions & Portfolio — La Yucateca",
  description: "Desarrollo de software a medida, diseño web profesional y nuestro portafolio de proyectos de vanguardia. || Custom software development, professional web design, and our portfolio of cutting-edge projects.",
};

export default async function SolucionesDigitalesPage() {
  const portfolioItems = await prisma.portfolioItem.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates to prevent hydration warnings/errors
  const serializedItems = portfolioItems.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return <SolucionesDigitalesClient portfolioItems={serializedItems} />;
}
