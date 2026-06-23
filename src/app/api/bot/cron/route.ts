/**
 * /api/bot/cron — Vercel Cron Job endpoint
 * Runs every minute via vercel.json schedule.
 * Calls the main bot/pull pipeline which generates one article per category.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  // Verify this is a legitimate Vercel cron call (security header or query param)
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const querySecret = url.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && querySecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://layucateca.com";

  try {
    const res = await fetch(`${siteUrl}/api/bot/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-trigger": "true",
      },
    });

    const data = await res.json();
    console.log(`[CRON] Pipeline result: ${data.articles_published} articles, ${data.facebook_posts} FB posts`);

    return NextResponse.json({
      triggered: true,
      timestamp: new Date().toISOString(),
      ...data,
    });
  } catch (err: any) {
    console.error("[CRON] Failed to trigger pipeline:", err.message);
    return NextResponse.json({ triggered: false, error: err.message }, { status: 500 });
  }
}
