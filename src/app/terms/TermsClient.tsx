"use client";

import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "32px 36px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}

export default function TermsPage() {
  const { t } = useLanguage();

  const sections = [
    {
      emoji: "📜",
      title: t("Licencia de Uso", "Use License"),
      body: t(
        "Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de La Yucateca únicamente para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título.",
        "Permission is granted to temporarily download one copy of the materials (information or software) on La Yucateca's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
      ),
    },
    {
      emoji: "⚠️",
      title: t("Descargo de Responsabilidad", "Disclaimer"),
      body: t(
        "Los materiales en el sitio web de La Yucateca se proporcionan 'tal cual'. La Yucateca no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de propiedad intelectual u otra violación de derechos.",
        "The materials on La Yucateca's website are provided on an 'as is' basis. La Yucateca makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
      ),
    },
    {
      emoji: "🔒",
      title: t("Limitaciones", "Limitations"),
      body: t(
        "En ningún caso La Yucateca o sus proveedores serán responsables de ningún daño (incluidos, entre otros, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surjan del uso o la imposibilidad de utilizar los materiales en el sitio web de La Yucateca.",
        "In no event shall La Yucateca or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on La Yucateca's website."
      ),
    },
    {
      emoji: "🔄",
      title: t("Modificaciones de los Términos", "Modifications"),
      body: t(
        "La Yucateca puede revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.",
        "La Yucateca may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service."
      ),
    },
  ];

  return (
    <>
      <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Ambient orbs */}
        <div aria-hidden="true" style={{ position: "fixed", top: "8%", left: "15%", width: "550px", height: "550px", background: "radial-gradient(circle, rgba(255,85,0,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: "fixed", bottom: "15%", right: "10%", width: "380px", height: "380px", background: "radial-gradient(circle, rgba(255,170,0,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, padding: "120px 24px 80px", maxWidth: "860px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <span style={{
              display: "inline-block", fontSize: "0.7rem", fontWeight: 800,
              letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#ff5500",
              padding: "5px 16px", border: "1.5px solid rgba(255,85,0,0.28)",
              background: "rgba(255,85,0,0.07)", borderRadius: 99, marginBottom: 20,
              backdropFilter: "blur(8px)",
            }}>
              {t("ACUERDO LEGAL", "LEGAL AGREEMENT", "ACUERDO")}
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "16px", color: "var(--text-primary)" }}>
              {t("Términos de Servicio", "Terms of Service", "Términos ti' Servicio")}
            </h1>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              {t(
                "Al acceder al sitio web en La Yucateca, usted acepta estar sujeto a estos términos de servicio y a todas las leyes y regulaciones aplicables.",
                "By accessing the website at La Yucateca, you are agreeing to be bound by these terms of service and all applicable laws and regulations."
              )}
            </p>
          </div>

          {/* Content glass cards */}
          {sections.map((section) => (
            <GlassCard key={section.title}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                <div style={{ width: 42, height: 42, borderRadius: "11px", background: "rgba(255,85,0,0.1)", border: "1.5px solid rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                  {section.emoji}
                </div>
                <h2 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {section.title}
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.92rem" }}>
                {section.body}
              </p>
            </GlassCard>
          ))}

          {/* Last updated */}
          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "32px", opacity: 0.6 }}>
            {t("Última actualización: ", "Last updated: ")}{new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
