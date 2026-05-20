"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { AlertTriangle, MapPin, EyeOff, ShieldAlert, FileText, CheckCircle, Upload } from "lucide-react";

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
}

export default function CitizenReportPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    state: "Yucatán",
    city: "Mérida",
    town: "",
    isAnonymous: true,
    photoUrl: "",
  });

  const [pinPos, setPinPos] = useState({ x: 120, y: 150 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error("Error loading reports", e);
    } finally {
      setLoadingReports(false);
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
      const lat = (20.97 - (pinPos.y - 150) * 0.005).toFixed(4);
      const lng = (-89.62 + (pinPos.x - 120) * 0.005).toFixed(4);

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
      setErrorMsg("Error de red.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fadeInUp">
        <span className="text-xs uppercase tracking-widest text-[#ff5500] font-bold px-3 py-1 border border-[rgba(255,85,0,0.3)] bg-[rgba(255,85,0,0.05)] rounded-full">
          {t("CANAL DE DENUNCIA CIUDADANA", "CITIZEN REPORTING CHANNEL", "CANAL DE DENUNCIA")}
        </span>
        <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight">
          {t("Reporte Ciudadano Interactivo", "Interactive Citizen Report", "Reporte Ciudadano")}
        </h1>
        <p className="text-lg text-[rgba(255,255,255,0.65)] mt-4 max-w-2xl mx-auto">
          {t(
            "Reporta incidentes viales, cortes de servicios, baches o eventos locales de forma anónima o identificada. Tu voz ayuda a mejorar la comunidad.",
            "Report road incidents, utility outages, potholes, or local events anonymously or openly. Help make your city better.",
            "Reporta incidentes de tu comunidad de forma segura."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,15,25,0.45)] backdrop-blur-md">
          {success ? (
            <div className="text-center py-10 animate-fadeInUp">
              <CheckCircle className="w-16 h-16 text-[#ff5500] mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white">{t("¡Reporte Enviado con Éxito!", "Report Submitted Successfully!", "¡Enviado!")}</h3>
              <p className="text-sm text-[rgba(255,255,255,0.65)] mt-3 max-w-md mx-auto">
                {t(
                  "Tu reporte ha sido procesado por el agente de moderación e IA. Se ha publicado de forma inmediata en el feed y se ha automatizado la sincronización con redes sociales.",
                  "Your report has been analyzed by AI moderation. It is now live on our feed and shared on Facebook page.",
                  "Tu reporte se ha registrado y compartido en redes sociales."
                )}
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-8 btn-primary border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] px-8 py-3 text-xs font-bold"
              >
                {t("Hacer otro reporte", "Make another report", "Otro reporte")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-4">
                <ShieldAlert className="w-5 h-5 text-[#ff5500]" />
                <h2 className="text-lg font-bold text-white">{t("Nueva Denuncia", "New Incident Report", "Denuncia")}</h2>
              </div>

              {errorMsg && <div className="p-3 text-xs bg-[rgba(255,0,0,0.1)] border border-red-500/30 text-red-400 rounded-lg">{errorMsg}</div>}

              <div>
                <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">{t("Título de la Denuncia", "Report Title", "Título")}</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Fuga de agua potable en Prolongación Paseo de Montejo"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">{t("Descripción Detallada", "Detailed Description", "Descripción")}</label>
                <textarea
                  name="description"
                  required
                  placeholder="Indica qué sucede, desde cuándo y los detalles visibles para los técnicos y autoridades de la comunidad..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input text-xs min-h-[100px]"
                />
              </div>

              {/* Geo selections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">{t("Estado", "State", "Estado")}</label>
                  <select name="state" value={formData.state} onChange={handleInputChange} className="input text-xs">
                    <option>Yucatán</option>
                    <option>Campeche</option>
                    <option>Quintana Roo</option>
                    <option>CDMX</option>
                    <option>Jalisco</option>
                    <option>Nuevo León</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">{t("Municipio / Ciudad", "City", "Municipio")}</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Mérida"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">{t("Colonia / Localidad", "Town / Area", "Colonia")}</label>
                  <input
                    type="text"
                    name="town"
                    placeholder="Centro"
                    value={formData.town}
                    onChange={handleInputChange}
                    className="input text-xs"
                  />
                </div>
              </div>

              {/* Photo url mock upload */}
              <div>
                <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">{t("URL de Imagen / Foto (Opcional)", "Photo URL (Optional)", "Imagen")}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="photoUrl"
                    placeholder="e.g. https://images.unsplash.com/photo-1594913785162-e6787352fec2?auto=format"
                    value={formData.photoUrl}
                    onChange={handleInputChange}
                    className="input text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        photoUrl: "https://images.unsplash.com/photo-1594913785162-e6787352fec2?auto=format&fit=crop&w=1200&q=80",
                      })
                    }
                    className="btn-secondary whitespace-nowrap text-xs py-2 px-4 flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Demo
                  </button>
                </div>
              </div>

              {/* Interactive SVG Radar Map Grid Pin-Locator */}
              <div>
                <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-2">
                  {t("Ubicación Exacta en Radar de Comunidad (Haz Click en el mapa para marcar pin)", "Exact Grid Radar Location (Click on Map to Drop Pin)", "Marcar en el Mapa")}
                </label>
                
                <div
                  onClick={handleMapClick}
                  className="relative w-full h-[220px] rounded-xl border border-[rgba(255,85,0,0.2)] bg-[radial-gradient(circle_at_center,rgba(255,85,0,0.06)_0%,rgba(0,0,0,0.85)_100%)] overflow-hidden cursor-crosshair group"
                >
                  {/* Cyber Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-20 pointer-events-none">
                    {Array.from({ length: 72 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-[#ff5500]/40"></div>
                    ))}
                  </div>

                  {/* Simulated radar rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[#ff5500]/15 animate-pulse pointer-events-none"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[#ff5500]/20 pointer-events-none"></div>

                  {/* Hotspots */}
                  <div className="absolute top-[80px] left-[150px] w-2 h-2 bg-green-500 rounded-full animate-ping pointer-events-none"></div>
                  <span className="absolute top-[80px] left-[160px] text-[8px] text-green-500/60 font-mono select-none">MÉRIDA_CENTRO</span>

                  <div className="absolute top-[140px] left-[320px] w-2 h-2 bg-green-500 rounded-full animate-ping pointer-events-none"></div>
                  <span className="absolute top-[140px] left-[330px] text-[8px] text-green-500/60 font-mono select-none">VALLADOLID_ESTE</span>

                  {/* Dynamic Dropped Pin */}
                  <div
                    style={{ left: `${pinPos.x - 12}px`, top: `${pinPos.y - 24}px` }}
                    className="absolute transition-all duration-300 pointer-events-none flex flex-col items-center"
                  >
                    <MapPin className="w-6 h-6 text-[#ff5500] filter drop-shadow-[0_0_8px_#ff5500]" />
                    <div className="w-1.5 h-1.5 bg-[#ff5500] rounded-full mt-[-2px] border border-white/50"></div>
                  </div>

                  {/* Instructions watermark */}
                  <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[rgba(255,255,255,0.4)] pointer-events-none bg-black/60 px-2 py-1 rounded">
                    COORD: {(20.97 - (pinPos.y - 150) * 0.005).toFixed(4)}N, {(-89.62 + (pinPos.x - 120) * 0.005).toFixed(4)}W
                  </div>
                </div>
              </div>

              {/* Anonymity settings */}
              <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                <div className="flex items-center gap-3">
                  <EyeOff className="w-5 h-5 text-[rgba(255,255,255,0.5)]" />
                  <div>
                    <span className="text-xs font-bold text-white block">{t("Publicar de forma Anónima", "Publish Anonymously", "Anónimo")}</span>
                    <span className="text-[10px] text-[rgba(255,255,255,0.45)]">{t("No mostraremos tu perfil ni nombre en la denuncia pública.", "Your profile information won't be shown publicly.", "No se mostrará tu perfil.")}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-[#ff5500] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary flex justify-center items-center gap-2 border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] py-3 text-sm"
              >
                {submitting ? t("Moderando y Publicando...", "Moderating & Publishing...", "Procesando...") : (
                  <>
                    <span>{t("Enviar Denuncia en Tiempo Real", "Submit Live Incident Report", "Enviar Reporte")}</span>
                    <AlertTriangle className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Live feed panel */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2 px-1">
            {t("Reportes Recientes en la Península", "Recent Incident Feeds", "Reportes")}
          </h2>

          {loadingReports ? (
            <div className="text-center py-12 text-xs text-[rgba(255,255,255,0.4)]">{t("Cargando reportes...", "Loading reports...", "Cargando...")}</div>
          ) : reports.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl text-xs text-[rgba(255,255,255,0.45)]">
              {t("No hay reportes ciudadanos registrados en este momento.", "No citizen reports registered yet.", "Sin reportes.")}
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {reports.map((rep) => {
                const tags = JSON.parse(rep.aiTags || "[]");
                return (
                  <div key={rep.id} className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,15,25,0.45)] space-y-3 hover:border-[rgba(255,85,0,0.25)] transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#ff5500] px-2 py-0.5 border border-[rgba(255,85,0,0.2)] bg-[rgba(255,85,0,0.03)] rounded-full">
                        {rep.city.toUpperCase()}, {rep.state.toUpperCase()}
                      </span>
                      <span className="text-[9px] text-[rgba(255,255,255,0.4)]">{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-sm text-white">{rep.title}</h3>
                    <p className="text-xs text-[rgba(255,255,255,0.6)] leading-relaxed">{rep.description}</p>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tags.map((tag: string, idx: number) => (
                          <span key={idx} className="text-[9px] text-[rgba(255,255,255,0.4)] px-1.5 py-0.5 bg-white/5 rounded border border-white/5 font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
