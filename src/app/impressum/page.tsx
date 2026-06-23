import { Metadata } from "next";
import ImpressumClient from "./ImpressumClient";

export const metadata: Metadata = {
  title: "Aviso Legal (Impressum)",
  description: "Aviso legal e información corporativa de La Yucateca.",
};

export const dynamic = "force-dynamic";

export default function ImpressumPage() {
  return <ImpressumClient />;
}
