"use client";

import { FormEvent } from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function ContactForm() {
  const { t } = useLanguage();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert(t("¡Mensaje enviado con éxito!", "Message sent successfully!"));
  };

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label
            htmlFor="first-name"
            style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {t("Nombre", "First Name")}
          </label>
          <input id="first-name" type="text" placeholder="Sergio" className="input" required />
        </div>
        <div>
          <label
            htmlFor="last-name"
            style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {t("Apellido", "Last Name")}
          </label>
          <input id="last-name" type="text" placeholder="Valle" className="input" required />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-email"
          style={{
            display: "block",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "8px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {t("Correo Electrónico", "Email Address")}
        </label>
        <input id="contact-email" type="email" placeholder="hello@example.com" className="input" required />
      </div>

      <div>
        <label
          htmlFor="project-type"
          style={{
            display: "block",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "8px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {t("Tipo de Proyecto", "Project Type")}
        </label>
        <select id="project-type" className="input" style={{ appearance: "none" }}>
          <option value="">{t("Selecciona un servicio...", "Select a service...")}</option>
          <option value="web-design">{t("Diseño Web Personalizado", "Custom Web Design")}</option>
          <option value="ecommerce">{t("Sitio de Comercio Electrónico", "E-Commerce Site")}</option>
          <option value="cms">{t("CMS / Blog", "CMS / Blog")}</option>
          <option value="seo">{t("Optimización SEO", "SEO Optimization")}</option>
          <option value="branding">{t("Marca e Identidad", "Branding & Identity")}</option>
          <option value="other">{t("Otro", "Other")}</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="budget"
          style={{
            display: "block",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "8px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {t("Rango de Presupuesto", "Budget Range")}
        </label>
        <select id="budget" className="input" style={{ appearance: "none" }}>
          <option value="">{t("Selecciona el presupuesto...", "Select budget...")}</option>
          <option value="500-1000">$500 – $1,000</option>
          <option value="1000-3000">$1,000 – $3,000</option>
          <option value="3000-10000">$3,000 – $10,000</option>
          <option value="10000+">$10,000+</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="project-details"
          style={{
            display: "block",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "8px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {t("Detalles del Proyecto", "Project Details")}
        </label>
        <textarea
          id="project-details"
          placeholder={t(
            "Cuéntanos sobre tu proyecto, objetivos y cualquier requisito específico...",
            "Tell us about your project, goals, and any specific requirements..."
          )}
          className="input"
          required
        />
      </div>

      <button
        id="contact-submit"
        type="submit"
        className="btn-primary"
        style={{ justifyContent: "center", padding: "14px" }}
      >
        {t("Enviar Mensaje →", "Send Message →")}
      </button>
    </form>
  );
}
