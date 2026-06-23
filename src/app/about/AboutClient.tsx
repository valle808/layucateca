"use client";

import { useLanguage } from "@/components/LanguageContext";
import Link from "next/link";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div style={{ padding: "120px 24px", maxWidth: "800px", margin: "0 auto", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
        {t("Acerca de La Yucateca", "About La Yucateca", "Tu yóolal La Yucateca")}
      </h1>

      <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "24px" }}>
        <p style={{ fontSize: "1.1rem" }}>
          {t(
            "Bienvenidos a La Yucateca, tu principal fuente de noticias y soluciones de diseño web profesional.",
            "Welcome to La Yucateca, your premier source for news and professional web design solutions.",
            "Kíimak 'oolal ti' La Yucateca, a yáax pa'ak'al ti'al péektsil yéetel meyajo'ob ti' pat jo'ol web."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Nuestra Misión", "Our Mission", "K-Misión")}
        </h2>
        <p>
          {t(
            "En La Yucateca, creemos en mantener a nuestra comunidad informada mientras empoderamos a las empresas locales e internacionales con una presencia digital de primer nivel. Nuestra plataforma de noticias cubre las últimas actualizaciones globales y locales con integridad y rapidez. Al mismo tiempo, nuestro equipo de diseño y desarrollo web crea sitios web a medida, sistemas de comercio electrónico y portafolios digitales para ayudar a los emprendedores a tener éxito en línea.",
            "At La Yucateca, we believe in keeping our community informed while empowering local and international businesses with a top-tier digital presence. Our news platform covers the latest global and local updates with integrity and speed. Simultaneously, our web design and development team creates custom websites, e-commerce systems, and digital portfolios to help entrepreneurs succeed online."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("¿Qué Hacemos?", "What We Do", "Ba'ax k-meyaj?")}
        </h2>
        <ul style={{ listStyleType: "disc", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <li>
            <strong>{t("Noticias: ", "News: ")}</strong>
            {t(
              "Reportajes periodísticos, noticias de última hora y cobertura de eventos.",
              "Journalistic reporting, breaking news, and event coverage."
            )}
          </li>
          <li>
            <strong>{t("Soluciones Digitales: ", "Digital Solutions: ")}</strong>
            {t(
              "Diseño web, optimización SEO, desarrollo de aplicaciones y mantenimiento.",
              "Web design, SEO optimization, application development, and maintenance."
            )}
          </li>
          <li>
            <strong>{t("Comunidad: ", "Community: ")}</strong>
            {t(
              "Un espacio donde la tecnología y la información se unen para el beneficio de todos.",
              "A space where technology and information come together for everyone's benefit."
            )}
          </li>
        </ul>

        <div style={{ marginTop: "32px", padding: "24px", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
          <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem", marginBottom: "16px" }}>
            {t("¿Quieres saber más o trabajar con nosotros?", "Want to know more or work with us?", "¿Ta k'áat a wojéeltik u maasil wa a meyaj t-éetel?")}
          </h3>
          <p style={{ marginBottom: "16px" }}>
            {t(
              "Estamos siempre abiertos a nuevas colaboraciones, preguntas de nuestros lectores o clientes interesados en transformar su negocio.",
              "We are always open to new collaborations, questions from our readers, or clients interested in transforming their business."
            )}
          </p>
          <Link href="/contact" style={{ display: "inline-block", padding: "10px 20px", background: "var(--accent-primary)", color: "#000", textDecoration: "none", fontWeight: "bold", borderRadius: "4px" }}>
            {t("Contáctanos", "Contact Us", "T'aanik k-wíinklil")}
          </Link>
        </div>
      </div>
    </div>
  );
}
