/**
 * RSS Sources — La Yucateca News Engine
 * 20+ Spanish-language RSS feeds organized by category
 */

export interface RssSource {
  name: string;
  url: string;
  tier: 1 | 2 | 3 | 4;
  language: 'es' | 'en';
  categories: string[];
  country?: string;
}

export const RSS_SOURCES: RssSource[] = [
  // ── Tier 1: Wire Services ─────────────────────────────────────────────────
  {
    name: 'BBC Mundo',
    url: 'https://feeds.bbci.co.uk/mundo/rss.xml',
    tier: 1, language: 'es',
    categories: ['Local', 'Internacional', 'Política', 'Economía'],
    country: 'MX'
  },
  {
    name: 'Reuters ES',
    url: 'https://feeds.reuters.com/reuters/MXTopNews',
    tier: 1, language: 'es',
    categories: ['Internacional', 'Economía', 'Política'],
    country: 'MX'
  },
  {
    name: 'EFE Noticias',
    url: 'https://www.efe.com/efe/espana/index.xml',
    tier: 1, language: 'es',
    categories: ['Internacional', 'Política', 'Economía'],
    country: 'ES'
  },
  {
    name: 'AFP ES',
    url: 'https://www.afpbb.com/rss/index.xml',
    tier: 1, language: 'es',
    categories: ['Internacional'],
    country: 'FR'
  },

  // ── Tier 2: Major Mexican Press ───────────────────────────────────────────
  {
    name: 'El Universal',
    url: 'https://www.eluniversal.com.mx/rss.xml',
    tier: 2, language: 'es',
    categories: ['Local', 'Política', 'Economía', 'Cultura'],
    country: 'MX'
  },
  {
    name: 'Milenio',
    url: 'https://www.milenio.com/rss',
    tier: 2, language: 'es',
    categories: ['Local', 'Política', 'Economía'],
    country: 'MX'
  },
  {
    name: 'Excélsior',
    url: 'https://www.excelsior.com.mx/rss.xml',
    tier: 2, language: 'es',
    categories: ['Local', 'Política', 'Economía', 'Deportes'],
    country: 'MX'
  },
  {
    name: 'La Jornada',
    url: 'https://www.jornada.com.mx/rss/portada.xml',
    tier: 2, language: 'es',
    categories: ['Política', 'Economía', 'Cultura'],
    country: 'MX'
  },
  {
    name: 'Reforma',
    url: 'https://www.reforma.com/rss/portada.xml',
    tier: 2, language: 'es',
    categories: ['Local', 'Política', 'Economía'],
    country: 'MX'
  },
  {
    name: 'Animal Político',
    url: 'https://www.animalpolitico.com/feed',
    tier: 2, language: 'es',
    categories: ['Política', 'Economía'],
    country: 'MX'
  },

  // ── Tier 2: Yucatán Regional ──────────────────────────────────────────────
  {
    name: 'Punto Medio',
    url: 'https://puntomedio.mx/feed',
    tier: 2, language: 'es',
    categories: ['Local', 'Política'],
    country: 'MX'
  },
  {
    name: 'El Diario de Yucatan',
    url: 'https://www.yucatan.com.mx/feed',
    tier: 2, language: 'es',
    categories: ['Local'],
    country: 'MX'
  },
  {
    name: 'Sipse',
    url: 'https://sipse.com/feed',
    tier: 2, language: 'es',
    categories: ['Local', 'Deportes'],
    country: 'MX'
  },
  {
    name: 'PorEsto Yucatán',
    url: 'https://www.poresto.net/feed',
    tier: 2, language: 'es',
    categories: ['Local', 'Política'],
    country: 'MX'
  },

  // ── Tier 3: Technology ────────────────────────────────────────────────────
  {
    name: 'Xataka México',
    url: 'https://www.xataka.com.mx/feedburner.xml',
    tier: 3, language: 'es',
    categories: ['Tecnología'],
    country: 'MX'
  },
  {
    name: 'Hipertextual',
    url: 'https://hipertextual.com/feed',
    tier: 3, language: 'es',
    categories: ['Tecnología'],
    country: 'ES'
  },
  {
    name: 'Engadget ES',
    url: 'https://es.engadget.com/rss.xml',
    tier: 3, language: 'es',
    categories: ['Tecnología'],
    country: 'US'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    tier: 3, language: 'en',
    categories: ['Tecnología'],
    country: 'US'
  },

  // ── Tier 3: Sports ────────────────────────────────────────────────────────
  {
    name: 'ESPN Deportes',
    url: 'https://espndeportes.espn.com/core/rss/news',
    tier: 3, language: 'es',
    categories: ['Deportes'],
    country: 'US'
  },
  {
    name: 'Marca',
    url: 'https://www.marca.com/rss/portada.xml',
    tier: 3, language: 'es',
    categories: ['Deportes'],
    country: 'ES'
  },
  {
    name: 'AS Mexico',
    url: 'https://mexico.as.com/rss/portada.xml',
    tier: 3, language: 'es',
    categories: ['Deportes'],
    country: 'MX'
  },

  // ── Tier 3: Culture & Entertainment ──────────────────────────────────────
  {
    name: 'El País Cultura',
    url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/cultura/portada',
    tier: 3, language: 'es',
    categories: ['Cultura', 'Entretenimiento'],
    country: 'ES'
  },
  {
    name: 'Vogue México',
    url: 'https://www.vogue.mx/feed',
    tier: 3, language: 'es',
    categories: ['Entretenimiento', 'Cultura'],
    country: 'MX'
  },

  // ── Tier 4: Economy & Finance ─────────────────────────────────────────────
  {
    name: 'El Economista MX',
    url: 'https://www.eleconomista.com.mx/rss/portada.xml',
    tier: 3, language: 'es',
    categories: ['Economía'],
    country: 'MX'
  },
  {
    name: 'Expansión',
    url: 'https://expansion.mx/rss',
    tier: 3, language: 'es',
    categories: ['Economía', 'Tecnología'],
    country: 'MX'
  },
];

// News categories for La Yucateca (8 total)
export const NEWS_CATEGORIES = [
  'Local',
  'Política',
  'Economía',
  'Deportes',
  'Cultura',
  'Tecnología',
  'Internacional',
  'Entretenimiento',
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];

// Get sources for a specific category
export function getSourcesForCategory(category: NewsCategory): RssSource[] {
  return RSS_SOURCES.filter(s => s.categories.includes(category))
    .sort((a, b) => a.tier - b.tier);
}

// Category rotation queue — cycles so each gets a turn
export class CategoryQueue {
  private queue: NewsCategory[] = [...NEWS_CATEGORIES];
  private index = 0;

  next(): NewsCategory {
    const cat = this.queue[this.index];
    this.index = (this.index + 1) % this.queue.length;
    return cat;
  }

  getCurrent(): NewsCategory {
    return this.queue[this.index];
  }
}
