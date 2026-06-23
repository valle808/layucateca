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
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="text-center mb-10 animate-fadeInUp">
        <span style={{
          fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#ff5500",
          padding: "5px 14px", border: "1.5px solid rgba(255,85,0,0.28)",
          background: "rgba(255,85,0,0.07)", borderRadius: 99,
          display: "inline-block", marginBottom: 16,
        }}>
          {t("CANAL DE DENUNCIA CIUDADANA", "CITIZEN REPORTING CHANNEL", "CANAL DE DENUNCIA")}
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
          {t("Reporte Ciudadano Interactivo", "Interactive Citizen Report", "Reporte Ciudadano")}
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto", lineHeight: 1.65 }}>
          {t(
            "Reporta incidentes viales, cortes de servicios, baches o eventos locales de forma anónima o identificada.",
            "Report road incidents, utility outages, potholes, or local events anonymously or openly.",
            "Reporta incidentes de tu comunidad de forma segura."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <div className="lg:col-span-7" style={{
          background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
          borderRadius: 18, padding: "32px",
          boxShadow: "var(--shadow-card)",
        }}>
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--border-subtle)", marginBottom: 4 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,85,0,0.1)", border: "1.5px solid rgba(255,85,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ShieldAlert style={{ width: 18, height: 18, color: "#ff5500" }} />
                </div>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>{t("Nueva Denuncia", "New Incident Report", "Denuncia")}</h2>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>{t("Procesado en tiempo real por IA", "AI-processed in real time", "Procesado en tiempo real")}</p>
                </div>
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
                style={{
                  width: "100%", padding: "13px 24px",
                  background: submitting ? "rgba(255,85,0,0.6)" : "#ff5500",
                  color: "#fff", fontWeight: 700, fontSize: "0.92rem",
                  border: "none", borderRadius: 11, cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 18px rgba(255,85,0,0.3)",
                  transition: "all 0.18s ease",
                }}
              >
                {submitting ? t("Moderando y Publicando...", "Processing...", "Procesando...") : (
                  <>
                    <AlertTriangle style={{ width: 16, height: 16 }} />
                    <span>{t("Enviar Denuncia en Tiempo Real", "Submit Live Report", "Enviar Reporte")}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Live feed panel */}
        <div className="lg:col-span-5">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              {t("Reportes Recientes", "Recent Reports", "Reportes")}
            </h2>
            <span style={{ fontSize: "0.7rem", color: "#ff5500", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff5500", display: "inline-block", animation: "pulse 2s infinite" }} />
              EN VIVO
            </span>
          </div>

          {loadingReports ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {t("Cargando reportes...", "Loading reports...", "Cargando...")}
            </div>
          ) : reports.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 24px",
              border: "1.5px dashed var(--border-subtle)", borderRadius: 16,
              color: "var(--text-secondary)", fontSize: "0.85rem",
            }}>
              <FileText style={{ width: 32, height: 32, margin: "0 auto 12px", opacity: 0.4 }} />
              {t("No hay reportes ciudadanos registrados.", "No citizen reports yet.", "Sin reportes.")}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 620, overflowY: "auto", paddingRight: 4 }}>
              {reports.map((rep) => {
                const tags = JSON.parse(rep.aiTags || "[]");
                return (
                  <div key={rep.id} style={{
                    padding: "16px", borderRadius: 14,
                    background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-card)",
                    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,85,0,0.28)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
                  }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 800, color: "#ff5500",
                        padding: "3px 10px", border: "1px solid rgba(255,85,0,0.22)",
                        background: "rgba(255,85,0,0.07)", borderRadius: 99,
                        letterSpacing: "0.07em", textTransform: "uppercase",
                      }}>
                        {rep.city}, {rep.state}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                        {new Date(rep.createdAt).toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.35, marginBottom: 6 }}>{rep.title}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{rep.description}</p>
                    {tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                        {tags.map((tag: string, idx: number) => (
                          <span key={idx} style={{
                            fontSize: "0.68rem", color: "var(--text-secondary)",
                            padding: "2px 8px", background: "rgba(255,255,255,0.05)",
                            border: "1px solid var(--border-subtle)", borderRadius: 5,
                            fontFamily: "monospace",
                          }}>
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
