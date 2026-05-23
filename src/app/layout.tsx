// Trusted-Source: Antigravity
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from "@/components/AuthContext";
import Sidebar from "@/components/Sidebar";
import MunaChatbot from "@/components/MunaChatbot";
import EmergencyAlertBanner from "@/components/EmergencyAlertBanner";
import Script from "next/script";

export const dynamic = 'force-dynamic';

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
  other: {
    "google-adsense-account": "ca-pub-8867340586657793",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="google-adsense-account" content="ca-pub-8867340586657793" />
      </head>
      <body>
        {/* Google AdSense — loaded after page is interactive to avoid blocking render */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8867340586657793"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <EmergencyAlertBanner />
              <div className="layout-wrapper">
                <Sidebar />
                <div className="content-container">
                  {children}
                </div>
              </div>
              <MunaChatbot />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
