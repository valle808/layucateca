import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      // Mock summary fallback if API key is not configured
      return NextResponse.json({
        summary: `• Resumen automático: Esta noticia detalla los últimos acontecimientos relevantes en el estado de ${post.state}.\n• Se analizan las repercusiones comunitarias y las opiniones locales al respecto.`,
      });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://api.fireworks.ai/inference/v1",
    });

    const response = await openai.chat.completions.create({
      model: "accounts/fireworks/models/kimi-k2p6",
      messages: [
        {
          role: "system",
          content: "You are an expert news editor. Write a brief, high-impact TL;DR summary of the following news article. Respond with exactly two bullet points in Spanish. Keep it under 60 words total.",
        },
        {
          role: "user",
          content: post.content,
        },
      ],
      temperature: 0.3,
      max_tokens: 120,
    });

    const summary = ((response.choices[0].message as any).content || "").trim();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("[NEWS SUMMARIZER ERROR]", error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
