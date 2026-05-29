"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  price: number | null;
}

interface PortfolioClientProps {
  items: PortfolioItem[];
}

export default function PortfolioClient({ items }: PortfolioClientProps) {
  const { t, translateDb } = useLanguage();

  return (
    <>
      <main style={{ paddingTop: "100px" }}>
        <section style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "56px", textAlign: "center" }}>
              <p className="section-label">{t("Nuestro Trabajo", "Our Work")}</p>
              <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "16px" }}>
                {t("Portafolio de ", "Web Design ")}<span className="gradient-text">{t("Diseño Web", "Portfolio")}</span>
              </h1>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1.05rem",
                  maxWidth: "560px",
                  margin: "0 auto",
                  lineHeight: 1.75,
                }}
              >
                {t(
                  "Cada proyecto es creado con precisión, creatividad y una comprensión profunda de tus objetivos comerciales.",
                  "Every project is crafted with precision, creativity, and a deep understanding of your business goals."
                )}
              </p>
            </div>

            {items.length === 0 ? (
              <div
                className="card"
                style={{ padding: "80px", textAlign: "center", color: "var(--text-secondary)" }}
              >
                <p style={{ fontSize: "3rem", marginBottom: "16px" }}>🎨</p>
                <h2 style={{ fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>
                  {t("Portafolio disponible próximamente", "Portfolio coming soon")}
                </h2>
                <p>{t("Estamos preparando nuestros mejores trabajos. ¡Vuelve pronto!", "We're curating our best work. Check back soon!")}</p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "28px",
                }}
              >
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="card animate-fadeInUp"
                    style={{
                      overflow: "hidden",
                      animationDelay: `${i * 0.08}s`,
                      animationFillMode: "both",
                      opacity: 0,
                    }}
                  >
                    <div
                      style={{
                        height: "220px",
                        background: item.imageUrl
                          ? `url(${item.imageUrl}) center/cover`
                          : "linear-gradient(135deg, #1a1a28, #0a0a0f)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3.5rem",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {!item.imageUrl && "🌐"}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(10,10,15,0.6) 0%, transparent 50%)",
                        }}
                      />
                    </div>
                    <div style={{ padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span className="badge badge-portfolio">{t("Diseño Web", "Web Design")}</span>
                        {item.price && (
                          <span className="gradient-text" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                            ${item.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: "10px" }}>
                        {translateDb(item.title)}
                      </h2>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                          lineHeight: 1.65,
                          marginBottom: "20px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {translateDb(item.description)}
                      </p>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {item.liveUrl && (
                          <Link
                            href={`/portfolio/live-preview/${item.slug}`}
                            className="btn-ghost"
                            style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                          >
                            {t("Demo En Vivo ↗", "Live Preview ↗")}
                          </Link>
                        )}
                        <Link
                          href={`/portfolio/${item.slug}`}
                          className="btn-secondary"
                          style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                        >
                          {t("Ver Detalles", "View Details")}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div
              style={{
                marginTop: "80px",
                textAlign: "center",
                padding: "60px 40px",
                borderRadius: "24px",
                border: "1px solid var(--border-accent)",
                background: "var(--bg-card)",
              }}
            >
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>
                {t("¿No encuentras lo que estás buscando?", "Don't see what you're looking for?")}
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>
                {t("Construimos soluciones totalmente a medida. Hablemos de tu idea.", "We build fully custom solutions. Let's talk about your project.")}
              </p>
              <Link href="/contact" className="btn-primary">
                {t("Iniciar Mi Proyecto →", "Start Your Project →")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
