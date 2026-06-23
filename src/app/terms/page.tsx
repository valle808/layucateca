import { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de los servicios de La Yucateca.",
};

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return <TermsClient />;
}
