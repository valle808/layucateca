/**
 * POST /api/cron/news
 * Vercel Cron handler — runs every minute via vercel.json
 * Triggers the full 4-agent news generation pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { runNewsCrew } from '@/lib/news-engine/crews/news-crew';
import type { NewsCategory } from '@/lib/rss-sources';

// Protect the cron endpoint
function isAuthorized(req: NextRequest): boolean {
  // Vercel cron calls include an Authorization header
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    // If no secret configured, only allow from Vercel's own IPs
    // (In dev, allow all)
    return process.env.NODE_ENV === 'development';
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Optional: force a specific category via query param
    const { searchParams } = new URL(req.url);
    const forceCategory = searchParams.get('category') as NewsCategory | null;

    const result = await runNewsCrew(forceCategory ?? undefined);

    return NextResponse.json({
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
