/**
 * Writer Agent — La Yucateca News Engine
 * Uses Gemini Flash to generate a full, SEO-optimized news article
 * from research candidates. Adapted from CrewAI news writing pattern.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { EDITORIAL_PROFILE } from '../editorial-profile';
import type { ResearchResult } from './researcher';
import type { NewsCategory } from '@/lib/rss-sources';

export interface GeneratedArticle {
  title: string;
  slug: string;
  content: string; // Full HTML article body
  summary: string; // 1-paragraph plain text summary
  metaDescription: string; // ≤155 chars
  category: NewsCategory;
  language: 'es' | 'en';
  sourceUrls: string[];
  sources: string[]; // source names
  tags: string[];
  state: string; // 'Yucatán' for local, 'Nacional' for national, etc.
  imagePrompt: string; // Prompt for image generation
}

// 3-tier Gemini failover (adapted from llm_editor.py)
const FAILOVER_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

function buildPrompt(research: ResearchResult): string {
  const { category, language, candidates } = research;
  const profile = EDITORIAL_PROFILE.categories[category as keyof typeof EDITORIAL_PROFILE.categories];
  const candidatesText = candidates.slice(0, 5).map((c, i) => 
    `${i + 1}. **${c.title}** (${c.source})\n   URL: ${c.url}\n   ${c.summary ?? 'No summary'}`
  ).join('\n\n');

  const langInstruction = language === 'en' 
    ? 'Write the entire article in English.'
    : 'Escribe todo el artículo en español.';

  return `You are a professional journalist for La Yucateca, a bilingual digital news channel covering Mexico and Latin America.

EDITORIAL VOICE: ${EDITORIAL_PROFILE.voice}
CATEGORY FOCUS: ${profile?.focus ?? category}
LANGUAGE: ${langInstruction}

Below are the top news stories found from RSS feeds. Select the most newsworthy one or synthesize the most important insights from multiple stories, and write a complete news article.

CANDIDATE STORIES:
${candidatesText}

Write a complete, professional news article with this EXACT JSON structure:

{
  "title": "Compelling headline (50-60 chars ideal, SEO-optimized)",
  "slug": "url-friendly-slug-in-target-language",
  "metaDescription": "Compelling meta description under 155 characters",
  "summary": "1-2 sentence summary in plain text (no HTML)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "state": "Yucatán OR Nacional OR Internacional",
  "imagePrompt": "Detailed prompt for generating a news thumbnail image (describe scene, colors, mood)",
  "sourceUrls": ["url1", "url2"],
  "sources": ["Source Name 1", "Source Name 2"],
  "content": "<full HTML article with <h2> subheadings, <p> paragraphs, and <strong> for emphasis. Minimum 400 words. Include attribution at the end.>"
}

REQUIREMENTS:
- The content must be factual and based ONLY on the candidate stories above
- Include proper attribution: mention source names inline (e.g., "según Reuters" or "according to Reuters")
- Add a <p class='sources'> at the end listing all sources with their URLs as <a> tags
- SEO: First paragraph must naturally include the main keyword
- No clickbait, no speculation beyond what sources report
- Return ONLY the JSON object, no markdown fences`;
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2000,
    },
  });

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

async function callFireworks(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "accounts/fireworks/models/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 3000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fireworks API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Fireworks response was empty or missing message content');
  }

  return content;
}

function parseArticleResponse(raw: string): GeneratedArticle | null {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
  }
  // Remove any leading/trailing text before { or after }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned) as GeneratedArticle;
  } catch (err) {
    console.error('[writer] JSON parse failed:', err);
    console.error('[writer] Raw response:', cleaned.slice(0, 500));
    return null;
  }
}

function validateAndCleanArticle(article: GeneratedArticle, research: ResearchResult): GeneratedArticle | null {
  // Validate required fields
  if (!article.title || !article.content || !article.slug) {
    console.warn(`[writer] Article missing required fields`);
    return null;
  }
  
  // Add category and language
  article.category = research.category;
  article.language = research.language;
  
  // Clean slug: only lowercase alphanumeric and hyphens
  article.slug = article.slug
    .toLowerCase()
    .replace(/[^a-z0-9\u00e0-\u00ff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  
  // Add timestamp to slug to ensure uniqueness
  const ts = Date.now().toString(36);
  article.slug = `${article.slug}-${ts}`;
  
  console.log(`[writer] ✅ Article generated: "${article.title}" (${article.content.length} chars)`);
  return article;
}

export async function runWriter(research: ResearchResult): Promise<GeneratedArticle | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fireworksApiKey = process.env.FIREWORKS_API_KEY;

  if (!apiKey && !fireworksApiKey) {
    throw new Error('[writer] Neither GEMINI_API_KEY nor FIREWORKS_API_KEY is set');
  }

  if (!research.topStory && research.candidates.length === 0) {
    console.warn('[writer] No candidates to write about');
    return null;
  }

  const prompt = buildPrompt(research);
  
  // Try Gemini first if API key is provided
  if (apiKey) {
    for (const model of FAILOVER_MODELS) {
      try {
        console.log(`[writer] Attempting with Gemini model: ${model}`);
        const raw = await callGemini(apiKey, model, prompt);
        const article = parseArticleResponse(raw);
        
        if (article) {
          return validateAndCleanArticle(article, research);
        }
      } catch (err) {
        console.error(`[writer] Gemini model ${model} failed:`, err);
      }
    }
  }

  // Fallback to Fireworks if Gemini failed or is not configured
  if (fireworksApiKey) {
    try {
      console.log(`[writer] Attempting with Fireworks model: accounts/fireworks/models/gpt-oss-120b`);
      const raw = await callFireworks(fireworksApiKey, prompt);
      const article = parseArticleResponse(raw);
      
      if (article) {
        return validateAndCleanArticle(article, research);
      }
    } catch (err) {
      console.error(`[writer] Fireworks model failed:`, err);
    }
  }

  console.error('[writer] All models and providers failed');
  return null;
}
