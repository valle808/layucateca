"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div style={{ padding: "120px 24px", maxWidth: "800px", margin: "0 auto", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
        {t("Términos de Servicio", "Terms of Service", "Términos ti' Servicio")}
      </h1>

      <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "24px" }}>
        <p>
          {t(
            "Al acceder al sitio web en La Yucateca, usted acepta estar sujeto a estos términos de servicio, a todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.",
            "By accessing the website at La Yucateca, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Licencia de Uso", "Use License")}
        </h2>
        <p>
          {t(
            "Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de La Yucateca únicamente para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título.",
            "Permission is granted to temporarily download one copy of the materials (information or software) on La Yucateca's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Descargo de Responsabilidad", "Disclaimer")}
        </h2>
        <p>
          {t(
            "Los materiales en el sitio web de La Yucateca se proporcionan 'tal cual'. La Yucateca no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de propiedad intelectual u otra violación de derechos.",
            "The materials on La Yucateca's website are provided on an 'as is' basis. La Yucateca makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Limitaciones", "Limitations")}
        </h2>
        <p>
          {t(
            "En ningún caso La Yucateca o sus proveedores serán responsables de ningún daño (incluidos, entre otros, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surjan del uso o la imposibilidad de utilizar los materiales en el sitio web de La Yucateca.",
            "In no event shall La Yucateca or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on La Yucateca's website."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Modificaciones de los Términos", "Modifications")}
        </h2>
        <p>
          {t(
            "La Yucateca puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.",
            "La Yucateca may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service."
          )}
        </p>

        <p style={{ marginTop: "32px", fontSize: "0.9rem" }}>
          {t("Última actualización: ", "Last updated: ")} {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
