"use client";

import { FormEvent } from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function ContactForm() {
  const { t } = useLanguage();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert(t("Mensaje enviado con exito!", "Message sent successfully!", "Ts'o'ok u ximbalta'al!"));
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
            {t("Nombre", "First Name", "K'aaba'")}
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
            {t("Apellido", "Last Name", "Apellido")}
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
          {t("Correo Electronico", "Email Address", "Correo Electronico")}
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
          {t("Tipo de Proyecto", "Project Type", "Tipo Meyaj")}
        </label>
        <select id="project-type" className="input" style={{ appearance: "none" }}>
          <option value="">{t("Selecciona un servicio...", "Select a service...", "Cha'a jump'eel servicio...")}</option>
          <option value="web-design">{t("Diseno Web Personalizado", "Custom Web Design", "Diseno Web")}</option>
          <option value="ecommerce">{t("Sitio de Comercio Electronico", "E-Commerce Site", "Sitio Comercio")}</option>
          <option value="cms">{t("CMS / Blog", "CMS / Blog", "CMS / Blog")}</option>
          <option value="seo">{t("Optimizacion SEO", "SEO Optimization", "Optimizacion SEO")}</option>
          <option value="branding">{t("Marca e Identidad", "Branding & Identity", "Marca e Identidad")}</option>
          <option value="other">{t("Otro", "Other", "U la'ak'")}</option>
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
          {t("Rango de Presupuesto", "Budget Range", "Rango Presupuesto")}
        </label>
        <select id="budget" className="input" style={{ appearance: "none" }}>
          <option value="">{t("Selecciona el presupuesto...", "Select budget...", "Cha'a presupuesto...")}</option>
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
          {t("Detalles del Proyecto", "Project Details", "Detalles Meyaj")}
        </label>
        <textarea
          id="project-details"
          placeholder={t(
            "Cuentanos sobre tu proyecto, objetivos y cualquier requisito especifico...",
            "Tell us about your project, goals, and any specific requirements...",
            "Ts'iib to'on ti' a meyaj, a wo'olal yetel ba'ax a k'aat..."
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
        {t("Enviar Mensaje", "Send Message", "Ximbaltik Ts'iib")}
      </button>
    </form>
  );
}
