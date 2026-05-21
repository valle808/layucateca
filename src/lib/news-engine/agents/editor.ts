/**
 * Editor Agent — La Yucateca News Engine
 * Quality-checks the generated article and enriches it
 * before passing to the Publisher agent
 */

import { DedupChecker } from '../tools/dedup-db';
import type { GeneratedArticle } from './writer';

export interface EditedArticle extends GeneratedArticle {
  qualityScore: number;
  approved: boolean;
  rejectionReason?: string;
  wordCount: number;
  readTimeMinutes: number;
}

function countWords(html: string): number {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function calculateReadTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200)); // avg reading speed 200 wpm
}

function scoreArticle(article: GeneratedArticle, wordCount: number): number {
  let score = 0;

  // Title quality (0-25 pts)
  if (article.title.length >= 30 && article.title.length <= 80) score += 15;
  else if (article.title.length > 0) score += 5;
  if (!article.title.includes('?')) score += 5; // Prefer declarative headlines
  if (article.title.length <= 65) score += 5; // SEO ideal length

  // Content quality (0-40 pts)
  if (wordCount >= 400) score += 20;
  else if (wordCount >= 250) score += 10;
  const hasH2 = article.content.includes('<h2');
  if (hasH2) score += 10;
  const paragraphCount = (article.content.match(/<p/g) ?? []).length;
  if (paragraphCount >= 4) score += 10;

  // Meta (0-20 pts)
  if (article.metaDescription && article.metaDescription.length >= 100 && article.metaDescription.length <= 155) score += 10;
  if (article.summary && article.summary.length > 50) score += 10;

  // Sources (0-15 pts)
  if (article.sourceUrls && article.sourceUrls.length >= 2) score += 10;
  else if (article.sourceUrls && article.sourceUrls.length >= 1) score += 5;
  if (article.sources && article.sources.length >= 1) score += 5;

  return Math.min(100, score);
}

export async function runEditor(article: GeneratedArticle): Promise<EditedArticle | null> {
  console.log(`[editor] Reviewing article: "${article.title}"`);
  
  const wordCount = countWords(article.content);
  const readTimeMinutes = calculateReadTime(wordCount);
  
  // Dedup check for the generated title
  const dedup = new DedupChecker();
  await dedup.loadRecent(50);
  
  if (dedup.isTitleDuplicate(article.title, 0.7)) {
    console.warn(`[editor] ❌ Rejected: Title is too similar to recent articles`);
    return {
      ...article,
      wordCount,
      readTimeMinutes,
      qualityScore: 0,
      approved: false,
      rejectionReason: 'Title too similar to recent articles (duplicate detected)',
    };
  }

  // Quality checks
  const checks: Array<{ check: boolean; reason: string }> = [
    { check: article.title.length >= 20, reason: 'Title too short' },
    { check: article.content.length >= 500, reason: 'Content too short (< 500 chars)' },
    { check: wordCount >= 200, reason: `Word count too low (${wordCount} words)` },
    { check: !!article.slug, reason: 'Missing slug' },
    { check: !!article.metaDescription, reason: 'Missing meta description' },
    { check: (article.sourceUrls?.length ?? 0) >= 1, reason: 'No source URLs' },
  ];

  const failed = checks.filter(c => !c.check);
  if (failed.length > 0) {
    console.warn(`[editor] ❌ Failed checks: ${failed.map(f => f.reason).join(', ')}`);
    return {
      ...article,
      wordCount,
      readTimeMinutes,
      qualityScore: scoreArticle(article, wordCount),
      approved: false,
      rejectionReason: failed.map(f => f.reason).join('; '),
    };
  }

  const qualityScore = scoreArticle(article, wordCount);
  const approved = qualityScore >= 50;

  if (!approved) {
    console.warn(`[editor] ❌ Quality score too low: ${qualityScore}/100`);
    return {
      ...article,
      wordCount,
      readTimeMinutes,
      qualityScore,
      approved: false,
      rejectionReason: `Quality score below threshold (${qualityScore}/100)`,
    };
  }

  // Enrich: ensure state is set properly
  const enriched = {
    ...article,
    state: article.state || guessState(article.category),
  };

  console.log(`[editor] ✅ Approved: score=${qualityScore}/100, words=${wordCount}`);
  
  return {
    ...enriched,
    wordCount,
    readTimeMinutes,
    qualityScore,
    approved: true,
  };
}

function guessState(category: string): string {
  const localCategories = ['Local', 'Cultura'];
  const nationalCategories = ['Política', 'Economía', 'Deportes'];
  const globalCategories = ['Tecnología', 'Internacional', 'Entretenimiento'];
  
  if (localCategories.includes(category)) return 'Yucatán';
  if (nationalCategories.includes(category)) return 'Nacional';
  if (globalCategories.includes(category)) return 'Internacional';
  return 'Yucatán';
}
