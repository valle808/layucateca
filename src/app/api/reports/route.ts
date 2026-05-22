import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { logTelemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

// Automated Content Tagging & Moderation Orchestrator
async function runAiOrchestration(title: string, description: string) {
  const apiKey = process.env.FIREWORKS_API_KEY;
  
  await logTelemetry({
    type: "AGENT_ACTION",
    event: "ai_moderation_started",
    details: { title, descLength: description.length },
    agentId: "moderator-agent",
    path: "/api/reports",
    status: "INFO",
  });

  if (!apiKey) {
    await logTelemetry({
      type: "AGENT_ACTION",
      event: "ai_moderation_skipped",
      details: { reason: "Missing FIREWORKS_API_KEY, fallback to default CLEAN status" },
      agentId: "moderator-agent",
      path: "/api/reports",
      status: "SUCCESS",
    });
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
    
    await logTelemetry({
      type: "AGENT_ACTION",
      event: "ai_moderation_completed",
      details: { moderation: data.moderation, tags: data.tags },
      agentId: "moderator-agent",
      path: "/api/reports",
      status: "SUCCESS",
    });

    return {
      moderation: data.moderation === "FLAGGED" ? "FLAGGED" : "CLEAN",
      tags: Array.isArray(data.tags) ? data.tags : ["ReporteCiudadano"],
    };
  } catch (err: any) {
    console.error("[AI ORCHESTRATOR ERROR]", err);
    await logTelemetry({
      type: "ERROR",
      event: "ai_moderation_failed",
      details: { error: err.message },
      agentId: "moderator-agent",
      path: "/api/reports",
      status: "FAILED",
    });
    return { moderation: "CLEAN", tags: ["ReporteCiudadano"] };
  }
}

// Auto-share report to Facebook Page
async function autoShareToFacebook(report: any) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  await logTelemetry({
    type: "AGENT_ACTION",
    event: "facebook_sharing_started",
    details: { reportId: report.id },
    agentId: "social-media-manager",
    path: "/api/reports",
    status: "INFO",
  });

  if (!pageId || !token) {
    await logTelemetry({
      type: "AGENT_ACTION",
      event: "facebook_sharing_skipped",
      details: { reason: "Missing credentials, skipping auto-post." },
      agentId: "social-media-manager",
      path: "/api/reports",
      status: "SUCCESS",
    });
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
      await logTelemetry({
        type: "AGENT_ACTION",
        event: "facebook_sharing_completed",
        details: { facebookPostId: fbData.id || fbData.post_id },
        agentId: "social-media-manager",
        path: "/api/reports",
        status: "SUCCESS",
      });
      return fbData.id || fbData.post_id;
    } else {
      await logTelemetry({
        type: "AGENT_ACTION",
        event: "facebook_sharing_failed",
        details: { response: fbData },
        agentId: "social-media-manager",
        path: "/api/reports",
        status: "FAILED",
      });
    }
  } catch (error: any) {
    console.error("[FB SHARE ERROR]", error);
    await logTelemetry({
      type: "ERROR",
      event: "facebook_sharing_error",
      details: { error: error.message },
      agentId: "social-media-manager",
      path: "/api/reports",
      status: "FAILED",
    });
  }
  return null;
}

export async function GET() {
  try {
    const reports = await (prisma as any).report.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    await logTelemetry({
      type: "ERROR",
      event: "fetch_reports_error",
      details: { error: error.message },
      path: "/api/reports",
      status: "FAILED",
    });
    return NextResponse.json({ error: "Error fetching reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, mediaUrls, lat, lng, state, city, town, isAnonymous, authorId } = await req.json();

    await logTelemetry({
      type: "USER_ACTION",
      event: "citizen_report_submission_attempt",
      details: { title, city, isAnonymous },
      userId: authorId || undefined,
      path: "/api/reports",
      status: "INFO",
    });

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

    await logTelemetry({
      type: "DATA_MUTATION",
      event: "citizen_report_created",
      details: { id: report.id, status: report.status },
      userId: authorId || undefined,
      path: "/api/reports",
      status: "SUCCESS",
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
    await logTelemetry({
      type: "ERROR",
      event: "citizen_report_submission_error",
      details: { error: error.message },
      path: "/api/reports",
      status: "FAILED",
    });
    return NextResponse.json({ error: "Error procesando reporte" }, { status: 500 });
  }
}

