"use client";

import AdSenseAd from "@/components/AdSenseAd";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import Footer from "@/components/Footer";
import SpeechPlayer from "@/components/SpeechPlayer";
import { Mail, MessageCircle, Sparkles, Send, MessageSquare } from "lucide-react";

// Local inline SVG icons for social platforms to ensure compatibility
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

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

export default function NewsArticleClient({ post, similarPosts = [] }: NewsArticleClientProps) {
  const { t, translateDb, language } = useLanguage();
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`Lee esta noticia en La Yucateca: ${post.title}`);

  useEffect(() => {

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?postId=${post.id}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (e) {
        console.error("Failed to load comments", e);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [post.id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setCommentError("");
    const text = commentInput;
    setCommentInput("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          authorName: user?.name || "Anónimo",
          authorId: user?.id || null,
          postId: post.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh comments list
        setComments([data.comment, ...comments]);
      } else {
        setCommentError(data.error || "Ocurrió un error al enviar tu comentario.");
      }
    } catch (err) {
      setCommentError("Error de red.");
    }
  };

  return (
    <>
      {/* Sticky Social Share Widget (Left Side on Desktop, Bottom on Mobile) */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-40 bg-[rgba(15,15,25,0.7)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md p-3 rounded-full shadow-lg">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgba(255,255,255,0.6)] hover:text-[#ff5500] p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-all"
          title="Compartir en Facebook"
        >
          <FacebookIcon className="w-5 h-5" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgba(255,255,255,0.6)] hover:text-[#ff5500] p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-all"
          title="Compartir en X"
        >
          <TwitterIcon className="w-5 h-5" />
        </a>
        <a
          href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgba(255,255,255,0.6)] hover:text-[#ff5500] p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-all"
          title="Compartir en WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${shareText}%20${encodeURIComponent(pageUrl)}`}
          className="text-[rgba(255,255,255,0.6)] hover:text-[#ff5500] p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-all"
          title="Enviar por Correo"
        >
          <Mail className="w-5 h-5" />
        </a>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row lg:justify-center gap-8">
        <article className="flex-1 w-full max-w-3xl mx-auto lg:mx-0">
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
            <span className="badge badge-news">{t("Noticias", "News", "Péektsil")}</span>
            <span className="badge badge-portfolio">📍 {post.state}</span>
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
              <img src={post.imageUrl} alt={translateDb(post.title)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div className="divider" />

          <div
            className="article-body"
            style={{
              color: "var(--text-primary)",
              fontSize: "1.15rem",
              lineHeight: 2.1,
              letterSpacing: "0.01em",
            }}
          >
            {translateDb(post.content).split('\n').map((paragraph, idx) => {
              if (!paragraph.trim()) return null;
              return (
                <p 
                  key={idx} 
                  style={{ 
                    marginBottom: "1.5em", 
                    opacity: 0.9 
                  }}
                  className={idx === 0 ? "first-letter:text-6xl first-letter:font-black first-letter:text-[#ff5500] first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:mt-2" : ""}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          <div className="divider" />

          {/* Social Sharing before AdSense */}
          <div className="mb-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t("Comparte esta noticia", "Share this news", "K'eex le péektsil")}</h3>
            <div className="flex justify-center lg:justify-start gap-3">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#1877f2] hover:text-white rounded-full transition-colors border border-gray-200 dark:border-[rgba(255,255,255,0.1)] text-gray-600 dark:text-[rgba(255,255,255,0.7)]"><FacebookIcon className="w-5 h-5" /></a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#1da1f2] hover:text-white rounded-full transition-colors border border-gray-200 dark:border-[rgba(255,255,255,0.1)] text-gray-600 dark:text-[rgba(255,255,255,0.7)]"><TwitterIcon className="w-5 h-5" /></a>
              <a href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#25d366] hover:text-white rounded-full transition-colors border border-gray-200 dark:border-[rgba(255,255,255,0.1)] text-gray-600 dark:text-[rgba(255,255,255,0.7)]"><MessageCircle className="w-5 h-5" /></a>
              <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${shareText}%20${encodeURIComponent(pageUrl)}`} className="p-3 bg-gray-100 dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#ff5500] hover:text-white rounded-full transition-colors border border-gray-200 dark:border-[rgba(255,255,255,0.1)] text-gray-600 dark:text-[rgba(255,255,255,0.7)]"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          {/* AdSense — one ad per article, placed after body, before comments */}
          <AdSenseAd adFormat="auto" fullWidthResponsive={true} />

          {/* Mobile Sharing shortcuts */}
          <div className="flex lg:hidden gap-3 items-center justify-center py-4 border-b border-gray-200 dark:border-[rgba(255,255,255,0.06)] mb-8">
            <span className="text-xs text-gray-500 dark:text-[rgba(255,255,255,0.4)] uppercase font-bold">{t("Compartir:", "Share:", "Compartir:")}</span>
            <div className="flex justify-center gap-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-[rgba(255,255,255,0.03)] border border-gray-200 dark:border-[rgba(255,255,255,0.06)] rounded-full text-gray-600 dark:text-white"><FacebookIcon className="w-4 h-4" /></a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-[rgba(255,255,255,0.03)] border border-gray-200 dark:border-[rgba(255,255,255,0.06)] rounded-full text-gray-600 dark:text-white"><TwitterIcon className="w-4 h-4" /></a>
              <a href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-[rgba(255,255,255,0.03)] border border-gray-200 dark:border-[rgba(255,255,255,0.06)] rounded-full text-gray-600 dark:text-white"><MessageCircle className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Comments Section */}
          <section className="space-y-6 mb-12">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center lg:justify-start gap-2">
              <MessageSquare className="w-5 h-5 text-[#ff5500]" />
              <span>{t("Comentarios de la Comunidad", "Community Comments", "Comentarios")} ({comments.length})</span>
            </h3>

            {/* Post comment form */}
            <form onSubmit={handlePostComment} className="space-y-3">
              {commentError && (
                <div className="p-3 text-xs bg-[rgba(255,0,0,0.1)] border border-red-500/30 text-red-400 rounded-lg">
                  {commentError}
                </div>
              )}
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={user ? `Escribe como ${user.name}...` : "Escribe un comentario público (Anónimo)..."}
                required
                className="input text-xs min-h-[70px]"
              />
              <div className="flex justify-end">
                <button type="submit" className="btn-primary border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] py-2 px-5 text-xs font-bold flex items-center gap-2">
                  <span>{t("Comentar", "Post Comment", "Comentar")}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Comments list */}
            {loadingComments ? (
              <div className="text-xs text-center lg:text-left text-gray-500 dark:text-[rgba(255,255,255,0.4)]">Cargando comentarios...</div>
            ) : comments.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-300 dark:border-[rgba(255,255,255,0.08)] rounded-xl text-center text-xs text-gray-500 dark:text-[rgba(255,255,255,0.45)]">
                No hay comentarios en esta noticia. ¡Sé el primero en compartir tu opinión!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comm) => (
                  <div key={comm.id} className="p-4 rounded-xl border border-gray-200 dark:border-[rgba(255,255,255,0.05)] bg-gray-50 dark:bg-[rgba(15,15,25,0.3)] space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                      <span className="font-bold text-gray-900 dark:text-white">{comm.authorName}</span>
                      <span>{new Date(comm.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-[rgba(255,255,255,0.75)] leading-relaxed">
                      {comm.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/news" className="btn-ghost">
              ← {t("Todas las Noticias", "All News", "Tuláakal Péektsil")}
            </Link>
          </div>
        </article>

        {/* Right Sidebar: Similar News */}
        {similarPosts && similarPosts.length > 0 && (
          <aside className="hidden lg:block lg:w-[340px] shrink-0 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-[rgba(255,255,255,0.1)] pb-3">
              {t("Noticias Similares", "Similar News", "Péektsil")}
            </h2>
            <div className="flex flex-col gap-4">
              {similarPosts.map(p => (
                <Link key={p.id} href={`/news/${p.slug}`} className="group block bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] border border-gray-200 dark:border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] transition-all">
                  {p.imageUrl && (
                    <div className="h-32 overflow-hidden">
                      <img src={p.imageUrl} alt={translateDb(p.title)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-xs text-[#ff5500] dark:text-[rgba(255,85,0,0.8)] font-bold mb-1 uppercase tracking-wider">{p.state}</div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[rgba(255,255,255,0.9)] group-hover:text-[#ff5500] line-clamp-2 leading-snug">
                      {translateDb(p.title)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </main>
      <Footer />
    </>
  );
}
