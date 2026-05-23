import { supabase } from "@/lib/supabaseClient";
import SolucionesDigitalesClient from "@/components/SolucionesDigitalesClient";

export const metadata = {
  title: "Soluciones Digitales y Portafolio — La Yucateca || Digital Solutions & Portfolio — La Yucateca",
  description: "Desarrollo de software a medida, diseño web profesional y nuestro portafolio de proyectos de vanguardia. || Custom software development, professional web design, and our portfolio of cutting-edge projects.",
};

export const revalidate = 60;

export default async function SolucionesDigitalesPage() {
  let portfolioItems: any[] = [];
  try {
    const { data, error } = await supabase
      .from('PortfolioItem')
      .select('*')
      .eq('published', true)
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }
    portfolioItems = data || [];
  } catch (error) {
    console.error("DB error in SolucionesDigitalesPage:", error);
  }

  // Serialize dates to prevent hydration warnings/errors
  const serializedItems = portfolioItems.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
  }));

  return <SolucionesDigitalesClient portfolioItems={serializedItems} />;
}
