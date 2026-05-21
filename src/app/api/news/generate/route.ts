/**
 * POST /api/news/generate
 * Manual trigger for news generation (admin use)
 * Also used by the Marketing HQ dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { runNewsCrew } from '@/lib/news-engine/crews/news-crew';
import { NEWS_CATEGORIES, type NewsCategory } from '@/lib/rss-sources';

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET ?? process.env.CRON_SECRET;
  
  if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({})) as { category?: string };
    const category = body.category as NewsCategory | undefined;
    
    // Validate category if provided
    if (category && !NEWS_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${NEWS_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await runNewsCrew(category);

    return NextResponse.json({
      success: result.success,
      category: result.category,
      durationMs: result.durationMs,
      researchCount: result.researchCount,
      article: result.publishResult ? {
        postId: result.publishResult.postId,
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
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return status + available categories
  return NextResponse.json({
    status: 'ok',
    categories: NEWS_CATEGORIES,
    message: 'POST to this endpoint to trigger news generation',
  });
}
