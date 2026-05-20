import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

// Automated Content Tagging & Moderation Orchestrator
async function runAiOrchestration(title: string, description: string) {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    return { moderation: "CLEAN", tags: ["ReporteCiudadano"] };
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: "https://api.fireworks.ai/inference/v1",
  });

  try {
    const response = await openai.chat.completions.create({
      model: "accounts/fireworks/models/kimi-k2p6",
      messages: [
        {
          role: "system",
          content: "You are an AI content moderator and tagging agent. You MUST respond with ONLY a valid minified JSON object with keys 'moderation' (value either 'CLEAN' or 'FLAGGED') and 'tags' (array of strings, max 4 short tags). No markdown, no explanation, no fences.",
        },
        {
          role: "user",
          content: `Analyze the following citizen report:
Title: ${title}
Description: ${description}

Requirements:
1. Determine if the report contains extreme toxicity, spam, slurs, or fake gibberish. Set 'moderation' to FLAGGED if toxic/spam, or CLEAN if clean.
2. Generate up to 4 tags (e.g., VíaPública, Servicios, Alumbrado, Seguridad, Mérida, etc.) in Spanish.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 150,
    });

    const content = (response.choices[0].message as any).content || "";
    // Clean code fences if any
    const cleanContent = content.replace(/```json|```/gi, "").trim();
    const data = JSON.parse(cleanContent);
    return {
      moderation: data.moderation === "FLAGGED" ? "FLAGGED" : "CLEAN",
      tags: Array.isArray(data.tags) ? data.tags : ["ReporteCiudadano"],
    };
  } catch (err) {
    console.error("[AI ORCHESTRATOR ERROR]", err);
    return { moderation: "CLEAN", tags: ["ReporteCiudadano"] };
  }
}

// Auto-share report to Facebook Page
async function autoShareToFacebook(report: any) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    console.log("[FB SHARE] Missing credentials, skipping auto-post.");
    return null;
  }

  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "https://layucateca.com";

  // Formulate a beautiful social message
  const tagsText = JSON.parse(report.aiTags).map((t: string) => `#${t}`).join(" ");
  const message = `📢 REPORTE CIUDADANO: ${report.title}\n\n📍 Ubicación: ${report.city}, ${report.state}\n\n📝 Descripción: ${report.description}\n\n${tagsText}\n\n— Colaboración Ciudadana en La Yucateca`;

  try {
    const mediaUrls = JSON.parse(report.mediaUrls);
    const hasPhoto = mediaUrls.length > 0 && mediaUrls[0].startsWith("http");

    let fbRes;
    if (hasPhoto) {
      // Post as photo
      fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: mediaUrls[0],
          caption: message,
          access_token: token,
        }),
      });
    } else {
      // Post as normal feed post
      fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          access_token: token,
        }),
      });
    }

    const fbData = await fbRes.json();
    if (fbData.id || fbData.post_id) {
      console.log(`[FB SHARE] Successfully shared report! ID: ${fbData.id || fbData.post_id}`);
      return fbData.id || fbData.post_id;
    } else {
      console.warn("[FB SHARE] Facebook API returned warning:", fbData);
    }
  } catch (error) {
    console.error("[FB SHARE ERROR]", error);
  }
  return null;
}

export async function GET() {
  try {
    const reports = await (prisma as any).report.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, mediaUrls, lat, lng, state, city, town, isAnonymous, authorId } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Título y descripción son obligatorios." }, { status: 400 });
    }

    // Run AI content moderation & tagging
    const aiResult = await runAiOrchestration(title, description);

    // Save report to database
    const report = await (prisma as any).report.create({
      data: {
        title,
        description,
        mediaUrls: JSON.stringify(mediaUrls || []),
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        state: state || "Yucatán",
        city: city || "Mérida",
        town: town || "",
        isAnonymous: isAnonymous === undefined ? true : isAnonymous,
        status: aiResult.moderation === "FLAGGED" ? "REJECTED" : "APPROVED",
        aiTags: JSON.stringify(aiResult.tags),
        moderation: aiResult.moderation,
        authorId: authorId || null,
      },
    });

    // Auto-share if approved/clean
    if (report.status === "APPROVED") {
      const fbId = await autoShareToFacebook(report);
      if (fbId) {
        await (prisma as any).report.update({
          where: { id: report.id },
          data: { fbPostId: fbId },
        });
      }
    }

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    console.error("[CITIZEN REPORT API ERROR]", error);
    return NextResponse.json({ error: "Error procesando reporte" }, { status: 500 });
  }
}
