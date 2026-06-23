"use client";

import AdSenseAd from "@/components/AdSenseAd";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import Footer from "@/components/Footer";
import SpeechPlayer from "@/components/SpeechPlayer";
import { Mail, MessageCircle, Send, MessageSquare, Clock, MapPin, Share2 } from "lucide-react";

// ─── Social icons ─────────────────────────────────────────────────────────────
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.94l4.265 5.641 5.789-5.641zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

// ─── Boilerplate scrubber ─────────────────────────────────────────────────────
// Removes the AI-generated report headers and section labels in all three languages.
function cleanContent(raw: string): string {
  // Remove the bracketed report header lines
  raw = raw.replace(/\[REAL-TIME MULTI-AGENT SWARM JOURNALISTIC REPORT[^\]]*\]/gi, "");
  raw = raw.replace(/\[REPORTE PERIODÍSTICO DE ENJAMBRE MULTI-AGENTE[^\]]*\]/gi, "");
  raw = raw.replace(/\[PÉEKTSIL MULTI-AGENTE[^\]]*\]/gi, "");

  // Remove bold section labels (Spanish, English, Mayan variants)
  const labels = [
    "\\*\\*Resumen Ejecutivo:\\*\\*",
    "\\*\\*Executive Summary:\\*\\*",
    "\\*\\*Tsol T'aan:\\*\\*",
    "\\*\\*Contexto y Análisis de Datos \\(Redacción AI\\):\\*\\*",
    "\\*\\*Context and Data Analysis \\(AI Drafting\\):\\*\\*",
    "\\*\\*Xook yéetel Meyaj \\(Redacción AI\\):\\*\\*",
    "\\*\\*Verificación y Revisión Editorial \\(Fact-Checkers\\):\\*\\*",
    "\\*\\*Editorial Verification and Fact-Checking:\\*\\*",
    "\\*\\*U T'oxol ti' Facebook Fan Page:\\*\\*",
    "\\*\\*Distribución Autónoma en Facebook Fan Page:\\*\\*",
    "\\*\\*Autonomous Facebook Fan Page Distribution:\\*\\*",
    "\\*\\*LA YUCATECA VIRAL ENGINE\\*\\*",
    "— LA YUCATECA VIRAL ENGINE",
  ];
  for (const label of labels) {
    raw = raw.replace(new RegExp(label, "gi"), "");
  }

  // Remove any remaining **Bold:** patterns that are section labels (catch-all)
  raw = raw.replace(/\*\*[^*]{1,60}:\*\*/g, "");

  // Remove the || separator that splits language variants — keep only the first segment
  if (raw.includes("||")) {
    raw = raw.split("||")[0];
  }

  // Remove any leftover asterisks used for bold markdown
  raw = raw.replace(/\*\*/g, "");

  // Collapse excessive blank lines (3+ newlines → 2)
  raw = raw.replace(/\n{3,}/g, "\n\n");

  return raw.trim();
}

// Estimate read time in minutes
function readTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Types ────────────────────────────────────────────────────────────────────
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
  similarPosts?: Post[];
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

// ─── Fallback hero images per state/category ─────────────────────────────────
const FALLBACK_IMAGES: Record<string, string> = {
  Yucatán: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  "Quintana Roo": "https://images.unsplash.com/photo-1682686578023-dc680e7a3aeb?w=1200&q=80",
  Campeche: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
};

function getHeroImage(post: Post): string {
  if (post.imageUrl && post.imageUrl.startsWith("http")) return post.imageUrl;
  return FALLBACK_IMAGES[post.state] ?? FALLBACK_IMAGES.default;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewsArticleClient({ post, similarPosts = [] }: NewsArticleClientProps) {
  const { t, translateDb, language } = useLanguage();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://layucateca.com/news/${post.slug}`;
  const shareText = encodeURIComponent(`Lee esta noticia en La Yucateca: ${post.title.split(" || ")[0]}`);

  const heroImage = getHeroImage(post);
  const rawContent = translateDb(post.content);
  const cleanedContent = cleanContent(rawContent);
  const paragraphs = cleanedContent.split("\n").filter((p) => p.trim().length > 0);
  const mins = readTime(cleanedContent);
  const displayTitle = translateDb(post.title).split(" || ")[0];

  useEffect(() => {
    // Re-parse Facebook Comments if navigation happens client-side
    if (typeof window !== "undefined" && (window as any).FB) {
      try {
        (window as any).FB.XFBML.parse();
      } catch (e) {
        console.error("Failed to parse Facebook XFBML", e);
      }
    }
  }, [pageUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* ── Sticky desktop share bar ── */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-40">
        {[
          { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, icon: <FacebookIcon className="w-4 h-4" />, label: "Facebook", color: "#1877f2" },
          { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${shareText}`, icon: <TwitterIcon className="w-4 h-4" />, label: "X / Twitter", color: "#000" },
          { href: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${shareText}`, icon: <TelegramIcon className="w-4 h-4" />, label: "Telegram", color: "#0088cc" },
          { href: `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(pageUrl)}`, icon: <WhatsAppIcon className="w-4 h-4" />, label: "WhatsApp", color: "#25d366" },
          { href: `mailto:?subject=${encodeURIComponent(displayTitle)}&body=${shareText}%20${encodeURIComponent(pageUrl)}`, icon: <Mail className="w-4 h-4" />, label: "Email", color: "#ff5500" },
        ].map(({ href, icon, label, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            style={{ "--hover-color": color } as React.CSSProperties}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[rgba(20,20,30,0.9)] border border-gray-200 dark:border-[rgba(255,255,255,0.08)] text-gray-500 dark:text-[rgba(255,255,255,0.55)] shadow-md hover:text-white hover:border-transparent transition-all duration-200"
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = color; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ""; (e.currentTarget as HTMLAnchorElement).style.color = ""; }}
          >
            {icon}
          </a>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10 lg:justify-center">
        {/* ── Main article column ── */}
        <article className="flex-1 w-full max-w-3xl mx-auto lg:mx-0 min-w-0">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-[rgba(255,255,255,0.4)] mb-6 flex-wrap">
            <Link href="/" className="hover:text-[#ff5500] transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-[#ff5500] transition-colors">{t("Noticias", "News", "Péektsil")}</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-[rgba(255,255,255,0.6)] line-clamp-1">{displayTitle}</span>
          </nav>

          {/* Category badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="badge badge-news">{t("Noticias", "News", "Péektsil")}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[rgba(255,85,0,0.12)] text-[#ff5500] border border-[rgba(255,85,0,0.2)]">
              <MapPin className="w-3 h-3" /> {post.state}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            {displayTitle}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-[rgba(255,255,255,0.45)] border-b border-gray-200 dark:border-[rgba(255,255,255,0.07)] pb-4">
            <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)]">
              <img src="/logo.png" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span>La Yucateca</span>
            </div>
            <span>·</span>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </time>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{mins} {t("min de lectura", "min read", "min")}</span>
            </div>
          </div>

          {/* Hero Image — always shown */}
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "36px",
              aspectRatio: "16/9",
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={heroImage}
              alt={displayTitle}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGES.default;
              }}
            />
          </div>

          {/* Speech player */}
          <SpeechPlayer text={cleanedContent} />

          {/* Article body */}
          <div
            className="article-body"
            style={{
              color: "var(--text-primary)",
              fontSize: "1.125rem",
              lineHeight: 1.9,
              letterSpacing: "0.012em",
              marginTop: "28px",
            }}
          >
            {paragraphs.map((paragraph, idx) => {
              const dropCapClass = idx === 0
                ? "first-letter:text-5xl first-letter:font-black first-letter:text-[#ff5500] first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:mt-1"
                : "";

              // Inject a mid-article ad after the 3rd paragraph
              if (idx === 3) {
                return (
                  <React.Fragment key={idx}>
                    <AdSenseAd adFormat="auto" fullWidthResponsive={true} />
                    <p style={{ marginBottom: "1.6em" }}>
                      {paragraph}
                    </p>
                  </React.Fragment>
                );
              }
              return (
                <p
                  key={idx}
                  style={{ marginBottom: "1.6em" }}
                  className={dropCapClass}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          <div className="divider my-8" />

          {/* Bottom share bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-5 rounded-2xl bg-gray-50 dark:bg-[rgba(255,255,255,0.03)] border border-gray-200 dark:border-[rgba(255,255,255,0.07)] mb-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-[rgba(255,255,255,0.75)]">
              <Share2 className="w-4 h-4 text-[#ff5500]" />
              {t("Comparte esta noticia", "Share this article", "K'eex le péektsil")}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {[
                { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, icon: <FacebookIcon className="w-4 h-4" />, label: "Facebook", bg: "#1877f2" },
                { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${shareText}`, icon: <TwitterIcon className="w-4 h-4" />, label: "X", bg: "#000" },
                { href: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${shareText}`, icon: <TelegramIcon className="w-4 h-4" />, label: "Telegram", bg: "#0088cc" },
                { href: `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(pageUrl)}`, icon: <WhatsAppIcon className="w-4 h-4" />, label: "WhatsApp", bg: "#25d366" },
                { href: `mailto:?subject=${encodeURIComponent(displayTitle)}&body=${shareText}%20${encodeURIComponent(pageUrl)}`, icon: <Mail className="w-4 h-4" />, label: "Email", bg: "#ff5500" },
              ].map(({ href, icon, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-gray-200 dark:border-[rgba(255,255,255,0.1)] text-gray-600 dark:text-[rgba(255,255,255,0.7)] hover:text-white transition-all duration-200"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = bg; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = ""; (e.currentTarget as HTMLAnchorElement).style.borderColor = ""; }}
                >
                  {icon} {label}
                </a>
              ))}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-gray-200 dark:border-[rgba(255,255,255,0.1)] text-gray-600 dark:text-[rgba(255,255,255,0.7)] hover:bg-[#ff5500] hover:text-white hover:border-transparent transition-all duration-200"
              >
                {copied ? "✓ Copiado" : "🔗 Copiar"}
              </button>
            </div>
          </div>

          {/* AdSense — bottom of article */}
          <AdSenseAd adFormat="auto" fullWidthResponsive={true} />

          {/* Comments section */}
          <section className="space-y-6 mt-10 mb-12">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-[rgba(255,255,255,0.07)] pb-3">
              <FacebookIcon className="w-5 h-5 text-[#1877f2]" />
              {t("Comentarios de Facebook", "Facebook Comments", "Comentarios de Facebook")}
            </h3>

            <div className="bg-white dark:bg-[#e4e6eb] rounded-xl overflow-hidden p-2">
              <div 
                className="fb-comments" 
                data-href={pageUrl} 
                data-width="100%" 
                data-numposts="5"
              ></div>
            </div>
          </section>

          <div className="flex gap-3 flex-wrap">
            <Link href="/news" className="btn-ghost text-sm">
              ← {t("Todas las Noticias", "All News", "Tuláakal Péektsil")}
            </Link>
          </div>
        </article>

        {/* ── Right sidebar ── */}
        {similarPosts && similarPosts.length > 0 && (
          <aside className="hidden lg:block lg:w-[320px] xl:w-[360px] shrink-0 space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b-2 border-[#ff5500] pb-2 inline-block">
              {t("Más Noticias", "More News", "Más Péektsil")}
            </h2>
            <div className="flex flex-col gap-4">
              {similarPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/news/${p.slug}`}
                  className="group flex gap-3 p-3 rounded-xl border border-gray-200 dark:border-[rgba(255,255,255,0.06)] bg-white dark:bg-[rgba(15,15,25,0.4)] hover:border-[#ff5500]/40 hover:shadow-md transition-all"
                >
                  <div
                    className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-[rgba(255,255,255,0.04)]"
                    style={{ minWidth: "80px" }}
                  >
                    <img
                      src={p.imageUrl ?? FALLBACK_IMAGES[p.state] ?? FALLBACK_IMAGES.default}
                      alt={translateDb(p.title).split(" || ")[0]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES.default; }}
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <div className="text-[10px] text-[#ff5500] font-bold uppercase tracking-wider mb-1">{p.state}</div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.9)] group-hover:text-[#ff5500] line-clamp-2 leading-snug transition-colors">
                      {translateDb(p.title).split(" || ")[0]}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sidebar AdSense */}
            <div className="sticky top-24">
              <AdSenseAd adFormat="auto" fullWidthResponsive={false} />
            </div>
          </aside>
        )}
      </main>
      <Footer />
    </>
  );
}
