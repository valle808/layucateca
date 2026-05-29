import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@whiskeysockets/baileys",
    "qrcode",
    "sharp",
    "pino",
  ],
  turbopack: {},
};

export default nextConfig;
