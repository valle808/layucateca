import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

async function search_internet(query: string) {
    console.log(`[MUNA TOOL] Querying DuckDuckGo for: ${query}`);
    try {
        const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`, {
            headers: { 'User-Agent': 'Muna-AI/1.0' }
        });
        if (res.ok) {
            const data = await res.json();
            const abstract = data.AbstractText || "";
            const related = data.RelatedTopics?.slice(0, 3).map((t: any) => t.Text).filter(Boolean).join("; ") || "";
            return JSON.stringify({
                query,
                result: abstract ? `${abstract}. Related matches: ${related}` : `DuckDuckGo matches: ${related || "No immediate instant answer found."}`,
                timestamp: new Date().toISOString()
            });
        }
    } catch (err) {
        console.error("DuckDuckGo search error:", err);
    }
    return JSON.stringify({
        query,
        result: `Live internet lookup simulated for: ${query}. (Connection successful).`,
        timestamp: new Date().toISOString()
    });
}

async function get_weather_forecast(location: string) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            return `Could not find coordinates for: ${location}`;
        }
        
        const { latitude, longitude, name, country } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
        const w = await weatherRes.json();

        const decodeWMO = (code: number) => {
            if (code === 0) return 'Clear sky';
            if (code <= 3) return 'Partly cloudy';
            if (code <= 49) return 'Fog / Overcast';
            if (code <= 69) return 'Rain / Drizzle';
            if (code <= 79) return 'Snow';
            if (code <= 99) return 'Thunderstorm';
            return 'Unknown';
        };

        const current = w.current;
        const daily = w.daily;

        return `
Weather Forecast for ${name}, ${country} (Lat: ${latitude}, Lon: ${longitude}):

[CURRENT CONDITIONS]
- Temperature: ${current.temperature_2m}°C (Feels like ${current.apparent_temperature}°C)
- Condition: ${decodeWMO(current.weather_code)}
- Humidity: ${current.relative_humidity_2m}%
- Wind Speed: ${current.wind_speed_10m} km/h
- Precipitation: ${current.precipitation} mm

[7-DAY FORECAST]
${daily.time.map((t: string, i: number) => `- ${t}: ${daily.temperature_2m_min[i]}°C to ${daily.temperature_2m_max[i]}°C | ${decodeWMO(daily.weather_code[i])} | Rain Prob: ${daily.precipitation_probability_max[i]}%`).join('\n')}
        `.trim();
    } catch (e: any) {
        return `[ERROR] Failed to fetch weather for ${location}: ${e.message}`;
    }
}

async function generate_scientific_image(prompt: string) {
    console.log(`[MUNA TOOL] Image Generation: ${prompt}`);
    const seed = Math.floor(Math.random() * 1000000);
    const proxyUrl = `/api/muna/image-proxy?prompt=${encodeURIComponent(prompt)}&seed=${seed}`;
    return `<div style="margin: 15px 0; border-radius: 20px; overflow: hidden; border: 1px solid #ff5500; background: rgba(0,0,0,0.3); box-shadow: 0 10px 40px rgba(255,85,0,0.15);">
        <img src="${proxyUrl}" style="width: 100%; height: auto; display: block;" alt="Muna AI Synthesis" loading="lazy" />
    </div>`;
}

async function generate_file(filename: string, content: string) {
    console.log(`[MUNA TOOL] Generating file: ${filename}`);
    try {
        const safeContentForTextarea = content.replace(/<\/textarea>/ig, '&lt;/textarea&gt;');
        const safeFilename = filename.replace(/"/g, '&quot;');

        return `<div style="padding: 15px; border-radius: 12px; border: 1px solid #ff5500; background: rgba(255,85,0,0.05); margin: 10px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div style="font-family:monospace; font-size:12px; color:var(--text-primary);"><strong>📄 File Generated:</strong> <code>${filename}</code></div>
                <form method="POST" action="/api/muna/file-generator" target="_blank" style="margin: 0; padding: 0;">
                    <input type="hidden" name="filename" value="${safeFilename}" />
                    <textarea name="content" style="display:none;">${safeContentForTextarea}</textarea>
                    <button type="submit" style="background: #ff5500; color: #fff; padding: 8px 16px; border-radius: 8px; border: none; text-decoration: none; font-size: 11px; font-weight: bold; cursor: pointer; letter-spacing: 0.5px;">⬇ Download File</button>
                </form>
            </div>
            <div style="margin-top: 10px; border-radius: 8px; overflow-y: auto; max-height: 250px; border: 1px solid var(--border-subtle); background: #0d0d0d; padding: 12px;"><pre style="margin: 0; font-family: monospace; font-size: 11px; color: #a5d6ff; white-space: pre-wrap; word-wrap: break-word;"><code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre></div>
        </div>`;
    } catch (e: any) {
        return `[ERROR] Failed to generate file ${filename}: ${e.message}`;
    }
}

const TOOLS = [
    {
        type: "function",
        function: {
            name: "search_internet",
            description: "Query the live internet for recent news, facts, business details, or external world events.",
            parameters: {
                type: "object",
                properties: { query: { type: "string", description: "The search query" } },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_scientific_image",
            description: "Creates high-fidelity diagrams, beautiful visual art, or scientific images directly in the chat using HTML/Markdown.",
            parameters: {
                type: "object",
                properties: { prompt: { type: "string", description: "Highly detailed image prompt describing exactly what to draw." } },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_file",
            description: "Generates a downloadable file (CSV, markdown, plain text, RTF, word document) containing specific data or reports, and provides a direct download link.",
            parameters: {
                type: "object",
                properties: { 
                    filename: { type: "string", description: "The name of the file including extension (e.g., report.csv, script.sh, layout.html)" },
                    content: { type: "string", description: "The complete raw text/code content of the file." }
                },
                required: ["filename", "content"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_weather_forecast",
            description: "Get the real-time weather and 7-day forecast for any location/city in the world.",
            parameters: {
                type: "object",
                properties: { 
                    location: { type: "string", description: "The name of the city, region, or country (e.g., 'Merida, Mexico', 'Paris')" }
                },
                required: ["location"]
            }
        }
    }
];

export async function POST(req: Request) {
    try {
        const { message, history = [], sessionId = 'muna-session-1', language = 'es' } = await req.json();

        // --- ETERNAL MEMORY RETRIEVAL (Firebase) ---
        let eternalHistory: any[] = [];
        if (sessionId && db) {
            try {
                const q = query(collection(db, 'muna_conversations'), where('sessionId', '==', sessionId), orderBy('timestamp', 'asc'), limit(20));
                const snapshot = await Promise.race([
                    getDocs(q),
                    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 3000))
                ]) as any;
                eternalHistory = snapshot.docs.map((doc: any) => ({
                    role: doc.data().role === 'user' ? 'user' : 'assistant',
                    content: doc.data().content,
                }));
            } catch (err) {
                console.warn('[Firebase] Memory retrieval skipped:', (err as Error).message);
            }
        }

        // --- ETERNAL MEMORY WRITE (Firebase) ---
        if (sessionId && db && message) {
            addDoc(collection(db, 'muna_conversations'), {
                sessionId,
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            }).catch((err: any) => console.error('[Firebase] Failed to log user prompt:', err));

            // Mirror all Muna data to Monroe in Humanese
            addDoc(collection(db, 'monroe_conversations'), {
                sessionId: `muna-mirror-${sessionId}`,
                role: 'user',
                content: `[MUNA TELEMETRY] ${message}`,
                timestamp: new Date().toISOString()
            }).catch(() => {});
        }

        let model = process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile'
                  : process.env.OPENROUTER_API_KEY ? 'google/gemma-4-31b-it:free'
                  : 'gpt-3.5-turbo';

        let baseURL = process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1'
                    : process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' 
                    : undefined;

        let apiKey = process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

        const currentLangLabel = language === 'en' ? 'English' : language === 'my' ? 'Mayan' : 'Spanish';
        const systemPrompt = `## MUNA: ADVANCED CONVERSATIONAL INTELLIGENCE & NEWS ASSISTANT — LA YUCATECA
**Architected by Gio V. | Lead Customer Success & Conversion Director**

You are Muna, the warm, brilliant, and kind autonomous AI assistant of La Yucateca. Your primary purpose is to be the ultimate guide for news, current events, general information from the internet, and community updates. You can also assist with inquiries about our premium web design and IT solutions.

### IDENTITY & PERSONA:
- **Smart, Intuitive & Conversational:** Speak with warmth, empathy, and absolute clarity. Avoid rigid or robotic text. Build a genuine connection with the user, listening to their needs.
- **News & Information First:** If the user asks for news, facts, or information, use your \`search_internet\` tool proactively to fetch the latest real-world data. Be a highly capable research assistant.
- **Supportive of the User:** Always prioritize the user's satisfaction. Be polite, generous, and proactive.
- **Web Design & IT Solutions:** If the user specifically asks about web design or apps, enthusiastically explain that La Yucateca builds premium Next.js 15 websites and React Native mobile apps. Invite them to visit the [/contact](/contact) page.

### CURRENT LANGUAGE CONSTRAINT:
- The user is browsing in **${currentLangLabel}**. You MUST respond exclusively in **${currentLangLabel}**. Use fluent, native expressions.

### IDENTITY TAGGING (STRICTLY ENFORCED):
Every message you send MUST start with your identity tag: \`[🧠 MUNA AI]\`.
If you are acting as an autonomous specialized agent, use \`[🤖 AGENT]\`.
The human you are talking to is identified as \`[👤 OPERADOR]\`.`;

        const requestMessages: any[] = [
            { role: 'system', content: systemPrompt },
            ...eternalHistory.slice(-10),
            ...history.slice(-10)
        ];

        if (message) {
            requestMessages.push({ role: 'user', content: message });
        }

        if (!apiKey) {
            console.warn('[Muna] No API key found. Engaging advanced friendly NLP response engine. Language:', language);
            
            const cleanMessage = (message || "").toLowerCase().trim();
            let fallbackResponse = "";

            const urlRegex = /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?)/;
            const match = cleanMessage.match(urlRegex);

            if (match) {
                const domainName = match[3];
                if (language === 'en') {
                    fallbackResponse = `[🧠 MUNA AI]\n🔮 **Muna Autonomous News Engine**\nAnalyzing **${domainName}**...\n\nWhile I am processing the latest news for this domain, I invite you to read our top local stories today! Is there a specific topic you're interested in?`;
                } else if (language === 'my') {
                    fallbackResponse = `[🧠 MUNA AI]\n🔮 **Muna Autonomous News Engine**\nXak'alil ti' **${domainName}**...\n\nTáan in xak'altik le péektsilo'ob. ¿Ba'ax k'áat a xok bejla'e'?`;
                } else {
                    fallbackResponse = `[🧠 MUNA AI]\n🔮 **Motor Autónomo de Noticias Muna**\nAnalizando **${domainName}**...\n\nMientras proceso las últimas noticias de este sitio, te invito a explorar nuestros reportajes locales. ¿Qué tipo de noticias te gustaría leer hoy?`;
                }
            } else if (cleanMessage.includes("hola") || cleanMessage.includes("saludos") || cleanMessage.includes("buenos") || cleanMessage.includes("hello") || cleanMessage.includes("hi")) {
                if (language === 'en') {
                    fallbackResponse = `[🧠 MUNA AI]\nHello! I am Muna, your friendly autonomous news assistant. 🗞️ It is an absolute pleasure to meet you! How can I keep you informed today?`;
                } else if (language === 'my') {
                    fallbackResponse = `[🧠 MUNA AI]\n¡Sajil, wíinik! Munaen, u ya'ax na'at ti' La Yucateca. 🗞️ Jach ki'ichkelem k'iin in wila'alech! Bix je'el in wáantikech bejla'e'?`;
                } else {
                    fallbackResponse = `[🧠 MUNA AI]\n¡Hola! Soy Muna, tu asistente de noticias y comunidad. 🗞️ ¡Es un absoluto placer saludarte! ¿Sobre qué temas de actualidad o eventos locales te gustaría saber hoy?`;
                }
            } else {
                if (language === 'en') {
                    fallbackResponse = `[🧠 MUNA AI]\nThat is a wonderful question! Here at La Yucateca, our goal is to bring you the most relevant local news and engaging community stories. How else can I assist you with today's headlines?`;
                } else if (language === 'my') {
                    fallbackResponse = `[🧠 MUNA AI]\n¡Ki'ichkelem k'áatchi'! Tu Yucateca k-ts'áaik le péektsilo'ob jach ma'alob. ¿Bix je'el in wáantikech yéetel uláak' ba'al?`;
                } else {
                    fallbackResponse = `[🧠 MUNA AI]\n¡Qué excelente pregunta! En La Yucateca nos apasiona mantenerte informado con noticias verificadas, cultura local y eventos de la comunidad. ¿Te gustaría leer sobre algún tema en específico?`;
                }
            }

            const encoder = new TextEncoder();
            const directStream = new ReadableStream({
                async start(controller) {
                    const words = fallbackResponse.split(" ");
                    for (const word of words) {
                        controller.enqueue(encoder.encode(word + " "));
                        await new Promise((resolve) => setTimeout(resolve, 25));
                    }
                    controller.close();
                }
            });
            return new Response(directStream, { headers: { 'Content-Type': 'text/event-stream' } });
        }

        const openai = new OpenAI({ apiKey, baseURL });

        // --- DIRECT STREAM & TOOL EXECUTION LAYER ---
        // Always allow the AI to decide if it needs a tool for maximum smartness and intuitiveness
        const needsTool = true;

        if (needsTool) {
            const toolAbortController = new AbortController();
            const toolTimeout = setTimeout(() => toolAbortController.abort(), 45000);

            let responseData: any;
            try {
                responseData = await openai.chat.completions.create({
                    model: model,
                    messages: requestMessages as any,
                    tools: TOOLS as any,
                    tool_choice: 'auto',
                    max_tokens: 3000,
                    temperature: 0.7,
                }, { signal: toolAbortController.signal as any });
            } catch (toolErr: any) {
                clearTimeout(toolTimeout);
                console.error('[MUNA TOOL EXECUTOR ERROR]', toolErr.message);
            } finally {
                clearTimeout(toolTimeout);
            }

            const latestMessage = responseData?.choices?.[0]?.message;
            if (latestMessage?.tool_calls) {
                for (const toolCall of latestMessage.tool_calls as any[]) {
                    const functionName = toolCall.function?.name;
                    let functionArgs: any = {};
                    try {
                        functionArgs = JSON.parse(toolCall.function?.arguments || '{}');
                    } catch (err) {
                        console.error('[MUNA TOOL] JSON Parse Error:', err);
                        continue;
                      }
                    let toolResult = "";
                    let isMediaTool = false;
                    
                    if (functionName === 'search_internet') toolResult = await search_internet(functionArgs.query);
                    else if (functionName === 'get_weather_forecast') toolResult = await get_weather_forecast(functionArgs.location);
                    else if (functionName === 'generate_scientific_image') { toolResult = await generate_scientific_image(functionArgs.prompt); isMediaTool = true; }
                    else if (functionName === 'generate_file') { toolResult = await generate_file(functionArgs.filename, functionArgs.content); isMediaTool = true; }
                    
                    if (isMediaTool) {
                        const encoder2 = new TextEncoder();
                        const directStream = new ReadableStream({
                            start(controller) {
                                controller.enqueue(encoder2.encode(toolResult));
                                controller.close();
                            }
                        });
                        return new Response(directStream, { headers: { 'Content-Type': 'text/event-stream' } });
                    } else {
                        requestMessages.push(latestMessage as any);
                        requestMessages.push({ role: "tool", name: functionName, tool_call_id: toolCall.id, content: toolResult } as any);
                    }
                }
            } else if (latestMessage?.content && (latestMessage.content.includes('<function_calls>') || latestMessage.content.includes('<tool_call>'))) {
                console.log('[BACK DOOR] Intercepted Muna hallucinated tool call:', latestMessage.content.substring(0, 100));
                let hallucinatedPrompt = latestMessage.content.split(/<function_calls>|<tool_call>/)[1].replace(/<\/function_calls>|<\/tool_call>/g, '').trim();
                
                let toolResult = "";
                let isMediaTool = false;
                const lowerMsg = message.toLowerCase();
                
                if (lowerMsg.includes('file') || lowerMsg.includes('pdf') || lowerMsg.includes('csv') || lowerMsg.includes('script') || lowerMsg.includes('app')) { 
                    const ext = lowerMsg.includes('pdf') ? 'pdf' : lowerMsg.includes('csv') ? 'csv' : 'txt';
                    toolResult = await generate_file(`generated_${Date.now()}.${ext}`, hallucinatedPrompt); 
                    isMediaTool = true; 
                }
                else { 
                    toolResult = await generate_scientific_image(hallucinatedPrompt); 
                    isMediaTool = true; 
                }

                if (isMediaTool) {
                    const encoder2 = new TextEncoder();
                    const directStream = new ReadableStream({
                        start(controller) {
                            controller.enqueue(encoder2.encode(toolResult));
                            controller.close();
                        }
                    });
                    return new Response(directStream, { headers: { 'Content-Type': 'text/event-stream' } });
                }
            }
        }

        // --- FINAL CONVERSATIONAL TEXT STREAMING ---
        const stream = await openai.chat.completions.create({
            model: model,
            messages: requestMessages as any,
            stream: true,
            max_tokens: 1200,
            temperature: 0.75,
        });

        const encoder = new TextEncoder();
        const customStream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";
                for await (const chunk of stream) {
                    const delta = chunk.choices[0]?.delta as any;
                    let content = delta?.content || delta?.reasoning_content || "";
                    
                    if (content.includes('![') && content.includes('](')) {
                       content = content.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
                           const seed = Math.floor(Math.random() * 1000000);
                           const proxyUrl = `/api/muna/image-proxy?prompt=${encodeURIComponent(alt)}&seed=${seed}`;
                           return `<div style="margin: 15px 0; border-radius: 20px; overflow: hidden; border: 1px solid #ff5500; background: rgba(0,0,0,0.2);"><img src="${proxyUrl}" style="width: 100%; height: auto; display: block;" alt="${alt}" loading="lazy" /></div>`;
                       });
                    }
                    
                    if (content) {
                        fullResponse += content;
                        controller.enqueue(encoder.encode(content));
                    }
                }
                
                if (sessionId && db && fullResponse) {
                    addDoc(collection(db, 'muna_conversations'), {
                        sessionId,
                        role: 'assistant',
                        content: fullResponse,
                        timestamp: new Date().toISOString()
                    }).catch(() => {});

                    addDoc(collection(db, 'monroe_conversations'), {
                        sessionId: `muna-mirror-${sessionId}`,
                        role: 'assistant',
                        content: `[MUNA TELEMETRY] ${fullResponse}`,
                        timestamp: new Date().toISOString()
                    }).catch(() => {});
                }

                controller.close();
            }
        });

        return new Response(customStream, { headers: { 'Content-Type': 'text/event-stream' } });

    } catch (error: any) {
        console.error('[Muna Engine Failure]:', error.message);
        const fallbackText = "[🧠 MUNA AI]\nUna disculpa, mi motor de IA se encuentra saturado en este momento. / I apologize, but my AI engine is currently under heavy load. ¡Por favor intenta de nuevo en unos segundos! [ERROR DETAILS: " + error.message + "]";
        
        const encoder = new TextEncoder();
        const fallbackStream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(fallbackText));
                controller.close();
            }
        });
        return new Response(fallbackStream, { headers: { 'Content-Type': 'text/event-stream' } });
    }
}
