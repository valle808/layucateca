"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Laptop, Code, ShieldCheck, CloudLightning, Cpu, CheckCircle, ArrowRight, Star } from "lucide-react";

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
    icon: <Laptop className="w-8 h-8 text-[#ff5500]" />,
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
    icon: <Code className="w-8 h-8 text-[#ff5500]" />,
    titleEs: "Desarrollo de Software a Medida",
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
    icon: <ShieldCheck className="w-8 h-8 text-[#ff5500]" />,
    titleEs: "Auditoría de Ciberseguridad",
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
    icon: <CloudLightning className="w-8 h-8 text-[#ff5500]" />,
    titleEs: "Arquitectura Cloud e Infraestructura",
    titleEn: "Cloud Architecture & Infrastructure",
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
    icon: <Cpu className="w-8 h-8 text-[#ff5500]" />,
    titleEs: "Innovaciones Tecnológicas e IA",
    titleEn: "AI & Technological Innovations",
    titleMy: "Ma'alobtsil IA",
    descEs: "Integración de Inteligencia Artificial, automatizaciones y agentes inteligentes para optimizar operaciones.",
    descEn: "AI model deployment, system integrations, and smart agent automation.",
    descMy: "Inteligencia Artificial y agentes inteligentes.",
    basePrice: 3200,
    featuresEs: ["Modelos de Lenguaje Locales", "Agentes autónomos", "Análisis predictivo de datos", "Asistentes virtuales cognitivos"],
    featuresEn: ["Local LLM fine-tuning", "Autonomous agent networks", "Predictive data analytics", "Cognitive virtual assistants"],
    featuresMy: ["LLM locales", "Agentes", "Predictive", "Virtual assistants"],
  },
];

export default function ItSolutionsPage() {
  const { t, language } = useLanguage();
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
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Title Hero */}
      <div className="text-center mb-16 animate-fadeInUp">
        <span className="text-xs uppercase tracking-widest text-[#ff5500] font-bold px-3 py-1 border border-[rgba(255,85,0,0.3)] bg-[rgba(255,85,0,0.05)] rounded-full">
          IT SOLUTIONS HUB
        </span>
        <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight">
          {t("Soluciones Tecnológicas de Vanguardia", "Cutting-Edge IT Solutions", "U Meyajo'ob Teknolójiko")}
        </h1>
        <p className="text-lg text-[rgba(255,255,255,0.65)] mt-4 max-w-2xl mx-auto">
          {t(
            "Desarrollamos soluciones a medida, desde sitios web interactivos hasta infraestructura en la nube e Inteligencia Artificial.",
            "We design custom technological ecosystems, from interactive web platforms to cloud systems and AI integrations.",
            "Desarrollamos soluciones a medida y Inteligencia Artificial."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Catalog Menu & Selection */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2 px-1">
            {t("Catálogo de Servicios", "Services Catalog", "Meyajo'ob")}
          </h2>
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
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                  isSelected
                    ? "bg-[rgba(255,85,0,0.08)] border-[#ff5500] shadow-[0_0_20px_rgba(255,85,0,0.15)]"
                    : "bg-[rgba(15,15,25,0.45)] border-[rgba(255,255,255,0.08)] hover:bg-[rgba(22,22,35,0.65)] hover:border-[rgba(255,85,0,0.3)]"
                }`}
              >
                <div className={`p-2 rounded-lg bg-[rgba(255,85,0,0.05)] border border-[rgba(255,85,0,0.15)]`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{title}</h3>
                  <p className="text-xs text-[rgba(255,255,255,0.45)] mt-1">
                    {t("Desde", "Starting at", "Desde")} <span className="text-[#ff5500] font-semibold">${service.basePrice} USD</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Service Detail Panel & Quote Request Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,15,25,0.45)] backdrop-blur-md">
            {/* Service Header Info */}
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[rgba(255,255,255,0.08)] pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {language === "en" ? activeService.titleEn : language === "my" ? activeService.titleMy : activeService.titleEs}
                </h2>
                <p className="text-sm text-[rgba(255,255,255,0.55)] mt-2">
                  {language === "en" ? activeService.descEn : language === "my" ? activeService.descMy : activeService.descEs}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[rgba(255,255,255,0.4)] uppercase block">{t("Valor base estimado", "Estimated Base Value", "Base")}</span>
                <span className="text-3xl font-black text-[#ff5500]">${activeService.basePrice} USD</span>
              </div>
            </div>

            {/* Features check list */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-4">
                {t("¿Qué incluye esta solución?", "What's included in this solution?", "Incluye")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(language === "en" ? activeService.featuresEn : language === "my" ? activeService.featuresMy : activeService.featuresEs).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#ff5500] shrink-0" />
                    <span className="text-sm text-[rgba(255,255,255,0.75)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquiry Form / Checkout simulation */}
            {formSubmitted ? (
              <div className="text-center p-8 border border-[rgba(255,85,0,0.2)] bg-[rgba(255,85,0,0.03)] rounded-xl animate-fadeInUp">
                <CheckCircle className="w-12 h-12 text-[#ff5500] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">{t("¡Solicitud Recibida!", "Inquiry Received!", "¡Recibido!")}</h3>
                <p className="text-sm text-[rgba(255,255,255,0.65)] mt-2">
                  {t(
                    "Hemos registrado tu solicitud de cotización para esta solución. Un especialista técnico te contactará en un plazo menor a 2 horas hábiles.",
                    "We have registered your quote request. A technical specialist will contact you in less than 2 business hours.",
                    "Un especialista técnico te contactará."
                  )}
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-6 px-6 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,85,0,0.3)] hover:bg-[rgba(255,85,0,0.08)] text-white text-xs font-bold transition-all"
                >
                  {t("Enviar otra solicitud", "Submit another request", "Otra solicitud")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">{t("Solicitar Cotización y Asesoría Gratis", "Request Quote & Free Consultation", "Cotización")}</h3>
                
                {errorMessage && <div className="p-3 text-xs bg-[rgba(255,0,0,0.1)] border border-red-500/30 text-red-400 rounded-lg">{errorMessage}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">{t("Nombre completo", "Full name", "Nombre")}</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Sergio Valle"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">{t("Correo electrónico", "Email address", "E-mail")}</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="sergio@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">{t("Teléfono (Opcional)", "Phone (Optional)", "Teléfono")}</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+52 999 123 4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">{t("Presupuesto Estimado", "Estimated Budget", "Presupuesto")}</label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="input text-xs"
                    >
                      <option>$1,000 - $3,000 USD</option>
                      <option>$3,000 - $10,000 USD</option>
                      <option>$10,000+ USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase block mb-1">{t("Especificaciones de tu Proyecto", "Project Details", "Proyecto")}</label>
                  <textarea
                    name="message"
                    required
                    placeholder={t(
                      "Cuéntanos brevemente sobre las metas de tu proyecto, integraciones requeridas o plazos estimados...",
                      "Briefly tell us about your project goals, required integrations, or estimated deadlines...",
                      "Cuéntanos sobre tu proyecto..."
                    )}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="input text-xs min-h-[80px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center gap-2 border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] text-sm py-3 mt-4"
                >
                  {loading ? t("Procesando...", "Processing...", "Procesando...") : (
                    <>
                      <span>{t("Solicitar Propuesta", "Request Proposal", "Solicitar")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
