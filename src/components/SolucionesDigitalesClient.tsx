"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";
import {
  Laptop,
  Code,
  ShieldCheck,
  CloudLightning,
  Cpu,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  price: number | null;
}

interface SolucionesDigitalesClientProps {
  portfolioItems: PortfolioItem[];
}

interface ServiceItem {
  id: string;
  icon: React.ReactNode;
  titleEs: string;
  titleEn: string;
  titleMy: string;
  descEs: string;
  descEn: string;
  descMy: string;
  basePrice: number;
  featuresEs: string[];
  featuresEn: string[];
  featuresMy: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: "web-design",
    icon: <Laptop className="w-6 h-6 text-[#ff5500]" />,
    titleEs: "Diseño Web Profesional",
    titleEn: "Professional Web Design",
    titleMy: "K'áak'nab Web",
    descEs: "Sitios web modernos, rápidos, responsive, optimizados para SEO y conversiones.",
    descEn: "Modern, fast, responsive websites optimized for SEO and conversion rates.",
    descMy: "U yich ka'an web modernilo'ob yéetel stelar SEO.",
    basePrice: 850,
    featuresEs: ["Diseño UX/UI a medida", "Optimización de velocidad (100/100)", "Responsive total", "Integración con CMS"],
    featuresEn: ["Bespoke UX/UI Design", "PageSpeed optimization (100/100)", "Fully Responsive Layout", "CMS integration"],
    featuresMy: ["UX/UI a medida", "Velocidad ma'alob", "Responsive", "CMS integration"],
  },
  {
    id: "custom-software",
    icon: <Code className="w-6 h-6 text-[#ff5500]" />,
    titleEs: "Desarrollo de Software",
    titleEn: "Custom Software Development",
    titleMy: "Meyajil Software",
    descEs: "Soluciones de software empresariales a la medida de tu flujo de trabajo.",
    descEn: "Enterprise-grade software solutions tailored to your unique workflow.",
    descMy: "Meyajil software utia'al a kaaj.",
    basePrice: 2400,
    featuresEs: ["Aplicaciones Web y Móviles", "Arquitectura escalable", "API REST / GraphQL", "Garantía de mantenimiento"],
    featuresEn: ["Web & Mobile apps", "Scalable cloud architecture", "GraphQL & REST APIs", "Maintenance warranty"],
    featuresMy: ["Apps Web y Móviles", "Scalable architecture", "API REST", "Mantenimiento"],
  },
  {
    id: "cybersecurity",
    icon: <ShieldCheck className="w-6 h-6 text-[#ff5500]" />,
    titleEs: "Ciberseguridad y Auditoría",
    titleEn: "Cybersecurity Auditing",
    titleMy: "Kanalil",
    descEs: "Protege tu negocio con auditorías de seguridad, pruebas de penetración y monitoreo continuo.",
    descEn: "Protect your business with security audits, pentesting, and 24/7 active monitoring.",
    descMy: "Auditoría de seguridad y pruebas de penetración.",
    basePrice: 1500,
    featuresEs: ["Pentesting de aplicaciones", "Auditoría de código estático", "Cumplimiento normativo", "Monitoreo perimetral"],
    featuresEn: ["Application pentesting", "Static code auditing", "Regulatory compliance check", "Perimeter defense setup"],
    featuresMy: ["Pentesting", "Auditoría", "Cumplimiento", "Monitoreo"],
  },
  {
    id: "cloud-architecture",
    icon: <CloudLightning className="w-6 h-6 text-[#ff5500]" />,
    titleEs: "Arquitectura Cloud",
    titleEn: "Cloud Architecture",
    titleMy: "Nubeil",
    descEs: "Migración a la nube (AWS/Azure/GCP) y automatización CI/CD de alto rendimiento.",
    descEn: "Seamless cloud migration (AWS/GCP/Azure) and robust pipeline automation.",
    descMy: "Infraestructura cloud y automatización.",
    basePrice: 1800,
    featuresEs: ["Migración zero-downtime", "Infraestructura como Código (IaC)", "Optimización de costos cloud", "Pipelines CI/CD"],
    featuresEn: ["Zero-downtime migration", "Infrastructure as Code (IaC)", "Cloud billing optimization", "CI/CD pipeline builds"],
    featuresMy: ["Migración", "Infrastructure as Code", "Costos cloud", "CI/CD"],
  },
  {
    id: "technological-innovations",
    icon: <Cpu className="w-6 h-6 text-[#ff5500]" />,
    titleEs: "IA y Automatizaciones",
    titleEn: "AI & Automations",
    titleMy: "Ma'alobtsil IA",
    descEs: "Integración de Inteligencia Artificial y agentes inteligentes autónomos para optimizar operaciones.",
    descEn: "AI model deployment, system integrations, and smart agent automation.",
    descMy: "Inteligencia Artificial y agentes inteligentes.",
    basePrice: 3200,
    featuresEs: ["Modelos de Lenguaje Locales", "Agentes autónomos", "Análisis predictivo de datos", "Asistentes virtuales cognitivos"],
    featuresEn: ["Local LLM fine-tuning", "Autonomous agent networks", "Predictive data analytics", "Cognitive virtual assistants"],
    featuresMy: ["LLM locales", "Agentes", "Predictive", "Virtual assistants"],
  },
];

export default function SolucionesDigitalesClient({ portfolioItems }: SolucionesDigitalesClientProps) {
  const { t, language, translateDb } = useLanguage();
  const [activeTab, setActiveTab] = useState<"services" | "portfolio">("services");
  const [selectedService, setSelectedService] = useState<string>("web-design");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    budget: "$1,000 - $3,000 USD",
  });

  const activeService = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          service: activeService.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSubmitted(true);
      } else {
        setErrorMessage(data.error || "Ocurrió un error al procesar.");
      }
    } catch (err) {
      setErrorMessage("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main style={{ minHeight: "100vh", paddingBottom: "80px", paddingTop: "80px" }}>
        {/* Title Hero */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px 40px", textAlign: "center" }}>
          <span className="section-label" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
            <Sparkles className="w-3 h-3 text-[#ff5500]" />
            {t("Estudio de Tecnología", "Technology Studio", "Estudio de Tecnología")}
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, marginTop: "16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {t("Soluciones ", "Digital ")}<span className="gradient-text">{t("Digitales", "Solutions")}</span>
          </h1>
          <p style={{
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            maxWidth: "640px",
            margin: "20px auto 0",
            lineHeight: 1.7,
          }}>
            {t(
              "Construimos ecosistemas de software a medida, aplicaciones en la nube e integraciones de IA con un portafolio comprobado de éxito.",
              "We build bespoke software ecosystems, cloud infrastructure, and AI integrations with a proven track record of success.",
              ""
            )}
          </p>

          {/* Premium Glassmorphic Switcher Tab */}
          <div style={{
            display: "inline-flex",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "30px",
            padding: "6px",
            marginTop: "40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          }}>
            <button
              onClick={() => setActiveTab("services")}
              style={{
                background: activeTab === "services" ? "var(--text-primary)" : "transparent",
                color: activeTab === "services" ? "var(--bg-primary)" : "var(--text-secondary)",
                border: "none",
                borderRadius: "24px",
                padding: "10px 24px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Cpu className="w-4 h-4" />
              {t("Servicios y Soluciones", "Services & Solutions", "Servicios")}
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              style={{
                background: activeTab === "portfolio" ? "var(--text-primary)" : "transparent",
                color: activeTab === "portfolio" ? "var(--bg-primary)" : "var(--text-secondary)",
                border: "none",
                borderRadius: "24px",
                padding: "10px 24px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Layers className="w-4 h-4" />
              {t("Portafolio de Proyectos", "Project Portfolio", "Portafolio")}
            </button>
          </div>
        </section>

        {/* Tab Contents */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          {activeTab === "services" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "32px",
            }} className="grid-cols-layout">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                alignContent: "start",
              }}>
                {SERVICES.map((service) => {
                  const isSelected = service.id === selectedService;
                  const title = language === "en" ? service.titleEn : language === "my" ? service.titleMy : service.titleEs;
                  return (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service.id);
                        setFormSubmitted(false);
                      }}
                      className="card"
                      style={{
                        textAlign: "left",
                        padding: "24px",
                        borderRadius: "16px",
                        cursor: "pointer",
                        border: isSelected
                          ? "1px solid var(--accent-gold)"
                          : "1px solid var(--border-subtle)",
                        background: isSelected
                          ? "var(--bg-card-hover)"
                          : "var(--bg-card)",
                        boxShadow: isSelected
                          ? "var(--glow-gold)"
                          : "none",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        display: "flex",
                        gap: "16px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{
                        padding: "10px",
                        borderRadius: "10px",
                        background: "rgba(255, 85, 0, 0.08)",
                        border: "1px solid var(--border-accent)",
                        flexShrink: 0,
                      }}>
                        {service.icon}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                          {title}
                        </h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                          {t("Desde", "Starting at")} <strong style={{ color: "var(--accent-gold)", fontWeight: 700 }}>${service.basePrice} USD</strong>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detail & Quote Request */}
              <div className="card" style={{
                borderRadius: "20px",
                padding: "40px",
                position: "relative",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "24px",
                  borderBottom: "1px solid var(--border-subtle)",
                  paddingBottom: "24px",
                  marginBottom: "32px",
                }}>
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>
                      {language === "en" ? activeService.titleEn : language === "my" ? activeService.titleMy : activeService.titleEs}
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                      {language === "en" ? activeService.descEn : language === "my" ? activeService.descMy : activeService.descEs}
                    </p>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block" }}>
                      {t("Valor base estimado", "Estimated Base Value")}
                    </span>
                    <span style={{ fontSize: "2rem", fontWeight: 900, color: "var(--accent-gold)" }}>
                      ${activeService.basePrice} USD
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: "40px" }}>
                  <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                    {t("¿Qué incluye esta solución?", "What's included in this solution?")}
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                    {(language === "en" ? activeService.featuresEn : language === "my" ? activeService.featuresMy : activeService.featuresEs).map((feat, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <CheckCircle className="w-4 h-4 text-[#ff5500] shrink-0" />
                        <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {formSubmitted ? (
                  <div style={{
                    textAlign: "center",
                    padding: "40px 24px",
                    border: "1px solid var(--border-accent)",
                    background: "rgba(255, 85, 0, 0.03)",
                    borderRadius: "16px",
                  }}>
                    <CheckCircle className="w-12 h-12 text-[#ff5500] mx-auto mb-4" />
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {t("¡Solicitud Recibida!", "Inquiry Received!")}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "8px", maxWidth: "420px", margin: "8px auto 24px" }}>
                      {t(
                        "Hemos registrado tu solicitud de cotización para esta solución. Un especialista técnico te contactará en un plazo menor a 2 horas hábiles.",
                        "We have registered your quote request. A technical specialist will contact you in less than 2 business hours."
                      )}
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="btn-secondary"
                      style={{ padding: "8px 24px", fontSize: "0.8rem" }}
                    >
                      {t("Enviar otra solicitud", "Submit another request")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {t("Solicitar Cotización y Asesoría Gratis", "Request Quote & Free Consultation")}
                    </h3>

                    {errorMessage && (
                      <div style={{ padding: "12px", background: "rgba(255,0,0,0.06)", border: "1px solid rgba(255,0,0,0.2)", color: "#e74c3c", borderRadius: "8px", fontSize: "0.8rem" }}>
                        {errorMessage}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                          {t("Nombre completo", "Full name")}
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Sergio Valle"
                          value={formData.name}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            outline: "none",
                            fontSize: "0.85rem",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                          {t("Correo electrónico", "Email address")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="sergio@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            outline: "none",
                            fontSize: "0.85rem",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                          {t("Teléfono (Opcional)", "Phone (Optional)")}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+52 999 123 4567"
                          value={formData.phone}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            outline: "none",
                            fontSize: "0.85rem",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                          {t("Presupuesto Estimado", "Estimated Budget")}
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            outline: "none",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                          }}
                        >
                          <option>$1,000 - $3,000 USD</option>
                          <option>$3,000 - $10,000 USD</option>
                          <option>$10,000+ USD</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                        {t("Especificaciones de tu Proyecto", "Project Details")}
                      </label>
                      <textarea
                        name="message"
                        required
                        placeholder={t(
                          "Cuéntanos brevemente sobre las metas de tu proyecto, integraciones requeridas o plazos estimados...",
                          "Briefly tell us about your project goals, required integrations, or estimated deadlines..."
                        )}
                        value={formData.message}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-primary)",
                          outline: "none",
                          fontSize: "0.85rem",
                          minHeight: "100px",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                      style={{
                        padding: "14px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      {loading ? t("Procesando...", "Processing...") : (
                        <>
                          <span>{t("Solicitar Propuesta", "Request Proposal")}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div>
              {portfolioItems.length === 0 ? (
                <div className="card" style={{ padding: "80px", textAlign: "center", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "3rem", marginBottom: "16px" }}>🎨</p>
                  <h2 style={{ fontWeight: 800, marginBottom: "8px", color: "var(--text-primary)" }}>
                    {t("Portafolio disponible próximamente", "Portfolio coming soon")}
                  </h2>
                  <p>{t("Estamos preparando nuestros mejores trabajos. ¡Vuelve pronto!", "We're curating our best work. Check back soon!")}</p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "28px",
                }}>
                  {portfolioItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      <div
                        style={{
                          height: "220px",
                          background: item.imageUrl
                            ? `url(${item.imageUrl}) center/cover`
                            : "linear-gradient(135deg, var(--bg-card), var(--bg-primary))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "3.5rem",
                          position: "relative",
                          overflow: "hidden",
                          borderBottom: "1px solid var(--border-subtle)",
                        }}
                      >
                        {!item.imageUrl && "🌐"}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
                          }}
                        />
                      </div>
                      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <span style={{
                              background: "rgba(255, 85, 0, 0.08)",
                              border: "1px solid var(--border-accent)",
                              color: "var(--accent-gold)",
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}>{t("Diseño Web", "Web Design")}</span>
                            {item.price && (
                              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                                ${item.price.toLocaleString()} USD
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--text-primary)", marginBottom: "10px" }}>
                            {translateDb(item.title)}
                          </h3>
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.85rem",
                              lineHeight: 1.65,
                              marginBottom: "24px",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {translateDb(item.description)}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          {item.liveUrl && (
                            <Link
                              href={`/portfolio/live-preview/${item.slug}`}
                              className="btn-secondary"
                              style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              <span>Demo</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          )}
                          <Link
                            href={`/portfolio/${item.slug}`}
                            className="btn-primary"
                            style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <span>{t("Ver Detalles", "Details")}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section style={{ maxWidth: "1280px", margin: "80px auto 0", padding: "0 24px", width: "100%" }}>
          <div className="card" style={{
            padding: "60px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>
              {t("¿Tienes un proyecto en mente?", "Have a project in mind?")}
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "28px", maxWidth: "540px", margin: "0 auto 28px", lineHeight: 1.6 }}>
              {t("Platiquemos sobre tus metas. Creamos productos digitales premium a la medida de tus necesidades.", "Let's discuss your goals. We create premium bespoke digital products tailored to your needs.")}
            </p>
            <Link href="/contact" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span>{t("Iniciar Mi Proyecto →", "Start Your Project →")}</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <style>{`
        @media (min-width: 1024px) {
          .grid-cols-layout {
            grid-template-columns: 380px 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
