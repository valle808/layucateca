/**
 * POST /api/cron/news
 * Vercel Cron handler — runs daily via vercel.json (Hobby plan)
 * Generates multiple articles per invocation to keep the site fresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { runNewsCrew } from '@/lib/news-engine/crews/news-crew';
import type { NewsCategory } from '@/lib/rss-sources';

// Protect the cron endpoint
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    return process.env.NODE_ENV === 'development';
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

const BATCH_SIZE = 10; // Generate up to 10 articles per daily run

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const forceCategory = searchParams.get('category') as NewsCategory | null;
    const batchCount = Math.min(
      parseInt(searchParams.get('count') ?? String(BATCH_SIZE), 10),
      BATCH_SIZE
    );

    const results = [];

    for (let i = 0; i < batchCount; i++) {
      try {
        const result = await runNewsCrew(forceCategory ?? undefined);
        results.push({
          index: i + 1,
          success: result.success,
          category: result.category,
          durationMs: result.durationMs,
          researchCount: result.researchCount,
          article: result.publishResult ? {
            slug: result.publishResult.slug,
            url: result.publishResult.url,
            facebookPostId: result.publishResult.facebookPostId,
          } : null,
          skipped: result.skipped ?? false,
          skipReason: result.skipReason,
          error: result.error,
        });
      } catch (innerErr: unknown) {
        const e = innerErr as Error;
        console.error(`[cron/news] Error on article ${i + 1}:`, e.message);
        results.push({ index: i + 1, success: false, error: e.message });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      batch: true,
      total: batchCount,
      succeeded: successCount,
      failed: batchCount - successCount,
      results,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[cron/news] Unhandled error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron (Vercel sends GET requests to cron routes)
export async function GET(req: NextRequest) {
  return POST(req);
}
