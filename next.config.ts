import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@whiskeysockets/baileys",
    "qrcode",
    "sharp",
    "pino",
  ],
  // Disable Turbopack for production builds — avoids Next.js 16.2 /_not-found
  // prerender invariant bug that only affects Turbopack builds locally.
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
