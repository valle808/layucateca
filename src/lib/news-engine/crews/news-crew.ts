/**
 * News Crew — La Yucateca News Engine
 * Orchestrates the 4-agent pipeline:
 *   Researcher → Writer → Editor → Publisher
 * 
 * Adapted from the CrewAI pattern in rokbenko/crew-news
 * and the OpenClaw newsroom pipeline
 */

import { runResearcher } from '../agents/researcher';
import { runWriter } from '../agents/writer';
import { runEditor } from '../agents/editor';
import { runPublisher, type PublishResult } from '../agents/publisher';
import { NEWS_CATEGORIES, type NewsCategory } from '@/lib/rss-sources';

// In-memory category rotation queue (persisted via DB for production)
let currentCategoryIndex = 0;

export async function getNextCategory(): Promise<NewsCategory> {
  // Try to get from DB to persist across serverless invocations
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Find which category was used least recently
    const recentLogs = await prisma.newsGenerationLog.findMany({
      where: { success: true },
      orderBy: { createdAt: 'desc' },
      take: NEWS_CATEGORIES.length * 2,
      select: { category: true },
    });
    
    const recentCategories = recentLogs.map(l => l.category as NewsCategory);
    
    // Find the category that hasn't been used recently
    for (const cat of NEWS_CATEGORIES) {
      if (!recentCategories.slice(0, NEWS_CATEGORIES.length).includes(cat)) {
        return cat;
      }
    }
    
    // All categories used recently — pick the least recent
    const lastUsed = recentCategories[recentCategories.length - 1] as NewsCategory;
    const lastIndex = NEWS_CATEGORIES.indexOf(lastUsed);
    return NEWS_CATEGORIES[(lastIndex + 1) % NEWS_CATEGORIES.length];
    
  } catch {
    // Fallback: simple rotation
    const cat = NEWS_CATEGORIES[currentCategoryIndex % NEWS_CATEGORIES.length];
    currentCategoryIndex++;
    return cat;
  }
}

export interface CrewRunResult {
  success: boolean;
  category: NewsCategory;
  durationMs: number;
  researchCount: number;
  publishResult?: PublishResult;
  error?: string;
  skipped?: boolean;
  skipReason?: string;
}

export async function runNewsCrew(category?: NewsCategory): Promise<CrewRunResult> {
  const start = Date.now();
  const selectedCategory = category ?? await getNextCategory();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[news-crew] 🚀 Starting run for category: ${selectedCategory}`);
  console.log(`[news-crew] Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  try {
    // ── STEP 1: Researcher ──────────────────────────────────────────
    console.log('[news-crew] Step 1/4: Researcher agent...');
    const research = await runResearcher(selectedCategory);
    
    if (research.candidates.length === 0) {
      console.warn('[news-crew] ⚠️ No candidates found, skipping this run');
      return {
        success: false,
        category: selectedCategory,
        durationMs: Date.now() - start,
        researchCount: 0,
        skipped: true,
        skipReason: 'No new articles found in RSS feeds',
      };
    }
    
    console.log(`[news-crew] Found ${research.candidates.length} candidates`);

    // ── STEP 2: Writer ──────────────────────────────────────────────
    console.log('[news-crew] Step 2/4: Writer agent (Gemini)...');
    const article = await runWriter(research);
    
    if (!article) {
      return {
        success: false,
        category: selectedCategory,
        durationMs: Date.now() - start,
        researchCount: research.candidates.length,
        skipped: true,
        skipReason: 'Writer agent failed to generate article (all models failed)',
      };
    }

    // ── STEP 3: Editor ──────────────────────────────────────────────
    console.log('[news-crew] Step 3/4: Editor agent...');
    const edited = await runEditor(article);
    
    if (!edited || !edited.approved) {
      return {
        success: false,
        category: selectedCategory,
        durationMs: Date.now() - start,
        researchCount: research.candidates.length,
        skipped: true,
        skipReason: `Editor rejected article: ${edited?.rejectionReason ?? 'unknown'}`,
      };
    }

    // ── STEP 4: Publisher ───────────────────────────────────────────
    console.log('[news-crew] Step 4/4: Publisher agent...');
    const publishResult = await runPublisher(edited);

    const duration = Date.now() - start;
    console.log(`\n[news-crew] ${publishResult.success ? '✅ RUN COMPLETE' : '❌ PUBLISH FAILED'}`);
    console.log(`[news-crew] Duration: ${duration}ms`);
    console.log(`[news-crew] Article: ${publishResult.url ?? 'N/A'}`);
    console.log(`[news-crew] Facebook: ${publishResult.facebookPostId ?? 'Not posted'}`);
    console.log('='.repeat(60) + '\n');

    return {
      success: publishResult.success,
      category: selectedCategory,
      durationMs: duration,
      researchCount: research.candidates.length,
      publishResult,
      error: publishResult.error,
    };

  } catch (error: unknown) {
    const err = error as Error;
    const duration = Date.now() - start;
    console.error(`[news-crew] ❌ Unhandled error:`, err);
    
    return {
      success: false,
      category: selectedCategory,
      durationMs: duration,
      researchCount: 0,
      error: err.message,
    };
  }
}
