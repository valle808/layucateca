import { Metadata } from "next";
import MunaClient from "./MunaClient";

export const metadata: Metadata = {
  title: "Muna AI",
  description: "Muna, la Inteligencia Autónoma de La Yucateca. Guía y asistencia personalizada con inteligencia artificial.",
};

// Force dynamic rendering to prevent prerendering issues with Client Components using localStorage/context
export const dynamic = "force-dynamic";

export default function MunaPage() {
  return <MunaClient />;
}
