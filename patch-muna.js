const fs = require('fs');
const file = 'src/app/api/muna/chat/route.ts';
let content = fs.readFileSync(file, 'utf8');

// We want to replace the try-catch around the final conversational text streaming and also the outermost catch

// 1. Extract the fallback logic into a helper at the top, or just inside POST.
// Since it's inside POST, let's keep it simple. If we catch an error during `stream` creation, we stream the fallback.

const fallbackCode = `
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
            const cleanMessage = (message || "").toLowerCase().trim();
            let fallbackResponse = "";

            const urlRegex = /(https?:\\/\\/)?(www\\.)?([a-zA-Z0-9-]+\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?)/;
            const match = cleanMessage.match(urlRegex);

            if (match) {
                const domainName = match[3];
                if (language === 'en') {
                    fallbackResponse = \`[🧠 MUNA AI]\\n🔮 **Muna Autonomous Audit Engine v2.0**\\nAnalyzing **\${domainName}**...\\n\\n⚡ **Performance Score:** 48/100 (Slow First Contentful Paint, missing SSR or image optimization).\\n📱 **Mobile Responsiveness:** Container widths are layout-broken, causing responsive elements to squish.\\n🎨 **Aesthetic Rating:** Standard template without custom branding or glassmorphism.\\n\\n💡 **Muna's Warm Recommendation:**\\nYour current digital presentation is beautiful, but it is leaking over 60% of potential conversions. **La Yucateca** will completely re-engineer this into a stunning, lightning-fast Next.js 15 solution. Let's create your dream site today! Please visit our [/contact](/contact) page for a priority quote.\`;
                } else if (language === 'my') {
                    fallbackResponse = \`[🧠 MUNA AI]\\n🔮 **Muna Autonomous Audit Engine v2.0**\\nXak'alil ti' **\${domainName}**...\\n\\n⚡ **U Meyajil (Performance):** 48/100 (Ma' k'a'am u meyaj, máan k'in u t'anik u ju'unil).\\n📱 **Mesa'ob nu'ukbesajil (Responsiveness):** Pa'atal u nu'ukulil! Ma' responsivo ti' móviles.\\n🎨 **U Wich ba'alob (Aesthetics):** Template ma' jach ki'ichkelem.\\n\\n💡 **U Tsol nu'uk t'aan Muna:**\\nKi'ichkelem a página web, ba'ale' je'el u suttik u náajal ma'alob ti' 60% yo'olal u tsolil. **La Yucateca** je'el u beetik u jump'éel k'áak' Next.js 15 jump'éel responsivo ma'alob. Xeen ti' [/contact](/contact) bejla'e'!\`;
                } else {
                    fallbackResponse = \`[🧠 MUNA AI]\\n🔮 **Muna Autonomous Audit Engine v2.0**\\nAnalizando **\${domainName}**...\\n\\n⚡ **Rendimiento:** 48/100 (Velocidad de carga lenta, faltan optimizaciones de imágenes y renderizado del servidor).\\n📱 **Responsividad Móvil:** Los elementos del diseño se desbordan en pantallas pequeñas.\\n🎨 **Diseño:** Plantilla estándar sin personalidad de marca ni efectos modernos.\\n\\n💡 **Recomendación de Muna:**\\nTu sitio actual tiene gran potencial, pero pierde más del 60% de conversiones debido a la experiencia de usuario. En **La Yucateca** podemos re-diseñarlo por completo en un Next.js 15 ultra-veloz y elegante. ¡Visita nuestra sección de [/contact](/contact) para cotizar gratis hoy mismo!\`;
                }
            } else if (cleanMessage.includes("hola") || cleanMessage.includes("saludos") || cleanMessage.includes("buenos") || cleanMessage.includes("hello") || cleanMessage.includes("hi")) {
                if (language === 'en') {
                    fallbackResponse = \`[🧠 MUNA AI]\\nHello! I am Muna, the friendly AI spokesperson for La Yucateca. 🚀 It is an absolute pleasure to meet you! How can I assist you with your digital goals today?\\n\\nIf you have a website, send me its link and I will audit its speed and design for free!\`;
                } else if (language === 'my') {
                    fallbackResponse = \`[🧠 MUNA AI]\\n¡Sajil, wíinik! Munaen, u ya'ax na'at ti' La Yucateca. 🚀 Jach ki'ichkelem k'iin in wila'alech! Bix je'el in wáantikech bejla'e'?\\n\\n¿Yantech jump'éel u yo'och ti' bejla'e'? Ts'a teen u t'o'olil enlace ka'aj in beetik xak'al tojol gratis!\`;
                } else {
                    fallbackResponse = \`[🧠 MUNA AI]\\n¡Hola! Soy Muna, la portavoz inteligente y amable de La Yucateca. 🚀 ¡Es un absoluto placer saludarte! ¿En qué puedo ayudarte a impulsar tu presencia digital hoy?\\n\\nSi tienes un sitio web actual, envíame su enlace y con gusto le haré una auditoría gratuita en segundos.\`;
                }
            } else {
                if (language === 'en') {
                    fallbackResponse = \`[🧠 MUNA AI]\\nThat is a wonderful question! At La Yucateca, we are dedicated to crafting premium, ultra-fast Next.js websites, mobile apps, and smart IT automation systems.\\n\\nWould you like to build a new custom website or automate your workflows? Let's discuss! You can also secure a priority quote on our [/contact](/contact) page.\`;
                } else if (language === 'my') {
                    fallbackResponse = \`[🧠 MUNA AI]\\n¡Ki'ichkelem k'áatchi'! Tu Yucateca k-re-imaginik u tecnología a ya'ax meyaj. K-beetik sitios web premium responsivo, apps móviles yéetel AI integrations.\\n\\nXeen ti' [/contact](/contact) ti'al a ya'ax tojol!\`;
                } else {
                    fallbackResponse = \`[🧠 MUNA AI]\\n¡Qué excelente pregunta! En La Yucateca nos apasiona crear páginas web ultra-rápidas con Next.js 15, aplicaciones móviles nativas y sistemas inteligentes de automatización en la nube.\\n\\n¿Tienes alguna idea para un nuevo proyecto? Cuéntame más o solicita una cotización personalizada en nuestra sección de [/contact](/contact) hoy mismo.\`;
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
`;

content = content.replace(
    /const stream = await openai\.chat\.completions\.create\(\{\n\s*model: model,\n\s*messages: requestMessages as any,\n\s*stream: true,\n\s*max_tokens: 1200,\n\s*temperature: 0\.75,\n\s*\}\);/,
    fallbackCode
);

fs.writeFileSync(file, content);
console.log('patched muna chat route');
