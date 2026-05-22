import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { logTelemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

// Rapid AI Content Moderation for Chat Messages
async function moderateChatMessage(content: string): Promise<string> {
  const apiKey = process.env.FIREWORKS_API_KEY;
  
  await logTelemetry({
    type: "AGENT_ACTION",
    event: "chat_moderation_started",
    details: { contentLength: content.length },
    agentId: "chat-moderator-agent",
    path: "/api/chat/messages",
    status: "INFO",
  });

  if (!apiKey) {
    await logTelemetry({
      type: "AGENT_ACTION",
      event: "chat_moderation_skipped",
      details: { reason: "Missing FIREWORKS_API_KEY, defaulting message to CLEAN" },
      agentId: "chat-moderator-agent",
      path: "/api/chat/messages",
      status: "SUCCESS",
    });
    return content;
  }

  // Quick heuristic to avoid calling LLM for simple/short messages
  if (content.length < 5) return content;

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
          content: "You are a real-time chat moderation agent. Analyze the user's message. If it contains extreme hate speech, slurs, explicit threat, or severe toxicity, respond with ONLY 'FLAGGED'. If it is acceptable, respond with ONLY 'CLEAN'. Do not explain.",
        },
        {
          role: "user",
          content: `Message: "${content}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    const result = ((response.choices[0].message as any).content || "").trim().toUpperCase();
    
    await logTelemetry({
      type: "AGENT_ACTION",
      event: "chat_moderation_completed",
      details: { outcome: result },
      agentId: "chat-moderator-agent",
      path: "/api/chat/messages",
      status: "SUCCESS",
    });

    if (result.includes("FLAGGED")) {
      return "🚫 [Mensaje bloqueado por moderación de IA: Contenido ofensivo o spam]";
    }
  } catch (err: any) {
    console.error("[CHAT MODERATION ERROR]", err);
    await logTelemetry({
      type: "ERROR",
      event: "chat_moderation_failed",
      details: { error: err.message },
      agentId: "chat-moderator-agent",
      path: "/api/chat/messages",
      status: "FAILED",
    });
  }
  return content;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomSlug = searchParams.get("roomSlug");

    if (!roomSlug) {
      return NextResponse.json({ error: "Room slug is required" }, { status: 400 });
    }

    const room = await (prisma as any).chatRoom.findUnique({
      where: { slug: roomSlug },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const messages = await (prisma as any).chatMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("[CHAT MESSAGES GET ERROR]", error);
    await logTelemetry({
      type: "ERROR",
      event: "chat_messages_fetch_error",
      details: { error: error.message },
      path: "/api/chat/messages",
      status: "FAILED",
    });
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content, authorName, authorId, roomSlug } = await req.json();

    await logTelemetry({
      type: "USER_ACTION",
      event: "chat_message_submission_attempt",
      details: { authorName, roomSlug, contentLength: content?.length },
      userId: authorId || undefined,
      path: "/api/chat/messages",
      status: "INFO",
    });

    if (!content || !roomSlug) {
      return NextResponse.json({ error: "Content and roomSlug are required" }, { status: 400 });
    }

    const room = await (prisma as any).chatRoom.findUnique({
      where: { slug: roomSlug },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Run AI content moderation
    const moderatedContent = await moderateChatMessage(content);

    const message = await (prisma as any).chatMessage.create({
      data: {
        content: moderatedContent,
        authorName: authorName || "Invitado",
        authorId: authorId || null,
        roomId: room.id,
      },
    });

    await logTelemetry({
      type: "DATA_MUTATION",
      event: "chat_message_created",
      details: { id: message.id, roomId: room.id, isModerated: moderatedContent !== content },
      userId: authorId || undefined,
      path: "/api/chat/messages",
      status: "SUCCESS",
    });

    // If authorId is present and content is clean, give a tiny boost (+1) to their reputation score!
    if (authorId && !moderatedContent.includes("bloqueado")) {
      try {
        const rep = await (prisma as any).reputation.findUnique({
          where: { userId: authorId },
        });
        if (rep) {
          const newScore = rep.score + 1;
          // Dynamically award badges based on score
          const currentBadges = JSON.parse(rep.badges || "[]");
          if (newScore >= 120 && !currentBadges.includes("Colaborador")) {
            currentBadges.push("Colaborador");
          }
          await (prisma as any).reputation.update({
            where: { userId: authorId },
            data: {
              score: newScore,
              badges: JSON.stringify(currentBadges),
            },
          });

          await logTelemetry({
            type: "DATA_MUTATION",
            event: "reputation_updated",
            details: { newScore, badges: currentBadges },
            userId: authorId,
            path: "/api/chat/messages",
            status: "SUCCESS",
          });
        }
      } catch (err: any) {
        console.error("[REPUTATION UPDATE ERROR]", err);
        await logTelemetry({
          type: "ERROR",
          event: "reputation_update_error",
          details: { error: err.message },
          userId: authorId,
          path: "/api/chat/messages",
          status: "FAILED",
        });
      }
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error("[CHAT MESSAGES POST ERROR]", error);
    await logTelemetry({
      type: "ERROR",
      event: "chat_messages_post_error",
      details: { error: error.message },
      path: "/api/chat/messages",
      status: "FAILED",
    });
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
