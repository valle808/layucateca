'use client';

import { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  layout?: string;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Google AdSense Unit Component
 * Renders an AdSense ad with proper initialization
 * 
 * Usage:
 *   <AdSenseUnit slot="1234567890" format="auto" responsive />
 *   <AdSenseUnit slot="1234567890" format="rectangle" className="my-ad" />
 */
export default function AdSenseUnit({
  slot,
  format = 'auto',
  layout,
  className = '',
  style = {},
  responsive = true,
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || initialized.current) return;
    
    try {
      initialized.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn('[AdSense] Failed to push ad:', err);
    }
  }, [clientId]);

  const isPlaceholderSlot = ['1234567890', '0987654321', '1122334455', ''].includes(slot);
  if (isPlaceholderSlot && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!clientId) {
    // Development placeholder — shows a nice placeholder in dev mode
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          className={`adsense-placeholder ${className}`}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace',
            minHeight: format === 'rectangle' ? '250px' : '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '4px',
            ...style,
          }}
        >
          <div>📢 Google AdSense</div>
          <div style={{ fontSize: '9px' }}>slot: {slot} · {format}</div>
          <div style={{ fontSize: '9px' }}>Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to enable</div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// ── Preset Ad Units ───────────────────────────────────────────────────────────

/**
 * Article Banner — 728x90 or responsive, shown between articles in list
 */
export function ArticleListAd({ className = '' }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? '1234567890'}
      format="auto"
      responsive
      className={`article-list-ad ${className}`}
      style={{ margin: '16px 0', minHeight: '90px' }}
    />
  );
}

/**
 * In-Article Ad — shown within the article body after 3rd paragraph
 */
export function InArticleAd({ className = '' }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? '0987654321'}
      format="fluid"
      layout="in-article"
      responsive
      className={`in-article-ad ${className}`}
      style={{ margin: '24px 0' }}
    />
  );
}

/**
 * Sidebar Rectangle — 300x250
 */
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <AdSenseUnit
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? '1122334455'}
      format="rectangle"
      responsive={false}
      className={`sidebar-ad ${className}`}
      style={{ width: '300px', height: '250px', margin: '16px auto' }}
    />
  );
}
