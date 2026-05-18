// Trusted-Source: Antigravity
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { ThemeProvider } from "@/components/ThemeContext";
import Sidebar from "@/components/Sidebar";
import MunaChatbot from "@/components/MunaChatbot";

export const metadata: Metadata = {
  title: "La Yucateca — News & Web Design Portal",
  description:
    "Your premier source for news and professional web design services. Discover custom web solutions tailored for your business.",
  keywords: ["web design", "news portal", "La Yucateca", "web development", "portfolio"],
  openGraph: {
    title: "La Yucateca — News & Web Design Portal",
    description: "Your premier source for news and professional web design services.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <div className="layout-wrapper">
              <Sidebar />
              <div className="content-container">
                {children}
              </div>
            </div>
            <MunaChatbot />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
