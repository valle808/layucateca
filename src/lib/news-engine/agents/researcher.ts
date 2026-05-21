/**
 * Researcher Agent — La Yucateca News Engine
 * Fetches fresh news from RSS feeds and (optionally) Exa/Tavily search
 * Returns ranked candidates for the Writer agent
 */

import { fetchRssForCategory, type RssArticle } from '../tools/rss-fetcher';
import { DedupChecker } from '../tools/dedup-db';
import { RSS_SOURCES, getSourcesForCategory, type NewsCategory } from '@/lib/rss-sources';
import { EDITORIAL_PROFILE } from '../editorial-profile';

export interface ResearchResult {
  candidates: RssArticle[];
  category: NewsCategory;
  language: 'es' | 'en';
  topStory: RssArticle | null;
  allStoriesCount: number;
}

export async function runResearcher(category: NewsCategory): Promise<ResearchResult> {
  console.log(`[researcher] Starting research for category: ${category}`);
  
  const categoryProfile = EDITORIAL_PROFILE.categories[category as keyof typeof EDITORIAL_PROFILE.categories];
  const language = categoryProfile?.lang ?? 'es';
  
  // 1. Get sources for this category
  const sources = getSourcesForCategory(category);
  console.log(`[researcher] Found ${sources.length} sources for "${category}"`);
  
  // 2. Fetch RSS feeds in parallel
  const rawArticles = await fetchRssForCategory(category, sources);
  console.log(`[researcher] Fetched ${rawArticles.length} raw articles`);
  
  // 3. Dedup check
  const dedup = new DedupChecker();
  await dedup.loadRecent(100);
  
  const filtered = rawArticles.filter(article => {
    if (dedup.isUrlSeen(article.url)) {
      console.log(`[researcher] Skipping (URL seen): ${article.title.slice(0, 50)}`);
      return false;
    }
    if (dedup.isTitleDuplicate(article.title)) {
      console.log(`[researcher] Skipping (title dup): ${article.title.slice(0, 50)}`);
      return false;
    }
    return true;
  });
  
  console.log(`[researcher] ${filtered.length} candidates after dedup`);
  
  // 4. Score candidates (freshness + tier)
  const now = Date.now();
  const scored = filtered.map(article => {
    const ageHours = (now - article.publishedAt.getTime()) / (1000 * 60 * 60);
    const freshnessScore = Math.max(0, 1 - ageHours / 48); // 0–1
    const tierScore = 1 - (article.tier - 1) / 4; // 1.0 for tier1, 0.25 for tier4
    const hasKeyword = articleMatchesCategory(article, category);
    const keywordBonus = hasKeyword ? 0.3 : 0;
    
    return {
      ...article,
      score: freshnessScore * 0.5 + tierScore * 0.3 + keywordBonus,
    };
  }).sort((a, b) => b.score - a.score);
  
  // 5. Take top candidates
  const candidates = scored.slice(0, 10);
  const topStory = candidates[0] ?? null;
  
  return {
    candidates,
    category,
    language,
    topStory,
    allStoriesCount: rawArticles.length,
  };
}

function articleMatchesCategory(article: RssArticle, category: NewsCategory): boolean {
  const keywords: Record<string, string[]> = {
    'Local': ['yucatán', 'mérida', 'yucatan', 'merida', 'campeche', 'quintana', 'sureste'],
    'Política': ['política', 'gobierno', 'congreso', 'elección', 'senado', 'presidenta', 'morena', 'partido'],
    'Economía': ['economía', 'pib', 'inflación', 'inversión', 'empresa', 'mercado', 'peso', 'banco'],
    'Deportes': ['fútbol', 'liga mx', 'deporte', 'champion', 'mundial', 'torneo', 'gol'],
    'Cultura': ['cultura', 'arte', 'maya', 'patrimonio', 'festival', 'museo', 'cine'],
    'Tecnología': ['ai', 'artificial intelligence', 'tech', 'startup', 'digital', 'software', 'innovación'],
    'Internacional': ['mundo', 'internacional', 'eeuu', 'estados unidos', 'europa', 'china', 'biden', 'trump'],
    'Entretenimiento': ['entretenimiento', 'netflix', 'serie', 'película', 'música', 'concierto', 'artista'],
  };
  
  const categoryKeywords = keywords[category] ?? [];
  const text = `${article.title} ${article.summary ?? ''}`.toLowerCase();
  return categoryKeywords.some(kw => text.includes(kw));
}
