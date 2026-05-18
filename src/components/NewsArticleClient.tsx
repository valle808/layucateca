"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";
import SpeechPlayer from "@/components/SpeechPlayer";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  state: string;
  createdAt: string;
}

interface NewsArticleClientProps {
  post: Post;
}

export default function NewsArticleClient({ post }: NewsArticleClientProps) {
  const { t, translateDb, language } = useLanguage();

  return (
    <>
      <main style={{ paddingTop: "100px" }}>
        <article style={{ padding: "60px 24px 80px", maxWidth: "780px", margin: "0 auto" }}>
          <Link
            href="/news"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "32px",
              transition: "color 0.2s",
            }}
          >
            ← {t("Volver a Noticias", "Back to News", "Volver Péektsil")}
          </Link>

          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", alignItems: "center" }}>
            <span className="badge badge-news">
              {t("Noticias", "News", "Péektsil")}
            </span>
            <span className="badge badge-portfolio">
              📍 {post.state}
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "20px",
            }}
          >
            {translateDb(post.title)}
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
            {t("Publicado el ", "Published on ", "Pata'ab ti' ")}{" "}
            {new Date(post.createdAt).toLocaleDateString(language === "es" ? "es-ES" : language === "my" ? "es-MX" : "en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          {/* Web Speech Reader integration */}
          <SpeechPlayer text={post.content} />

          {post.imageUrl && (
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "40px",
                maxHeight: "480px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={translateDb(post.title)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Video Report Mockup section */}
          {post.videoUrl && (
            <div style={{ margin: "40px 0" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px" }}>
                🎥 {t("Reportaje en Video", "Video News Report", "Video Péektsil")}
              </h3>
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: "16px",
                  border: "1px solid var(--border-accent)",
                }}
              >
                <iframe
                  src={post.videoUrl}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video report"
                />
              </div>
            </div>
          )}

          <div className="divider" />

          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.85,
              whiteSpace: "pre-wrap",
            }}
          >
            {translateDb(post.content)}
          </div>

          <div className="divider" />

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/news" className="btn-ghost">
              ← {t("Todas las Noticias", "All News", "Tuláakal Péektsil")}
            </Link>
            <Link href="/contact" className="btn-secondary">
              {t("Contacto", "Contact Us", "Tsikbal")}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
