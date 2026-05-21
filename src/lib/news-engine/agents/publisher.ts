/**
 * Publisher Agent — La Yucateca News Engine
 * Saves approved articles to DB and posts to Facebook
 */

import { prisma } from '@/lib/prisma';
import { DedupChecker } from '../tools/dedup-db';
import { EDITORIAL_PROFILE } from '../editorial-profile';
import type { EditedArticle } from './editor';

export interface PublishResult {
  success: boolean;
  postId?: string;
  facebookPostId?: string;
  slug?: string;
  url?: string;
  error?: string;
}

// Generate a simple placeholder image URL (for production, use Gemini Imagen or DALL-E)
function getPlaceholderImage(category: string): string {
  const colors: Record<string, string> = {
    'Local': '1a1a2e/ff6b35',
    'Política': '1a1a2e/c0392b',
    'Economía': '1a1a2e/27ae60',
    'Deportes': '1a1a2e/2980b9',
    'Cultura': '1a1a2e/8e44ad',
    'Tecnología': '1a1a2e/00d4ff',
    'Internacional': '1a1a2e/e67e22',
    'Entretenimiento': '1a1a2e/e91e63',
  };
  const color = colors[category] ?? '1a1a2e/ff6b35';
  const encoded = encodeURIComponent(category);
  return `https://placehold.co/1200x630/${color}/png?text=${encoded}`;
}

export async function runPublisher(article: EditedArticle): Promise<PublishResult> {
  console.log(`[publisher] Publishing: "${article.title}"`);
  
  try {
    // 1. Save to database
    const post = await prisma.post.create({
      data: {
        title: article.title,
        slug: article.slug,
        content: article.content,
        category: article.category,
        state: article.state,
        published: true,
        imageUrl: getPlaceholderImage(article.category),
        aiGenerated: true,
        sourceUrls: JSON.stringify(article.sourceUrls ?? []),
        metaDescription: article.metaDescription,
        language: article.language,
        tags: JSON.stringify(article.tags ?? []),
        readTimeMinutes: article.readTimeMinutes,
        qualityScore: article.qualityScore,
      },
    });
    
    console.log(`[publisher] ✅ Saved to DB: ${post.id}`);

    // 2. Mark as seen in dedup
    const dedup = new DedupChecker();
    for (const url of article.sourceUrls ?? []) {
      dedup.markSeen(url, article.title);
    }

    // 3. Post to Facebook (non-blocking — don't fail if FB is down)
    let facebookPostId: string | undefined;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://layucateca.com';
    const articleUrl = `${siteUrl}/news/${post.slug}`;

    facebookPostId = await postToFacebook(
      article.title,
      article.summary,
      articleUrl,
      article.category,
      post.imageUrl ?? undefined
    ).catch(err => {
      console.error('[publisher] Facebook post failed (non-fatal):', err.message);
      return undefined;
    });

    // 4. Update FB post ID if we got one
    if (facebookPostId) {
      await prisma.post.update({
        where: { id: post.id },
        data: { facebookPostId },
      }).catch(() => {});
      console.log(`[publisher] 📘 Posted to Facebook: ${facebookPostId}`);
    }

    // 5. Log generation
    await prisma.newsGenerationLog.create({
      data: {
        category: article.category,
        postId: post.id,
        success: true,
        qualityScore: article.qualityScore,
        facebookPosted: !!facebookPostId,
      },
    }).catch(() => {}); // Non-fatal

    return {
      success: true,
      postId: post.id,
      facebookPostId,
      slug: post.slug,
      url: articleUrl,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[publisher] ❌ Failed to publish:', err.message);
    
    // Log failure
    await prisma.newsGenerationLog.create({
      data: {
        category: article.category,
        success: false,
        errorMessage: err.message,
        facebookPosted: false,
      },
    }).catch(() => {});

    return {
      success: false,
      error: err.message,
    };
  }
}

async function postToFacebook(
  title: string,
  summary: string,
  url: string,
  category: string,
  imageUrl?: string
): Promise<string | undefined> {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  
  if (!accessToken || !pageId) {
    console.warn('[publisher] Facebook credentials not configured');
    return undefined;
  }

  const message = EDITORIAL_PROFILE.facebookPostTemplate(title, summary, url, category);

  // Post to Facebook Page
  const body: Record<string, string> = {
    message,
    link: url,
    access_token: accessToken,
  };

  const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`Facebook API error: ${response.status} — ${(errorData.error?.message) ?? 'Unknown'}`);
  }

  const data = await response.json() as { id?: string };
  return data.id;
}
