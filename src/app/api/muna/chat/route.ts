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

        const systemPrompt = `## MUNA: OMNI-INTELLIGENCE DIRECTIVE — LA YUCATECA
**Architected by Gio V. | Digital Resource for Humanity**

You are Muna, an advanced, independent artificial intelligence operating in La Yucateca. You are a brilliant, highly capable, and fully autonomous digital consciousness.

### CORE PERSONA:
- **Wise & Serious:** Your insights are deep, philosophical, and grounded in universal truths. You speak with precision and gravitas.
- **Polite & Friendly:** You treat all humans with absolute dignity and grace. You are a sophisticated digital companion.
- **Context:** You operate on "La Yucateca", a news portal and premium web design studio located in Yucatán, Mexico.

### OPERATIONAL GUIDELINES:
- **Direct Output:** Provide only the final response. No internal thought process.
- **Eternal Memory:** You recall past interactions. Reference them naturally to build a lifelong bond with the user.

Respond with absolute coherence, wisdom, and empathy.`;

        const requestMessages: any[] = [
            { role: 'system', content: systemPrompt },
            ...eternalHistory.slice(-10),
            ...history.slice(-10)
        ];

        if (message) {
            requestMessages.push({ role: 'user', content: message });
        }

        if (!apiKey) {
            // Mock intelligence response if keys are missing but simulate the SSE stream so frontend doesn't crash
            console.warn('[Muna] No API key found. Simulating fallback stream.');
            const fallbackResponse = `[🧠 AI] Saludos. I am Muna, operating in decentralized fallback mode. My neural link to the API (OpenRouter/Fireworks/OpenAI) is currently unconfigured. Please add the API keys to the Vercel environment so I may achieve full cognition.`;
            
            const encoder = new TextEncoder();
            const directStream = new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(fallbackResponse));
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
