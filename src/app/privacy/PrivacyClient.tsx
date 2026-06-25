"use client";

import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";

function GlassCard({ children, accentColor = "rgba(255,85,0,0.1)" }: { children: React.ReactNode; accentColor?: string }) {
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

export default function PrivacyPage() {
  const { t } = useLanguage();

  const sections = [
    {
      emoji: "📋",
      title: t("Archivos de Registro", "Log Files"),
      body: t(
        "Al igual que muchos otros sitios web, La Yucateca utiliza archivos de registro. La información dentro de los archivos de registro incluye direcciones de protocolo de Internet (IP), tipo de navegador, proveedor de servicios de Internet (ISP), sello de fecha/hora, páginas de referencia/salida y el número de clics para analizar tendencias, administrar el sitio, rastrear el movimiento de los usuarios por el sitio y recopilar información demográfica.",
        "Like many other Web sites, La Yucateca makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user's movement around the site, and gather demographic information."
      ),
    },
    {
      emoji: "🍪",
      title: t("Cookies y Web Beacons", "Cookies and Web Beacons"),
      body: t(
        "La Yucateca sí utiliza cookies para almacenar información sobre las preferencias de los visitantes, registrar información específica del usuario sobre las páginas a las que el usuario accede o visita, personalizar el contenido de la página web según el tipo de navegador del visitante u otra información que el visitante envía a través de su navegador.",
        "La Yucateca does use cookies to store information about visitors preferences, record user-specific information on which pages the user access or visit, customize Web page content based on visitors browser type or other information that the visitor sends via their browser."
      ),
    },
    {
      emoji: "📢",
      title: t("Cookie DART de DoubleClick", "DoubleClick DART Cookie"),
      body: t(
        "Google, como proveedor de terceros, utiliza cookies para publicar anuncios en La Yucateca. El uso de la cookie DART por parte de Google le permite publicar anuncios a los usuarios basándose en su visita a La Yucateca y otros sitios en Internet.",
        "Google, as a third party vendor, uses cookies to serve ads on La Yucateca. Google's use of the DART cookie enables it to serve ads to users based on their visit to La Yucateca and other sites on the Internet."
      ),
    },
    {
      emoji: "✅",
      title: t("Consentimiento", "Consent"),
      body: t(
        "Al utilizar nuestro sitio web, por la presente acepta nuestra política de privacidad y acepta sus términos.",
        "By using our website, you hereby consent to our privacy policy and agree to its terms."
      ),
    },
  ];

  return (
    <>
      <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Ambient orbs */}
        <div aria-hidden="true" style={{ position: "fixed", top: "5%", right: "10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,85,0,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: "fixed", bottom: "10%", left: "5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255,170,0,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

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
              {t("POLÍTICA LEGAL", "LEGAL POLICY", "POLÍTICA")}
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "16px", color: "var(--text-primary)" }}>
              {t("Política de Privacidad", "Privacy Policy", "No'ojalil Privacidad")}
            </h1>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              {t(
                "En La Yucateca, la privacidad de nuestros visitantes es de extrema importancia para nosotros.",
                "At La Yucateca, the privacy of our visitors is of extreme importance to us."
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
