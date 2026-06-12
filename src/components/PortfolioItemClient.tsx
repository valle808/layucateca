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

interface PortfolioItemClientProps {
  item: PortfolioItem;
}

export default function PortfolioItemClient({ item }: PortfolioItemClientProps) {
  const { t, translateDb } = useLanguage();

  return (
    <>
      <main>
        <article style={{ padding: "60px 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
          <Link
            href="/soluciones-digitales"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "32px",
            }}
          >
            ← {t("Volver al Portafolio", "Back to Portfolio")}
          </Link>

          <span className="badge badge-portfolio" style={{ marginBottom: "20px" }}>
            {t("Diseño Web", "Web Design")}
          </span>

          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: "16px" }}>
            {translateDb(item.title)}
          </h1>

          {item.price && (
            <p className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px" }}>
              {t("Desde", "Starting at")} ${item.price.toLocaleString()}
            </p>
          )}

          {item.imageUrl && (
            <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "40px", maxHeight: "500px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={translateDb(item.title)} style={{ width: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div className="divider" />

          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.85, marginBottom: "40px" }}>
            {translateDb(item.description)}
          </p>

          <div className="divider" />

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {item.liveUrl && (
              <Link href={`/portfolio/live-preview/${item.slug}`} className="btn-primary">
                {t("Ver Sitio En Vivo ↗", "View Live Site ↗", "Il ts'o'ok bejla'e' ↗")}
              </Link>
            )}
            <Link href="/contact" className="btn-secondary">
              {t("Adquirir Este Diseño", "Get This Design")}
            </Link>
            <Link href="/soluciones-digitales" className="btn-ghost">
              ← {t("Portafolio", "Portfolio")}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
