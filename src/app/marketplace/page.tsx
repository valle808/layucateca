"use client";



import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { ShoppingBag, Tag, MapPin, Calendar, Plus, X, Sparkles, Filter, CheckCircle } from "lucide-react";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price?: number | null;
  location: string;
  imageUrl?: string | null;
  category: string;
  createdAt: string;
}

export default function MarketplacePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // Create posting modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "Mérida, Yucatán",
    imageUrl: "",
    category: "General",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/marketplace");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("Failed to fetch marketplace items", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          authorId: user?.id || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        fetchItems();
        setFormData({
          title: "",
          description: "",
          price: "",
          location: "Mérida, Yucatán",
          imageUrl: "",
          category: "General",
        });
        setTimeout(() => {
          setSuccess(false);
          setShowModal(false);
        }, 1500);
      } else {
        setErrorMsg(data.error || "Ocurrió un error al procesar.");
      }
    } catch (err) {
      setErrorMsg("Error de red.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "ALL") return true;
    return item.category.toUpperCase() === filter;
  });

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-12 animate-fadeInUp">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-bold px-3 py-1 border border-[rgba(255,85,0,0.3)] bg-[rgba(255,85,0,0.05)] rounded-full">
            {t("MERCADO LOCAL", "LOCAL MARKETPLACE", "K'ÍIWIK")}
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-[#ff5500]" />
            <span>{t("Clasificados de la Comunidad", "Community Classifieds", "Clasificados")}</span>
          </h1>
          <p className="text-sm text-[rgba(255,255,255,0.65)] mt-3">
            {t("Ventas locales, eventos culturales, servicios profesionales y promociones de la península.", "Local sales, cultural events, and promos.", "Ventas locales de la península.")}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#ff5500", color: "#fff",
            padding: "12px 24px", borderRadius: "10px",
            fontWeight: 700, fontSize: "0.85rem",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 14px rgba(255,85,0,0.3)",
            transition: "opacity 0.18s ease, transform 0.1s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus className="w-4 h-4" />
          <span>{t("Publicar Clasificado", "Publish Ad", "Publicar")}</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-8 overflow-x-auto">
        {[
          { key: "ALL", label: t("Todos", "All", "Todos"), icon: <Filter className="w-3.5 h-3.5" /> },
          { key: "GENERAL", label: t("Venta / Compra", "For Sale / Buy", "Venta"), icon: <Tag className="w-3.5 h-3.5" /> },
          { key: "EVENT", label: t("Eventos", "Events", "Eventos"), icon: <Calendar className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${
              filter === tab.key
                ? "bg-[rgba(255,85,0,0.08)] border-[#ff5500] text-white"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.04)]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[rgba(255,255,255,0.4)]">Cargando anuncios...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[rgba(255,255,255,0.08)] rounded-2xl text-xs text-[rgba(255,255,255,0.45)]">
          No hay clasificados en esta categoría todavía. ¡Publica el tuyo hoy!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="card p-5 flex flex-col justify-between"
                 style={{
                   transition: "transform 0.18s ease, box-shadow 0.18s ease",
                   gap: "16px",
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
              <div>
                {item.imageUrl && (
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-[rgba(255,255,255,0.06)]">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#ff5500] px-2 py-0.5 border border-[rgba(255,85,0,0.2)] bg-[rgba(255,85,0,0.02)] rounded-full">
                    {item.category === "EVENT" ? "EVENTO" : "VENTA"}
                  </span>
                  {item.price !== null && (
                    <span className="text-sm font-black text-[#ff5500]">${item.price} USD</span>
                  )}
                </div>
                <h3 className="font-bold text-base text-white mt-3">{item.title}</h3>
                <p className="text-xs text-[rgba(255,255,255,0.6)] mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 flex items-center justify-between text-[10px] text-[rgba(255,255,255,0.4)]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#ff5500]" />
                  {item.location}
                </span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[rgba(15,15,25,0.95)] border border-[rgba(255,85,0,0.3)] rounded-2xl max-w-md w-full p-6 space-y-4 animate-fadeInUp shadow-[0_0_50px_rgba(255,85,0,0.15)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-3">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ff5500]" />
                Publicar en el Mercado
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[rgba(255,255,255,0.5)] hover:text-white text-sm">
                ✕
              </button>
            </div>

            {success ? (
              <div className="text-center py-6 animate-fadeInUp">
                <CheckCircle className="w-12 h-12 text-[#ff5500] mx-auto mb-3" />
                <p className="text-sm text-white font-bold">¡Publicación exitosa!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && <div className="p-3 text-xs bg-[rgba(255,0,0,0.1)] border border-red-500/30 text-red-400 rounded-lg">{errorMsg}</div>}

                <div>
                  <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">Título de la Publicación</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computadora Mac M1 seminueva"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">Descripción</label>
                  <textarea
                    required
                    placeholder="Detalles sobre el producto, evento, método de entrega..."
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input text-xs min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">Precio (USD - Opcional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 450"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">Categoría</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input text-xs"
                    >
                      <option value="GENERAL">Venta / Clasificados</option>
                      <option value="EVENT">Eventos locales</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">Ubicación</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">URL de Imagen (Opcional)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    background: "#ff5500", color: "#fff",
                    padding: "12px", borderRadius: "10px",
                    fontWeight: 700, fontSize: "0.85rem",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(255,85,0,0.3)",
                    transition: "opacity 0.18s ease",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Publicando..." : "Publicar Anuncio"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
