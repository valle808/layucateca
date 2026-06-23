"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";
import AdSenseAd from "@/components/AdSenseAd";
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

const TICKER_ITEMS = [
  "🔴 EN VIVO: Últimas noticias de Yucatán",
  "📰 Diseño web profesional a medida — desde $499",
  "🤖 Muna AI disponible 24/7 para asistencia inteligente",
  "🌐 Nuevo portal ciudadano — reporta tu colonia",
  "💼 Mercadito de servicios digitales ahora activo",
];

function BreakingTicker({ posts, translateDb }: { posts: Post[], translateDb: (str: string) => string }) {
  return (
    <div style={{
      background: "#111",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      height: "38px",
      position: "relative",
      zIndex: 50,
    }}>
      <span style={{
        background: "#ff5500",
        padding: "0 18px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        fontWeight: 900,
        fontSize: "0.72rem",
        letterSpacing: "0.14em",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        ● EN VIVO
      </span>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{
          display: "flex",
          animation: "tickerScroll 40s linear infinite",
          whiteSpace: "nowrap",
        }}>
          {posts.length > 0 ? [...posts, ...posts].map((post, i) => (
            <Link 
              key={`${post.id}-${i}`} 
              href={`/news/${post.slug}`} 
              style={{ padding: "0 48px", fontSize: "0.82rem", fontWeight: 500, color: "#fff", textDecoration: "none" }}
              className="ticker-link"
            >
              🔴 {translateDb(post.title)}
            </Link>
          )) : [...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
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
        .ticker-link { transition: color 0.2s ease; }
        .ticker-link:hover { color: var(--accent-gold) !important; }
      `}</style>
    </div>
  );
}

export default function HomeClient({ recentPosts }: HomeClientProps) {
  const { t, translateDb } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hero = recentPosts[0];
  const secondaryPosts = recentPosts.slice(1, 4);

  const categories = [
    { label: t("Política", "Politics", "Política"), icon: "🏛️", href: "/news" },
    { label: t("Economía", "Economy", "Economía"), icon: "📊", href: "/news" },
    { label: t("Cultura", "Culture", "Cultura"), icon: "🎭", href: "/news" },
    { label: t("Tecnología", "Technology", "Tecnología"), icon: "💻", href: "/news" },
    { label: t("Deportes", "Sports", "Deportes"), icon: "⚽", href: "/news" },
    { label: t("Opinión", "Opinion", "Opinión"), icon: "✍️", href: "/opinion-room" },
  ];

  const services = [
    {
      icon: "🌐",
      title: t("Diseño Web", "Web Design", "Diseño Web"),
      desc: t("Sitios premium a medida desde $499. Rápidos, elegantes y optimizados.", "Premium bespoke websites from $499. Fast, elegant, and optimized.", ""),
      href: "/soluciones-digitales",
      color: "var(--accent-gold)",
    },
    {
      icon: "🤖",
      title: "Muna AI",
      desc: t("Asistente inteligente para tu negocio. Disponible 24/7 en español e inglés.", "Intelligent assistant for your business. Available 24/7.", ""),
      href: "/muna",
      color: "var(--accent-gold)",
    },
    {
      icon: "🖥️",
      title: t("Soluciones Digitales", "Digital Solutions", "Soluciones Digitales"),
      desc: t("Desarrollo de software a medida, arquitectura cloud, ciberseguridad y automatización.", "Custom software development, cloud architecture, cybersecurity, and automation.", ""),
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
        <BreakingTicker posts={recentPosts} translateDb={translateDb} />

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
                    background: "#ff5500",
                    color: "#fff",
                    padding: "4px 14px",
                    borderRadius: "6px",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                    width: "fit-content",
                    boxShadow: "0 2px 10px rgba(255,85,0,0.4)",
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
                      background: "#ff5500",
                      color: "#fff",
                      padding: "8px 20px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      boxShadow: "0 2px 12px rgba(255,85,0,0.3)",
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
                    <span>{cat.icon}</span> {cat.label}
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
                borderRadius: "12px",
                minHeight: "120px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <AdSenseAd adFormat="auto" fullWidthResponsive={true} />
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES STRIP ── */}
        <section style={{ maxWidth: "1280px", margin: "48px auto 0", padding: "0 24px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "3px", height: "22px", background: "#ff5500", borderRadius: "2px" }} />
            <h2 style={{
              fontSize: "0.8rem", fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              {t("Nuestros Servicios", "Our Services", "Nuestros Servicios")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
            {services.map((svc) => (
              <Link key={svc.title} href={svc.href} style={{ textDecoration: "none" }}>
                <div className="card" style={{
                  borderRadius: "16px",
                  padding: "28px 24px",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
                }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "rgba(255,85,0,0.1)", border: "1.5px solid rgba(255,85,0,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", marginBottom: "16px",
                  }}>{svc.icon}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: "8px" }}>{svc.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "18px" }}>{svc.desc}</p>
                  <span style={{ color: "#ff5500", fontSize: "0.82rem", fontWeight: 700 }}>
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
                <div style={{ width: "3px", height: "22px", background: "#ff5500", borderRadius: "2px" }} />
                <h2 style={{
                  fontSize: "0.8rem", fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  {t("Últimas Noticias", "Latest News", "Últimas Noticias")}
                </h2>
              </div>
              <Link href="/news" style={{
                color: "#ff5500",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                border: "1.5px solid rgba(255,85,0,0.3)",
                padding: "6px 16px",
                borderRadius: "20px",
                transition: "all 0.18s ease",
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
                        background: "#ff5500",
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: "5px",
                        fontSize: "0.66rem",
                        fontWeight: 900,
                        letterSpacing: "0.1em",
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
                        <span style={{ color: "#ff5500", fontSize: "0.78rem", fontWeight: 700 }}>
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
            padding: "72px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(255,85,0,0.05) 0%, transparent 60%)",
            border: "1px solid rgba(255,85,0,0.12)",
          }}>
            <div style={{
              position: "absolute", top: "-80px", right: "-80px",
              width: "400px", height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,85,0,0.1) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: "-80px", left: "-80px",
              width: "300px", height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,85,0,0.06) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}>
              {t("¿Listo para tu sitio web ideal?", "Ready for your dream website?", "¿Listo para tu sitio web ideal?")}
            </h2>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              maxWidth: "560px",
              margin: "0 auto 36px",
              lineHeight: 1.7,
            }}>
              {t(
                "Diseño 100% personalizado, rápido y elegante. Sin plantillas genéricas — tu identidad, tu visión.",
                "100% custom design, fast and elegant. No generic templates — your identity, your vision.",
                ""
              )}
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact" style={{
                background: "#ff5500", color: "#fff",
                padding: "13px 32px", borderRadius: 10,
                fontWeight: 700, fontSize: "0.92rem",
                textDecoration: "none",
                boxShadow: "0 4px 18px rgba(255,85,0,0.35)",
                transition: "opacity 0.18s ease",
              }}>
                {t("Cotización Gratis →", "Free Quote →", "Cotización Gratis →")}
              </Link>
              <Link href="/soluciones-digitales" style={{
                background: "transparent", color: "var(--text-primary)",
                padding: "13px 32px", borderRadius: 10,
                fontWeight: 700, fontSize: "0.92rem",
                textDecoration: "none",
                border: "1.5px solid var(--border-subtle)",
                transition: "border-color 0.18s ease",
              }}>
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
