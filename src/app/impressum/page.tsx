"use client";

import { useLanguage } from "@/components/LanguageContext";
import Link from "next/link";

export default function ImpressumPage() {
  const { t } = useLanguage();

  return (
    <div style={{ padding: "120px 24px", maxWidth: "800px", margin: "0 auto", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
        {t("Aviso Legal / Impressum", "Legal Notice / Impressum", "Aviso Legal / Impressum")}
      </h1>

      <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "24px" }}>
        
        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Información de la empresa", "Company Information", "Información de la empresa")}
        </h2>
        <p>
          <strong>La Yucateca News & Web Design Portal</strong><br/>
          Mérida, Yucatán, México<br/>
          Email: <a href="mailto:contact@layucateca.com" style={{ color: "var(--accent-primary)", textDecoration: "underline" }}>contact@layucateca.com</a>
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Representante Legal", "Legal Representative", "Representante Legal")}
        </h2>
        <p>
          {t("Representado por la junta directiva y editores en jefe.", "Represented by the board of directors and editors-in-chief.", "Representado por la junta directiva y editores en jefe.")}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Responsabilidad por el contenido", "Liability for Content", "Responsabilidad por el contenido")}
        </h2>
        <p>
          {t(
            "Como proveedores de servicios, somos responsables del contenido propio de estas páginas según las leyes generales. Sin embargo, no estamos obligados a monitorear la información transmitida o almacenada de terceros, ni a investigar circunstancias que indiquen actividad ilegal. Las obligaciones de eliminar o bloquear el uso de información según las leyes generales permanecen inalteradas.",
            "As service providers, we are liable for own contents of these websites according to general laws. However, we are not obligated to monitor transmitted or stored external information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general laws remain unaffected.",
            "Como proveedores de servicios, somos responsables del contenido propio de estas páginas según las leyes generales."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Responsabilidad por los enlaces", "Liability for Links", "Responsabilidad por los enlaces")}
        </h2>
        <p>
          {t(
            "Nuestra oferta contiene enlaces a sitios web externos de terceros, sobre cuyo contenido no tenemos influencia. Por lo tanto, no podemos asumir ninguna responsabilidad por estos contenidos externos. El respectivo proveedor u operador de las páginas es siempre responsable del contenido de las páginas enlazadas.",
            "Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages.",
            "Nuestra oferta contiene enlaces a sitios web externos de terceros, sobre cuyo contenido no tenemos influencia."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Derechos de Autor", "Copyright", "Derechos de Autor")}
        </h2>
        <p>
          {t(
            "El contenido y las obras creadas por los operadores del sitio en estas páginas están sujetos a la ley de derechos de autor. La duplicación, procesamiento, distribución y cualquier tipo de explotación fuera de los límites de la ley de derechos de autor requieren el consentimiento por escrito del respectivo autor o creador.",
            "The content and works created by the site operators on these pages are subject to copyright law. Duplication, processing, distribution, and any kind of exploitation outside the limits of copyright law require the written consent of the respective author or creator.",
            "El contenido y las obras creadas por los operadores del sitio en estas páginas están sujetos a la ley de derechos de autor."
          )}
        </p>
      </div>
    </div>
  );
}
