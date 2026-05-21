/**
 * RSS Fetcher Tool — La Yucateca News Engine
 * Fetches and parses RSS feeds, returning normalized article candidates
 * Adapted from openclaw-newsroom/scripts logic
 */

export interface RssArticle {
  title: string;
  url: string;
  source: string;
  tier: 1 | 2 | 3 | 4;
  publishedAt: Date;
  summary?: string;
  category: string;
  language: 'es' | 'en';
}

const FETCH_TIMEOUT_MS = 8000;
const MAX_ARTICLES_PER_FEED = 10;
const MAX_AGE_HOURS = 48;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date();
  try {
    return new Date(dateStr);
  } catch {
    return new Date();
  }
}

function isRecent(date: Date): boolean {
  const cutoff = new Date(Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000);
  return date > cutoff;
}

interface RssItem {
  title?: string | { _text?: string };
  link?: string | { _text?: string; href?: string } | Array<{ _text?: string; href?: string }>;
  description?: string | { _text?: string; __cdata?: string };
  summary?: string | { _text?: string; __cdata?: string };
  pubDate?: string | { _text?: string };
  published?: string | { _text?: string };
  updated?: string | { _text?: string };
  'dc:date'?: string | { _text?: string };
  guid?: string | { _text?: string; '#text'?: string };
}

function extractText(field: unknown): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>;
    return String(obj._text || obj.__cdata || obj['#text'] || '');
  }
  return '';
}

function extractLink(item: RssItem): string {
  if (!item.link) return '';
  if (typeof item.link === 'string') return item.link;
  if (Array.isArray(item.link)) {
    for (const l of item.link) {
      if (l.href) return l.href;
      if (l._text) return l._text;
    }
    return '';
  }
  const obj = item.link as Record<string, unknown>;
  return String(obj.href || obj._text || '');
}

async function fetchFeed(
  url: string,
  sourceName: string,
  tier: 1 | 2 | 3 | 4,
  category: string,
  language: 'es' | 'en'
): Promise<RssArticle[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LaYucateca-NewsBot/1.0 (+https://layucateca.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      console.warn(`[rss-fetcher] Failed ${sourceName}: HTTP ${response.status}`);
      return [];
    }

    const xmlText = await response.text();

    // Simple XML parsing without external dependency
    const articles: RssArticle[] = [];
    
    // Extract items using regex (lightweight, no xmldom needed)
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    
    const extractTag = (xml: string, tag: string): string => {
      const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'));
      if (cdataMatch) return cdataMatch[1].trim();
      const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const extractLinkFromXml = (xml: string): string => {
      // Try <link href="..."> (Atom)
      const atomMatch = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
      if (atomMatch) return atomMatch[1];
      // Try <link>URL</link> (RSS)
      const rssMatch = xml.match(/<link>([^<]*)<\/link>/i);
      if (rssMatch) return rssMatch[1].trim();
      return '';
    };

    const processItem = (itemXml: string) => {
      const title = stripHtml(extractTag(itemXml, 'title'));
      const link = extractLinkFromXml(itemXml) || extractTag(itemXml, 'guid');
      const summary = stripHtml(extractTag(itemXml, 'description') || extractTag(itemXml, 'summary'));
      const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published') || extractTag(itemXml, 'updated');
      const publishedAt = parseDate(pubDate);

      if (!title || !link) return;
      if (!isRecent(publishedAt)) return;
      if (title.length < 10) return;

      articles.push({
        title,
        url: link,
        source: sourceName,
        tier,
        publishedAt,
        summary: summary?.slice(0, 300),
        category,
        language,
      });
    };

    let match;
    let count = 0;
    
    // Try RSS items
    itemRegex.lastIndex = 0;
    while ((match = itemRegex.exec(xmlText)) !== null && count < MAX_ARTICLES_PER_FEED) {
      processItem(match[1]);
      count++;
    }

    // Try Atom entries
    if (count === 0) {
      entryRegex.lastIndex = 0;
      while ((match = entryRegex.exec(xmlText)) !== null && count < MAX_ARTICLES_PER_FEED) {
        processItem(match[1]);
        count++;
      }
    }

    return articles;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`[rss-fetcher] Timeout on ${sourceName}`);
    } else {
      console.warn(`[rss-fetcher] Error on ${sourceName}:`, err);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRssForCategory(
  category: string,
  sources: Array<{ name: string; url: string; tier: 1 | 2 | 3 | 4; language: 'es' | 'en' }>
): Promise<RssArticle[]> {
  const results = await Promise.allSettled(
    sources.map(s => fetchFeed(s.url, s.name, s.tier, category, s.language))
  );

  const articles: RssArticle[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
    }
  }

  // Sort by tier (higher quality first) then by date (newest first)
  return articles
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    })
    .slice(0, 50); // Cap at 50 candidates
}
