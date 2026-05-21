"use client";

import { useEffect, useRef } from "react";

interface AdSenseAdProps {
  adSlot?: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSenseAd({
  adSlot = "",
  adFormat = "auto",
  fullWidthResponsive = true,
  style,
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (typeof window !== "undefined") {
        window.adsbygoogle = window.adsbygoogle || [];
        (window.adsbygoogle as unknown[]).push({});
        pushed.current = true;
      }
    } catch (e) {
      // Silently ignore — AdSense may not be ready yet
    }
  }, []);

  return (
    <div
      style={{
        display: "block",
        textAlign: "center",
        margin: "32px 0",
        position: "relative",
        ...style,
      }}
      aria-label="Publicidad"
    >
      {/* Subtle label so users know it's an ad */}
      <span
        style={{
          display: "block",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
          marginBottom: "6px",
        }}
      >
        Publicidad
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8867340586657793"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
