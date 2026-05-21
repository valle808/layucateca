/**
 * Dedup DB — La Yucateca News Engine
 * Prevents publishing duplicate or near-duplicate articles
 * Uses Prisma/DB to store seen URL hashes and title fingerprints
 * Adapted from openclaw-newsroom/scripts/dedup_db.py
 */

import { prisma } from '@/lib/prisma';

// Normalize URL by removing tracking params, fragments, trailing slashes
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking params
    const tracking = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source', 'fbclid', 'gclid'];
    for (const param of tracking) {
      parsed.searchParams.delete(param);
    }
    // Remove fragment
    parsed.hash = '';
    // Normalize path trailing slash
    const path = parsed.pathname.replace(/\/+$/, '');
    return (parsed.origin + path + (parsed.search || '')).toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

// Simple title fingerprint — removes stopwords and punctuation for fuzzy matching
export function titleFingerprint(title: string): string {
  const stopwords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'con', 'por', 'para',
    'que', 'se', 'no', 'al', 'es', 'the', 'a', 'an', 'of', 'in', 'to', 'and', 'is',
    'are', 'was', 'were', 'y', 'e', 'o', 'u'
  ]);
  
  return title
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .sort()
    .join('-');
}

// Calculate title similarity using Jaccard coefficient
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split('-'));
  const setB = new Set(b.split('-'));
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

export class DedupChecker {
  private recentUrls: Set<string> = new Set();
  private recentFingerprints: string[] = [];

  async loadRecent(limit = 100): Promise<void> {
    try {
      const recentPosts = await prisma.post.findMany({
        where: { aiGenerated: true },
        select: { slug: true, title: true, sourceUrls: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      for (const post of recentPosts) {
        // Load URLs
        if (post.sourceUrls) {
          try {
            const urls: string[] = JSON.parse(post.sourceUrls);
            for (const url of urls) {
              this.recentUrls.add(normalizeUrl(url));
            }
          } catch { /* ignore */ }
        }
        // Load title fingerprints
        this.recentFingerprints.push(titleFingerprint(post.title));
      }
    } catch (error) {
      console.warn('[dedup] Could not load recent posts:', error);
    }
  }

  isUrlSeen(url: string): boolean {
    return this.recentUrls.has(normalizeUrl(url));
  }

  isTitleDuplicate(title: string, threshold = 0.6): boolean {
    const fp = titleFingerprint(title);
    for (const existing of this.recentFingerprints) {
      if (jaccardSimilarity(fp, existing) > threshold) {
        return true;
      }
    }
    return false;
  }

  markSeen(url: string, title: string): void {
    this.recentUrls.add(normalizeUrl(url));
    this.recentFingerprints.unshift(titleFingerprint(title));
    // Keep only last 100
    if (this.recentFingerprints.length > 100) {
      this.recentFingerprints = this.recentFingerprints.slice(0, 100);
    }
  }
}
