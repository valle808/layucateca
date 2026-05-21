/**
 * POST /api/news/publish-facebook
 * Publish a specific article to the La Yucateca Facebook Page
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EDITORIAL_PROFILE } from '@/lib/news-engine/editorial-profile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { articleId?: string; articleSlug?: string };
    const { articleId, articleSlug } = body;

    if (!articleId && !articleSlug) {
      return NextResponse.json(
        { error: 'articleId or articleSlug is required' },
        { status: 400 }
      );
    }

    // Fetch article from DB
    const post = await prisma.post.findFirst({
      where: articleId ? { id: articleId } : { slug: articleSlug },
    });

    if (!post) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (post.facebookPostId) {
      return NextResponse.json({
        success: true,
        message: 'Already posted to Facebook',
        facebookPostId: post.facebookPostId,
      });
    }

    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    if (!accessToken || !pageId) {
      return NextResponse.json(
        { error: 'Facebook credentials not configured. Set FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID.' },
        { status: 503 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://layucateca.com';
    const articleUrl = `${siteUrl}/news/${post.slug}`;
    
    // Extract plain text summary from HTML content
    const plainSummary = post.content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);

    const message = EDITORIAL_PROFILE.facebookPostTemplate(
      post.title,
      plainSummary,
      articleUrl,
      post.category
    );

    // Post to Facebook Page feed
    const fbResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          link: articleUrl,
          access_token: accessToken,
        }),
      }
    );

    if (!fbResponse.ok) {
      const errorData = await fbResponse.json().catch(() => ({})) as { error?: { message?: string; code?: number } };
      return NextResponse.json(
        {
          success: false,
          error: `Facebook API error: ${errorData.error?.message ?? fbResponse.statusText}`,
          code: errorData.error?.code,
        },
        { status: 502 }
      );
    }

    const fbData = await fbResponse.json() as { id?: string };
    const facebookPostId = fbData.id;

    // Update DB with Facebook post ID
    await prisma.post.update({
      where: { id: post.id },
      data: { facebookPostId },
    });

    return NextResponse.json({
      success: true,
      facebookPostId,
      articleUrl,
      message: `Posted to Facebook: ${facebookPostId}`,
    });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// GET: check Facebook configuration
export async function GET() {
  const hasToken = !!process.env.FACEBOOK_ACCESS_TOKEN;
  const hasPageId = !!process.env.FACEBOOK_PAGE_ID;
  
  return NextResponse.json({
    configured: hasToken && hasPageId,
    hasToken,
    hasPageId,
    pageId: process.env.FACEBOOK_PAGE_ID ? `...${process.env.FACEBOOK_PAGE_ID.slice(-4)}` : null,
  });
}
