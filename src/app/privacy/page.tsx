import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y manejo de datos de La Yucateca.",
};

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return <PrivacyClient />;
}
