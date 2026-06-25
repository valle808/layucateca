"use client";

import { useLanguage } from "@/components/LanguageContext";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <>
      {/* Ambient background */}
      <div className="relative min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Glowing ambient orbs */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: "10%",
            left: "15%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(255,85,0,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            bottom: "15%",
            right: "10%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(255,170,0,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "120px 24px 80px",
            maxWidth: "860px",
            margin: "0 auto",
          }}
        >
          {/* Page label */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#ff5500",
                padding: "5px 16px",
                border: "1.5px solid rgba(255,85,0,0.28)",
                background: "rgba(255,85,0,0.07)",
                borderRadius: 99,
                marginBottom: 20,
                backdropFilter: "blur(8px)",
              }}
            >
              {t("NUESTRA HISTORIA", "OUR STORY", "K-HISTORIA")}
            </span>
            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: "16px",
                color: "var(--text-primary)",
              }}
            >
              {t("Acerca de La Yucateca", "About La Yucateca", "Tu yóolal La Yucateca")}
            </h1>
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
              {t(
                "Tu principal fuente de noticias y soluciones de diseño web profesional en Yucatán.",
                "Your premier source for news and professional web design solutions in Yucatan.",
                "A yáax pa'ak'al ti'al péektsil yéetel meyajo'ob ti' pat jo'ol web."
              )}
            </p>
          </div>

          {/* Glass cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Mission card */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "36px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "rgba(255,85,0,0.1)",
                    border: "1.5px solid rgba(255,85,0,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                  }}
                >
                  🎯
                </div>
                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {t("Nuestra Misión", "Our Mission", "K-Misión")}
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
                {t(
                  "En La Yucateca, creemos en mantener a nuestra comunidad informada mientras empoderamos a las empresas locales e internacionales con una presencia digital de primer nivel. Nuestra plataforma de noticias cubre las últimas actualizaciones globales y locales con integridad y rapidez.",
                  "At La Yucateca, we believe in keeping our community informed while empowering local and international businesses with a top-tier digital presence. Our news platform covers the latest global and local updates with integrity and speed."
                )}
              </p>
            </div>

            {/* What we do */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "36px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "rgba(255,85,0,0.1)",
                    border: "1.5px solid rgba(255,85,0,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                  }}
                >
                  🚀
                </div>
                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {t("¿Qué Hacemos?", "What We Do", "Ba'ax k-meyaj?")}
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  {
                    emoji: "📰",
                    title: t("Noticias", "News"),
                    desc: t("Reportajes periodísticos, noticias de última hora y cobertura de eventos.", "Journalistic reporting, breaking news, and event coverage."),
                  },
                  {
                    emoji: "💻",
                    title: t("Soluciones Digitales", "Digital Solutions"),
                    desc: t("Diseño web, optimización SEO, desarrollo de aplicaciones y mantenimiento.", "Web design, SEO optimization, application development, and maintenance."),
                  },
                  {
                    emoji: "🤝",
                    title: t("Comunidad", "Community"),
                    desc: t("Un espacio donde la tecnología y la información se unen para el beneficio de todos.", "A space where technology and information come together for everyone's benefit."),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "16px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span style={{ fontSize: "1.4rem", lineHeight: 1.4 }}>{item.emoji}</span>
                    <div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{item.title}: </strong>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255,85,0,0.12) 0%, rgba(255,170,0,0.08) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,85,0,0.2)",
                borderRadius: "20px",
                padding: "36px",
                boxShadow: "0 8px 32px rgba(255,85,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px" }}>
                {t("¿Quieres saber más o trabajar con nosotros?", "Want to know more or work with us?", "¿Ta k'áat a wojéeltik u maasil wa a meyaj t-éetel?")}
              </h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {t(
                  "Estamos siempre abiertos a nuevas colaboraciones, preguntas de nuestros lectores o clientes interesados en transformar su negocio.",
                  "We are always open to new collaborations, questions from our readers, or clients interested in transforming their business."
                )}
              </p>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 28px",
                  background: "#ff5500",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  borderRadius: "50px",
                  boxShadow: "0 4px 18px rgba(255,85,0,0.35)",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(255,85,0,0.45)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 18px rgba(255,85,0,0.35)"; }}
              >
                {t("Contáctanos", "Contact Us", "T'aanik k-wíinklil")}
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
