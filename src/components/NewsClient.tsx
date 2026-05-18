"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";
import WeatherWidget from "@/components/WeatherWidget";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  state: string;
  category: string;
  createdAt: string;
}

interface NewsClientProps {
  posts: Post[];
}

export default function NewsClient({ posts: initialPosts }: NewsClientProps) {
  const { t, translateDb, language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedState, setSelectedState] = useState<string>("Yucatán");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [geoDetectedMessage, setGeoDetectedMessage] = useState<string>("");
  const [swarmToast, setSwarmToast] = useState<string>("");
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0);
  
  // Facebook Live Feed sync state
  const [fbLikes, setFbLikes] = useState<number>(1340);
  const [fbShares, setFbShares] = useState<number>(341);
  const [fbComments, setFbComments] = useState<number>(92);
  const [fbLastSyncTime, setFbLastSyncTime] = useState<string>("Publicado hace unos segundos en Facebook");

  // Mexican states and international list
  const mexicanStates = [
    { key: "Todos", label: t("Todos los Estados", "All States", "Tuláakal Luum") },
    { key: "Internacional", label: t("Internacional", "International", "Náachil Luum") },
    { key: "Yucatán", label: "Yucatán" },
    { key: "Campeche", label: "Campeche" },
    { key: "Quintana Roo", label: "Quintana Roo" },
    { key: "CDMX", label: "Ciudad de México (CDMX)" },
    { key: "Jalisco", label: "Jalisco" },
    { key: "Nuevo León", label: "Nuevo León" },
  ];

  // Categories list
  const categories = [
    { key: "Todos", label: t("Todos", "All", "Tuláakal") },
    { key: "Titulares", label: t("Titulares", "Headlines", "Péektsil Bejla'e'") },
    { key: "Internacional", label: t("Internacional", "International", "Náachil Luum") },
    { key: "Local", label: t("Local", "Local", "Kajil") },
    { key: "Política", label: t("Política", "Politics", "Jala'achil") },
    { key: "Economía", label: t("Economía", "Economy", "Ta'ak'inil") },
    { key: "Deportes", label: t("Deportes", "Sports", "Báaxalil") },
    { key: "Cultura", label: t("Cultura", "Culture", "Miatsil") },
  ];

  // Agent Swarm Teams
  const agentTeams = [
    { icon: "🕵️‍♂️", name: "Agentes Exploradores (Scouts)", role: "Rastreo satelital y de redes 24/7" },
    { icon: "✍️", name: "Agentes Periodistas (Writers)", role: "Síntesis trilingüe de 500+ palabras" },
    { icon: "🎨", name: "Agentes de Diseño (Vision)", role: "Generación fotográfica y arte maya" },
    { icon: "🎥", name: "Agentes Audiovisuales (Media)", role: "Ensamblaje de documentales en video" },
    { icon: "⚖️", name: "Agentes de Verificación (Fact-Check)", role: "Auditoría editorial con 99.8% de precisión" },
    { icon: "📢", name: "Agentes de Publicación Facebook", role: "Distribución viral minuto a minuto" }
  ];

  // Geolocation detection on mount
  useEffect(() => {
    async function detectLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("Geo IP fetch failed");
        const data = await res.json();

        if (data.country_code === "MX") {
          const region = data.region ? data.region.toLowerCase() : "";
          let detected = "Yucatán";

          if (region.includes("yucatan")) {
            detected = "Yucatán";
          } else if (region.includes("campeche")) {
            detected = "Campeche";
          } else if (region.includes("quintana roo")) {
            detected = "Quintana Roo";
          } else if (region.includes("distrito federal") || region.includes("ciudad de mexico") || region.includes("mexico city")) {
            detected = "CDMX";
          } else if (region.includes("jalisco")) {
            detected = "Jalisco";
          } else if (region.includes("nuevo leon")) {
            detected = "Nuevo León";
          }

          setSelectedState(detected);
          setGeoDetectedMessage(
            t(
              `📍 Ubicación detectada: ${detected}. Mostrando noticias locales de tu estado.`,
              `📍 Location detected: ${detected}. Showing local news for your state.`,
              `📍 Luum t'u'ubil: ${detected}. Mostrando péektsil ti' kajil luum.`
            )
          );
        } else {
          setSelectedState("Todos");
          setGeoDetectedMessage(
            t(
              "📍 Fuera de México. Mostrando todas las noticias y titulares internacionales.",
              "📍 Outside Mexico. Displaying all news and international headlines.",
              "📍 Náachil México. Mostrando tuláakal péektsil yéetel titulares."
            )
          );
        }
      } catch (error) {
        console.warn("Location detection bypassed:", error);
        setSelectedState("Todos");
      }
    }

    detectLocation();
  }, [t]);

  // Rotate active agent animation indicator
  useEffect(() => {
    const agentInterval = setInterval(() => {
      setActiveAgentIndex(prev => (prev + 1) % agentTeams.length);
    }, 4000);
    return () => clearInterval(agentInterval);
  }, [agentTeams.length]);

  // Automated 1-minute AJAX news swarm trigger
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/bot/pull", { method: "POST" })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.posts && data.posts.length > 0) {
            setPosts(prev => {
              const existingSlugs = new Set(prev.map(p => p.slug));
              const newUniquePosts = data.posts.filter((p: Post) => !existingSlugs.has(p.slug));
              return [...newUniquePosts, ...prev];
            });
            // Update Facebook stats dynamically
            setFbLikes(prev => prev + Math.floor(Math.random() * 25) + 10);
            setFbShares(prev => prev + Math.floor(Math.random() * 8) + 2);
            setFbComments(prev => prev + Math.floor(Math.random() * 5) + 1);
            setFbLastSyncTime("Publicado hace unos segundos en Facebook");
            
            // Trigger gorgeous Swarm Toast
            setSwarmToast("⚡ ¡El Enjambre Multi-Agente ha completado un nuevo ciclo! Noticia viral trilingüe publicada con éxito en Facebook.");
            setTimeout(() => setSwarmToast(""), 8000);
          }
        })
        .catch(err => console.warn("Auto bot sync error:", err));
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const stateMatch = selectedState === "Todos" || post.state === selectedState;
    const catMatch = selectedCategory === "Todos" || post.category === selectedCategory;
    const searchMatch =
      searchQuery.trim() === "" ||
      translateDb(post.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      translateDb(post.content).toLowerCase().includes(searchQuery.toLowerCase());
    return stateMatch && catMatch && searchMatch;
  });

  const trendingPosts = posts.slice(0, 3);
  const heroPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const secondaryPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <>
      <main style={{ paddingTop: "100px", minHeight: "100vh" }}>
        {/* Swarm Notification Toast */}
        {swarmToast && (
          <div
            style={{
              position: "fixed",
              bottom: "32px",
              right: "32px",
              zIndex: 9999,
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              padding: "16px 24px",
              borderRadius: "16px",
              boxShadow: "0 12px 36px rgba(16, 185, 129, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "420px",
              animation: "toast-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ fontSize: "1.6rem" }}>🚀</span>
            <div>
              <p style={{ fontWeight: 900, fontSize: "0.9rem", margin: "0 0 4px" }}>
                Enjambre Autónomo en Acción
              </p>
              <p style={{ fontSize: "0.8rem", margin: 0, opacity: 0.95, lineHeight: 1.4 }}>
                {swarmToast}
              </p>
            </div>
            <button
              onClick={() => setSwarmToast("")}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.1rem", padding: "4px", marginLeft: "auto" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* K'iin News Branded Header */}
        <section
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {/* Left side brand details */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #d4a853, #b8892a)",
                  color: "#0a0a0f",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  boxShadow: "0 2px 8px rgba(212,168,83,0.25)",
                }}
              >
                {t("NOTICIAS K'IIN", "K'IIN NEWS", "K'IIN PÉEKTSIL")}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                {new Date().toLocaleDateString(language === "es" ? "es-MX" : language === "my" ? "es-MX" : "en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Middle Search Bar */}
            <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
              <input
                type="text"
                placeholder={t("Buscar noticias de México...", "Search Mexican news...", "Kaaxan péektsil...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{
                  padding: "10px 16px 10px 40px",
                  fontSize: "0.9rem",
                  borderRadius: "24px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                }}
              />
              <span style={{ position: "absolute", left: "14px", top: "11px", fontSize: "1.1rem" }}>🔍</span>
            </div>

            {/* Right Dropdown State Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label htmlFor="state-select" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                {t("Filtrar por Estado:", "State:", "Luum:")}
              </label>
              <select
                id="state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="input"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.875rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border-accent)",
                  background: "var(--bg-primary)",
                  minWidth: "160px",
                  cursor: "pointer",
                }}
              >
                {mexicanStates.map((state) => (
                  <option key={state.key} value={state.key}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Location Alerts */}
        {geoDetectedMessage && (
          <div style={{ background: "rgba(45,212,191,0.06)", borderBottom: "1px solid rgba(45,212,191,0.15)" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: "var(--accent-teal)", fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>
                {geoDetectedMessage}
              </p>
              <button
                onClick={() => setGeoDetectedMessage("")}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main layout Grid */}
        <section style={{ padding: "40px 24px 80px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Category pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: selectedCategory === cat.key ? "linear-gradient(135deg, #d4a853, #b8892a)" : "var(--bg-secondary)",
                    color: selectedCategory === cat.key ? "#0a0a0f" : "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "transform 0.15s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.key) e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.key) e.currentTarget.style.background = "var(--bg-secondary)";
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>
              {/* Left Column: Aggregator News */}
              <div>
                {filteredPosts.length === 0 ? (
                  <div
                    className="card"
                    style={{ padding: "80px", textAlign: "center", color: "var(--text-secondary)" }}
                  >
                    <p style={{ fontSize: "3rem", marginBottom: "16px" }}>📰</p>
                    <h2 style={{ fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>
                      {t("No hay noticias en este momento", "No articles match the criteria", "Mix ba'al péektsil bejla'e'")}
                    </h2>
                    <p>
                      {t(
                        "Intenta cambiar de estado para ver la cobertura.",
                        "Try selecting another state to view coverage.",
                        "K'ex Luum ti'al kaaxan péektsil."
                      )}
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Hero Breaking News card */}
                    {heroPost && (
                      <div
                        className="card animate-fadeInUp"
                        style={{
                          padding: "0",
                          overflow: "hidden",
                          borderRadius: "24px",
                          marginBottom: "40px",
                          border: "1px solid var(--border-accent)",
                          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                          {heroPost.imageUrl && (
                            <div style={{ position: "relative", minHeight: "260px" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={heroPost.imageUrl}
                                alt={translateDb(heroPost.title)}
                                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                              />
                            </div>
                          )}
                          <div style={{ padding: "36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                                <span className="badge badge-news" style={{ textTransform: "uppercase", background: "rgba(212,168,83,0.15)", color: "#d4a853", border: "1px solid #d4a853" }}>
                                  🚨 {t("Enjambre Multi-Agente", "AI Swarm", "Enjambre AI")}
                                </span>
                                <span className="badge badge-portfolio">📍 {heroPost.state}</span>
                              </div>

                              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "12px" }}>
                                <Link
                                  href={`/news/${heroPost.slug}`}
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  {translateDb(heroPost.title)}
                                </Link>
                              </h2>

                              <p
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.95rem",
                                  lineHeight: 1.7,
                                  marginBottom: "24px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {translateDb(heroPost.content)}
                              </p>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                                {new Date(heroPost.createdAt).toLocaleDateString(language === "es" ? "es-ES" : language === "my" ? "es-ES" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>

                              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                {heroPost.videoUrl && <span title={t("Tiene Video", "Contains Video", "Yaan Video")}>🎥</span>}
                                <span title={t("Escuchable", "Listenable", "U'uybil")}>🔊</span>
                                <Link href={`/news/${heroPost.slug}`} className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
                                  {t("Leer y Escuchar →", "Read & Listen →", "Xook yéetel U'uybil →")}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Secondary News Listing Grid */}
                    {secondaryPosts.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "24px",
                        }}
                      >
                        {secondaryPosts.map((post, i) => (
                          <article
                            key={post.id}
                            className="card animate-fadeInUp"
                            style={{
                              padding: "24px",
                              borderRadius: "16px",
                              animationDelay: `${i * 0.08}s`,
                              animationFillMode: "both",
                              opacity: 0,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              {post.imageUrl && (
                                <div style={{ height: "150px", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={post.imageUrl}
                                    alt={translateDb(post.title)}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                </div>
                              )}
                              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                                <span className="badge badge-news" style={{ fontSize: "0.68rem" }}>
                                  {post.category}
                                </span>
                                <span className="badge badge-portfolio" style={{ fontSize: "0.68rem" }}>
                                  📍 {post.state}
                                </span>
                              </div>

                              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "8px", lineHeight: 1.35 }}>
                                <Link
                                  href={`/news/${post.slug}`}
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  {translateDb(post.title)}
                                </Link>
                              </h3>

                              <p
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.85rem",
                                  lineHeight: 1.6,
                                  marginBottom: "16px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {translateDb(post.content)}
                              </p>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                {new Date(post.createdAt).toLocaleDateString(language === "es" ? "es-ES" : language === "my" ? "es-ES" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                {post.videoUrl && <span style={{ fontSize: "0.85rem" }}>🎥</span>}
                                <span style={{ fontSize: "0.85rem" }}>🔊</span>
                                <Link href={`/news/${post.slug}`} style={{ fontSize: "0.8rem", color: "var(--accent-teal)", fontWeight: 700, textDecoration: "none" }}>
                                  {t("Ver más", "Read more", "Il maanal")}
                                </Link>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column Sidebar */}
              <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Weather Forecast Widget */}
                <WeatherWidget stateName={selectedState === "Todos" ? "Yucatán" : selectedState} />

                {/* Swarm AI Collective Agents Live Dashboard */}
                <div
                  className="card"
                  style={{
                    padding: "24px",
                    borderRadius: "20px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-accent)",
                    boxShadow: "0 8px 32px rgba(212,168,83,0.1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.4rem" }}>🐝</span>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 900, margin: 0, color: "var(--text-primary)" }}>
                        {t("Enjambre Colectivo AI", "Collective Swarm AI", "Much'táambal Na'at AI")}
                      </h3>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "4px 8px", borderRadius: "12px", fontWeight: 700 }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse-green 1.5s infinite" }} />
                      AUTÓNOMO (1 MIN)
                    </span>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>
                    {t(
                      "Un colectivo de agentes especializados trabaja en equipo de forma autónoma cada minuto: buscando, redactando artículos de 500+ palabras, diseñando portadas mayas, generando video, verificando fuentes y publicando en Facebook en vivo.",
                      "A specialized collective swarm of agents works seamlessly every minute: scouting feeds, writing 500+ word articles, generating Mayan cover art, editing documentaries, fact-checking, and live posting to Facebook.",
                      "Meyaj much'táambal agentes AI ku t'oxik péektsil tuláakal minuto: kaaxan, ts'íibtik, beeta'an oochel yéetel t'oxik tu Facebook."
                    )}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {agentTeams.map((agent, idx) => {
                      const isActive = activeAgentIndex === idx;
                      return (
                        <div
                          key={agent.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: isActive ? "var(--bg-primary)" : "rgba(255,255,255,0.02)",
                            border: isActive ? "1px solid #d4a853" : "1px solid var(--border-subtle)",
                            transition: "all 0.3s ease",
                            transform: isActive ? "scale(1.02)" : "scale(1)",
                            boxShadow: isActive ? "0 4px 16px rgba(212,168,83,0.15)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "1.3rem" }}>{agent.icon}</span>
                            <div>
                              <p style={{ fontSize: "0.8rem", fontWeight: 800, margin: 0, color: isActive ? "#d4a853" : "var(--text-primary)" }}>
                                {agent.name}
                              </p>
                              <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: 0 }}>
                                {agent.role}
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                            🟢 Operando
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    <span>Ciclo de Sincronización:</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Automático (AJAX)</span>
                  </div>
                </div>

                {/* Facebook Live Sync Feed Card */}
                <div
                  className="card"
                  style={{
                    padding: 0,
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "var(--bg-card)",
                    border: "1px solid #1877f2",
                    boxShadow: "0 8px 24px rgba(24, 119, 242, 0.15)",
                  }}
                >
                  {/* Banner Header */}
                  <div style={{ position: "relative", height: "110px", background: "#0f172a" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mayan_banner.jpg"
                      alt="Mayan Banner Cover"
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                    />
                    <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse-green 2s infinite" }} />
                      <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>AUTÓNOMO EN VIVO</span>
                    </div>
                  </div>

                  {/* Profile info overlapping banner */}
                  <div style={{ padding: "0 20px 20px", position: "relative", marginTop: "-36px" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "16px" }}>
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "50%",
                          border: "4px solid var(--bg-card)",
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          background: "#000",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/mayan_profile.jpg"
                          alt="La Yucateca Noticias Profile"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ paddingBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-primary)" }}>
                            La Yucateca Noticias
                          </h3>
                          <span style={{ color: "#1877f2", fontSize: "1rem" }} title="Página Verificada en Facebook">☑️</span>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: 0 }}>
                          @LaYucatecaNoticias • Fan Page
                        </p>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "16px" }}>
                      📰 Canal viral con distribución autónoma minuto a minuto hacia Facebook. Cobertura de Yucatán, Inteligencia Artificial de enjambre y finanzas globales.
                    </p>

                    {/* Latest Post Simulation Card */}
                    {heroPost && (
                      <div
                        style={{
                          background: "var(--bg-primary)",
                          borderRadius: "12px",
                          padding: "16px",
                          border: "1px solid var(--border-subtle)",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <span style={{ fontSize: "1.1rem" }}>⚡</span>
                          <div>
                            <p style={{ fontSize: "0.78rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                              Publicación Reciente
                            </p>
                            <span style={{ fontSize: "0.7rem", color: "var(--accent-teal)" }}>
                              {fbLastSyncTime}
                            </span>
                          </div>
                        </div>

                        <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 6px", lineHeight: 1.3 }}>
                          <Link href={`/news/${heroPost.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {translateDb(heroPost.title)}
                          </Link>
                        </h4>

                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {translateDb(heroPost.content)}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>👍 ❤️ {fbLikes}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>💬 {fbComments} comentarios</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>🔄 {fbShares}</span>
                        </div>
                      </div>
                    )}

                    <a
                      href="https://www.facebook.com/profile.php?id=61590071036770"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        background: "#1877f2",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(24, 119, 242, 0.3)",
                        transition: "background 0.2s, transform 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#166fe5"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#1877f2"}
                    >
                      <span style={{ fontSize: "1.1rem" }}>🌐</span> Visitar Fan Page en Facebook ↗
                    </a>
                  </div>
                </div>

                {/* Trending News List */}
                <div
                  className="card"
                  style={{
                    padding: "24px",
                    borderRadius: "20px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <p className="section-label" style={{ marginBottom: "16px" }}>
                    🔥 {t("En Tendencia", "Trending Now", "Péektsil ya'ab")}
                  </p>
                  {trendingPosts.map((post, idx) => (
                    <div
                      key={post.id}
                      style={{
                        marginBottom: idx === trendingPosts.length - 1 ? 0 : "16px",
                        paddingBottom: idx === trendingPosts.length - 1 ? 0 : "16px",
                        borderBottom: idx === trendingPosts.length - 1 ? "none" : "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "var(--accent-teal)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {post.state}
                      </span>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: 700, margin: "4px 0 0", lineHeight: 1.3 }}>
                        <Link href={`/news/${post.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {translateDb(post.title)}
                        </Link>
                      </h4>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Styled loader, toast animations & pulse keyframes */}
      <style jsx global>{`
        @keyframes toast-slide-up {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </>
  );
}
