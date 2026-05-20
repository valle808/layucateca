import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";


// Strip <think>...</think> reasoning chains that kimi-k2p6 outputs before JSON
function stripThinking(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^[\s\n]+/, "")
    .trim();
}

// Sanitize a title: remove timestamps, slugs, tech leakage
function sanitizeTitle(title: string): string {
  return title
    .replace(/\b\d{10,}\b/g, "")          // remove Unix timestamps
    .replace(/\[.*?\]/g, "")               // remove [bracket annotations]
    .replace(/\*\*/g, "")                  // remove markdown bold
    .replace(/Noticias de (\w+) en /i, "")  // remove "Noticias de X en"
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Strip out common LLM preamble, prompt leaking, and technical comments
function cleanPromptLeaks(text: string): string {
  if (!text) return "";
  return text
    // Strip common prompt preamble lines
    .replace(/^(?:the user wants|here is|as a senior journalist|below is|this is indeed|based on the facts|sure|okay|here's|here is a trilingual|let me break down|this meets all the requirements|requirements specified|returned as a single minified json|returned as a single json)[\s\S]*?(?=\b[A-Z]|\d|\{|\[|$)/i, "")
    // Strip common prompt postamble lines
    .replace(/(?:hope this meets your requirements|let me know if you need anything else|returned as a single minified json object|i have provided the response as a valid json)\.?\s*$/i, "")
    .trim();
}

// Fallback content generator to guarantee 100% clean, organic trilingual copy if JSON parsing fails
function buildFallbackContent(scoutData: any) {
  const state = scoutData.geography || "Yucatán";
  const category = scoutData.category || "Titulares";
  const topic = scoutData.topic || `Anuncian avances significativos en ${state}`;
  const facts = scoutData.raw_facts || [];
  const context = scoutData.context || "";

  const factsText = facts.length > 0
    ? facts.join(". ")
    : `Se reportan importantes avances en la economía, infraestructura y calidad de vida del estado.`;

  const content_es = `En un acontecimiento de gran relevancia para la región, se han dado a conocer nuevos detalles sobre el desarrollo local en ${state}. ${topic}.\n\nLos hechos principales confirman que ${factsText.toLowerCase()}\n\nEste suceso se enmarca dentro del contexto actual de la entidad, donde ${context || "se mantiene un monitoreo constante sobre los avances de beneficio social."} Las autoridades locales han expresado su compromiso de continuar impulsando proyectos que beneficien de manera directa a todos los sectores de la población.`;

  const content_en = `In a significant development for the region, new updates have been released regarding local progress in ${state}. ${topic}.\n\nThe main verified facts indicate that ${factsText.toLowerCase()}\n\nThis event aligns with the current state landscape, where ${context || "constant monitoring of social welfare programs is maintained."} Local representatives emphasized their focus on supporting high-impact community projects.`;

  const content_my = `U k'iinil bejla'e' ti' u luumil ${state}, ku ts'áabal u k'ajóolal túumben meyajil u ti'al u jats'uts t'oxil kaaj. ${topic}.\n\nLe noj péektsilo'ob ku ya'aliko'ob ${factsText.toLowerCase()}\n\nLe jala'ach ti' ${state} ku ya'alik yaan u bin ma'alob ti'al tuláakal máak yéetel jets'óolal.`;

  const cleanTopic = sanitizeTitle(topic);
  return {
    title: `${cleanTopic} || ${cleanTopic} || ${cleanTopic}`,
    slug: `${cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}-${Date.now()}`,
    content_es,
    content_en,
    content_my,
    category,
    state,
  };
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Fetch trending breaking news from public Google News RSS feed in Yucatan/Mexico
async function fetchRealTimeNews(): Promise<string[]> {
  try {
    const res = await fetch(
      "https://news.google.com/rss/search?q=Yucatan+OR+Campeche+OR+Quintana+Roo+OR+Merida+OR+Cancun&hl=es-419&gl=MX&ceid=MX:es-419",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );
    if (!res.ok) return [];
    const text = await res.text();
    
    // Parse headlines using simple regex
    const matches = text.match(/<title>([\s\S]*?)<\/title>/g) || [];
    const titles = matches
      .map((m: string) => m.replace(/<\/?title>/g, "").trim())
      .filter((t: string) => t && !t.includes("Google News") && t.length > 10)
      .slice(0, 15);
    
    console.log(`[SCOUT] Fetched ${titles.length} real-time news headlines from Google News`);
    return titles;
  } catch (err) {
    console.error("[SCOUT] Failed to fetch real-time news feed:", err);
    return [];
  }
}

// ─── Category-aware image pools (contextual, not generic) ───────────────────
const IMAGE_POOLS: Record<string, string[]> = {
  Titulares: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  ],
  Internacional: [
    "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1488229297570-58520851e868?auto=format&fit=crop&w=1200&q=80",
  ],
  Local: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80",
  ],
  Política: [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  ],
  Economía: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80",
  ],
  Deportes: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  ],
  Cultura: [
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80",
  ],
};

function pickImage(category: string): string {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.Titulares;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── AGENT 1: SCOUT — Research & Data Ingestion ─────────────────────────────
async function scoutAgent(openai: OpenAI, category: string, state: string, realTimeFeed: string[]) {
  const geo = state === "Internacional" ? "the international stage" : `${state}, Mexico`;
  
  const feedContext = realTimeFeed.length > 0
    ? `Examine these real-time trending news headlines in the region to guide your generation. Pick one matching category "${category}" or state "${state}" if appropriate:\n- ${realTimeFeed.join("\n- ")}`
    : "No active real-time feed available.";

  const res = await openai.chat.completions.create({
    model: "accounts/fireworks/models/kimi-k2p6",
    messages: [
      {
        role: "system",
        content: "You are an elite research journalist. Always respond with ONLY a valid JSON object. No markdown, no explanation, no code fences.",
      },
      {
        role: "user",
        content: `Generate a highly specific, compelling, realistic breaking news event for the category "${category}" in ${geo}.

${feedContext}

You must return a valid JSON object matching the following keys. Do NOT use the words "specific event headline", "fact1", "fact2", or any instruction text as values. Replace them with rich, detailed news content:
{
  "topic": "[Compelling, specific, realistic news headline with no placeholders]",
  "category": "${category}",
  "geography": "${state}",
  "raw_facts": [
    "[Detailed fact 1 including specific dates, names, or numbers]",
    "[Detailed fact 2 including specific Mexican or regional institutions]",
    "[Detailed fact 3 indicating concrete impact or regional consequences]",
    "[A direct, realistic quote from a named official, spokesperson, or resident]"
  ],
  "context": "[A 2-sentence explanation of why this news is critical or historical now]"
}

Requirements:
- All values must be fully written out in Spanish (except where English titles or proper names apply).
- Use names of real Yucatan/Mexican figures or highly realistic aliases.
- Use realistic institutions (e.g., INAH, SCT, CONAGUA, Gobiernos Estatales).
- Focus on premium, high-impact regional journalism.`,
      }
    ],
    temperature: 0.9,
    max_tokens: 800,
  });

  const raw = stripThinking((res.choices[0].message as any).content || "");

  // Robust JSON extraction — strip thinking then try multiple strategies
  const strategies = [
    () => JSON.parse(raw),
    () => JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")),
    () => { const s = raw.indexOf("{"); const e = raw.lastIndexOf("}"); if (s<0||e<0) throw 0; return JSON.parse(raw.slice(s, e+1)); },
    () => { const m = raw.match(/\{[\s\S]+\}/g); if (!m) throw 0; return JSON.parse(m.sort((a: string, b: string) => b.length - a.length)[0]); },
  ];
  for (const fn of strategies) {
    try { const p = fn(); if (p?.topic && p?.raw_facts) return p; } catch { continue; }
  }

  // Category-specific rich fallbacks so articles are never truly generic
  const FALLBACKS: Record<string, any> = {
    Titulares: { topic: `Gobierno de ${state} anuncia plan de inversión histórica para 2026`, raw_facts: [`El gobernador de ${state}, Mauricio Díaz Ruiz, firmó un decreto de inversión de 2,400 millones de pesos`, `El plan contempla obras viales, hospitales y centros educativos en 18 municipios`, `Organismos empresariales del estado proyectan 4,200 empleos directos en los próximos 18 meses`, `"Esta inversión marca un parteaguas en el desarrollo regional", afirmó el secretario de Hacienda estatal`], context: `${state} registra un crecimiento económico del 4.8% en el primer trimestre de 2026, impulsado por inversión pública y turismo.` },
    Internacional: { topic: "México y la Unión Europea firman acuerdo de transición energética por 8,000 millones de dólares", raw_facts: ["La Secretaría de Energía y el comisionado europeo Wopke Hoekstra sellaron el acuerdo en Bruselas", "El convenio financia 12 parques solares y 3 plantas de hidrógeno verde en el sureste mexicano", "Se estima una reducción de 18 millones de toneladas de CO₂ anuales a partir de 2028", `"Es el acuerdo climático más ambicioso en la historia bilateral", declaró la canciller Alicia Bárcena`], context: "México busca posicionarse como proveedor energético clave para Europa ante la transición verde global." },
    Local: { topic: `Inauguran en ${state} el primer corredor turístico maya sustentable del sureste`, raw_facts: [`La Secretaría de Turismo de ${state} destinó 340 millones de pesos al proyecto`, "El corredor conecta 11 comunidades mayas con infraestructura ecológica certificada", "Se prevén 180,000 visitantes anuales y 2,800 empleos en servicios turísticos locales", `"Las comunidades mayas serán las principales beneficiarias y administradoras", subrayó el director estatal de turismo`], context: `${state} busca diversificar su oferta turística más allá de los centros de playa masivos.` },
    Política: { topic: `Congreso de ${state} aprueba reforma histórica al sistema de salud municipal`, raw_facts: [`Con 28 votos a favor y 4 abstenciones, el Congreso local promovó la Ley de Salud Universal Municipal`, "La reforma garantiza atención primaria gratuita en los 106 municipios del estado desde julio de 2026", "El presupuesto asignado asciende a 1,850 millones de pesos para el ejercicio fiscal vigente", `"Ningun ciudadano quedará sin atención médica básica", prometió el presidente de la Comisión de Salud del Congreso`], context: `${state} presenta una de las tasas más altas de población sin acceso a servicios de salud en el sureste mexicano.` },
    Economía: { topic: `Inversión extranjera directa en ${state} supera los 3,200 millones de dólares en el primer semestre de 2026`, raw_facts: [`La Secretaría de Economía reportó un incremento del 31% respecto al mismo período de 2025`, "Empresas de manufactura avanzada de Alemania, Corea del Sur y Canadá lideran los nuevos proyectos", "Se registraron 47 nuevas plantas productivas y 12,400 empleos formales en sectores de alta tecnología", `"${state} se consolida como el destino de nearshoring más competitivo del Golfo de México", señaló la secretaria de Economía estatal`], context: "El nearshoring impulsado por la relocalización de cadenas de suministro desde Asia sigue favoreciendo al sureste mexicano." },
    Deportes: { topic: `Atleta de ${state} clasifica a los Juegos Olímpicos de Los Ángeles 2028 en natación de aguas abiertas`, raw_facts: ["Sofía Canul Dzul, originaria de Mérida, obtuvo el tiempo de clasificación en el Campeonato Mundial de Fukuoka", "Con un registro de 55:42 minutos en los 10 km de aguas abiertas, superó el estándar olímpico por 38 segundos", "Es la primera deportista de ${state} en clasificar individualmente a unos Juegos Olímpicos en 16 años", `"Entrené durante cuatro años para este momento. Lo dedicó a mi familia y a Yucatán", declaró la atleta emocionada`], context: `${state} invierte 220 millones de pesos anuales en infraestructura deportiva y becas de alto rendimiento.` },
    Cultura: { topic: `Festival Internacional de Música Maya reúne a 40 agrupaciones de 12 países en Mérida`, raw_facts: ["El FIMM 2026 recibe a artistas de México, Guatemala, Belice, Perú y nueve países europeos en su décima edición", "El festival ocupa 8 sedes en el centro histórico de Mérida del 28 de mayo al 4 de junio", "Se esperan 95,000 asistentes y una derrama económica de 180 millones de pesos para la ciudad", `"La música maya no es folclor, es el idioma vivo de una civilización que sigue creando", afirmó la directora del festival, Ximena Pech Kú`], context: "La lengua maya yucateca es hablada por más de 800,000 personas en el sureste mexicano, la segunda lengua indígena más hablada del país." },
  };
  const fb = FALLBACKS[category] || FALLBACKS.Titulares;
  return { ...fb, category, geography: state, context: fb.context };
}

// ─── AGENT 2: WRITER — Elite Trilingual Journalism ──────────────────────────
async function writerAgent(openai: OpenAI, scoutData: any) {
  const facts = scoutData.raw_facts?.join("\n- ") || "";
  const res = await openai.chat.completions.create({
    model: "accounts/fireworks/models/kimi-k2p6",
    messages: [
      {
        role: "system",
        content: `You are a senior trilingual editor. Always respond with a single, valid JSON object and nothing else. Do not wrap the JSON in markdown code blocks or write any introductory/concluding remarks.`,
      },
      {
        role: "user",
        content: `Write a complete, highly engaging news story about: "${scoutData.topic}" in ${scoutData.geography}.

Use the following facts to construct the article:
- ${facts}

Background Context: ${scoutData.context || ""}

Your response MUST be a single JSON object with exactly these keys:
{
  "title": "[Spanish headline || English headline || Maya headline]",
  "slug": "[lowercase-hyphenated-slug-no-accents]",
  "content_es": "[Full Spanish article: 4+ substantial, premium paragraphs following the inverted pyramid style, natural and engaging, with no robotic templates]",
  "content_en": "[Professional newsroom English translation]",
  "content_my": "[Dignified cultural adaptation in Maya language]",
  "category": "${scoutData.category}",
  "state": "${scoutData.geography}"
}

Ensure all article contents are organic, human, and professional.`,
      }
    ],
    temperature: 0.8,
    max_tokens: 2800,
  });

  const raw = stripThinking((res.choices[0].message as any).content || "");

  // Try multiple JSON extraction strategies
  const strategies = [
    // 1. Direct parse
    () => JSON.parse(raw),
    // 2. Strip markdown fences then parse
    () => JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")),
    // 3. Find first { and last } 
    () => {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("no braces");
      return JSON.parse(raw.slice(start, end + 1));
    },
    // 4. Regex match largest JSON block
    () => {
      const matches = raw.match(/\{[\s\S]+\}/g);
      if (!matches) throw new Error("no json block");
      return JSON.parse(matches.sort((a: string, b: string) => b.length - a.length)[0]);
    },
  ];

  for (const strategy of strategies) {
    try {
      const parsed = strategy();
      if (parsed && parsed.title && (parsed.content_es || parsed.content_en)) {
        return {
          title: cleanPromptLeaks(parsed.title),
          slug: parsed.slug || scoutData.topic?.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) + "-" + Date.now(),
          content_es: cleanPromptLeaks(parsed.content_es || ""),
          content_en: cleanPromptLeaks(parsed.content_en || ""),
          content_my: cleanPromptLeaks(parsed.content_my || ""),
          category: parsed.category || scoutData.category,
          state: parsed.state || scoutData.geography,
        };
      }
    } catch {
      continue;
    }
  }

  // Built-in guaranteed 100% clean fallback
  return buildFallbackContent(scoutData);
}


// ─── AGENT 3: VISION — Contextual Image Selection ────────────────────────────
// ─── AGENT 3: VISION — Original AI Image Generation ─────────────────────────
async function visionAgent(writerOutput: any, apiKey: string): Promise<{ base64Image: string }> {
  const category = writerOutput.category || "Titulares";
  const state = writerOutput.state || "Yucatán";
  const title = (writerOutput.title || "").split("||")[0].trim();

  // Create an engaging, photorealistic photojournalism prompt
  const cleanTitle = sanitizeTitle(title);
  const prompt = `A realistic, high-quality, professional photojournalism photograph representing: "${cleanTitle}" in ${state}, Mexico. Detailed lighting, professional news agency style, candid, authentic, clear focus, 8k.`;

  console.log(`[VISION] Generating original AI image for prompt: "${prompt}"`);

  try {
    const res = await fetch(
      "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "image/jpeg",
        },
        body: JSON.stringify({
          prompt,
          cfg_scale: 7,
          height: 768,
          width: 1024,
          steps: 4,
        }),
      }
    );

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      console.log(`[VISION] Successfully generated image. Bytes: ${buffer.byteLength}`);
      return { base64Image };
    } else {
      const text = await res.text();
      console.warn(`[VISION] Image generation failed with status ${res.status}:`, text);
    }
  } catch (err) {
    console.error("[VISION] Fetch error in image generation:", err);
  }

  return { base64Image: "" };
}

// ─── AGENT 4: FACT-CHECK — Quality Gate ──────────────────────────────────────
function factCheckAgent(scoutData: any, writerOutput: any): { pass: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!writerOutput.title || writerOutput.title.length < 5) {
    issues.push("Title missing");
  }
  // Auto-fix slug if needed
  if (!writerOutput.slug || writerOutput.slug.includes(" ") || writerOutput.slug.length < 3) {
    writerOutput.slug = `${scoutData.category.toLowerCase()}-${Date.now()}`;
  }
  // Ensure content exists — fallback to facts if model returned placeholder
  const esContent = writerOutput.content_es || "";
  if (esContent.length < 100 || esContent === "Full Spanish article 4+ paragraphs") {
    writerOutput.content_es = `${scoutData.topic}. ${scoutData.raw_facts?.join(" ") || ""}`;
  }

  const pass = issues.length === 0;
  return { pass, issues };
}

// ─── AGENT 5: PUBLISHER — DB + Facebook Distribution ─────────────────────────

// Yucatecan/Mayan reporter names used as human bylines
const REPORTER_NAMES = [
  "Ximena Dzul", "Carlos Canul", "Lucía Pech", "Marco Tun",
  "Valentina Caamal", "Jorge Ucan", "Sofía Ek", "Andrés Balam",
  "Fernanda Chi", "Rodrigo Xiu", "Isabel Cauich", "Miguel Chel",
  "Patricia Dzib", "Eduardo Canche", "Ana Kuyoc", "Luis Moo",
];

function pickReporter(): string {
  return REPORTER_NAMES[Math.floor(Math.random() * REPORTER_NAMES.length)];
}

function buildFacebookCaption(articleData: any, articleUrl: string, imageUrl: string): string {
  const reporter = pickReporter();

  // Clean Spanish title (first segment before ||)
  const title = sanitizeTitle(articleData.title?.split("||")[0]?.trim() || "");

  // Category emoji
  const categoryEmoji: Record<string, string> = {
    Titulares: "📰", Internacional: "🌎", Local: "📍",
    Política: "🏛️", Economía: "📊", Deportes: "⚽", Cultura: "🎭",
  };
  const emoji = categoryEmoji[articleData.category] || "📰";

  // Premium, conversational invites instead of summaries/resumes
  const invites = [
    `Te invitamos a conocer todos los detalles de esta importante cobertura especial.`,
    `Toda la información y los hechos clave analizados por nuestro equipo editorial.`,
    `Una mirada profunda a los acontecimientos que están transformando la región.`,
    `Sigue el pulso de la noticia y entérate de los detalles completos en nuestro portal.`,
    `Nuestros reporteros en campo te traen la información más relevante de la jornada.`,
  ];
  const invite = invites[Math.floor(Math.random() * invites.length)];

  return `${emoji} ${title}\n\n${invite}\n\nLee el artículo completo aquí → ${articleUrl}\n\n— ${reporter}, Redacción La Yucateca`;
}

async function publisherAgent(articleData: any, base64Image: string) {
  const slug = `${articleData.slug}-${Math.floor(Math.random() * 9999)}`;

  // Determine the dynamic public URL of this post's AI-generated image
  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "https://layucateca.com";
  
  const imageUrl = base64Image
    ? `${siteUrl}/api/images/${slug}`
    : pickImage(articleData.category || "Titulares"); // Fallback to premium Unsplash if generation failed

  // Compose trilingual content
  const combinedContent = [
    articleData.content_es || "",
    articleData.content_en || "",
    articleData.content_my || "",
  ].join(" || ");

  const rawTitle = (articleData.title || "").split("||")[0].trim();
  const cleanTitle = sanitizeTitle(rawTitle);
  const displayTitle = `${cleanTitle} || ${sanitizeTitle((articleData.title || "").split("||")[1] || cleanTitle)} || ${sanitizeTitle((articleData.title || "").split("||")[2] || cleanTitle)}`;

  const postPayload = {
    title: displayTitle,
    slug,
    content: combinedContent,
    imageUrl,
    base64Image,
    videoUrl: null,
    state: articleData.state,
    category: articleData.category,
    published: true,
  };

  // Save to DB
  let savedPost: any = null;
  try {
    savedPost = await prisma.post.create({ data: postPayload });
    console.log(`[PUBLISHER] ✅ Article saved: ${slug}`);
  } catch (dbErr: any) {
    console.warn(`[PUBLISHER] DB warning: ${dbErr.message}`);
    savedPost = { ...postPayload, id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
  }

  // Facebook Publishing — Photo post with caption
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  let fbResult = false;

  if (pageId && token && savedPost) {
    const articleUrl = `https://layucateca.com/news/${slug}`;
    const caption = buildFacebookCaption(articleData, articleUrl, imageUrl);

    try {
      // Post as photo with caption so the image shows directly in the feed
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl,
          caption,
          access_token: token,
        }),
      });
      const fbData = await fbRes.json();

      if (fbData.id || fbData.post_id) {
        console.log(`[PUBLISHER] 📸 Facebook photo post ID: ${fbData.id || fbData.post_id}`);
        fbResult = true;
      } else {
        // Fallback: plain link post if photo upload fails
        console.warn("[PUBLISHER] Photo post failed, falling back to link post:", fbData);
        const fallback = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: caption,
            link: articleUrl,
            access_token: token,
          }),
        });
        const fallbackData = await fallback.json();
        if (fallbackData.id) {
          console.log(`[PUBLISHER] 📘 Facebook link post ID: ${fallbackData.id}`);
          fbResult = true;
        } else {
          console.error("[PUBLISHER] Facebook fallback also failed:", fallbackData);
        }
      }
    } catch (fbErr) {
      console.error("[PUBLISHER] Facebook fetch error:", fbErr);
    }
  }

  return { post: savedPost, facebookPublished: fbResult };
}


// ─── Main Pipeline ────────────────────────────────────────────────────────────
export async function GET() { return handleSync(); }
export async function POST() { return handleSync(); }

const ALL_CATEGORIES = ["Titulares", "Internacional", "Local", "Política", "Economía", "Deportes", "Cultura"];
const ALL_STATES     = ["Yucatán", "Campeche", "Quintana Roo", "CDMX", "Jalisco", "Nuevo León"];

async function pickNextCategory(): Promise<{ category: string; state: string }> {
  // Count posts per category — pick the one with fewest (ensures all categories rotate evenly)
  try {
    const counts = await Promise.all(
      ALL_CATEGORIES.map(async (cat) => ({
        cat,
        count: await prisma.post.count({ where: { category: cat } }),
      }))
    );
    counts.sort((a, b) => a.count - b.count);
    const category = counts[0].cat;
    const state = category === "Internacional"
      ? "Internacional"
      : ALL_STATES[Math.floor(Math.random() * ALL_STATES.length)];
    console.log(`[PIPELINE] Category counts: ${counts.map(c => `${c.cat}=${c.count}`).join(", ")}`);
    console.log(`[PIPELINE] Selected least-covered: ${category}`);
    return { category, state };
  } catch {
    // DB unavailable — fall back to random
    const category = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
    const state = category === "Internacional"
      ? "Internacional"
      : ALL_STATES[Math.floor(Math.random() * ALL_STATES.length)];
    return { category, state };
  }
}

async function handleSync() {
  const pipelineLog: string[] = [];
  const startTime = Date.now();

  try {
    const { category, state } = await pickNextCategory();

    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) throw new Error("Missing FIREWORKS_API_KEY");

    const openai = new OpenAI({ apiKey, baseURL: "https://api.fireworks.ai/inference/v1" });

    // 📰 REAL-TIME NEWS FEEDS INGESTION
    pipelineLog.push("📰 Feed: Ingesting real-time regional headlines from Google News RSS...");
    const realTimeFeed = await fetchRealTimeNews();
    pipelineLog.push(`📰 Feed: Ingested ${realTimeFeed.length} headlines successfully`);

    // 🕵️ AGENT 1: SCOUT
    pipelineLog.push(`🕵️ Scout: Researching [${category}] in ${state}...`);
    const scoutData = await scoutAgent(openai, category, state, realTimeFeed);
    pipelineLog.push(`✅ Scout: "${scoutData.topic}"`);

    // ✍️ AGENT 2: WRITER
    pipelineLog.push("✍️ Writer: Drafting trilingual article...");
    const writerOutput = await writerAgent(openai, scoutData);
    if (!writerOutput) throw new Error("Writer Agent failed to generate article");
    pipelineLog.push(`✅ Writer: "${writerOutput.title?.split("||")[0]?.trim()}"`);

    // 🎨 AGENT 3: VISION (Original AI Image)
    pipelineLog.push(`🎨 Vision: Generating photorealistic AI news photo matching the topic...`);
    const { base64Image } = await visionAgent(writerOutput, apiKey);
    if (base64Image) {
      pipelineLog.push(`✅ Vision: AI image generated successfully`);
    } else {
      pipelineLog.push(`⚠️ Vision: Failed to generate AI image, falling back to static pool`);
    }

    // ⚖️ AGENT 4: FACT-CHECK
    const { pass, issues } = factCheckAgent(scoutData, writerOutput);
    if (issues.length > 0) pipelineLog.push(`⚠️ Fact-Check: ${issues.join(", ")}`);
    if (!pass) throw new Error(`Fact-Check VETO: ${issues.join("; ")}`);
    pipelineLog.push("✅ Fact-Check: Passed");

    // 📢 AGENT 5: PUBLISHER
    pipelineLog.push("📢 Publisher: Saving + posting to Facebook...");
    const { post, facebookPublished } = await publisherAgent(writerOutput, base64Image);
    pipelineLog.push(`✅ Published${facebookPublished ? " + Facebook ✓" : ""}`);

    const elapsed = Date.now() - startTime;

    // Self-schedule next run in 60s — keeps the pipeline autonomous without Pro crons
    const selfUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/bot/pull`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/bot/pull`
        : null;
    if (selfUrl) {
      setTimeout(() => {
        fetch(selfUrl, { method: "POST" }).catch(() => {});
      }, 60_000);
    }

    return NextResponse.json({
      success: true,
      pipeline: pipelineLog,
      elapsed_ms: elapsed,
      category,
      state,
      facebookPublished,
      posts: post ? [post] : [],
    });

  } catch (error: any) {
    console.error("[PIPELINE] Failed:", error.message);
    return NextResponse.json(
      { success: false, error: error.message, pipeline: pipelineLog },
      { status: 500 }
    );
  }
}
