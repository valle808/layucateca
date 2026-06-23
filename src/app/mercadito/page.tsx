import { Metadata } from "next";
import MercaditoClient from "./MercaditoClient";

export const metadata: Metadata = {
  title: "Mercadito Local",
  description: "Compra, vende y descubre servicios locales en la península. Desde artículos usados hasta eventos culturales increíbles.",
};

// Force dynamic rendering to prevent prerendering issues with Client Components using localStorage/context
export const dynamic = "force-dynamic";

export default function MercaditoPage() {
  return <MercaditoClient />;
}
