"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { ShoppingBag, Tag, MapPin, Calendar, Plus, X, Sparkles, Filter, CheckCircle, Image as ImageIcon, Upload, Bot, Loader2 } from "lucide-react";

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

export default function MercaditoPage() {
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
  
  const [imageMode, setImageMode] = useState<"URL" | "UPLOAD" | "AI">("URL");
  const [generatingAi, setGeneratingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/mercadito");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("Failed to fetch mercadito items", e);
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

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle AI generation
  const handleGenerateAi = async () => {
    if (!formData.title) {
      setErrorMsg("Ingresa un título para generar la imagen con IA.");
      return;
    }
    setErrorMsg("");
    setGeneratingAi(true);
    try {
      const res = await fetch(`/api/muna/image-proxy?prompt=${encodeURIComponent(formData.title + " high quality photo")}`);
      if (!res.ok) throw new Error("Error generating image");
      
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setErrorMsg("Error al generar imagen con IA.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/mercadito", {
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
          <span className="text-sm uppercase tracking-widest text-[#ff5500] font-bold px-3 py-1 border border-[#ff5500]/30 bg-[#ff5500]/5 rounded-full">
            {t("MERCADITO LOCAL", "LOCAL MARKETPLACE", "K'ÍIWIK")}
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight flex items-center gap-3 text-white">
            <ShoppingBag className="w-8 h-8 text-[#ff5500]" />
            <span>{t("Clasificados de la Comunidad", "Community Classifieds", "Clasificados")}</span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] mt-3">
            {t("Ventas locales, eventos culturales, servicios profesionales y promociones de la península.", "Local sales, cultural events, and promos.", "Ventas locales de la península.")}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span>{t("Publicar Clasificado", "Publish Ad", "Publicar")}</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-4 mb-8 overflow-x-auto">
        {[
          { key: "ALL", label: t("Todos", "All", "Todos"), icon: <Filter className="w-4 h-4" /> },
          { key: "GENERAL", label: t("Venta / Compra", "For Sale / Buy", "Venta"), icon: <Tag className="w-4 h-4" /> },
          { key: "EVENT", label: t("Eventos", "Events", "Eventos"), icon: <Calendar className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border transition-all ${
              filter === tab.key
                ? "bg-[#ff5500]/10 border-[#ff5500] text-white"
                : "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.2)]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="text-center py-12 text-base text-[var(--text-secondary)] flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#ff5500]" />
          Cargando anuncios...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--border-subtle)] rounded-2xl text-base text-[var(--text-secondary)]">
          No hay clasificados en esta categoría todavía. ¡Publica el tuyo hoy!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="card p-5 flex flex-col justify-between group"
                 style={{
                   transition: "transform 0.18s ease, box-shadow 0.18s ease",
                   gap: "16px",
                   backgroundColor: "var(--bg-card)",
                   border: "1px solid var(--border-subtle)",
                   borderRadius: "16px",
                   boxShadow: "var(--shadow-card)",
                 }}
                 onMouseEnter={(e) => {
                   (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                   (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-hover)";
                 }}
                 onMouseLeave={(e) => {
                   (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                   (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
                 }}
            >
              <div>
                {item.imageUrl && (
                  <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-[var(--border-subtle)] bg-black/50">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#ff5500] px-2 py-0.5 border border-[#ff5500]/20 bg-[#ff5500]/5 rounded-full">
                    {item.category === "EVENT" ? "EVENTO" : "VENTA"}
                  </span>
                  {item.price !== null && (
                    <span className="text-base font-black text-[#ff5500]">${item.price} USD</span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-white mt-3">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-4 flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#ff5500]" />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 animate-fadeInUp shadow-[0_0_50px_rgba(255,85,0,0.15)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#ff5500]" />
                Publicar en el Mercado
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-10 animate-fadeInUp">
                <CheckCircle className="w-16 h-16 text-[#ff5500] mx-auto mb-4" />
                <p className="text-lg text-white font-bold">¡Publicación exitosa!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && <div className="p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">{errorMsg}</div>}

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-1.5 tracking-wider">Título de la Publicación</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computadora Mac M1 seminueva"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input text-base py-3"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-1.5 tracking-wider">Descripción</label>
                  <textarea
                    required
                    placeholder="Detalles sobre el producto, evento, método de entrega..."
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input text-base min-h-[100px] py-3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-1.5 tracking-wider">Precio (USD - Opcional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 450"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="input text-base py-3"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-1.5 tracking-wider">Categoría</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input text-base py-3"
                    >
                      <option value="GENERAL">Venta / Clasificados</option>
                      <option value="EVENT">Eventos locales</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-1.5 tracking-wider">Ubicación</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input text-base py-3"
                  />
                </div>

                {/* Imagen Section */}
                <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-black/20">
                  <label className="text-xs font-bold text-white uppercase block mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#ff5500]" /> Imagen de Portada
                  </label>
                  
                  <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-lg">
                    <button type="button" onClick={() => setImageMode("URL")} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${imageMode === "URL" ? "bg-[#ff5500] text-white" : "text-[var(--text-secondary)] hover:text-white"}`}>URL</button>
                    <button type="button" onClick={() => setImageMode("UPLOAD")} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${imageMode === "UPLOAD" ? "bg-[#ff5500] text-white" : "text-[var(--text-secondary)] hover:text-white"}`}>Subir</button>
                    <button type="button" onClick={() => setImageMode("AI")} className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors ${imageMode === "AI" ? "bg-[#ff5500] text-white" : "text-[var(--text-secondary)] hover:text-white"}`}>Generar con IA</button>
                  </div>

                  {imageMode === "URL" && (
                    <input
                      type="text"
                      placeholder="https://..."
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="input text-sm py-3"
                    />
                  )}

                  {imageMode === "UPLOAD" && (
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary w-full justify-center flex items-center gap-2 py-3"
                      >
                        <Upload className="w-4 h-4" /> Seleccionar Imagen
                      </button>
                    </div>
                  )}

                  {imageMode === "AI" && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-[var(--text-secondary)]">Se utilizará el título de tu publicación para generar una imagen automáticamente.</p>
                      <button 
                        type="button" 
                        onClick={handleGenerateAi}
                        disabled={generatingAi || !formData.title}
                        className="btn-secondary w-full justify-center flex items-center gap-2 py-3"
                        style={{ opacity: generatingAi || !formData.title ? 0.5 : 1 }}
                      >
                        {generatingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                        {generatingAi ? "Generando..." : "Generar con Muna AI"}
                      </button>
                    </div>
                  )}

                  {formData.imageUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-[var(--border-subtle)] relative h-32">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData(prev => ({...prev, imageUrl: ""}))} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-[#ff5500] transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center py-4 text-base"
                  style={{ opacity: submitting ? 0.7 : 1 }}
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
