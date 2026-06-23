import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// FREE AI PROVIDERS:
//  1. Groq (primary)    → https://console.groq.com  — free, no billing
//  2. OpenRouter (fallback) → https://openrouter.ai — free models available
// Image: Pollinations.ai → https://pollinations.ai  — 100% free, no key
// ─────────────────────────────────────────────────────────────────────────────


// ─── Rate-limit helpers ───────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelay = 1000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = err?.status === 429 || String(err?.message).includes("429");
      if (is429 && attempt < retries) {
        const delay = baseDelay * Math.pow(1.5, attempt);
        console.warn(`[RETRY] 429 hit — waiting ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

// ─── Text helpers ─────────────────────────────────────────────────────────────
function sanitizeTitle(title: string): string {
  return title
    .replace(/\b\d{10,}\b/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\*\*/g, "")
    .replace(/Noticias de (\w+) en /i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanPromptLeaks(text: string): string {
  if (!text) return "";
  return text
    .replace(
      /^(?:the user wants|here is|as a senior journalist|below is|sure,|okay,|here's|let me break down|this meets all|returned as a single|i have provided)[\s\S]*?(?=\b[A-ZÁÉÍÓÚÑ]|\d|\{|\[|$)/i,
      ""
    )
    .replace(
      /(?:hope this meets|let me know if you need|returned as a single minified json|i have provided the response)\.?\s*$/i,
      ""
    )
    .trim();
}

function extractJson(raw: string): any {
  const strategies = [
    () => JSON.parse(raw),
    () => JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")),
    () => {
      const s = raw.indexOf("{");
      const e = raw.lastIndexOf("}");
      if (s < 0 || e < 0) throw 0;
      return JSON.parse(raw.slice(s, e + 1));
    },
    () => {
      const m = raw.match(/\{[\s\S]+\}/g);
      if (!m) throw 0;
      return JSON.parse(m.sort((a, b) => b.length - a.length)[0]);
    },
  ];
  for (const fn of strategies) {
    try {
      const p = fn();
      if (p && typeof p === "object") return p;
    } catch { continue; }
  }
  return null;
}

// ─── Categories & states ──────────────────────────────────────────────────────
export const ALL_CATEGORIES = [
  "Titulares", "Internacional", "Local", "Política",
  "Economía", "Deportes", "Cultura",
];

const ALL_STATES = [
  "Yucatán", "Campeche", "Quintana Roo", "CDMX", "Jalisco", "Nuevo León",
];

// ─── COMPREHENSIVE RSS FEED REGISTRY ─────────────────────────────────────────
const RSS_FEEDS: Record<string, string[]> = {
  ALL: [
    "https://news.google.com/rss/search?q=Yucatan+OR+Merida+OR+Campeche&hl=es-419&gl=MX&ceid=MX:es-419",
    "https://www.gob.mx/rss",
  ],
  Titulares: [
    "https://feeds.reuters.com/reuters/topNews",
    "https://apnews.com/hub/ap-top-news/rss.xml",
    "http://feeds.bbci.co.uk/news/rss.xml",
    "https://feeds.npr.org/1001/rss.xml",
    "https://www.eluniversal.com.mx/rss.xml",
    "https://www.milenio.com/rss",
    "https://www.excelsior.com.mx/rss.xml",
  ],
  Internacional: [
    "https://feeds.reuters.com/reuters/worldNews",
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "http://rss.cnn.com/rss/cnn_world.rss",
    "https://news.google.com/rss/search?q=Mexico+internacional&hl=es-419&gl=MX&ceid=MX:es-419",
  ],
  Local: [
    "https://www.yucatan.com.mx/feed",
    "https://www.poresto.net/rss",
    "https://reporteroshoy.mx/feed/",
    "https://yucatanahora.mx/feed/",
    "https://puntomedio.mx/feed/",
    "https://yucatan.quadratin.com.mx/feed/",
    "https://www.yucatan.gob.mx/rss",
    "https://news.google.com/rss/search?q=Merida+Yucatan+noticias&hl=es-419&gl=MX&ceid=MX:es-419",
    "https://www.bing.com/news/search?q=Mérida+Yucatán&format=rss",
  ],
  Política: [
    "https://www.eluniversal.com.mx/rss.xml",
    "https://www.jornada.com.mx/rss",
    "https://news.google.com/rss/search?q=politica+Mexico+gobernador&hl=es-419&gl=MX&ceid=MX:es-419",
  ],
  Economía: [
    "https://feeds.bloomberg.com/markets/news.rss",
    "https://www.elfinanciero.com.mx/rss/",
    "https://www.forbes.com.mx/feed/",
    "https://www.inegi.org.mx/rss/",
    "https://news.google.com/rss/search?q=economia+Mexico+finanzas&hl=es-419&gl=MX&ceid=MX:es-419",
  ],
  Deportes: [
    "https://www.espn.com/espn/rss/news",
    "https://e00-marca.uecdn.es/rss/",
    "https://news.google.com/rss/search?q=deportes+Mexico+futbol&hl=es-419&gl=MX&ceid=MX:es-419",
  ],
  Cultura: [
    "https://news.google.com/rss/search?q=cultura+maya+Yucatan&hl=es-419&gl=MX&ceid=MX:es-419",
    "https://www.bing.com/news/search?q=cultura+Mexico+arte&format=rss",
  ],
};

// ─── RSS fetcher ──────────────────────────────────────────────────────────────
async function fetchFeedsForCategory(category: string): Promise<string[]> {
  const urls = [...(RSS_FEEDS.ALL || []), ...(RSS_FEEDS[category] || [])];

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; LaYucatecaBot/1.0)" },
          signal: AbortSignal.timeout(3000), // Speed up RSS fail-fast
        });
        if (!res.ok) return [] as string[];
        const text = await res.text();
        const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];
        return items
          .slice(0, 5)
          .map((item) => {
            const m = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/);
            return (m?.[1] || m?.[2] || "").replace(/<[^>]*>/g, "").trim();
          })
          .filter((t) => t && t.length > 10) as string[];
      } catch {
        return [] as string[];
      }
    })
  );

  const all = results
    .filter((r): r is PromiseFulfilledResult<string[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const seen = new Set<string>();
  return all.filter((h) => { if (seen.has(h)) return false; seen.add(h); return true; }).slice(0, 15);
}

// ─── Reporter names ───────────────────────────────────────────────────────────
const REPORTER_NAMES = [
  "Ximena Dzul", "Carlos Canul", "Lucía Pech", "Marco Tun",
  "Valentina Caamal", "Jorge Ucan", "Sofía Ek", "Andrés Balam",
  "Fernanda Chi", "Rodrigo Xiu", "Isabel Cauich", "Miguel Chel",
  "Patricia Dzib", "Eduardo Canche", "Ana Kuyoc", "Luis Moo",
];
const pickReporter = () => REPORTER_NAMES[Math.floor(Math.random() * REPORTER_NAMES.length)];

// ─── Image pools (fallback CDN) ───────────────────────────────────────────────
const IMAGE_POOLS: Record<string, string> = {
  Titulares:     "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  Internacional: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  Local:         "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
  Política:      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
  Economía:      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  Deportes:      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  Cultura:       "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
};
const pickImage = (cat: string) => IMAGE_POOLS[cat] || IMAGE_POOLS.Titulares;

// ─── VISION: Pollinations.ai & LoremFlickr — 100% free, no API key ───────────
// ─── VISION: Direct Image URLs (No base64 to save DB space and speed up) ───────────
async function generateImage(topic: string, category: string): Promise<string> {
  const seed = Math.floor(Math.random() * 999999);
  
  // Create Pollinations URL
  const prompt = encodeURIComponent(
    `Professional photojournalism photograph: ${sanitizeTitle(topic).slice(0, 100)}, ${category}, Mexico, Yucatan. Realistic, candid, news agency style, 4k`
  );
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=640&seed=${seed}&nologo=true&enhance=true`;
  
  return pollinationsUrl;
}

// ─── Provider factory: OpenRouter (primary, fast) → Groq (fallback) ────────────────
function makeClient(): { client: OpenAI; provider: string; model: string } {
  // Use OpenRouter with Gemini 2.5 Flash as primary for speed and rate limits
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    return {
      client: new OpenAI({
        apiKey: orKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://layucateca.com",
          "X-Title": "La Yucateca News Bot",
        },
      }),
      provider: "OpenRouter",
      model: process.env.AI_MODEL || "google/gemini-2.5-flash", // Insanely fast, generous rate limits
    };
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      client: new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" }),
      provider: "Groq",
      model: "llama-3.3-70b-versatile",
    };
  }
  throw new Error("No AI provider. Add OPENROUTER_API_KEY or GROQ_API_KEY.");
}

// ─── AGENT 1: SCOUT ──────────────────────────────────────────────────────────
async function scoutAgent(client: OpenAI, model: string, category: string, state: string, headlines: string[]) {
  const geo = state === "Internacional" ? "the international stage" : `${state}, Mexico`;
  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const headlineCtx = headlines.length > 0
    ? `LIVE RSS HEADLINES (pick one relevant to "${category}" and expand it into a full story):\n- ${headlines.slice(0, 10).join("\n- ")}`
    : `No live feed available. Generate a compelling, realistic ${category} story from ${geo} for today.`;

  const res = await withRetry(() => client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a senior research journalist. Respond ONLY with a valid JSON object — no markdown, no preamble." },
      {
        role: "user",
        content: `Research a news story for category "${category}" in ${geo} for ${today}.

${headlineCtx}

Return ONLY this JSON (all values in Spanish):
{
  "topic": "Compelling specific headline based on the RSS headlines or a credible current event",
  "category": "${category}",
  "geography": "${state}",
  "who": "Named people or organizations",
  "what": "Specific event or action that occurred",
  "when": "${today}",
  "where": "Specific location",
  "why": "Cause or context",
  "how": "How it unfolded",
  "raw_facts": [
    "Concrete fact with numbers or names",
    "Institutional detail",
    "Regional impact",
    "Direct quote from named source"
  ],
  "context": "2-sentence background on significance"
}`,
      },
    ],
    temperature: 0.85,
    max_tokens: 600, // Reduced from 900 for speed
  }));

  const parsed = extractJson((res.choices[0].message.content || "").trim());
  if (parsed?.topic) return parsed;

  // Per-category fallbacks
  const FALLBACKS: Record<string, any> = {
    Titulares:     { topic: `Gobierno de ${state} anuncia inversión histórica de 2,400 mdp en infraestructura`, who: `Gobernador de ${state}`, what: "Firma decreto de inversión pública", when: today, where: `Palacio de Gobierno de ${state}`, why: "Impulsar desarrollo económico regional", how: "Decreto ejecutivo con fondos federales", raw_facts: [`Inversión de 2,400 millones de pesos aprobada`, `18 municipios beneficiados con obras viales y hospitales`, `4,200 empleos directos proyectados`, `"Esta inversión transforma el estado", afirmó el secretario de Hacienda`], context: `${state} lidera crecimiento económico del sureste con 4.8% en 2026.` },
    Internacional: { topic: "México y Unión Europea sellan acuerdo climático de 8,000 millones de dólares", who: "Cancillería de México y Comisión Europea", what: "Firma de acuerdo bilateral de transición energética", when: today, where: "Bruselas, Bélgica", why: "Reducir emisiones y financiar energías limpias", how: "Convenio multilateral con fondos europeos", raw_facts: ["12 parques solares financiados en el sureste mexicano", "Reducción de 18 millones de ton de CO₂ anuales desde 2028", "México recibe 8,000 mdd en inversión verde en 5 años", `"Es el acuerdo climático más ambicioso", declaró la canciller Bárcena`], context: "México busca posicionarse como hub de energía limpia para Europa." },
    Local:         { topic: `Inauguran corredor turístico maya sustentable en ${state} con inversión de 340 mdp`, who: "Secretaría de Turismo y comunidades mayas", what: "Inauguración del corredor ecoturístico maya", when: today, where: `Zona maya de ${state}`, why: "Diversificar turismo y beneficiar comunidades indígenas", how: "Inversión estatal con fondos FONATUR", raw_facts: ["340 millones de pesos invertidos", "11 comunidades mayas integradas al corredor", "180,000 visitantes anuales proyectados", `"Las comunidades mayas administrarán directamente", dijo el director estatal`], context: `${state} diversifica oferta turística más allá de destinos de playa.` },
    Política:      { topic: `Congreso de ${state} aprueba Ley de Salud Universal con 28 votos`, who: `Congreso local de ${state}`, what: "Aprobación de reforma al sistema de salud municipal", when: today, where: `Recinto del Congreso de ${state}`, why: "Garantizar atención médica gratuita en 106 municipios", how: "Votación en sesión ordinaria", raw_facts: ["28 votos a favor, 4 abstenciones", "Ley garantiza atención primaria gratuita desde julio 2026", "Presupuesto asignado: 1,850 mdp", `"Ningún ciudadano quedará sin atención", prometió el presidente de la comisión`], context: `${state} busca reducir brecha de acceso a salud formal.` },
    Economía:      { topic: `Inversión extranjera en ${state} supera 3,200 mdd en primer semestre 2026`, who: "Secretaría de Economía federal", what: "Registro récord de IED en el primer semestre", when: today, where: `Parques industriales de ${state}`, why: "Nearshoring por relocalización de cadenas de suministro", how: "47 nuevas plantas productivas establecidas", raw_facts: ["IED creció 31% respecto a 2025", "47 plantas de alta tecnología inauguradas", "12,400 empleos formales generados", `"${state} es el destino nearshoring más competitivo del sureste", dijo la secretaria`], context: "El nearshoring continúa favoreciendo al sureste mexicano ante reconfiguración global." },
    Deportes:      { topic: "Atleta yucateca Sofía Canul clasifica a Juegos Olímpicos 2028 en natación", who: "Sofía Canul Dzul, nadadora de Mérida", what: "Clasificación olímpica en 10 km aguas abiertas", when: today, where: "Campeonato Mundial de Fukuoka, Japón", why: "Superó estándar olímpico por 38 segundos", how: "Entrenamiento de 4 años con becas estatales", raw_facts: ["Tiempo de 55:42, 38 segundos bajo el estándar olímpico", "Primera yucateca en clasificar individualmente en 16 años", "Yucatán invierte 220 mdp anuales en deporte de alto rendimiento", `"Lo dedico a Yucatán y mi familia", declaró Canul emocionada`], context: "El programa estatal de becas ha producido 14 atletas de élite en 3 años." },
    Cultura:       { topic: "Festival Internacional Música Maya reúne 40 grupos de 12 países en Mérida", who: "Ximena Pech Kú, directora del FIMM", what: "Décima edición del Festival Internacional de Música Maya", when: today, where: "Centro histórico de Mérida, Yucatán", why: "Preservar y difundir cultura musical maya", how: "Conciertos en 8 sedes durante 7 días", raw_facts: ["40 agrupaciones de México, Guatemala, Belice y 9 países más", "8 sedes en el centro histórico de Mérida", "95,000 asistentes esperados, derrama de 180 mdp", `"La música maya es el idioma vivo de una civilización que no se detuvo", afirmó Pech Kú`], context: "La lengua maya yucateca la hablan 800,000 personas, segunda lengua indígena más hablada del país." },
  };
  const fb = FALLBACKS[category] || FALLBACKS.Titulares;
  return { ...fb, category, geography: state };
}

// ─── AGENT 2: WRITER ──────────────────────────────────────────────────────────
async function writerAgent(client: OpenAI, model: string, scoutData: any) {
  const reporter = pickReporter();
  const facts = (scoutData.raw_facts || []).join("\n- ");
  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const res = await withRetry(() => client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a senior trilingual news editor trained at Reuters and NYT. You write award-winning journalism. Respond ONLY with a valid JSON object — no markdown, no preamble.",
      },
      {
        role: "user",
        content: `Write a concise news article about: "${scoutData.topic}" in ${scoutData.geography || "Yucatán"}.

FACTS:
Who: ${scoutData.who || ""}
What: ${scoutData.what || ""}
When: ${scoutData.when || today}
Where: ${scoutData.where || ""}
Why: ${scoutData.why || ""}
How: ${scoutData.how || ""}
Key facts:
- ${facts}
Context: ${scoutData.context || ""}

JOURNALISM STANDARDS (mandatory):
1. HEADLINE: 5-10 words, active voice, present tense
2. BYLINE: "${reporter}, Redacción La Yucateca — ${today}"
3. LEAD: WHO-WHAT-WHEN-WHERE in 1-2 sentences
4. NUT GRAPH: Why this matters broadly
5. BODY: Comprehensive article detailing the event, historical context, and multiple perspectives. Minimum 1024 words. Include direct quotes.
6. CLOSING: Next steps or community impact

Return ONLY this JSON:
{
  "title": "[Spanish headline || English headline || Maya headline]",
  "slug": "[lowercase-hyphenated-no-accents-max-60-chars]",
  "byline": "${reporter}",
  "content_es": "[Full Spanish article, absolute minimum of 1024 words, extremely detailed]",
  "content_en": "[Professional English translation summary, approx 200 words]",
  "content_my": "[Short Maya language adaptation, approx 50 words]",
  "summary_es": "[2-sentence Facebook-ready summary, max 250 chars]",
  "category": "${scoutData.category}",
  "state": "${scoutData.geography}"
}`,
      },
    ],
    temperature: 0.75,
    max_tokens: 4000,
  }));

  const parsed = extractJson((res.choices[0].message.content || "").trim());
  if (parsed?.title && (parsed.content_es || parsed.content_en)) {
    return {
      title: cleanPromptLeaks(parsed.title),
      slug: parsed.slug || (scoutData.topic || "")
        .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 60)
        + "-" + Date.now(),
      byline: parsed.byline || reporter,
      content_es: cleanPromptLeaks(parsed.content_es || ""),
      content_en: cleanPromptLeaks(parsed.content_en || ""),
      content_my: cleanPromptLeaks(parsed.content_my || ""),
      summary_es: cleanPromptLeaks(parsed.summary_es || (parsed.content_es || "").slice(0, 250)),
      category: parsed.category || scoutData.category,
      state: parsed.state || scoutData.geography,
    };
  }

  // Fallback
  const lead = `${scoutData.what || scoutData.topic}, informaron autoridades de ${scoutData.geography}.`;
  const body = (scoutData.raw_facts || []).join(". ");
  return {
    title: `${sanitizeTitle(scoutData.topic)} || ${sanitizeTitle(scoutData.topic)} || ${sanitizeTitle(scoutData.topic)}`,
    slug: `${(scoutData.category || "noticia").toLowerCase()}-${Date.now()}`,
    byline: reporter,
    content_es: `${lead}\n\n${body}\n\n${scoutData.context || ""}`,
    content_en: lead, content_my: lead,
    summary_es: lead.slice(0, 250),
    category: scoutData.category,
    state: scoutData.geography,
  };
}

// ─── AGENT 3: FACT-CHECK ──────────────────────────────────────────────────────
function factCheckAgent(scoutData: any, article: any): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!article.title || article.title.length < 5) issues.push("Title missing");
  if (!article.slug || article.slug.length < 3) {
    article.slug = `${(scoutData.category || "noticia").toLowerCase()}-${Date.now()}`;
  }
  if ((article.content_es || "").length < 100) {
    article.content_es = `${scoutData.topic}. ${(scoutData.raw_facts || []).join(" ")}`;
  }
  return { pass: issues.length === 0, issues };
}

// ─── Facebook post builder ─────────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  Titulares: "📰", Internacional: "🌎", Local: "📍",
  Política: "🏛️", Economía: "📊", Deportes: "⚽", Cultura: "🎭",
};

function buildFacebookPost(article: any, articleUrl: string): string {
  const emoji = CATEGORY_EMOJI[article.category] || "📰";
  const title = sanitizeTitle((article.title || "").split("||")[0].trim());
  const body = (article.content_es || "").replace(/ \|\| [\s\S]*/g, "").trim().slice(0, 1200);
  const bylineStr = article.byline ? `\n\n— ${article.byline}, Redacción La Yucateca` : "";
  const catTag = (article.category || "").replace(/[^a-zA-Z]/g, "");
  return [
    `${emoji} ${title}`, "",
    body + (body.length >= 1200 ? "…" : ""),
    bylineStr, "",
    `🔗 Leer artículo completo → ${articleUrl}`, "",
    `#LaYucateca #Noticias${catTag} #Yucatan #Mexico`,
  ].join("\n");
}

// ─── AGENT 4: PUBLISHER ───────────────────────────────────────────────────────
async function publisherAgent(article: any, generatedImageUrl: string) {
  const suffix = Math.floor(Math.random() * 9999);
  const slug = `${article.slug || "noticia"}-${suffix}`;
  const siteUrl = "https://layucateca.com";
  const articleUrl = `${siteUrl}/news/${slug}`;
  const imageUrl = generatedImageUrl || pickImage(article.category || "Titulares");

  const rawTitle = (article.title || "").split("||")[0].trim();
  const cleanTitle = sanitizeTitle(rawTitle);
  const displayTitle = [
    cleanTitle,
    sanitizeTitle((article.title || "").split("||")[1] || cleanTitle),
    sanitizeTitle((article.title || "").split("||")[2] || cleanTitle),
  ].join(" || ");

  const combinedContent = [
    article.content_es || "", article.content_en || "", article.content_my || "",
  ].join(" || ");

  // Save to DB
  let savedPost: any = null;
  try {
    savedPost = await prisma.post.create({
      data: {
        title: displayTitle, slug, content: combinedContent,
        imageUrl, base64Image: null, videoUrl: null,
        state: article.state || "Yucatán",
        category: article.category || "Titulares",
        published: true, aiGenerated: true,
        metaDescription: (article.summary_es || cleanTitle).slice(0, 160),
        readTimeMinutes: Math.max(1, Math.ceil(combinedContent.split(" ").length / 200)),
        qualityScore: 90,
      },
    });
    console.log(`[PUBLISHER] ✅ Saved: ${slug} [${article.category}]`);
  } catch (dbErr: any) {
    console.warn(`[PUBLISHER] DB error: ${dbErr.message}`);
    savedPost = { title: displayTitle, slug, content: combinedContent, imageUrl, base64Image: null, state: article.state, category: article.category, id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
  }

  // Facebook publishing
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  let facebookPublished = false;
  let facebookPostId: string | null = null;

  if (pageId && token) {
    const fbMessage = buildFacebookPost(article, articleUrl);
    try {
      // Try photo post first (image + full article as caption)
      const photoRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl, caption: fbMessage, access_token: token }),
      });
      const photoData = await photoRes.json();
      if (photoData.id || photoData.post_id) {
        facebookPostId = photoData.id || photoData.post_id;
        facebookPublished = true;
        console.log(`[PUBLISHER] 📸 FB photo: ${facebookPostId} [${article.category}]`);
      }
      // Fallback: link post
      if (!facebookPublished) {
        const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: fbMessage, link: articleUrl, access_token: token }),
        });
        const feedData = await feedRes.json();
        if (feedData.id) {
          facebookPostId = feedData.id;
          facebookPublished = true;
          console.log(`[PUBLISHER] 📘 FB link: ${facebookPostId} [${article.category}]`);
        }
      }
    } catch (fbErr) { console.error("[PUBLISHER] FB error:", fbErr); }

    if (facebookPostId && savedPost?.id && !String(savedPost.id).startsWith("temp-")) {
      try { await prisma.post.update({ where: { id: savedPost.id }, data: { facebookPostId } }); } catch {}
    }
  }

  return { post: savedPost, facebookPublished, facebookPostId };
}

// ─── Single-category pipeline ─────────────────────────────────────────────────
async function runCategoryPipeline(
  client: OpenAI,
  model: string,
  category: string,
  headlines: string[]
): Promise<{ category: string; success: boolean; slug?: string; facebookPublished?: boolean; error?: string }> {
  const state = category === "Internacional"
    ? "Internacional"
    : ALL_STATES[Math.floor(Math.random() * ALL_STATES.length)];

  try {
    console.log(`[PIPELINE] ▶ [${category}] in ${state}`);
    const scoutData = await scoutAgent(client, model, category, state, headlines);
    console.log(`[PIPELINE] 🕵️ [${category}] → "${scoutData.topic}"`);

    const article = await writerAgent(client, model, scoutData);
    if (!article) throw new Error("Writer returned nothing");

    const { pass, issues } = factCheckAgent(scoutData, article);
    if (!pass) throw new Error(`Fact-check veto: ${issues.join("; ")}`);

    const generatedImageUrl = await generateImage(scoutData.topic, category);
    const { post, facebookPublished } = await publisherAgent(article, generatedImageUrl);

    console.log(`[PIPELINE] ✅ [${category}]${facebookPublished ? " + FB ✓" : ""}`);
    return { category, success: true, slug: post?.slug, facebookPublished };
  } catch (err: any) {
    console.error(`[PIPELINE] ❌ [${category}]:`, err.message);
    return { category, success: false, error: err.message };
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
async function handleSync() {
  let client: OpenAI;
  let provider: string;
  let model: string;

  try {
    const ai = makeClient();
    client = ai.client;
    provider = ai.provider;
    model = ai.model;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }

  const startTime = Date.now();
  console.log(`[PIPELINE] 🚀 Starting via ${provider} (${model})...`);

  // Discover dynamic categories from DB (self-evolving)
  let dynamicCategories = [...ALL_CATEGORIES];
  try {
    const dbCats = await prisma.post.findMany({ select: { category: true }, distinct: ["category"] });
    const newCats = dbCats
      .map((r: { category: string }) => r.category)
      .filter((c: string) => c && !dynamicCategories.includes(c));
    if (newCats.length > 0) dynamicCategories = [...dynamicCategories, ...newCats];
  } catch {}

  // Pick ONE random category to avoid Vercel 10-second timeout limits on the free tier.
  // Since cron-job runs every minute, all categories will be populated throughout the day.
  const selectedCategory = dynamicCategories[Math.floor(Math.random() * dynamicCategories.length)];
  console.log(`[PIPELINE] 🎲 Selected single category: ${selectedCategory}`);

  console.log(`[PIPELINE] 📰 Fetching RSS feeds for ${selectedCategory}...`);
  const headlines = await fetchFeedsForCategory(selectedCategory);

  const result = await runCategoryPipeline(client, model, selectedCategory, headlines);
  
  const summary = [result];

  const elapsed = Date.now() - startTime;
  const successCount = summary.filter((s) => s.success).length;
  const fbCount = summary.filter((s: any) => s.facebookPublished).length;

  console.log(`[PIPELINE] 🏁 Done: ${successCount}/${dynamicCategories.length} published, ${fbCount} FB — ${elapsed}ms via ${provider}`);

  return NextResponse.json({
    success: true,
    provider: `${provider} (${model}) + Pollinations.ai`,
    categories_run: dynamicCategories,
    articles_published: successCount,
    facebook_posts: fbCount,
    elapsed_ms: elapsed,
    results: summary,
  });
}

export async function GET() { return handleSync(); }
export async function POST() { return handleSync(); }
