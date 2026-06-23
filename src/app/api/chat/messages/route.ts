import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Rapid AI Content Moderation for Chat Messages
async function moderateChatMessage(content: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return content;

  // Quick heuristic to avoid calling LLM for simple/short messages
  if (content.length < 5) return content;

  const openai = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
    if (result.includes("FLAGGED")) {
      return "🚫 [Mensaje bloqueado por moderación de IA: Contenido ofensivo o spam]";
    }
  } catch (err) {
    console.error("[CHAT MODERATION ERROR]", err);
  }
  return content;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomSlug = searchParams.get("roomSlug");
    const roomPassword = searchParams.get("roomPassword");

    if (!roomSlug) {
      return NextResponse.json({ error: "Room slug is required" }, { status: 400 });
    }

    const room = await (prisma as any).chatRoom.findUnique({
      where: { slug: roomSlug },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.isPrivate) {
      if (!roomPassword) {
        return NextResponse.json({ error: "Se requiere contraseña para esta sala." }, { status: 401 });
      }
      const isValid = await bcrypt.compare(roomPassword, room.password || "");
      if (!isValid) {
        return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
      }
    }

    const messages = await (prisma as any).chatMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("[CHAT MESSAGES GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content, authorName, authorId, roomSlug, roomPassword } = await req.json();

    if (!content || !roomSlug) {
      return NextResponse.json({ error: "Content and roomSlug are required" }, { status: 400 });
    }

    const room = await (prisma as any).chatRoom.findUnique({
      where: { slug: roomSlug },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.isPrivate) {
      if (!roomPassword) {
        return NextResponse.json({ error: "Se requiere contraseña para publicar en esta sala." }, { status: 401 });
      }
      const isValid = await bcrypt.compare(roomPassword, room.password || "");
      if (!isValid) {
        return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
      }
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
        }
      } catch (err) {
        console.error("[REPUTATION UPDATE ERROR]", err);
      }
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error("[CHAT MESSAGES POST ERROR]", error);
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
