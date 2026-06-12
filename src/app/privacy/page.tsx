"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div style={{ padding: "120px 24px", maxWidth: "800px", margin: "0 auto", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
        {t("Política de Privacidad", "Privacy Policy", "No'ojalil Privacidad")}
      </h1>

      <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "24px" }}>
        <p>
          {t(
            "En La Yucateca, la privacidad de nuestros visitantes es de extrema importancia para nosotros. Este documento de política de privacidad describe los tipos de información personal que recibe y recopila La Yucateca y cómo se utiliza.",
            "At La Yucateca, the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information is received and collected by La Yucateca and how it is used."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Archivos de Registro", "Log Files")}
        </h2>
        <p>
          {t(
            "Al igual que muchos otros sitios web, La Yucateca utiliza archivos de registro. La información dentro de los archivos de registro incluye direcciones de protocolo de Internet (IP), tipo de navegador, proveedor de servicios de Internet (ISP), sello de fecha/hora, páginas de referencia/salida y el número de clics para analizar tendencias, administrar el sitio, rastrear el movimiento de los usuarios por el sitio y recopilar información demográfica. Las direcciones IP y otra información similar no están vinculadas a ninguna información que sea de identificación personal.",
            "Like many other Web sites, La Yucateca makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user's movement around the site, and gather demographic information. IP addresses, and other such information are not linked to any information that is personally identifiable."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Cookies y Web Beacons", "Cookies and Web Beacons")}
        </h2>
        <p>
          {t(
            "La Yucateca sí utiliza cookies para almacenar información sobre las preferencias de los visitantes, registrar información específica del usuario sobre las páginas a las que el usuario accede o visita, personalizar el contenido de la página web según el tipo de navegador del visitante u otra información que el visitante envía a través de su navegador.",
            "La Yucateca does use cookies to store information about visitors preferences, record user-specific information on which pages the user access or visit, customize Web page content based on visitors browser type or other information that the visitor sends via their browser."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Cookie DART de DoubleClick", "DoubleClick DART Cookie")}
        </h2>
        <p>
          {t(
            "Google, como proveedor de terceros, utiliza cookies para publicar anuncios en La Yucateca. El uso de la cookie DART por parte de Google le permite publicar anuncios a los usuarios basándose en su visita a La Yucateca y otros sitios en Internet. Los usuarios pueden darse de baja del uso de la cookie DART visitando la política de privacidad de la red de anuncios y contenido de Google.",
            "Google, as a third party vendor, uses cookies to serve ads on La Yucateca. Google's use of the DART cookie enables it to serve ads to users based on their visit to La Yucateca and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy."
          )}
        </p>

        <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginTop: "16px" }}>
          {t("Consentimiento", "Consent")}
        </h2>
        <p>
          {t(
            "Al utilizar nuestro sitio web, por la presente acepta nuestra política de privacidad y acepta sus términos.",
            "By using our website, you hereby consent to our privacy policy and agree to its terms."
          )}
        </p>

        <p style={{ marginTop: "32px", fontSize: "0.9rem" }}>
          {t("Última actualización: ", "Last updated: ")} {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
