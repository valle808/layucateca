"use client";

import { useLanguage } from "@/components/LanguageContext";
import Link from "next/link";
import Footer from "@/components/Footer";

const sections = [
  {
    emoji: "🏢",
    titleEs: "Información de la empresa",
    titleEn: "Company Information",
    content: (
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.92rem" }}>
        <strong style={{ color: "var(--text-primary)" }}>La Yucateca News &amp; Web Design Portal</strong>
        <br />
        Mérida, Yucatán, México
        <br />
        Email:{" "}
        <a
          href="mailto:contact@layucateca.com"
          style={{ color: "#ff5500", textDecoration: "underline", textUnderlineOffset: "3px" }}
        >
          contact@layucateca.com
        </a>
      </p>
    ),
  },
  {
    emoji: "⚖️",
    titleEs: "Representante Legal",
    titleEn: "Legal Representative",
    bodyEs:
      "Representado por la junta directiva y editores en jefe.",
    bodyEn:
      "Represented by the board of directors and editors-in-chief.",
  },
  {
    emoji: "📝",
    titleEs: "Responsabilidad por el contenido",
    titleEn: "Liability for Content",
    bodyEs:
      "Como proveedores de servicios, somos responsables del contenido propio de estas páginas según las leyes generales. Sin embargo, no estamos obligados a monitorear la información transmitida o almacenada de terceros, ni a investigar circunstancias que indiquen actividad ilegal.",
    bodyEn:
      "As service providers, we are liable for own contents of these websites according to general laws. However, we are not obligated to monitor transmitted or stored external information or to investigate circumstances that indicate illegal activity.",
  },
  {
    emoji: "🔗",
    titleEs: "Responsabilidad por los enlaces",
    titleEn: "Liability for Links",
    bodyEs:
      "Nuestra oferta contiene enlaces a sitios web externos de terceros, sobre cuyo contenido no tenemos influencia. Por lo tanto, no podemos asumir ninguna responsabilidad por estos contenidos externos.",
    bodyEn:
      "Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents.",
  },
  {
    emoji: "©️",
    titleEs: "Derechos de Autor",
    titleEn: "Copyright",
    bodyEs:
      "El contenido y las obras creadas por los operadores del sitio en estas páginas están sujetos a la ley de derechos de autor. La duplicación, procesamiento, distribución y cualquier tipo de explotación fuera de los límites de la ley de derechos de autor requieren el consentimiento por escrito.",
    bodyEn:
      "The content and works created by the site operators on these pages are subject to copyright law. Duplication, processing, distribution, and any kind of exploitation outside the limits of copyright law require the written consent of the respective author or creator.",
  },
];

export default function ImpressumPage() {
  const { t } = useLanguage();

  return (
    <>
      <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Ambient orbs */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed", top: "8%", right: "12%",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(255,85,0,0.07) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "fixed", bottom: "10%", left: "5%",
            width: "380px", height: "380px",
            background: "radial-gradient(circle, rgba(255,170,0,0.05) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, padding: "120px 24px 80px", maxWidth: "860px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <span style={{
              display: "inline-block", fontSize: "0.7rem", fontWeight: 800,
              letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "#ff5500", padding: "5px 16px",
              border: "1.5px solid rgba(255,85,0,0.28)",
              background: "rgba(255,85,0,0.07)", borderRadius: 99,
              marginBottom: 20, backdropFilter: "blur(8px)",
            }}>
              {t("AVISO LEGAL", "LEGAL NOTICE", "AVISO LEGAL")}
            </span>
            <h1 style={{
              fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900,
              letterSpacing: "-0.03em", lineHeight: 1.1,
              marginBottom: "16px", color: "var(--text-primary)",
            }}>
              {t("Aviso Legal / Impressum", "Legal Notice / Impressum", "Aviso Legal")}
            </h1>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              {t(
                "Información legal y de responsabilidad sobre La Yucateca.",
                "Legal and liability information about La Yucateca."
              )}
            </p>
          </div>

          {/* Glass section cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {sections.map((section) => (
              <div
                key={section.titleEn}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "32px 36px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "11px",
                    background: "rgba(255,85,0,0.1)",
                    border: "1.5px solid rgba(255,85,0,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem", flexShrink: 0,
                  }}>
                    {section.emoji}
                  </div>
                  <h2 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {t(section.titleEs, section.titleEn, section.titleEs)}
                  </h2>
                </div>

                {section.content
                  ? section.content
                  : (
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.92rem" }}>
                      {t(section.bodyEs || "", section.bodyEn || "", section.bodyEs || "")}
                    </p>
                  )}
              </div>
            ))}

            {/* Navigation links */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,85,0,0.1) 0%, rgba(255,170,0,0.07) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,85,0,0.18)",
              borderRadius: "20px",
              padding: "28px 36px",
              display: "flex", flexWrap: "wrap" as const, gap: "12px", alignItems: "center",
            }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginRight: "4px" }}>
                {t("Ver también:", "See also:", "Ver también:")}
              </span>
              {[
                { href: "/privacy", labelEs: "Política de Privacidad", labelEn: "Privacy Policy" },
                { href: "/terms", labelEs: "Términos de Servicio", labelEn: "Terms of Service" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "8px 18px",
                    background: "rgba(255,85,0,0.08)",
                    border: "1.5px solid rgba(255,85,0,0.22)",
                    color: "#ff5500",
                    textDecoration: "none",
                    fontWeight: 700, fontSize: "0.85rem",
                    borderRadius: "50px",
                    transition: "background 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,85,0,0.18)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 14px rgba(255,85,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,85,0,0.08)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                  }}
                >
                  {t(link.labelEs, link.labelEn, link.labelEs)} →
                </Link>
              ))}
            </div>
          </div>

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "36px", opacity: 0.55 }}>
            © {new Date().getFullYear()} La Yucateca. {t("Todos los derechos reservados.", "All rights reserved.")}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
