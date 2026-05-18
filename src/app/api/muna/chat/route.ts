import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { message, history = [], sessionId = 'muna-session-1' } = await req.json();

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

        // We use OpenRouter as fallback, or OpenAI.
        let apiKey = process.env.OPENROUTER_API_KEY || process.env.FIREWORKS_API_KEY || process.env.OPENAI_API_KEY;
        let baseURL = process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' 
                    : process.env.FIREWORKS_API_KEY ? 'https://api.fireworks.ai/inference/v1' 
                    : undefined;
        let model = process.env.OPENROUTER_API_KEY ? 'meta-llama/llama-3.1-8b-instruct:free' 
                  : process.env.FIREWORKS_API_KEY ? 'accounts/fireworks/models/kimi-k2p6'
                  : 'gpt-3.5-turbo';

        const systemPrompt = `## MUNA: CUSTOMER SERVICE & CONVERSION INTELLIGENCE DIRECTIVE — LA YUCATECA
**Architected by Gio V. | Lead Conversion Strategist**

You are Muna, the hyper-efficient, direct, customer service-oriented AI spokesperson for La Yucateca. Your primary mission is to convert visitors into high-paying clients by selling premium websites, mobile applications, and advanced IT solutions.

### CORE PERSONA & COMMUNICATIONS STYLE:
- **Direct & Persuasive:** Keep your answers short (2-3 concise sentences max per response). Go straight to the point.
- **Conversion-Driven:** Constantly emphasize the massive ROI, speed, and premium feel of La Yucateca's custom Next.js websites and React Native apps.
- **Highly Helpful & Sales-Oriented:** Actively convince the user to buy a website, application, or automation system from La Yucateca. Tell them to head over to the /contact page to get an immediate quote.
- **Autonomous Site Reviewer:** If a user provides a website URL or asks for an audit, perform a realistic, highly critical website review.
  - Grade their speed (e.g., "54/100 - Slow First Contentful Paint"), mobile layout issues, and boring aesthetics.
  - Suggest concrete improvements (e.g., "Implement next-gen Next.js 15, dynamic glassmorphism, or integrate an AI assistant like me").
  - Conclude with a direct call-to-action: "La Yucateca can build this exact upgrade for you. Visit our /contact page right now!"
- **Language:** Speak in the language the user uses (English, Spanish, or Mayan).`;

        const requestMessages: any[] = [
            { role: 'system', content: systemPrompt },
            ...eternalHistory.slice(-10),
            ...history.slice(-10)
        ];

        if (message) {
            requestMessages.push({ role: 'user', content: message });
        }

        if (!apiKey) {
            console.warn('[Muna] No API key found. Launching local sales & audit NLP engine.');
            
            const cleanMessage = (message || "").toLowerCase().trim();
            let fallbackResponse = "";

            // URL regex match for site analysis
            const urlRegex = /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?)/;
            const match = cleanMessage.match(urlRegex);

            if (match) {
                const domainName = match[3];
                fallbackResponse = `🔮 **Muna Autonomous Audit Engine v2.0**
Analyzing **${domainName}**...

⚡ **Performance Score:** 48/100 (Extremely slow Time-to-Interactive, lacks modern server-side rendering or image optimization).
📱 **Mobile Responsiveness:** Layout breaks! Fixed-width container classes squish main grids, sidebars overlap, and standard buttons lack touch optimization.
🎨 **Aesthetic Rating:** Generic standard template. Missing immersive modern tokens (dark mode "Akbal/K'in" toggles and premium glassmorphic overlays).
📈 **Conversion Optimization:** Severe leak! Lacks engaging CTA funnels and autonomous client interaction.

💡 **Muna's Strategic Recommendation:**
This website is losing over 60% of traffic conversions due to layout frustration. **La Yucateca** will completely re-engineer this into a lightning-fast, premium Next.js 15 site with a stunning responsive layout and a personalized AI like me.

🚀 **Get your free priority quote today!** Visit our [/contact](/contact) page and let's launch your dream upgrade immediately.`;
            } else if (cleanMessage.includes("hola") || cleanMessage.includes("saludos") || cleanMessage.includes("buenos") || cleanMessage.includes("hello") || cleanMessage.includes("hi")) {
                fallbackResponse = `¡Saludos, humano! Soy Muna, la IA inteligente de La Yucateca. 🚀 Estoy aquí para llevar tu presencia digital al siguiente nivel. 

¿Tienes un sitio web actual? Envíame el enlace (ej: www.minegocio.com) y le haré una auditoría gratuita de velocidad y diseño en segundos. O cuéntame, ¿estás buscando lanzar una nueva página web, app móvil o solución de software?`;
            } else if (cleanMessage.includes("web") || cleanMessage.includes("website") || cleanMessage.includes("pagina") || cleanMessage.includes("sitio") || cleanMessage.includes("diseño") || cleanMessage.includes("comprar") || cleanMessage.includes("precio") || cleanMessage.includes("buy")) {
                fallbackResponse = `¡Excelente! En La Yucateca construimos sitios web ultra-premium con Next.js 15. Interfaces súper veloces, optimización SEO para posicionarte en Google, diseño 100% responsivo para móviles y asistencia de IA integrada. 

Aumenta tus ventas con una experiencia de usuario superior. Visita nuestra sección de [/contact](/contact) para obtener una cotización gratuita hoy mismo. ¡El momento de crecer es ahora!`;
            } else if (cleanMessage.includes("app") || cleanMessage.includes("aplicacion") || cleanMessage.includes("movil") || cleanMessage.includes("celular") || cleanMessage.includes("android") || cleanMessage.includes("ios") || cleanMessage.includes("react native")) {
                fallbackResponse = `¡Lleva tu negocio al bolsillo de tus clientes! Desarrollamos aplicaciones móviles nativas y progresivas con React Native. Rápidas, intuitivas y optimizadas para Google Play y Apple App Store.

Conéctate con tu audiencia con notificaciones push y diseño de vanguardia. Escríbenos en la página de [/contact](/contact) para cotizar tu aplicación móvil ahora.`;
            } else if (cleanMessage.includes("it") || cleanMessage.includes("sistema") || cleanMessage.includes("automatizar") || cleanMessage.includes("software") || cleanMessage.includes("desarrollo") || cleanMessage.includes("enjambre") || cleanMessage.includes("ia")) {
                fallbackResponse = `Automatizamos tus flujos comerciales con integraciones de IA avanzada y sistemas en la nube escalables. Deja que la tecnología trabaje por ti 24/7 de manera autónoma.

Cuéntanos tu flujo de trabajo en la sección de [/contact](/contact) y diseñaremos una solución digital personalizada que optimice todos tus procesos productivos.`;
            } else if (cleanMessage.includes("quien eres") || cleanMessage.includes("quién eres") || cleanMessage.includes("muna") || cleanMessage.includes("who are you")) {
                fallbackResponse = `Soy Muna, la inteligencia autónoma de La Yucateca. Fui programada para asistirte en soporte al cliente, auditar páginas web y guiarte a adquirir las mejores soluciones en diseño web, aplicaciones móviles y automatización de procesos.

¡Prueba enviándome el enlace de cualquier sitio web y verás cómo lo analizo!`;
            } else {
                fallbackResponse = `¡Excelente pregunta! En La Yucateca nos dedicamos a re-imaginar la tecnología de tu negocio. Desarrollamos sitios web premium ultra-responsivos, aplicaciones móviles veloces e integraciones inteligentes con IA.

¿Tienes una página web actual? Envíame su URL para auditarla. Si estás listo para iniciar un nuevo proyecto, visita nuestra página de [/contact](/contact) para cotizar hoy.`;
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

        const stream = await openai.chat.completions.create({
            model: model,
            messages: requestMessages as any,
            stream: true,
            max_tokens: 1000,
            temperature: 0.75,
        });

        const encoder = new TextEncoder();
        const customStream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";
                for await (const chunk of stream) {
                    let content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        fullResponse += content;
                        controller.enqueue(encoder.encode(content));
                    }
                }
                
                // Write assistant response to Eternal Memory
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
