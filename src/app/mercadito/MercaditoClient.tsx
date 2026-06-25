"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { ShoppingBag, Tag, MapPin, Calendar, Plus, X, Sparkles, Filter, CheckCircle, Image as ImageIcon, Upload, Bot, Loader2, Store } from "lucide-react";
import Footer from "@/components/Footer";

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
  const { t } = useLanguage();
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
      const res = await fetch(`/api/muna/image-proxy?prompt=${encodeURIComponent(formData.title + " product photography, high quality, realistic")}`);
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
        }, 2000);
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
    <>
    <main className="min-h-screen bg-[var(--bg-main)] pb-24">
      {/* ── STUNNING HERO SECTION ── */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ff5500]/20 rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#ffaa00]/10 rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            {t("MERCADITO LOCAL", "LOCAL MARKETPLACE", "K'ÍIWIK")}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight mb-6">
            Encuentra lo que <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-[#ffaa00]">necesitas aquí.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 font-medium leading-relaxed">
            {t("Compra, vende y descubre servicios locales en la península. Desde artículos usados hasta eventos culturales increíbles.", "Buy, sell, and discover local services in the peninsula. From used items to amazing cultural events.", "Kíinsaj, koonol yéetel k'a'ajsaj meyajil te' péeninsula.")}
          </p>
          
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
          >
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
            <span>{t("Publicar Anuncio Gratis", "Post Free Ad", "Publicar")}</span>
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* ── FILTER TABS ── */}
        <div className="flex gap-3 border-b border-[var(--border-subtle)] pb-6 mb-10 overflow-x-auto scrollbar-hide sticky top-20 z-20 bg-[var(--bg-main)]/80 backdrop-blur-xl pt-4">
          {[
            { key: "ALL", label: t("Todos", "All", "Todos"), icon: <Store className="w-5 h-5" /> },
            { key: "GENERAL", label: t("Compra / Venta", "Buy / Sell", "Venta"), icon: <Tag className="w-5 h-5" /> },
            { key: "EVENT", label: t("Eventos", "Events", "Eventos"), icon: <Calendar className="w-5 h-5" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2.5 transition-all whitespace-nowrap ${
                filter === tab.key
                  ? "bg-[#ff5500] text-white shadow-[0_4px_20px_rgba(255,85,0,0.4)]"
                  : "bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[#ff5500]/50 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── GALLERY ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[var(--text-secondary)]">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-[#ff5500]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#ff5500] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="font-bold tracking-wider uppercase text-sm">Cargando el mercadito...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-3xl">
            <ShoppingBag className="w-16 h-16 text-[var(--border-subtle)] mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No hay anuncios aún</h3>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">Sé la primera persona en publicar en esta categoría. ¡Es totalmente gratis y toma menos de un minuto!</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Publicar ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="group border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,85,0,0.3)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(255,85,0,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)"; }}
              >
                {/* Image Area */}
                <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlaceholder />
                    </div>
                  )}
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span className="backdrop-blur-md bg-black/50 border border-white/10 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-wider shadow-lg">
                      {item.category === "EVENT" ? "🎉 Evento" : "🛍️ Venta"}
                    </span>
                    {item.price !== null && (
                      <span className="bg-[#ff5500] text-white font-black px-3 py-1 rounded-full text-sm shadow-lg">
                        ${item.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/20">
                  <h3 className="font-black text-xl text-white mb-3 leading-tight line-clamp-2 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-base text-white/70 line-clamp-3 leading-relaxed flex-grow mb-6 font-medium">
                    {item.description}
                  </p>
                  
                  {/* Footer */}
                  <div className="pt-5 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white/60">
                    <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                      <MapPin className="w-3.5 h-3.5 text-[#ff5500] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <span className="shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="relative bg-[#111111] border border-white/10 rounded-3xl max-w-2xl w-full p-8 shadow-[0_0_100px_rgba(255,85,0,0.15)] my-8"
            style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-2xl text-white flex items-center gap-3">
                  <span className="bg-gradient-to-br from-[#ff5500] to-[#ffaa00] text-transparent bg-clip-text">Publicar Anuncio</span>
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mt-1">Completa los detalles para que la comunidad lo vea.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#ff5500]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-[#ff5500]" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">¡Todo listo!</h3>
                <p className="text-[var(--text-secondary)] text-lg">Tu anuncio ya está publicado en el Mercadito.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium flex items-start gap-3">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2 tracking-wider">Título de la Publicación</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. MacBook Pro M1 2020 en excelente estado"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2 tracking-wider">Descripción detallada</label>
                    <textarea
                      required
                      placeholder="Describe los detalles, condiciones, métodos de entrega o información del evento..."
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all outline-none min-h-[120px] resize-y"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2 tracking-wider">Precio (USD - Opcional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3.5 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2 tracking-wider">Categoría</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all outline-none appearance-none"
                    >
                      <option value="GENERAL" className="bg-[#111]">Venta / Producto</option>
                      <option value="EVENT" className="bg-[#111]">Evento Local</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-2 tracking-wider">Ubicación</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ── ENHANCED IMAGE SECTION ── */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#ff5500]" />
                      Foto del Producto / Evento
                    </label>
                  </div>
                  
                  {/* Mode Switcher */}
                  <div className="flex bg-black/40 p-1 rounded-xl mb-5">
                    {[
                      { id: "UPLOAD", label: "Subir Foto", icon: <Upload className="w-4 h-4" /> },
                      { id: "AI", label: "Generar con IA", icon: <Sparkles className="w-4 h-4" /> },
                      { id: "URL", label: "Enlace URL", icon: <Tag className="w-4 h-4" /> }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setImageMode(mode.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 text-xs py-2.5 rounded-lg font-bold transition-all ${
                          imageMode === mode.id 
                            ? "bg-[#ff5500] text-white shadow-md" 
                            : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {mode.icon} <span className="hidden sm:inline">{mode.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Mode Content */}
                  <div className="min-h-[140px] flex flex-col justify-center">
                    {imageMode === "UPLOAD" && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#ff5500]/50 hover:bg-[#ff5500]/5 transition-all group"
                      >
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <Upload className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-[#ff5500] mx-auto mb-3 transition-colors" />
                        <p className="text-sm font-bold text-white mb-1">Click para subir una imagen</p>
                        <p className="text-xs text-[var(--text-secondary)]">PNG, JPG, WEBP (Max 4MB)</p>
                      </div>
                    )}

                    {imageMode === "AI" && (
                      <div className="border border-[#ff5500]/30 bg-[#ff5500]/5 rounded-xl p-6 text-center">
                        <Bot className="w-10 h-10 text-[#ffaa00] mx-auto mb-3" />
                        <p className="text-sm text-white font-medium mb-4 max-w-sm mx-auto">
                          Muna AI creará una foto profesional basada en tu título: 
                          <strong className="block mt-1 text-[#ff5500]">"{formData.title || "..."}"</strong>
                        </p>
                        <button 
                          type="button" 
                          onClick={handleGenerateAi}
                          disabled={generatingAi || !formData.title}
                          className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[#ff5500] to-[#ffaa00] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
                        >
                          {generatingAi && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          )}
                          {generatingAi ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <Sparkles className="w-4 h-4 relative z-10" />}
                          <span className="relative z-10">{generatingAi ? "Creando Magia..." : "Generar Imagen Ahora"}</span>
                        </button>
                      </div>
                    )}

                    {imageMode === "URL" && (
                      <div>
                        <input
                          type="text"
                          placeholder="Pega el enlace de la imagen (https://...)"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleInputChange}
                          className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#ff5500] outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="mt-5 relative aspect-video rounded-xl overflow-hidden border border-white/20 shadow-lg bg-black/50 group">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={() => setFormData(prev => ({...prev, imageUrl: ""}))} 
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" /> Eliminar Foto
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-white text-black font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                    {submitting ? "Publicando Anuncio..." : "Publicar Anuncio Ahora"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global styles for animations that might not be in globals.css */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </main>
    <Footer />
    </>
  );
}

// Minimal placeholder component for images
function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--border-subtle)]">
      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
    </div>
  );
}
