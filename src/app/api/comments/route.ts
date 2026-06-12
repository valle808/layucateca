import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

// Automated AI Moderation for Comments
async function moderateComment(content: string): Promise<boolean> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return true; // Default to clean if API key not present

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
          content: "You are an automated comment moderator. Analyze the text. Respond with ONLY 'FLAGGED' if it contains hate speech, profanity, slurs, or extreme toxicity. Otherwise, respond with 'CLEAN'.",
        },
        {
          role: "user",
          content: `Comment: "${content}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    const result = ((response.choices[0].message as any).content || "").trim().toUpperCase();
    return !result.includes("FLAGGED");
  } catch (err) {
    console.error("[COMMENT MODERATION ERROR]", err);
    return true;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const comments = await (prisma as any).comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { content, authorName, authorId, postId } = await req.json();

    if (!content || !postId) {
      return NextResponse.json({ error: "Content and postId are required" }, { status: 400 });
    }

    // Run AI Moderation
    const isClean = await moderateComment(content);
    if (!isClean) {
      return NextResponse.json({ error: "El comentario ha sido rechazado por el filtro de moderación automática de IA." }, { status: 400 });
    }

    const comment = await (prisma as any).comment.create({
      data: {
        content,
        authorName: authorName || "Anónimo",
        authorId: authorId || null,
        postId,
      },
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("[COMMENT POST ERROR]", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
