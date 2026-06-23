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
        {/* ── Google AdSense verification + auto-ads ── */}
        {/* PERMANENT: Do NOT remove. Required for AdSense approval and ad serving. */}
        <meta name="google-adsense-account" content="ca-pub-8867340586657793" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8867340586657793"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* Google AdSense — secondary load via Next.js Script for SPA navigations */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8867340586657793"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Facebook SDK for Comments Plugin */}
        <div id="fb-root"></div>
        <Script
          async
          defer
          crossOrigin="anonymous"
          src={`https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v19.0&appId=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ""}`}
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
