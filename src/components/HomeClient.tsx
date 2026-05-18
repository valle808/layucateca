"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";
import AgentKinBackground from "@/components/AgentKinBackground";
import InteractiveHeroTitle from "@/components/InteractiveHeroTitle";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date | string;
}

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  price: number | null;
}

interface HomeClientProps {
  recentPosts: Post[];
  featuredPortfolio: PortfolioItem[];
}

export default function HomeClient({ recentPosts, featuredPortfolio }: HomeClientProps) {
  const { t, translateDb, language } = useLanguage();

  return (
    <>
      <main style={{ position: "relative" }}>
        <AgentKinBackground />
        {/* ---- Hero (AgentKin Style) ---- */}
        <section
          id="hero"
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 60% at 50% 20%, rgba(255,255,255,0.03) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%", position: "relative", zIndex: 10 }}>
            <p
              className="section-label animate-fadeInUp"
              style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards", justifyContent: "center" }}
            >
              {t("Portal de Noticias y Diseño Web", "News & Web Design Portal", "Péektsil yéetel Diseño Web")}
            </p>
            <InteractiveHeroTitle />
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.15rem",
                lineHeight: 1.75,
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px",
                animation: "fadeInUp 0.6s 0.35s ease-out forwards",
                opacity: 0,
              }}
            >
              {t(
                "La Yucateca es tu centro de noticias y servicios premium de diseño web. Limpio, imparable y construido para crecer.",
                "La Yucateca is your hub for news and premium web design services. Clean, unstoppable, and built to grow.",
                "La Yucateca le u péektsil yéetel meyajo'ob ti' diseño web premium. Limpio, imparable yéetel construido para crecer."
              )}
            </p>
            
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                animation: "fadeInUp 0.6s 0.5s ease-out forwards",
                opacity: 0,
              }}
            >
              <Link href="/portfolio" className="btn-primary" style={{ padding: "16px 32px", fontSize: "1.1rem", borderRadius: "30px" }}>
                {t("Únete a la Red →", "Join the Network →", "Oko'ol ti' Red →")}
              </Link>
            </div>

            {/* Stats (AgentKin Grid Style) */}
            <div
              className="dashboard-grid"
              style={{
                marginTop: "80px",
                animation: "fadeInUp 0.6s 0.65s ease-out forwards",
                opacity: 0,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {[
                { value: "50+", label: t("Proyectos", "Projects", "Meyajo'ob") },
                { value: "98%", label: t("Satisfacción", "Satisfaction", "Utzil") },
                { value: "24/7", label: t("Disponibilidad", "Uptime", "Disponibilidad") },
              ].map((stat) => (
                <div key={stat.label} className="dashboard-card" style={{ textAlign: "center", padding: "32px 24px" }}>
                  <p
                    style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)", marginBottom: "8px" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Dashboard Sections (AgentKin Style) ---- */}
        <section id="dashboard" style={{ padding: "40px 24px 80px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
            
            {/* Live Workspace / Portfolio */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "24px" }}>
                {t("Espacio de Trabajo en Vivo", "Live Workspace", "Meyaj bejla'e'")}
              </h2>
              <div className="dashboard-grid">
                {/* Featured Portfolio Card */}
                <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{t("Tareas de Diseño", "Design Tasks", "Meyajo'ob")}</h3>
                    <span className="badge-outline" style={{ color: "var(--accent-rose)", border: "1px solid var(--accent-rose)" }}>LIVE</span>
                  </div>
                  
                  {featuredPortfolio.length > 0 ? (
                    <Link href={`/portfolio/live-preview/${featuredPortfolio[0].slug}`} style={{ textDecoration: "none" }}>
                      <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }} className="hover:bg-opacity-80">
                        <div>
                          <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{translateDb(featuredPortfolio[0].title)}</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>TK-DEMO</p>
                        </div>
                        <span className="badge-outline" style={{ background: "rgba(244, 63, 94, 0.1)", color: "var(--accent-rose)", border: "none" }}>PREVIEW</span>
                      </div>
                    </Link>
                  ) : (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No active tasks.</p>
                  )}
                </div>

                {/* Privacy / Muna Core */}
                <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Muna AI Core</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                    Sovereign Intelligence Active
                  </p>
                  <div style={{ width: "48px", height: "24px", background: "rgba(255, 255, 255, 0.15)", borderRadius: "12px", position: "relative", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <div style={{ position: "absolute", top: "2px", right: "2px", width: "18px", height: "18px", background: "#fff", borderRadius: "50%", boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Core / News */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "24px" }}>
                {t("Núcleo de la Plataforma", "Platform Core", "U puksi'ik'al Plataforma")}
              </h2>
              <div className="dashboard-grid">
                
                {recentPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="dashboard-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {translateDb(post.title)}
                      </h3>
                      <span className="badge-outline" style={{ color: "var(--accent-gold)", border: "1px solid var(--accent-gold)" }}>INFO</span>
                    </div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        marginBottom: "16px",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {translateDb(post.content).replace(/<[^>]+>/g, "").substring(0, 150)}...
                    </p>
                    <Link href={`/news/${post.slug}`} style={{ color: "#ffffff", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(255, 255, 255, 0.3)", paddingBottom: "2px", display: "inline-block" }}>
                      {t("Leer Documento →", "Read Intel →", "Xook →")}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---- Portfolio Preview ---- */}
        <section id="portfolio-preview" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "40px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <p className="section-label">{t("Nuestro Trabajo", "Our Work")}</p>
                <h2 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                  {t("Diseños", "Featured ")}<span style={{ color: "rgba(255,255,255,0.7)" }}>{t("Destacados", "Designs")}</span>
                </h2>
              </div>
              <Link href="/portfolio" className="btn-ghost">
                {t("Portafolio Completo →", "Full Portfolio →")}
              </Link>
            </div>

            {featuredPortfolio.length === 0 ? (
              <div
                className="dashboard-card"
                style={{
                  padding: "60px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                    <rect x="3" y="3" width="18" height="18" rx="0"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <p>{t("Aún no hay portafolios disponibles.", "Portfolio items coming soon.")}</p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "24px",
                }}
              >
                {featuredPortfolio.map((item) => (
                  <div key={item.id} className="card" style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        height: "200px",
                        background: item.imageUrl
                          ? `url(${item.imageUrl}) center/cover`
                          : "rgba(255, 255, 255, 0.02)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-secondary)",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      {!item.imageUrl && (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                          <rect x="2" y="3" width="20" height="14" rx="0"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                      )}
                    </div>
                    <div style={{ padding: "24px" }}>
                      <span className="badge badge-portfolio" style={{ marginBottom: "12px" }}>
                        {t("Diseño Web", "Web Design")}
                      </span>
                      <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>{translateDb(item.title)}</h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                          lineHeight: 1.6,
                          marginBottom: "16px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {translateDb(item.description)}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {item.price && (
                          <span className="gradient-text" style={{ fontWeight: 700 }}>
                            ${item.price.toLocaleString()}
                          </span>
                        )}
                        <div style={{ display: "flex", gap: "8px" }}>
                          {item.liveUrl && (
                            <a
                              href={item.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost"
                              style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                            >
                              {t("En Vivo ↗", "Live ↗")}
                            </a>
                          )}
                          <Link
                            href={`/portfolio/${item.slug}`}
                            className="btn-secondary"
                            style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                          >
                            {t("Detalles", "Details")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---- CTA Banner ---- */}
        <section
          id="cta-banner"
          style={{
            padding: "80px 24px",
            background: "var(--bg-secondary)",
          }}
        >
          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              textAlign: "center",
              padding: "60px 40px",
              borderRadius: "24px",
              border: "1px solid var(--border-subtle)",
              background: "rgba(5, 5, 5, 0.4)",
              backdropFilter: "blur(30px)",
            }}
            className="dashboard-card"
          >
            <p className="section-label" style={{ justifyContent: "center" }}>
              {t("Comienza Hoy", "Start Today")}
            </p>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 900, margin: "16px 0" }}>
              {t("¿Listo para Construir Tu", "Ready to Build Your")}
              <br />
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{t("Sitio Web Ideal?", "Dream Website?")}</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                lineHeight: 1.75,
                marginBottom: "32px",
              }}
            >
              {t(
                "Permítenos crear una presencia web increíble y de alto rendimiento que te distinga de la competencia. Sin plantillas genéricas: diseño 100% personalizado.",
                "Let us create a stunning, high-performance web presence that sets you apart from the competition. No generic templates — 100% custom design."
              )}
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn-primary">
                {t("Cotización Gratis →", "Get a Free Quote →")}
              </Link>
              <Link href="/portfolio" className="btn-ghost">
                {t("Ver Ejemplos", "See Examples")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
