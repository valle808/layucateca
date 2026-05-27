"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

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

const TICKER_ITEMS_ES = [
  "EN VIVO: Ultimas noticias de Yucatan",
  "Diseno web profesional a medida -- desde $499",
  "Muna AI disponible 24/7 para asistencia inteligente",
  "Nuevo portal ciudadano -- reporta tu colonia",
  "Marketplace de servicios digitales ahora activo",
];
const TICKER_ITEMS_EN = [
  "LIVE: Latest news from Yucatan",
  "Professional custom web design -- from $499",
  "Muna AI available 24/7 for smart assistance",
  "New citizen portal -- report your neighborhood",
  "Digital services marketplace now active",
];
const TICKER_ITEMS_MY = [
  "KUXTAL: Tuminben peektsil Yucatan",
  "Diseno web a medida -- ti' $499",
  "Muna AI 24/7 ti' waantaj",
  "Tuminben portal -- ts'iib a kaajal",
  "Marketplace nu'ukulo'ob digitales kuxtal",
];

function BreakingTicker({ lang }: { lang: string }) {
  const items = lang === "en" ? TICKER_ITEMS_EN : lang === "my" ? TICKER_ITEMS_MY : TICKER_ITEMS_ES;
  const liveLabel = lang === "en" ? "LIVE" : lang === "my" ? "KUXTAL" : "EN VIVO";
  return (
    <div style={{
      background: "#c0392b",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      height: "36px",
      position: "relative",
      zIndex: 50,
    }}>
      <span style={{
        background: "#8b0000",
        padding: "0 18px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        fontWeight: 800,
        fontSize: "0.75rem",
        letterSpacing: "0.12em",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {liveLabel}
      </span>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{
          display: "flex",
          animation: "tickerScroll 28s linear infinite",
          whiteSpace: "nowrap",
        }}>
          {[...items, ...items].map((item, i) => (
            <span key={i} style={{ padding: "0 48px", fontSize: "0.82rem", fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cat-chip { transition: background 0.2s ease, color 0.2s ease; }
        .cat-chip:hover { background: var(--accent-gold) !important; color: #fff !important; }
      `}</style>
    </div>
  );
}

export default function HomeClient({ recentPosts }: HomeClientProps) {
  const { t, translateDb, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hero = recentPosts[0];
  const secondaryPosts = recentPosts.slice(1, 4);

  const categories = [
    { label: t("Politica", "Politics", "Politica"), href: "/news" },
    { label: t("Economia", "Economy", "Economia"), href: "/news" },
    { label: t("Cultura", "Culture", "Cultura"), href: "/news" },
    { label: t("Tecnologia", "Technology", "Tecnologia"), href: "/news" },
    { label: t("Deportes", "Sports", "Deportes"), href: "/news" },
    { label: t("Opinion", "Opinion", "Opinion"), href: "/opinion-room" },
  ];

  const services = [
    {
      title: t("Diseno Web", "Web Design", "Diseno Web"),
      desc: t("Sitios premium a medida desde $499. Rapidos, elegantes y optimizados.", "Premium bespoke websites from $499. Fast, elegant, and optimized.", "Sitios premium ti' $499. Jach seeb, jach ki'ichpam."),
      href: "/soluciones-digitales",
      color: "var(--accent-gold)",
    },
    {
      title: "Muna AI",
      desc: t("Asistente inteligente para tu negocio. Disponible 24/7 en espanol e ingles.", "Intelligent assistant for your business. Available 24/7.", "Waantaj na'at ti' a negocio. 24/7 kuxtal."),
      href: "/muna",
      color: "var(--accent-gold)",
    },
    {
      title: t("Soluciones Digitales", "Digital Solutions", "Nu'ukulo'ob Digitales"),
      desc: t("Desarrollo de software a medida, arquitectura cloud, ciberseguridad y automatizacion.", "Custom software development, cloud architecture, cybersecurity, and automation.", "Meentik software, cloud, ciberseguridad yetel automatizacion."),
      href: "/soluciones-digitales",
      color: "var(--accent-gold)",
    },
  ];

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <BreakingTicker lang={language} />

        {/* ── HERO ── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 0", width: "100%" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)",
            gap: "24px",
            alignItems: "start",
          }}>
            {/* Main Feature */}
            {hero ? (
              <Link href={`/news/${hero.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <div className="card" style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: hero.imageUrl
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.85) 100%), url(${hero.imageUrl}) center/cover no-repeat`
                    : "var(--bg-card)",
                  minHeight: "480px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "32px",
                }}>
                  <span style={{
                    display: "inline-block",
                    background: "#c0392b",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                    width: "fit-content",
                  }}>
                    {t("Destacado", "Featured", "Destacado")}
                  </span>
                  <h1 style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                    fontWeight: 900,
                    color: hero.imageUrl ? "#ffffff" : "var(--text-primary)",
                    lineHeight: 1.2,
                    marginBottom: "12px",
                    textShadow: hero.imageUrl ? "0 2px 20px rgba(0,0,0,0.7)" : "none",
                  }}>
                    {translateDb(hero.title)}
                  </h1>
                  <p style={{
                    color: hero.imageUrl ? "rgba(255,255,255,0.9)" : "var(--text-secondary)",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    marginBottom: "20px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {translateDb(hero.content).replace(/<[^>]+>/g, "").substring(0, 160)}…
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ color: hero.imageUrl ? "rgba(255,255,255,0.7)" : "var(--text-secondary)", fontSize: "0.8rem" }}>
                      {formatDate(hero.createdAt)}
                    </span>
                    <span style={{
                      background: "#c0392b",
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}>
                      {t("Leer →", "Read →", "Xook →")}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="card" style={{
                minHeight: "480px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "1rem",
              }}>
                {t("Próximamente — las noticias llegarán aquí.", "Coming soon — news will appear here.", "")}
              </div>
            )}

            {/* Side column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Category chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "4px" }}>
                {categories.map((cat) => (
                  <Link key={cat.label} href={cat.href} style={{
                    textDecoration: "none",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }} className="cat-chip">
                    {cat.label}
                  </Link>
                ))}
              </div>

              {secondaryPosts.length > 0 ? secondaryPosts.map((post, idx) => (
                <Link key={post.id} href={`/news/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{
                    display: "flex",
                    gap: "14px",
                    borderRadius: "12px",
                    padding: "16px",
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      flexShrink: 0,
                      background: post.imageUrl
                        ? `url(${post.imageUrl}) center/cover`
                        : `linear-gradient(135deg, hsl(${idx * 60 + 200},30%,var(--bg-card, 55%)), hsl(${idx * 60 + 220},30%,40%))`,
                      border: "1px solid var(--border-subtle)",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1.35,
                        marginBottom: "6px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {translateDb(post.title)}
                      </h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="card" style={{
                  padding: "40px 24px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}>
                  {t("Más noticias próximamente.", "More news coming soon.", "")}
                </div>
              )}

              {/* AdSense slot */}
              <div style={{
                background: "var(--bg-card)",
                border: "1px dashed var(--border-subtle)",
                borderRadius: "12px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                opacity: 0.5,
              }}>
                {t("PUBLICIDAD", "ADVERTISEMENT", "PUBLICIDAD")}
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES STRIP ── */}
        <section style={{ maxWidth: "1280px", margin: "48px auto 0", padding: "0 24px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "4px", height: "24px", background: "var(--accent-gold)", borderRadius: "2px" }} />
            <h2 style={{
              fontSize: "1.1rem", fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              {t("Nuestros Servicios", "Our Services", "Nuestros Servicios")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {services.map((svc) => (
              <Link key={svc.title} href={svc.href} style={{ textDecoration: "none" }}>
                <div className="card" style={{
                  borderRadius: "14px",
                  padding: "28px 24px",
                }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{svc.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "16px" }}>{svc.desc}</p>
                  <span style={{ color: svc.color, fontSize: "0.82rem", fontWeight: 700 }}>
                    {t("Conocer más →", "Learn more →", "Conocer más →")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── ALL NEWS GRID ── */}
        {recentPosts.length > 0 && (
          <section style={{ maxWidth: "1280px", margin: "48px auto 0", padding: "0 24px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "4px", height: "24px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                <h2 style={{
                  fontSize: "1.1rem", fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {t("Últimas Noticias", "Latest News", "Últimas Noticias")}
                </h2>
              </div>
              <Link href="/news" style={{
                color: "var(--accent-gold)",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid var(--border-accent)",
                padding: "6px 16px",
                borderRadius: "20px",
              }}>
                {t("Ver todas →", "See all →", "Ver todas →")}
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/news/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{
                    borderRadius: "14px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "180px",
                      background: post.imageUrl
                        ? `url(${post.imageUrl}) center/cover`
                        : "var(--bg-card-hover)",
                      position: "relative",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}>
                      <span style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "#c0392b",
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        {t("Noticias", "News", "Noticias")}
                      </span>
                    </div>
                    <div style={{ padding: "18px" }}>
                      <h3 style={{
                        fontSize: "0.97rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1.4,
                        marginBottom: "8px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {translateDb(post.title)}
                      </h3>
                      <p style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.82rem",
                        lineHeight: 1.55,
                        marginBottom: "14px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {translateDb(post.content).replace(/<[^>]+>/g, "").substring(0, 100)}…
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          {formatDate(post.createdAt)}
                        </span>
                        <span style={{ color: "var(--accent-gold)", fontSize: "0.78rem", fontWeight: 700 }}>
                          {t("Leer →", "Read →", "Leer →")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA BANNER ── */}
        <section style={{ maxWidth: "1280px", margin: "64px auto 0", padding: "0 24px 80px", width: "100%" }}>
          <div className="card" style={{
            padding: "60px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "-60px", right: "-60px",
              width: "300px", height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,85,0,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}>
              {t("¿Listo para tu sitio web ideal?", "Ready for your dream website?", "¿Listo para tu sitio web ideal?")}
            </h2>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              maxWidth: "580px",
              margin: "0 auto 32px",
              lineHeight: 1.7,
            }}>
              {t(
                "Diseño 100% personalizado, rápido y elegante. Sin plantillas genéricas — tu identidad, tu visión.",
                "100% custom design, fast and elegant. No generic templates — your identity, your vision.",
                ""
              )}
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" className="btn-primary">
                {t("Cotización Gratis →", "Free Quote →", "Cotización Gratis →")}
              </Link>
              <Link href="/soluciones-digitales" className="btn-secondary">
                {t("Ver Portafolio", "View Portfolio", "Ver Portafolio")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
