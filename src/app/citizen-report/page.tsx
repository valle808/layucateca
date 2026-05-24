"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { useTheme } from "@/components/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  MapPin, 
  EyeOff, 
  Eye, 
  ShieldAlert, 
  FileText, 
  CheckCircle, 
  Upload, 
  Compass, 
  Globe, 
  RefreshCw, 
  Send, 
  Layers, 
  Radio, 
  Activity, 
  Landmark, 
  ChevronRight,
  Database,
  Clock
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  state: string;
  city: string;
  town: string;
  isAnonymous: boolean;
  status: string;
  aiTags: string; // JSON string
  createdAt: string;
  lat?: number;
  lng?: number;
}

export default function CitizenReportPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    state: "Yucatán",
    city: "Mérida",
    town: "",
    isAnonymous: true,
    photoUrl: "",
  });

  const [pinPos, setPinPos] = useState({ x: 120, y: 110 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isDark = theme === "dark";

  // Map coordinates conversion values
  const getCoordinates = (x: number, y: number) => {
    const lat = (20.97 - (y - 110) * 0.004).toFixed(4);
    const lng = (-89.62 + (x - 120) * 0.004).toFixed(4);
    return { lat, lng };
  };

  const currentCoords = getCoordinates(pinPos.x, pinPos.y);

  const fetchReports = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error("Error loading reports", e);
    } finally {
      setLoadingReports(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: val,
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setPinPos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const { lat, lng } = getCoordinates(pinPos.x, pinPos.y);

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lat,
          lng,
          mediaUrls: formData.photoUrl ? [formData.photoUrl] : [],
          authorId: user?.id || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        fetchReports();
        setFormData({
          title: "",
          description: "",
          state: "Yucatán",
          city: "Mérida",
          town: "",
          isAnonymous: true,
          photoUrl: "",
        });
      } else {
        setErrorMsg(data.error || "Ocurrió un error al procesar.");
      }
    } catch (err) {
      setErrorMsg("Error de red al enviar reporte.");
    } finally {
      setSubmitting(false);
    }
  };

  // Deterministically resolves a glowing status pill based on ID or index
  const getStatusBadge = (rep: Report, idx: number) => {
    const status = rep.status?.toUpperCase() || "APPROVED";
    
    if (status === "RESOLVED") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
          {t("RESOLVED", "RESOLVED", "RESUELTO")}
        </span>
      );
    }

    if (status === "REJECTED") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 px-2 py-0.5 border border-rose-500/20 bg-rose-500/5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.1)]">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></span>
          {t("REJECTED", "REJECTED", "RECHAZADO")}
        </span>
      );
    }

    // Blend pending states between REPORTADO and EN REVISIÓN deterministically for visual richness
    const isUnderReview = idx % 3 === 1;

    if (isUnderReview) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 px-2 py-0.5 border border-amber-500/20 bg-amber-500/5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
          {t("UNDER REVIEW", "UNDER REVIEW", "EN REVISIÓN")}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#ff5500] px-2 py-0.5 border border-[#ff5500]/20 bg-[#ff5500]/5 rounded-full shadow-[0_0_10px_rgba(255,85,0,0.1)]">
        <span className="w-1.5 h-1.5 bg-[#ff5500] rounded-full animate-pulse"></span>
        {t("REPORTED", "REPORTED", "REPORTADO")}
      </span>
    );
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-[var(--bg-primary)] transition-colors duration-300 relative overflow-hidden">
      
      {/* Immersive Cyber-HUD Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(255,85,0,0.03)] blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(0,240,255,0.02)] blur-[120px] pointer-events-none select-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(212,168,83,0.01)] blur-[150px] pointer-events-none select-none" />

      {/* HEADER SECTION */}
      <div className="text-center mb-16 relative z-10 animate-fadeInUp">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5500] font-black px-4 py-1.5 border border-[rgba(255,85,0,0.25)] bg-[rgba(255,85,0,0.04)] rounded-full mb-4 shadow-[0_0_20px_rgba(255,85,0,0.1)]">
          <Activity className="w-3.5 h-3.5 animate-pulse text-[#ff5500]" />
          <span>{t("SISTEMA DE TELEMETRÍA CIUDADANA", "CITIZEN TELEMETRY SYSTEM", "RED DE DENUNCIAS")}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mt-2 tracking-tight text-[var(--text-primary)]">
          {t("Reporte Ciudadano Interactivo", "Interactive Citizen Report", "Reporte Ciudadano")}
        </h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mt-4 max-w-2xl mx-auto leading-relaxed">
          {t(
            "Reporta incidentes viales, cortes de servicios públicos o baches en la península. Los reportes se procesan automáticamente por IA y se sincronizan en tiempo real.",
            "Report road incidents, utility outages, or potholes across the peninsula. Submissions are processed by AI and broadcasted live.",
            "Reporta incidentes de tu comunidad. Los reportes son moderados por Inteligencia Artificial y sincronizados."
          )}
        </p>

        {/* HUD Stats Dashboard */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-[10px] font-mono text-[var(--text-secondary)] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] max-w-lg mx-auto py-2 px-6 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span>LINK: <span className="text-[var(--text-primary)] font-bold">ONLINE</span></span>
          </div>
          <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
          <div>
            <span>NODE: <span className="text-[var(--text-primary)] font-bold">PENINSULA_YUCATAN</span></span>
          </div>
          <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-[#ff5500]" />
            <span>SYNCED: <span className="text-[var(--text-primary)] font-bold">{loadingReports ? "..." : reports.length} RECORDS</span></span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT COLUMN: THE GIS REPORT FORM PANEL (lg:col-span-7) - Spacious premium design */}
        <div 
          className={`lg:col-span-7 p-10 md:px-12 md:py-16 rounded-[32px] border backdrop-blur-3xl transition-all duration-300 relative overflow-hidden space-y-10 ${
            isDark 
              ? "border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.7)] shadow-2xl" 
              : "border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.85)] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.08)]"
          }`}
        >
          {/* Subtle animated neon scan bar in background */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5500]/40 to-transparent animate-pulse" />

          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-[rgba(255,85,0,0.08)] flex items-center justify-center border border-[rgba(255,85,0,0.2)] mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-[#ff5500] animate-bounce" />
              </div>
              <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-wide">
                {t("¡Reporte Registrado!", "Telemetry Broadcasted!", "¡Enviado con Éxito!")}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed max-w-md mx-auto">
                {t(
                  "Tu reporte ha sido exitosamente indexado en la red descentralizada de La Yucateca. Nuestro agente de IA ha tags calificados y procedido al auto-post en redes sociales.",
                  "Your telemetry report has been broadcasted. AI classification completed and live synchronization is now active.",
                  "Tu reporte se ha registrado y compartido de forma exitosa en el feed y redes sociales."
                )}
              </p>
              
              <button
                onClick={() => setSuccess(false)}
                className="mt-8 bg-[rgba(255,255,255,0.02)] hover:bg-[#ff5500] text-[var(--text-primary)] border border-[rgba(255,255,255,0.08)] hover:border-[#ff5500] hover:shadow-[0_0_20px_rgba(255,85,0,0.25)] px-8 py-3.5 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 cursor-pointer"
              >
                {t("Registrar Nueva Telemetría", "New Telemetry Log", "Otro reporte")}
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Header inside Panel */}
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-5 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(255,85,0,0.08)] border border-[rgba(255,85,0,0.2)] flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-[#ff5500]" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-wider">
                      {t("Nueva Denuncia Ciudadana", "New Telemetry Record", "Crear Denuncia")}
                    </h2>
                    <span className="text-[9px] font-mono text-[var(--text-secondary)]">
                      STATUS: TRANSMITTING_NODE_SECURE
                    </span>
                  </div>
                </div>
                
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">
                  {t("ONLINE", "ONLINE", "ACTIVO")}
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl font-semibold text-center leading-relaxed">
                  {errorMsg}
                </div>
              )}
              
              {/* REPORT TITLE FIELD */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#ff5500] uppercase tracking-[0.25em] block px-1 opacity-90">
                  {t("Título de la Denuncia", "Report Title / Alert Headline", "Título")}
                </label>
                
                <div className={`flex items-center border rounded-2xl py-[18px] px-6 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:border-orange-500/80 focus-within:scale-[1.01] group ${
                  isDark 
                    ? "bg-black/35 border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" 
                    : "bg-white border-black/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                }`}>
                  {/* Spacious left icon section with sleek vertical divider */}
                  <div className={`flex items-center justify-center pr-5 mr-5 border-r transition-colors duration-300 flex-shrink-0 h-5 ${
                    isDark ? "border-white/10" : "border-black/10"
                  }`}>
                    <FileText className={`w-5 h-5 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                  </div>
                  
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder={t("e.g. Fuga de agua potable en Paseo de Montejo", "e.g. Clean water leak on Paseo de Montejo", "e.g. Fuga ja' k'áax Montejo")}
                    value={formData.title}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:outline-none text-sm text-[var(--text-primary)] font-semibold placeholder:opacity-35"
                  />
                </div>
              </div>

              {/* DETAILED DESCRIPTION FIELD */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#ff5500] uppercase tracking-[0.25em] block px-1 opacity-90">
                  {t("Descripción Detallada", "Detailed Telemetry Description", "Descripción")}
                </label>
                
                <div className={`flex items-start border rounded-2xl py-[18px] px-6 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:border-orange-500/80 focus-within:scale-[1.01] group ${
                  isDark 
                    ? "bg-black/35 border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" 
                    : "bg-white border-black/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                }`}>
                  {/* Spacious left icon section with sleek vertical divider */}
                  <div className={`flex items-center justify-center pr-5 mr-5 border-r transition-colors duration-300 flex-shrink-0 h-6 mt-1.5 ${
                    isDark ? "border-white/10" : "border-black/10"
                  }`}>
                    <FileText className={`w-5 h-5 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                  </div>
                  
                  <textarea
                    name="description"
                    required
                    placeholder={t("Indica qué sucede, desde cuándo y los detalles visibles...", "Describe what is happening, for how long, and visible details...", "Ts'íib ba'ax ku yúuchul ti' a kaajal...")}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:outline-none text-sm text-[var(--text-primary)] font-semibold placeholder:opacity-35 min-h-[100px] resize-y"
                  />
                </div>
              </div>

              {/* THREE-COLUMN GEOGRAPHY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* STATE SELECTOR */}
                <div className={`flex items-center border rounded-2xl py-3 px-5 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:border-orange-500/80 group ${
                  isDark 
                    ? "bg-black/35 border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" 
                    : "bg-white border-black/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                }`}>
                  <div className={`flex items-center justify-center pr-4 mr-4 border-r flex-shrink-0 h-5 ${
                    isDark ? "border-white/10" : "border-black/10"
                  }`}>
                    <Landmark className={`w-4 h-4 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
                      {t("Estado", "State", "Estado")}
                    </span>
                    <select 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      className="w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none outline-none text-xs text-[var(--text-primary)] font-bold cursor-pointer appearance-none"
                    >
                      <option className={`${isDark ? "bg-[#0c0c14] text-white" : "bg-white text-black"}`}>Yucatán</option>
                      <option className={`${isDark ? "bg-[#0c0c14] text-white" : "bg-white text-black"}`}>Campeche</option>
                      <option className={`${isDark ? "bg-[#0c0c14] text-white" : "bg-white text-black"}`}>Quintana Roo</option>
                      <option className={`${isDark ? "bg-[#0c0c14] text-white" : "bg-white text-black"}`}>CDMX</option>
                      <option className={`${isDark ? "bg-[#0c0c14] text-white" : "bg-white text-black"}`}>Jalisco</option>
                      <option className={`${isDark ? "bg-[#0c0c14] text-white" : "bg-white text-black"}`}>Nuevo León</option>
                    </select>
                  </div>
                </div>

                {/* CITY / MUNICIPIO INPUT */}
                <div className={`flex items-center border rounded-2xl py-3 px-5 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:border-orange-500/80 group ${
                  isDark 
                    ? "bg-black/35 border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" 
                    : "bg-white border-black/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                }`}>
                  <div className={`flex items-center justify-center pr-4 mr-4 border-r flex-shrink-0 h-5 ${
                    isDark ? "border-white/10" : "border-black/10"
                  }`}>
                    <Compass className={`w-4 h-4 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
                      {t("Municipio / Ciudad", "City / Municipality", "Municipio")}
                    </span>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none outline-none text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>

                {/* TOWN / COLONIA INPUT */}
                <div className={`flex items-center border rounded-2xl py-3 px-5 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:border-orange-500/80 group ${
                  isDark 
                    ? "bg-black/35 border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" 
                    : "bg-white border-black/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                }`}>
                  <div className={`flex items-center justify-center pr-4 mr-4 border-r flex-shrink-0 h-5 ${
                    isDark ? "border-white/10" : "border-black/10"
                  }`}>
                    <MapPin className={`w-4 h-4 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
                      {t("Colonia / Localidad", "Town / Neighborhood", "Colonia")}
                    </span>
                    <input
                      type="text"
                      name="town"
                      value={formData.town}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none outline-none text-xs text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>

              </div>

              {/* PHOTO URL MOCK UPLOAD FIELD */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#ff5500] uppercase tracking-[0.25em] block px-1 opacity-90">
                  {t("URL de Imagen (Opcional)", "Photo URL / Evidence Image", "Imagen")}
                </label>
                
                <div className={`flex items-center border rounded-2xl py-[18px] px-6 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/60 focus-within:border-orange-500/80 focus-within:scale-[1.01] group ${
                  isDark 
                    ? "bg-black/35 border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" 
                    : "bg-white border-black/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                }`}>
                  {/* Spacious left icon section with sleek vertical divider */}
                  <div className={`flex items-center justify-center pr-5 mr-5 border-r transition-colors duration-300 flex-shrink-0 h-5 ${
                    isDark ? "border-white/10" : "border-black/10"
                  }`}>
                    <Upload className={`w-5 h-5 ${isDark ? "text-white/40" : "text-black/40"} group-focus-within:text-[#ff5500]`} />
                  </div>
                  <div className="flex-1 relative pr-20">
                    <input
                      type="text"
                      name="photoUrl"
                      placeholder="e.g. https://images.unsplash.com/photo-1594913785162-e6787352fec2"
                      value={formData.photoUrl}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:outline-none text-sm text-[var(--text-primary)] font-semibold placeholder:opacity-35"
                    />
                    {/* Demo fill button */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          photoUrl: "https://images.unsplash.com/photo-1594913785162-e6787352fec2?auto=format&fit=crop&w=1200&q=80",
                        })
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-[rgba(255,85,0,0.1)] hover:bg-[#ff5500] text-[#ff5500] hover:text-white px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all duration-200 border-none outline-none focus:outline-none focus:ring-0 cursor-pointer animate-none"
                    >
                      Demo
                    </button>
                  </div>
                </div>
              </div>

              {/* SPECTACULAR INTERACTIVE SVG RADAR MAP (COGNITIVE DYNAMIC HUD) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-2 px-1">
                  {t("Ubicación Exacta en Radar Satelital (Click para posicionar pin)", "Tactical GIS Radar Grid (Click to drop coordinate pin)", "Radar de Ubicación")}
                </label>
                
                <div
                  onClick={handleMapClick}
                  className={`relative w-full h-[250px] rounded-2xl border overflow-hidden cursor-crosshair transition-all duration-300 group ${
                    isDark 
                      ? "border-[rgba(255,85,0,0.2)] bg-[#030305] shadow-[inset_0_0_30px_rgba(255,85,0,0.05)]" 
                      : "border-[rgba(255,85,0,0.25)] bg-[#faf8f4] shadow-[inset_0_0_30px_rgba(255,85,0,0.03)]"
                  }`}
                >
                  
                  {/* 1. Radar Grid Overlay */}
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-[0.08] pointer-events-none">
                    {Array.from({ length: 72 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-[#ff5500]"></div>
                    ))}
                  </div>

                  {/* 2. Topographic Cyber Contour Circles */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                    <div className="w-[100px] h-[100px] rounded-full border border-cyan-400" />
                    <div className="w-[200px] h-[200px] rounded-full border border-cyan-400 absolute" />
                    <div className="w-[300px] h-[300px] rounded-full border border-cyan-400 absolute" />
                    <div className="w-[400px] h-[400px] rounded-full border border-cyan-400 absolute" />
                  </div>

                  {/* 3. Hardware-Accelerated Dynamic Sonar Beam Sweep */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute w-[400px] h-[400px] top-1/2 left-1/2 origin-top-left -translate-x-[200px] -translate-y-[200px] pointer-events-none select-none"
                    style={{
                      background: isDark
                        ? "conic-gradient(from 0deg, rgba(255,85,0,0.1) 0deg, rgba(255,85,0,0.02) 40deg, transparent 180deg)"
                        : "conic-gradient(from 0deg, rgba(255,85,0,0.08) 0deg, rgba(255,85,0,0.01) 40deg, transparent 180deg)",
                    }}
                  />

                  {/* 4. Telemetry Corner Labels (High Tech HUD Watermark) */}
                  <div className={`absolute top-3 left-4 text-[8px] font-mono pointer-events-none space-y-1 select-none ${isDark ? "text-[rgba(255,255,255,0.3)]" : "text-[rgba(26,18,8,0.45)]"}`}>
                    <div>SYS_ARC: PENINSULAR_GIS_LINK</div>
                    <div>SECTOR: LA_YUCATECA_ALPHA</div>
                  </div>
                  
                  <div className={`absolute top-3 right-4 text-[8px] font-mono pointer-events-none space-y-1 select-none text-right ${isDark ? "text-cyan-400/50" : "text-cyan-600/70"}`}>
                    <div>ZOOM: 12.8X</div>
                    <div>SIGNAL: STRONG [100%]</div>
                  </div>

                  {/* 5. Blinking Hotspot Nodes (Mérida, Progreso, Valladolid) */}
                  <div className="absolute top-[80px] left-[150px] flex items-center pointer-events-none select-none">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
                    </span>
                    <span className={`text-[7.5px] font-mono tracking-widest uppercase ${isDark ? "text-cyan-400/60" : "text-cyan-600/80"}`}>MÉRIDA_METRO</span>
                  </div>

                  <div className="absolute top-[30px] left-[130px] flex items-center pointer-events-none select-none">
                    <span className="relative flex h-1.5 w-1.5 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5500] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ff5500] shadow-[0_0_8px_#ff5500]"></span>
                    </span>
                    <span className="text-[7.5px] text-[#ff5500]/60 font-mono tracking-widest uppercase">PROGRESO_PORT</span>
                  </div>

                  <div className="absolute top-[160px] left-[260px] flex items-center pointer-events-none select-none">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
                    </span>
                    <span className={`text-[7.5px] font-mono tracking-widest uppercase ${isDark ? "text-cyan-400/60" : "text-cyan-600/80"}`}>VALLADOLID_ESTE</span>
                  </div>

                  {/* 6. Dynamic Dropped Pin HUD Overlay */}
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ left: `${pinPos.x - 14}px`, top: `${pinPos.y - 28}px` }}
                    className="absolute pointer-events-none flex flex-col items-center z-20"
                  >
                    <div className="w-7 h-7 rounded-full bg-[rgba(255,85,0,0.15)] border border-[#ff5500] flex items-center justify-center shadow-[0_0_12px_#ff5500]">
                      <MapPin className="w-4 h-4 text-[#ff5500]" />
                    </div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-[-2px] border border-[#ff5500] shadow-sm animate-ping"></div>
                  </motion.div>

                  {/* 7. Live Telemetry Data HUD Watermark footer */}
                  <div className={`absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none border px-3.5 py-1.5 rounded-lg backdrop-blur-md transition-all ${
                    isDark 
                      ? "bg-[rgba(0,0,0,0.8)] border-[rgba(255,255,255,0.06)]" 
                      : "bg-[rgba(255,255,255,0.9)] border-[rgba(0,0,0,0.06)] shadow-sm"
                  }`}>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                      <span className={`text-[9px] font-mono ${isDark ? "text-[rgba(255,255,255,0.45)]" : "text-[rgba(0,0,0,0.6)]"}`}>
                        COORDINATES: <span className="text-[var(--text-primary)] font-bold">{currentCoords.lat}°N, {currentCoords.lng}°W</span>
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-widest text-right shrink-0 ml-1">
                      GIS LOCK ON
                    </span>
                  </div>

                </div>
              </div>

              {/* ANONYMITY CONFIGURATION BUTTON */}
              <div className={`flex items-center justify-between p-5 border rounded-2xl transition-all duration-300 ${
                isDark 
                  ? "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]" 
                  : "bg-[rgba(0,0,0,0.01)] border-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.02)]"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    {formData.isAnonymous ? (
                      <EyeOff className="w-5 h-5 text-[var(--text-secondary)]" />
                    ) : (
                      <Eye className="w-5 h-5 text-[#ff5500]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black text-[var(--text-primary)] block uppercase tracking-wider">
                      {t("Publicar de forma Anónima", "Publish Anonymously", "Anónimo")}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5 max-w-[280px] leading-relaxed">
                      {t(
                        "Oculta tu perfil y credenciales. La denuncia se registrará de forma soberana.",
                        "Your identity will be completely hidden on the public broadcast feed.",
                        "No se mostrará tu perfil público en esta denuncia."
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Modern Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange} 
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff5500] shadow-inner ${
                    isDark ? "bg-[rgba(255,255,255,0.08)] after:bg-[rgba(255,255,255,0.45)]" : "bg-[rgba(0,0,0,0.08)] after:bg-[rgba(0,0,0,0.35)]"
                  }`}></div>
                </label>
              </div>

              {/* PRIMARY SUBMIT ACTION - Spacious button padding & clean margins */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white py-[18px] mt-10 rounded-full shadow-[0_8px_30px_rgba(255,85,0,0.2)] hover:shadow-[0_8px_45px_rgba(255,85,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transform transition-all duration-300 font-black tracking-widest text-xs uppercase cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 animate-none"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t("Moderando y Publicando con IA...", "AI Moderating & Syncing...", "Meyajil...")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("Transmitir Denuncia Satelital", "Submit Telemetry Alert", "Enviar Reporte")}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* RIGHT COLUMN: LIVE FEED SYSTEM TERMINAL LOGS (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
              </span>
              <h2 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                {t("Reportes Recientes", "Satellite Incident Feed", "Denuncias Recientes")}
              </h2>
            </div>

            {/* Quick reload button */}
            <button
              onClick={fetchReports}
              disabled={isRefreshing}
              className="text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 animate-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#ff5500]" : ""}`} />
              RELOAD
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {loadingReports ? (
              <motion.div
                key="loading-feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-20 border rounded-[24px] backdrop-blur-md ${
                  isDark ? "border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,18,0.3)]" : "border-[rgba(0,0,0,0.05)] bg-[rgba(255,255,255,0.3)]"
                }`}
              >
                <RefreshCw className="w-8 h-8 animate-spin text-[#ff5500] mx-auto mb-4" />
                <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider block">
                  RESOLVING_TELEMETRY_LOGS...
                </span>
              </motion.div>
            ) : reports.length === 0 ? (
              <motion.div
                key="empty-feed"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 border border-dashed border-[rgba(255,85,0,0.15)] bg-[rgba(255,85,0,0.01)] rounded-[24px] px-6"
              >
                <AlertTriangle className="w-8 h-8 text-[#ff5500]/50 mx-auto mb-3 animate-pulse" />
                <span className="text-xs font-bold text-[var(--text-primary)] block uppercase tracking-wider">
                  {t("Sin Telemetrías Activas", "No Incident Logs", "Sin Reportes")}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] mt-1 block max-w-xs mx-auto leading-relaxed">
                  {t(
                    "No se registran denuncias ciudadanas activas en este nodo satelital.",
                    "No telemetry logs registered for this peninsula sector yet.",
                    "No hay reportes registrados en este sector."
                  )}
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="reports-list"
                layout
                className="space-y-4 max-h-[720px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {reports.map((rep, idx) => {
                  const tags = JSON.parse(rep.aiTags || "[]");
                  return (
                    <motion.div
                      key={rep.id}
                      layoutId={rep.id}
                      initial={{ opacity: 0, y: 15, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className={`p-5 rounded-2xl border space-y-4 hover:border-[rgba(255,85,0,0.25)] hover:bg-[rgba(15,15,25,0.6)] hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 group ${
                        isDark 
                          ? "border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,18,0.4)] backdrop-blur-2xl" 
                          : "border-[rgba(0,0,0,0.05)] bg-[rgba(255,255,255,0.95)] shadow-sm"
                      }`}
                    >
                      {/* Top feed metadata */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black text-[#ff5500] px-2 py-0.5 border border-[#ff5500]/25 bg-[#ff5500]/5 rounded font-mono uppercase tracking-wider">
                            {rep.city.toUpperCase()}, {rep.state.toUpperCase()}
                          </span>
                          
                          {/* Floating coordinates indicator */}
                          {rep.lat && rep.lng && (
                            <span className="text-[8px] font-mono text-cyan-500/80 font-semibold bg-cyan-400/5 border border-cyan-500/10 px-1 rounded select-none">
                              {rep.lat.toFixed(2)}N, {rep.lng.toFixed(2)}W
                            </span>
                          )}
                        </div>
                        
                        {/* Status Pills */}
                        {getStatusBadge(rep, idx)}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-2">
                        <h3 className="font-black text-sm text-[var(--text-primary)] group-hover:text-[#ff5500] transition-colors duration-200 uppercase tracking-wide leading-snug">
                          {rep.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                          {rep.description}
                        </p>
                      </div>

                      {/* Category Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tags.map((tag: string, tagIdx: number) => (
                            <span 
                              key={tagIdx} 
                              className={`text-[8px] font-black font-mono hover:text-[var(--text-primary)] px-2 py-0.5 border rounded uppercase transition-colors ${
                                isDark 
                                  ? "text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]" 
                                  : "text-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.03)] border-[rgba(0,0,0,0.05)]"
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer telemetry timestamp & anonymity badge */}
                      <div className={`flex items-center justify-between border-t pt-3 text-[8.5px] font-mono ${
                        isDark 
                          ? "border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.35)]" 
                          : "border-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.45)]"
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                          <span>{new Date(rep.createdAt).toLocaleDateString()} {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span>SOURCE:</span>
                          <span className="text-[var(--text-primary)] font-bold">
                            {rep.isAnonymous ? "ANONYMOUS_BEACON" : "IDENTIFIED_NODE"}
                          </span>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </main>
  );
}
