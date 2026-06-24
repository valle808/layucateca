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


  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <style>{`
        .magazine-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (min-width: 992px) {
          .magazine-grid {
            grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
          }
        }
        .news-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 640px) {
          .news-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .news-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .hero-card {
          min-height: 400px;
        }
        @media (min-width: 768px) {
          .hero-card {
            min-height: 520px;
          }
        }
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }
      `}</style>
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <BreakingTicker posts={recentPosts} translateDb={translateDb} />

        {/* ── MAGAZINE HERO SECTION ── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 0", width: "100%" }}>
          <div className="magazine-grid">
            {/* Main Feature */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {hero ? (
                <Link href={`/news/${hero.slug}`} style={{ textDecoration: "none", display: "block" }} className="hover-lift">
                  <div className="card hero-card" style={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: hero.imageUrl
                      ? `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 60%, transparent 100%), url(${hero.imageUrl}) center/cover no-repeat`
                      : "var(--bg-card)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "32px",
                  }}>
                    <span style={{
                      display: "inline-block",
                      background: "#ff5500",
                      color: "#fff",
                      padding: "6px 16px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginBottom: "16px",
                      width: "fit-content",
                      boxShadow: "0 4px 15px rgba(255,85,0,0.5)",
                    }}>
                      {t("Destacado", "Featured", "Destacado")}
                    </span>
                    <h1 style={{
                      fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                      fontWeight: 900,
                      color: hero.imageUrl ? "#ffffff" : "var(--text-primary)",
                      lineHeight: 1.15,
                      marginBottom: "16px",
                      textShadow: hero.imageUrl ? "0 2px 24px rgba(0,0,0,0.8)" : "none",
                      letterSpacing: "-0.02em",
                    }}>
                      {translateDb(hero.title)}
                    </h1>
                    <p style={{
                      color: hero.imageUrl ? "rgba(255,255,255,0.9)" : "var(--text-secondary)",
                      fontSize: "1.05rem",
                      lineHeight: 1.6,
                      marginBottom: "24px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      maxWidth: "800px",
                    }}>
                      {translateDb(hero.content).replace(/<[^>]+>/g, "").substring(0, 200)}…
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <span style={{ color: hero.imageUrl ? "rgba(255,255,255,0.8)" : "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
                        {formatDate(hero.createdAt)}
                      </span>
                      <span style={{
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        borderBottom: "2px solid #ff5500",
                        paddingBottom: "2px",
                      }}>
                        {t("Leer Artículo", "Read Article", "Xook")} →
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="card hero-card" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontSize: "1.1rem",
                }}>
                  {t("Próximamente — las noticias llegarán aquí.", "Coming soon — news will appear here.", "")}
                </div>
              )}
            </div>

            {/* Side column: Categories and Secondary Posts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Category chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                {categories.map((cat) => (
                  <Link key={cat.label} href={cat.href} style={{
                    textDecoration: "none",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                    padding: "8px 16px",
                    borderRadius: "24px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "var(--shadow-card)",
                  }} className="cat-chip">
                    <span>{cat.icon}</span> {cat.label}
                  </Link>
                ))}
              </div>

              {/* Secondary Posts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  <div style={{ width: "3px", height: "20px", background: "#ff5500", borderRadius: "2px" }} />
                  <h2 style={{
                    fontSize: "0.9rem", fontWeight: 900,
                    color: "var(--text-primary)",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                  }}>
                    {t("En Tendencia", "Trending", "Trending")}
                  </h2>
                </div>

                {secondaryPosts.length > 0 ? secondaryPosts.map((post, idx) => (
                  <Link key={post.id} href={`/news/${post.slug}`} style={{ textDecoration: "none" }} className="hover-lift">
                    <div className="card" style={{
                      display: "flex",
                      gap: "16px",
                      borderRadius: "14px",
                      padding: "16px",
                      alignItems: "center",
                    }}>
                      <div style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "10px",
                        flexShrink: 0,
                        background: post.imageUrl
                          ? `url(${post.imageUrl}) center/cover`
                          : `linear-gradient(135deg, hsl(${idx * 60 + 200},30%,var(--bg-card, 55%)), hsl(${idx * 60 + 220},30%,40%))`,
                        border: "1px solid var(--border-subtle)",
                      }} />
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <h3 style={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: "var(--text-primary)",
                          lineHeight: 1.35,
                          marginBottom: "8px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {translateDb(post.title)}
                        </h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600 }}>
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
                    fontSize: "0.95rem",
                  }}>
                    {t("Más noticias próximamente.", "More news coming soon.", "")}
                  </div>
                )}
              </div>

              {/* AdSense slot */}
              <div style={{
                background: "var(--bg-card)",
                borderRadius: "14px",
                minHeight: "120px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-subtle)",
              }}>
                <AdSenseAd adFormat="auto" fullWidthResponsive={true} />
              </div>
            </div>
          </div>
        </section>

        {/* ── ALL NEWS GRID ── */}
        {recentPosts.length > 0 && (
          <section style={{ maxWidth: "1280px", margin: "64px auto 0", padding: "0 24px 64px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "3px", height: "24px", background: "#ff5500", borderRadius: "2px" }} />
                <h2 style={{
                  fontSize: "1.2rem", fontWeight: 900,
                  color: "var(--text-primary)",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                  {t("Últimas Noticias", "Latest News", "Últimas Noticias")}
                </h2>
              </div>
              <Link href="/news" style={{
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                fontWeight: 700,
                textDecoration: "none",
                border: "2px solid var(--border-subtle)",
                padding: "8px 20px",
                borderRadius: "24px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#ff5500";
                (e.currentTarget as HTMLElement).style.color = "#ff5500";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              >
                {t("Ver todas →", "See all →", "Ver todas →")}
              </Link>
            </div>
            <div className="news-grid">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/news/${post.slug}`} style={{ textDecoration: "none" }} className="hover-lift">
                  <div className="card" style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}>
                    <div style={{
                      height: "220px",
                      background: post.imageUrl
                        ? `url(${post.imageUrl}) center/cover`
                        : "var(--bg-card-hover)",
                      position: "relative",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}>
                      <span style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        background: "#ff5500",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        fontWeight: 900,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        boxShadow: "0 2px 10px rgba(255,85,0,0.4)",
                      }}>
                        {t("Noticias", "News", "Noticias")}
                      </span>
                    </div>
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 style={{
                        fontSize: "1.15rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        lineHeight: 1.4,
                        marginBottom: "12px",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {translateDb(post.title)}
                      </h3>
                      <p style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        marginBottom: "24px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flex: 1,
                      }}>
                        {translateDb(post.content).replace(/<[^>]+>/g, "").substring(0, 120)}…
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", marginTop: "auto" }}>
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>
                          {formatDate(post.createdAt)}
                        </span>
                        <span style={{ color: "#ff5500", fontSize: "0.85rem", fontWeight: 800 }}>
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
      </main>

      <Footer />
    </>
  );
}
