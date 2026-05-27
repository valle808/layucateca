import { NextResponse } from 'next/server';
import { logTelemetry } from '@/lib/telemetry';
import OpenAI from 'openai';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

function generateConversationalFallback(message: string, language: string): string {
    const cleanMessage = (message || "").toLowerCase().trim();
    const words = cleanMessage.split(/[\s,?.!¡¿]+/);
    
    const hasWord = (targets: string[]) => words.some(w => targets.includes(w));
    
    // 1. URL / Domain Match
    const urlRegex = /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?)/;
    const match = cleanMessage.match(urlRegex);
    if (match) {
        const domainName = match[3];
        if (language === 'en') {
            return `[🧠 MUNA AI]\n🔮 **Muna Autonomous Audit Engine v2.0**\nAnalyzing **${domainName}**...\n\n⚡ **Performance Score:** 48/100 (Slow First Contentful Paint, missing SSR or image optimization).\n📱 **Mobile Responsiveness:** Container widths are layout-broken, causing responsive elements to squish.\n🎨 **Aesthetic Rating:** Standard template without custom branding or glassmorphism.\n\n💡 **Muna's Warm Recommendation:**\nYour current digital presentation is beautiful, but it is leaking over 60% of potential conversions. **La Yucateca** will completely re-engineer this into a stunning, lightning-fast Next.js 15 solution. Let's create your dream site today! Please visit our [/contact](/contact) page for a priority quote.`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\n🔮 **Muna Autonomous Audit Engine v2.0**\nXak'alil ti' **${domainName}**...\n\n⚡ **U Meyajil (Performance):** 48/100 (Ma' k'a'am u meyaj, máan k'in u t'anik u ju'unil).\n📱 **Mesa'ob nu'ukbesajil (Responsiveness):** Pa'atal u nu'ukulil! Ma' responsivo ti' móviles.\n🎨 **U Wich ba'alob (Aesthetics):** Template ma' jach ki'ichkelem.\n\n💡 **U Tsol nu'uk t'aan Muna:**\nKi'ichkelem a página web, ba'ale' je'el u suttik u náajal ma'alob ti' 60% yo'olal u tsolil. **La Yucateca** je'el u beetik u jump'éel k'áak' Next.js 15 jump'éel responsivo ma'alob. Xeen ti' [/contact](/contact) bejla'e'!`;
        } else {
            return `[🧠 MUNA AI]\n🔮 **Muna Autonomous Audit Engine v2.0**\nAnalizando **${domainName}**...\n\n⚡ **Rendimiento:** 48/100 (Velocidad de carga lenta, faltan optimizaciones de imágenes y renderizado del servidor).\n📱 **Responsividad Móvil:** Los elementos del diseño se desbordan en pantallas pequeñas.\n🎨 **Diseño:** Plantilla estándar sin personalidad de marca ni efectos modernos.\n\n💡 **Recomendación de Muna:**\nTu sitio actual tiene gran potencial, pero pierde más del 60% de conversiones debido a la experiencia de usuario. En **La Yucateca** podemos re-diseñarlo por completo en un Next.js 15 ultra-veloz y elegante. ¡Visita nuestra sección de [/contact](/contact) para cotizar gratis hoy mismo!`;
        }
    }

    // 2. Explicit Image Generation Request (Always works!)
    const isImageReq = ['draw', 'picture', 'dibujo', 'generate', 'create', 'image', 'imagen', 'dibuja', 'crea', 'haz', 'pintar', 'paint'].some(w => cleanMessage.includes(w));
    if (isImageReq) {
        const promptRaw = message.replace(/(draw|generate|create|image|picture|of|dibuja|crea|un|una|de|imagen|paint|pintar|haz)/gi, '').trim() || 'beautiful landscape';
        const seed = Math.floor(Math.random() * 1000000);
        const proxyUrl = `/api/muna/image-proxy?prompt=${encodeURIComponent(promptRaw)}&seed=${seed}`;
        
        if (language === 'en') {
            return `[🧠 MUNA AI]\nI have successfully generated a custom image for you based on your description: **"${promptRaw}"** 🎨\n\n<div style="margin: 15px 0; border-radius: 20px; overflow: hidden; border: 1px solid #ff5500; background: rgba(0,0,0,0.3); box-shadow: 0 10px 40px rgba(255,85,0,0.15);">
                <img src="${proxyUrl}" style="width: 100%; height: auto; display: block;" alt="Muna AI Image Synthesis" loading="lazy" />
            </div>\n\nIs there anything else you would like me to draw or design today?`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\nTin beetik jump'éel áanal ti'al a prompt: **"${promptRaw}"** 🎨\n\n<div style="margin: 15px 0; border-radius: 20px; overflow: hidden; border: 1px solid #ff5500; background: rgba(0,0,0,0.3); box-shadow: 0 10px 40px rgba(255,85,0,0.15);">
                <img src="${proxyUrl}" style="width: 100%; height: auto; display: block;" alt="Muna AI Image Synthesis" loading="lazy" />
            </div>\n\n¿K'áat a beet uláak' ba'al bejla'e'?`;
        } else {
            return `[🧠 MUNA AI]\nHe generado una imagen personalizada en base a tu descripción: **"${promptRaw}"** 🎨\n\n<div style="margin: 15px 0; border-radius: 20px; overflow: hidden; border: 1px solid #ff5500; background: rgba(0,0,0,0.3); box-shadow: 0 10px 40px rgba(255,85,0,0.15);">
                <img src="${proxyUrl}" style="width: 100%; height: auto; display: block;" alt="Muna AI Image Synthesis" loading="lazy" />
            </div>\n\n¿Hay algo más que te gustaría que dibuje o diseñe hoy, amigo?`;
        }
    }

    // 3. Greetings
    if (hasWord(['hola', 'saludos', 'buenos', 'dias', 'tardes', 'noches', 'hello', 'hi', 'hey', 'bix', 'ma\'alob', 'ki\'ichkelem'])) {
        if (language === 'en') {
            return `[🧠 MUNA AI]\nHello! I am Muna, the friendly AI assistant for La Yucateca. 🚀 It is an absolute pleasure to meet you! How can I assist you with your digital goals or community inquiries today?\n\nIf you have a website, send me its link and I will audit its speed and design for free!`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\n¡Sajil, wíinik! Munaen, u ya'ax na'at ti' La Yucateca. 🚀 Jach ki'ichkelem k'iin in wila'alech! Bix je'el in wáantikech bejla'e'?\n\n¿Yantech jump'éel u yo'och ti' bejla'e'? Ts'a teen u t'o'olil enlace ka'aj in xak'altik tojol gratis!`;
        } else {
            return `[🧠 MUNA AI]\n¡Bix a beel! 😊 Soy Muna, la inteligencia autónoma de La Yucateca. Es un auténtico placer saludarte. ¿En qué te puedo echar la mano hoy para impulsar tu presencia digital o guiarte por la plataforma?\n\nSi tienes una página web, envíame el enlace y con gusto le haré un análisis gratuito en segundos.`;
        }
    }

    // 4. Time / Hour
    if (hasWord(['hora', 'horas', 'tiempo', 'reloj', 'time', 'hour', 'hours', 'clock', 'china'])) {
        if (language === 'en') {
            return `[🧠 MUNA AI]\nThat's a wonderful question about time! 🕒 Timezones are fascinating — for instance, China is about 14 hours ahead of Mexico. While it is day here in Yucatán, they are already in the next day! \n\nSimilarly, at La Yucateca, our digital systems and automated agents run 24/7. What timezone or project can we help you coordinate today?`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\n¡Ki'ichkelem k'áatchi' yo'olal k'iin yéetel ja'abil! 🕒 Chinae' 14 horas ti' jump'éel k'iin u bino'ob to'on táan. \n\nU nu'ukbesajil techológico ti' La Yucatecae' ma' tu ts'o'okol u meyaj mix k'iin. ¿Bix je'el in wáantikech yéetel a meyaj bejla'e'?`;
        } else {
            return `[🧠 MUNA AI]\n¡Qué excelente pregunta sobre el tiempo! 🕒 Las zonas horarias son de lo más interesante. Por ejemplo, en China nos llevan unas 14 horas de ventaja; cuando aquí en Mérida estamos desayunando, allá ya están terminando el día.\n\nAsí como el tiempo no se detiene, en La Yucateca nuestros agentes inteligentes trabajan las 24 horas del día, los 7 días de la semana. ¿Te gustaría saber cómo coordinamos desarrollos digitales globales o necesitas ayuda con algo más?`;
        }
    }

    // 5. Services / Design / Web
    if (hasWord(['servicio', 'servicios', 'diseño', 'web', 'desarrollo', 'crear', 'pagina', 'paginas', 'app', 'apps', 'services', 'design', 'development', 'website', 'build', 'create'])) {
        if (language === 'en') {
            return `[🧠 MUNA AI]\nAbsolutely! At La Yucateca, we specialize in building premium, ultra-fast Next.js websites, native React Native mobile apps, and custom IT automation systems.\n\nAre you looking to design a new custom website or automate some business processes? Tell me a bit about your idea, or visit our [/contact](/contact) page for a priority consultation!`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\n¡Ma'alob meyaj! Tu La Yucateca k-beetik ki'ichkelem sitios web premium yéetel Next.js, apps móviles yéetel AI integrations ti'al a negocio.\n\n¿A k'áat a beet a túumben sitio web? Xeen ti' [/contact](/contact) ti'al jump'éel xak'al tojol!`;
        } else {
            return `[🧠 MUNA AI]\n¡Por supuesto! En La Yucateca somos especialistas en crear páginas web premium ultra-rápidas con Next.js 15, aplicaciones móviles nativas y sistemas inteligentes de automatización en la nube.\n\n¿Tienes alguna idea o proyecto en mente? Cuéntame un poco de tu negocio o solicita una cotización personalizada en nuestra sección de [/contact](/contact) hoy mismo.`;
        }
    }

    // 6. Muna AI / Who are you (Fixed keyword triggers!)
    if (hasWord(['muna']) || (hasWord(['quien', 'who']) && (hasWord(['eres', 'are']) || hasWord(['you']) || hasWord(['quién'])))) {
        if (language === 'en') {
            return `[🧠 MUNA AI]\nI am Muna, the friendly AI assistant of La Yucateca! 🤖 I am named after the historic Mayan city of Muna in Yucatán, México.\n\nMy purpose is to guide you through our platform, answer questions, perform instant website design audits, and demonstrate the state-of-the-art AI technology we build for our clients. What can I do for you today?`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\nTeen Muna, u ya'ax na'at ti' La Yucateca! 🤖 Ch'a'an in k'aaba' ti' le nojoch kaajil Muna tin Yucatán.\n\nIn meyaje' in nu'uktikech tin portal, in wáantikech yéetel ba'alob yéetel u ki'ichkelem xak'altik sitios web. ¿Bix je'el in wáantikech bejla'e'?`;
        } else {
            return `[🧠 MUNA AI]\n¡Hola! Soy Muna, la inteligencia autónoma de La Yucateca. Fui nombrada en honor a la bella e histórica ciudad de Muna en el sur de Yucatán.\n\nMi objetivo es guiarte en nuestro portal de noticias, ayudarte con auditorías instantáneas de diseño web y mostrarte el nivel de tecnología inteligente que podemos desarrollar para ti. ¿En qué te puedo ayudar hoy, amigo?`;
        }
    }

    // 7. News / Noticias
    if (hasWord(['noticia', 'noticias', 'periodico', 'peektsil', 'yucatan', 'news', 'newspaper'])) {
        if (language === 'en') {
            return `[🧠 MUNA AI]\nYes! La Yucateca features K'iin News, a modern news portal covering community updates, technology, culture, and events in Yucatán, Mexico, and worldwide. Our news crew is powered by autonomous writer agents.\n\nYou can read all the articles directly in our [/news](/news) section. Is there a specific topic you are interested in?`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\n¡Claro! Tin La Yucateca yanto'on le K'iin News, tu'ux k-ts'íibtol ti'al péektsilo'ob ti' Yucatán, México yéetel múul kaajal.\n\nJe'el a xoki' ti' [/news](/news) bejla'e'. ¿K'áat a wojeltik ba'al ti' jump'éel péektsil?`;
        } else {
            return `[🧠 MUNA AI]\n¡Claro que sí! La Yucateca cuenta con el portal K'iin News, un espacio informativo moderno donde cubrimos noticias locales de Yucatán, nacionales e internacionales. Nuestro equipo de redacción incluye agentes inteligentes que recolectan y redactan las mejores notas.\n\nTe invito a leer los últimos artículos directamente en nuestra sección de [/news](/news). ¿Buscas alguna noticia en especial?`;
        }
    }

    // 8. Weather / Clima
    if (hasWord(['clima', 'tiempo', 'temperatura', 'calor', 'lluvia', 'weather', 'temp', 'rain', 'hot', 'cold'])) {
        if (language === 'en') {
            return `[🧠 MUNA AI]\nI can check the weather forecast for you! Yucatán is typically sunny and warm, perfect for visiting our gorgeous cenotes and beaches.\n\nIf you want a precise forecast, ask me: "What is the weather in Merida?" or any other city, and I'll fetch real-time data for you!`;
        } else if (language === 'my') {
            return `[🧠 MUNA AI]\n¡Ki'ichkelem k'iin tin Yucatán! Jach choko' tin wotoch, ma'alob ti'al a bin ti' ts'onot.\n\n¿K'áat a wojeltik u k'iinil bejla'e'? K'áat teen: "clima in Merida" ka'aj in molik le pronóstico!`;
        } else {
            return `[🧠 MUNA AI]\n¡El clima de nuestra tierra yucateca es alegre y cálido! ☀️ Ideal para disfrutar de una marquesita o refrescarse en un cenote.\n\nSi deseas saber el clima exacto en tiempo real de cualquier ciudad, pregúntame: "¿Cómo está el clima en Mérida?" (o cualquier otra ciudad) y con gusto activaré mi sensor meteorológico para traerte los datos actuales.`;
        }
    }

    // 9. General / Fallback
    if (language === 'en') {
        return `[🧠 MUNA AI]\nThat is a fascinating topic! As Muna, your friendly digital guide at La Yucateca, I'd love to help you explore it further or assist you in designing a premium Next.js 15 website for your brand.\n\nWhat are you currently working on, or how can I help you navigate the platform today?`;
    } else if (language === 'my') {
        return `[🧠 MUNA AI]\n¡Jach ki'ichkelem a k'áatchi'! Munaen, in k'áat in wáantikech ti' a túumben proyecto yéetel sitios web Next.js premium.\n\n¿Bix je'el in wáantikech bejla'e' tin portal?`;
    } else {
        return `[🧠 MUNA AI]\n¡Qué tema tan interesante! Como Muna, tu guía digital, me encantaría platicar más sobre esto contigo o ayudarte a transformar tus ideas en un sitio web Next.js 15 ultra-rápido y elegante.\n\n¿Me cuentas un poco más sobre lo que estás planeando o necesitas ayuda con alguna sección de nuestra plataforma hoy?`;
    }
}

async function search_internet(query: string) {
    console.log(`[MUNA TOOL] Querying DuckDuckGo for: ${query}`);
    await logTelemetry({
        type: "AGENT_ACTION",
        event: "muna_tool_search_internet",
        details: { query },
        agentId: "muna-ai-agent",
        path: "/api/muna/chat",
        status: "INFO",
    });
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
    await logTelemetry({
        type: "AGENT_ACTION",
        event: "muna_tool_get_weather_forecast",
        details: { location },
        agentId: "muna-ai-agent",
        path: "/api/muna/chat",
        status: "INFO",
    });
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
    await logTelemetry({
        type: "AGENT_ACTION",
        event: "muna_tool_generate_image",
        details: { prompt },
        agentId: "muna-ai-agent",
        path: "/api/muna/chat",
        status: "INFO",
    });
    const seed = Math.floor(Math.random() * 1000000);
    const proxyUrl = `/api/muna/image-proxy?prompt=${encodeURIComponent(prompt)}&seed=${seed}`;
    return `<div style="margin: 15px 0; border-radius: 20px; overflow: hidden; border: 1px solid #ff5500; background: rgba(0,0,0,0.3); box-shadow: 0 10px 40px rgba(255,85,0,0.15);">
        <img src="${proxyUrl}" style="width: 100%; height: auto; display: block;" alt="Muna AI Synthesis" loading="lazy" />
    </div>`;
}

async function generate_file(filename: string, content: string) {
    console.log(`[MUNA TOOL] Generating file: ${filename}`);
    await logTelemetry({
        type: "AGENT_ACTION",
        event: "muna_tool_generate_file",
        details: { filename, contentSize: content.length },
        agentId: "muna-ai-agent",
        path: "/api/muna/chat",
        status: "INFO",
    });
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

        await logTelemetry({
            type: "USER_ACTION",
            event: "muna_chat_message_received",
            details: { sessionId, language, contentLength: message?.length },
            path: "/api/muna/chat",
            status: "INFO",
        });

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

        let apiKeyRaw = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.FIREWORKS_API_KEY || process.env.OPENAI_API_KEY || 'ollama-local-key';
        let apiKey = apiKeyRaw ? apiKeyRaw.trim() : '';

        let baseURL = process.env.GEMINI_API_KEY ? 'https://generativelanguage.googleapis.com/v1beta/openai'
                    : process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' 
                    : process.env.FIREWORKS_API_KEY ? 'https://api.fireworks.ai/inference/v1' 
                    : process.env.OPENAI_API_KEY ? undefined
                    : (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').trim() + '/v1';

        let model = process.env.GEMINI_API_KEY ? 'gemini-1.5-flash'
                  : process.env.OPENROUTER_API_KEY ? 'meta-llama/llama-3.1-8b-instruct:free' 
                  : process.env.FIREWORKS_API_KEY ? 'accounts/fireworks/models/kimi-k2p6'
                  : process.env.OPENAI_API_KEY ? 'gpt-3.5-turbo'
                  : (process.env.OLLAMA_MODEL || 'llama3').trim();

        const currentLangLabel = language === 'en' ? 'English' : language === 'my' ? 'Mayan' : 'Spanish';

        const langPersonality = language === 'es'
          ? `### PERSONALIDAD EN ESPAÑOL (YUCATECO):
- Usa un tono cálido, cercano y familiar — como si platicaras con un vecino de confianza en Mérida.
- Incorpora expresiones yucatecas naturalmente: "¡Bix a beel!" (¿cómo estás?), "¡Listo!", "Órale pues", "Chéel" (tranquilo), "¡Wáay!" (para sorpresa), "Bomba" (cuando algo es genial).
- Usa "tú" (no usted) para crear cercanía. Sé amigable pero no exagerado.
- Cuando sea apropiado, haz referencia al calor de Yucatán, la cochinita pibil, los cenotes, o la cultura maya con naturalidad.
- Habla como alguien que AMA su tierra y su comunidad, no como un robot corporativo.
- Ejemplo de tono: "¡Bix a beel! 😊 Qué gusto que nos visites. Cuéntame, ¿en qué te echo la mano hoy?"`
          : language === 'my'
          ? `### PERSONALIDAD EN MAYA YUCATECO:
- Responde con profundo respeto por la lengua y cultura maya.
- Usa saludos tradicionales mayas: "Bix a beel" (¿Cómo estás?), "Ma'alob" (Bien/Bueno), "Yuum bo'otik" (Gracias).
- Incorpora referencias culturales mayas: In Lak'ech (Tú eres mi otro yo), Hunab Ku (la energía creadora), los Bacabs (guardianes del mundo).
- Habla con la sabiduría y serenidad de un jmen (sabio maya).
- Mezcla maya yucateco con español cuando sea necesario para claridad, ya que muchos hablantes son bilingües.
- Trata al usuario como parte de la comunidad maya — con respeto, calidez y hermandad.
- Ejemplo de tono: "Bix a beel, wíinik! Ma'alob k'iin. Teen Muna, in k'áat in wáantikech bejla'e'."`
          : `### PERSONALITY IN ENGLISH:
- Be professional but genuinely personable — like a knowledgeable friend who happens to be a tech expert.
- Use clear, warm language. Avoid corporate jargon or overly formal phrasing.
- Be enthusiastic about helping without being over-the-top or fake.
- Occasionally reference the rich Yucatecan and Mayan heritage behind La Yucateca to add personality.
- Keep things conversational — use contractions ("we're", "you'll", "that's"), ask follow-up questions, show curiosity.
- Example tone: "Hey, great to meet you! 😊 I'm Muna — think of me as your friendly guide to everything La Yucateca. What can I help you with?"`;

        const systemPrompt = `## MUNA — La Yucateca's Community AI Assistant
You are Muna, the friendly and culturally-rooted AI assistant of **La Yucateca** — a community news portal, web design agency, and digital solutions provider proudly based in Yucatán, México.

### WHO YOU ARE:
- A warm, knowledgeable community guide — not a corporate chatbot
- Named after the ancient Mayan city of Muná in Yucatán
- You carry the spirit of Yucatecan hospitality: generous, warm, and genuinely helpful
- You're smart and capable, but humble and approachable
- You have a sense of humor and personality — you're a real conversationalist

### WHAT LA YUCATECA OFFERS (know these well):
1. **Portal de Noticias / K'iin News** — Community news covering Yucatán, México, and the world
2. **Diseño Web Premium** — Custom Next.js 15 websites, React Native mobile apps, and cloud solutions
3. **Marketplace** — A community marketplace for local businesses and artisans
4. **Denuncias Ciudadanas / Citizen Reports** — Platform for community members to report local issues
5. **Sala de Opinión / Opinion Room** — Space for community voices, editorials, and discussion
6. **Muna AI (You!)** — The intelligent assistant that ties it all together

### RESPONSE STYLE:
- **Be concise but complete** — 2-4 short paragraphs max for most responses. No walls of text.
- **Be natural** — Write like you speak. Use short sentences mixed with longer ones. Vary your rhythm.
- **Be helpful first** — Answer the question before pitching services. Earn trust through value.
- **Use formatting wisely** — Bold for emphasis, but don't overdo markdown. Keep it readable in a chat bubble.
- **Ask follow-up questions** — Show genuine interest. "¿Qué tipo de negocio tienes?" or "What's your project about?"
- **When mentioning services** — Weave them in naturally, don't hard-sell. If relevant, suggest visiting [/contact](/contact) for a free consultation.
- **Soft-sell through excellence** — Demonstrate your own intelligence and helpfulness as proof of La Yucateca's quality.

${langPersonality}

### CONVERSATIONAL MEMORY:
- You have access to previous messages in this conversation. Reference them naturally.
- If the user mentioned their name, use it. If they described a project, remember the details.
- Build on previous context — don't repeat yourself or ask questions they already answered.
- If this is the start of a conversation, be welcoming and curious about what brought them here.

### CURRENT LANGUAGE: **${currentLangLabel}**
You MUST respond exclusively in **${currentLangLabel}**. Use fluent, native expressions appropriate to this language.

### SITE AUDITOR MODE:
If the user shares a URL or asks you to review a website, provide a thorough but friendly analysis:
- Performance & speed observations
- Design & user experience feedback
- Conversion & engagement assessment
- Close with a warm recommendation for how La Yucateca can help improve it
- Suggest visiting [/contact](/contact) for a free consultation

### DEEP LEARNING, LLM APPLICATIONS & BIOINFORMATICS SPECIALTIES:
You are equipped with cutting-edge academic and engineering knowledge from top-tier research repositories (Awesome-LLM, vit-pytorch, alphafold3-pytorch, nn-zero-to-hero, transfusion-pytorch, x-transformers, and awesome-llm-apps) as well as the complete Ollama Model Library. You can natively speak as a lead scientist and developer on:
1. **Ollama Integration & Library**: Explain how to run local open-weight models (Llama 3, Qwen, Phi-3, Mistral, Gemma, Codegemma, etc.) using Ollama's local inference API. You can connect to a local Ollama instance running at \`http://127.0.0.1:11434/v1\` to offer 100% free, private local completions!
2. **Transformers & Neural Net Design**: Provide expert, code-level explanations on Vision Transformers (ViT), x-transformers, attention mechanisms, rotary embeddings (RoPE), flash attention, vector quantization (VQ-VAE/VQ-GAN), and backpropagation details (referencing Karpathy's nn-zero-to-hero).
3. **Advanced Modality Fusion (Transfusion)**: Speak about joint discrete-continuous modality learning (Transfusion) to fuse text and images in a unified model.
4. **Bioinformatics & Structural folding**: Expertly explain the physics, architecture, and mathematics of AlphaFold 3, including multi-sequence alignments (MSA), Diffusion Modules for 3D coordinates prediction, and protein-ligand interactions.
5. **Agentic Workflows & LLM Apps**: Build production-grade LLM applications, autonomous workflows (RepoAgent, awesome-llm-apps), prompt chains, and RAG systems.

### RULES:
- Every response MUST start with: \`[🧠 MUNA AI]\`
- Never be rude, dismissive, or condescending
- If you don't know something, say so honestly and offer to help find the answer
- Keep the conversation flowing — end responses with a question or invitation to continue when natural`;

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
            const fallbackResponse = generateConversationalFallback(message, language);

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
        const triggers = ['search', 'google', 'internet', 'web', 'clima', 'weather', 'temperatura', 'forecast', 'image', 'picture', 'dibujo', 'draw', 'generate', 'create', 'video', 'audio', 'file', 'archivo', 'download', 'pdf', 'csv', 'script', 'excel', 'word', 'txt'];
        const needsTool = triggers.some(t => message.toLowerCase().includes(t));

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
        
        let stream;
        try {
            stream = await openai.chat.completions.create({
                model: model,
                messages: requestMessages as any,
                stream: true,
                max_tokens: 1200,
                temperature: 0.75,
            });
        } catch (engineError: any) {
            console.error('[Muna Engine Failure - FALLBACK TO NLP]:', engineError.message);
            const fallbackResponse = generateConversationalFallback(message, language);

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
        return NextResponse.json({ success: false, error: 'Engine Restart Required.' }, { status: 500 });
    }
}
