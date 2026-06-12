"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export default function ContactClient() {
  const { t } = useLanguage();

  return (
    <>
      <main>
        <section style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ marginBottom: "48px" }}>
              <p className="section-label">{t("Contacto", "Get In Touch")}</p>
              <h1 style={{ fontSize: "3rem", fontWeight: 900 }}>
                {t("Construyamos Algo ", "Let's Build Something ")}<span className="gradient-text">{t("Increíble", "Amazing")}</span>
              </h1>
              <p style={{ color: "var(--text-secondary)", marginTop: "12px", lineHeight: 1.75 }}>
                {t(
                  "Cuéntanos sobre tu proyecto y nos pondremos en contacto contigo en menos de 24 horas con una cotización y un cronograma personalizados.",
                  "Tell us about your project and we'll get back to you within 24 hours with a custom quote and timeline."
                )}
              </p>
            </div>

            <div className="card" style={{ padding: "40px" }}>
              <ContactForm />
            </div>

            {/* Contact info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginTop: "32px",
              }}
            >
              {[
                { icon: "✉️", label: t("Correo", "Email"), value: "hello@layucateca.com" },
                { icon: "📍", label: t("Ubicación", "Location"), value: "Yucatán, México" },
                { icon: "⏱️", label: t("Respuesta", "Response"), value: t("Menos de 24h", "Within 24 hours") },
              ].map((info) => (
                <div
                  key={info.label}
                  className="card"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <p style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{info.icon}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                    {info.label}
                  </p>
                  <p style={{ fontSize: "0.8rem", fontWeight: 500 }}>{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
