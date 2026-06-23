import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL is not set");
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database with trilingual Spanish/English/Mayan content across Mexican states...");

  // Clear existing items
  await prisma.post.deleteMany({});
  await prisma.portfolioItem.deleteMany({});

  // Seed 6 bilingual portfolio items
  await prisma.portfolioItem.createMany({
    data: [
      {
        title: "Plantilla de Portafolio Aura Creative Agency || Aura Creative Agency Portfolio Template",
        slug: "aura-creative-agency-portfolio",
        description: "Un portafolio premium de tema oscuro, diseñado para estudios creativos y directores de arte digital. Incluye controles CMS integrados, cuadrículas dinámicas de mampostería y efectos de desenfoque de cristal. || A dark-themed, premium design portfolio tailored for luxury branding studios and creative web directors. Built with fully integrated CMS controls, dynamic masonry grids, and smooth glassmorphism containers.",
        imageUrl: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=800&q=80",
        liveUrl: "https://aura-design-demo.vercel.app",
        price: 1850.0,
        published: true,
      },
      {
        title: "Página de Inicio de E-Commerce de Lujo Solstice || Solstice Luxury E-Commerce Landing Page",
        slug: "solstice-luxury-ecommerce-landing",
        description: "Un diseño web sumamente sofisticado elaborado para exhibir accesorios de alta gama. Con elegantes acentos dorados, transiciones rápidas de carrito y estructuras pensadas para convertir clientes premium. || A highly sophisticated e-commerce layout crafted to showcase boutique accessories. Featuring modern gold and velvet accents, fast shopping cart states, and tailored layouts designed to convert high-net-worth consumers.",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
        liveUrl: "https://solstice-luxury-demo.vercel.app",
        price: 2400.0,
        published: true,
      },
      {
        title: "Sistema de Portafolio y Blog Vertex para Desarrolladores || Vertex Developer Portfolio & Tech Blog System",
        slug: "vertex-developer-portfolio-tech-blog",
        description: "Una interfaz minimalista y ultra limpia diseñada para ingenieros de software senior. Ofrece resaltado de código integrado, generación ultra rápida de artículos estáticos y formularios funcionales de contacto. || A ultra-clean, minimalist tech blogging interface and portfolio built for senior software engineers. Features integrated syntax highlighting, lightning-fast static page generation, and standard contact forms.",
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
        liveUrl: "https://vertex-dev-demo.vercel.app",
        price: 1250.0,
        published: true,
      },
      {
        title: "Portal Inmobiliario Exclusivo Zenith || Zenith Premium Real Estate Portal Template",
        slug: "zenith-premium-real-estate-portal",
        description: "Una plantilla de corretaje de propiedades inmobiliarias de lujo, con filtros de búsqueda avanzados, galerías de imágenes de alta fidelidad y mapas dinámicos interactivos integrados. || A luxury real estate brokerage template featuring advanced search filter interfaces, high-fidelity gallery sliders, and seamlessly integrated interactive property maps.",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
        liveUrl: "https://zenith-estate-demo.vercel.app",
        price: 3100.0,
        published: true,
      },
      {
        title: "Interfaz de Panel Nova SaaS y Analytics || Nova SaaS Dashboard & Analytics Interface",
        slug: "nova-saas-dashboard-analytics",
        description: "Un panel de control web para aplicaciones web empresariales. Incluye gráficos interactivos en tiempo real, integraciones con pasarelas de pago y configuraciones avanzadas de seguridad en modo oscuro. || A masterclass web dashboard designed for enterprise scale SaaS applications. Complete with interactive real-time analytics graphs, payment gateway setups, and high-level dark mode UI.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        liveUrl: "https://nova-saas-demo.vercel.app",
        price: 2850.0,
        published: true,
      },
      {
        title: "Página de Estilo de Vida Bloom Boutique || Bloom Boutique Lifestyle & Beauty Landing Page",
        slug: "bloom-boutique-lifestyle-landing",
        description: "Un sitio web sumamente estético diseñado para marcas de cosméticos y bienestar de lujo. Con layouts asimétricos modernos, fuentes elegantes de Google Fonts y efectos de scroll parallax premium. || A highly aesthetic lifestyle showcase built for luxury cosmetic and wellness brands. Featuring dynamic asymmetric layout grids, elegant Google Fonts, and premium parallax scrolling elements.",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        liveUrl: "https://bloom-boutique-demo.vercel.app",
        price: 1950.0,
        published: true,
      },
      {
        title: "WhatsApp Automation Studio",
        slug: "whatsapp-automation-studio",
        description: "Automatización profesional de WhatsApp Web para mensajes rápidos y sencillos. Aplicación de escritorio con interfaz gráfica en Python. || Professional WhatsApp Web automation for seamless messaging. Desktop application with a beautiful Python GUI.",
        imageUrl: "/whatsapp-automation.png",
        liveUrl: "https://github.com/SohanRaidev/WhatsApp-Automation-Studio",
        price: null,
        published: true,
      },
    ],
  });

  // Seed 6 rich trilingual news posts across Mexican states (with mockup videos!)
  await prisma.post.createMany({
    data: [
      {
        title: "Mérida se consolida como el Hub Tecnológico más seguro de Latinoamérica || Mérida solidifies its position as Latin America's safest Tech Hub || Mérida ts'o'ok u p'áatal u yáax meyajil tecnología ti' América Latina",
        slug: "merida-hub-tecnologico-seguro-latam",
        content: `La capital de Yucatán ha registrado una inversión histórica de más de 300 millones de dólares en infraestructura de fibra óptica y centros de investigación digital durante el último año. Gracias a sus extraordinarios niveles de seguridad pública y calidad de vida, Mérida se ha convertido en el destino predilecto para programadores internacionales y startups de inteligencia artificial.

Las autoridades locales han anunciado un nuevo fondo de coinversión para acelerar el talento de ingeniería web en la región. || The capital of Yucatán has recorded a historical investment of over 300 million dollars in fiber-optic infrastructure and digital research centers over the past year. Thanks to its extraordinary public safety records and premium quality of life, Mérida has become the preferred choice for international developers and AI startups looking to set up regional hubs.

Local authorities have announced a co-investment fund to accelerate web engineering talent. || Le kajil Mérida ts'o'ok u ch'a'ik ya'ab u ta'ak'in ti'al u patik najilo'ob tecnología yéetel fibra óptica. Tuláakal máak ki'imak u yóol tu'ux ku yantal kajtalil ya'ab u jats'utsil luum yéetel jets'óolal. Le jala'ach ts'o'ok u k'áatik u t'oxik meyaj ti'al túumben programadores bilingües.

La región ha experimentado un crecimiento acelerado gracias a las nuevas políticas de inversión extranjera directa, lo que ha generado miles de empleos en el sector tecnológico y de servicios. Las empresas internacionales están buscando expandir sus horizontes hacia el sureste mexicano.

El desarrollo de infraestructura ha sido clave. La construcción de nuevas vías de transporte y la ampliación de la red de fibra óptica permiten a los negocios locales operar a niveles competitivos globales, atrayendo a inversionistas de primer nivel.

Además, la riqueza cultural y gastronómica de la zona ofrece una excelente calidad de vida, combinando la tradición milenaria con la vanguardia tecnológica. Esto resulta muy atractivo para los nómadas digitales y profesionales remotos.

Se espera que en los próximos años, los proyectos de energía renovable complementen esta expansión, asegurando un desarrollo sustentable y un compromiso real con el cuidado del medio ambiente y los ecosistemas locales.

Las autoridades continúan trabajando de la mano con la iniciativa privada para garantizar que este progreso sea equitativo y beneficie a todas las comunidades, promoviendo la educación digital en las escuelas rurales.

The region has experienced accelerated growth thanks to new foreign direct investment policies, which have generated thousands of jobs in the technology and services sectors. International companies are looking to expand their horizons toward southeastern Mexico.

Infrastructure development has been key. The construction of new transportation routes and the expansion of the fiber optic network allow local businesses to operate at global competitive levels, attracting top-tier investors.

Furthermore, the cultural and gastronomic wealth of the area offers an excellent quality of life, combining ancient tradition with technological avant-garde. This is very attractive to digital nomads and remote professionals.

It is expected that in the coming years, renewable energy projects will complement this expansion, ensuring sustainable development and a real commitment to caring for the environment and local ecosystems.

Authorities continue to work hand in hand with the private sector to ensure that this progress is equitable and benefits all communities, promoting digital education in rural schools.`,
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        state: "Yucatán",
        category: "Local",
        published: true,
      },
      {
        title: "Restauración histórica de la Muralla de Campeche impulsa turismo cultural || Campeche Historic Wall restoration sparks major cultural tourism boom || U túumbenil restauración ti' le pak'il Campeche ku ts'áaik jats'uts t'oxil",
        slug: "restauracion-muralla-campeche-turismo",
        content: `El gobierno del estado de Campeche, en conjunto con el INAH, ha completado la fase final de restauración de las históricas murallas coloniales, Patrimonio de la Humanidad. El proyecto de conservación preserva los antiguos baluartes defensivos piratas y añade un moderno sistema de iluminación interactiva 100% ecológico para visitas nocturnas.

Los hoteleros reportan una ocupación récord del 85%. || The state government of Campeche, in collaboration with INAH, has completed the final restoration phase of the colonial fortifications, a certified UNESCO World Heritage site. The conservation project preserves the historic pirate defense ramparts while adding a modern, eco-friendly interactive night lighting experience for walking tours.

Local hotel operators report a record 85% occupancy rate. || Le jala'ach ti' Campeche yéetel INAH ts'o'ok u ts'o'oksik u patik u jats'utsil le colonial pak'il ku kanik u k'aba' ti' UNESCO. Le k'exo'ob ku ts'áaik jump'éel jats'uts sáasil ti'al le áak'ab xíimbal.

La región ha experimentado un crecimiento acelerado gracias a las nuevas políticas de inversión extranjera directa, lo que ha generado miles de empleos en el sector tecnológico y de servicios. Las empresas internacionales están buscando expandir sus horizontes hacia el sureste mexicano.

El desarrollo de infraestructura ha sido clave. La construcción de nuevas vías de transporte y la ampliación de la red de fibra óptica permiten a los negocios locales operar a niveles competitivos globales, atrayendo a inversionistas de primer nivel.

Además, la riqueza cultural y gastronómica de la zona ofrece una excelente calidad de vida, combinando la tradición milenaria con la vanguardia tecnológica. Esto resulta muy atractivo para los nómadas digitales y profesionales remotos.

Se espera que en los próximos años, los proyectos de energía renovable complementen esta expansión, asegurando un desarrollo sustentable y un compromiso real con el cuidado del medio ambiente y los ecosistemas locales.

Las autoridades continúan trabajando de la mano con la iniciativa privada para garantizar que este progreso sea equitativo y beneficie a todas las comunidades, promoviendo la educación digital en las escuelas rurales.

The region has experienced accelerated growth thanks to new foreign direct investment policies, which have generated thousands of jobs in the technology and services sectors. International companies are looking to expand their horizons toward southeastern Mexico.

Infrastructure development has been key. The construction of new transportation routes and the expansion of the fiber optic network allow local businesses to operate at global competitive levels, attracting top-tier investors.

Furthermore, the cultural and gastronomic wealth of the area offers an excellent quality of life, combining ancient tradition with technological avant-garde. This is very attractive to digital nomads and remote professionals.

It is expected that in the coming years, renewable energy projects will complement this expansion, ensuring sustainable development and a real commitment to caring for the environment and local ecosystems.

Authorities continue to work hand in hand with the private sector to ensure that this progress is equitable and benefits all communities, promoting digital education in rural schools.`,
        imageUrl: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        state: "Campeche",
        category: "Cultura",
        published: true,
      },
      {
        title: "Tulum lidera la transición hacia un ecoturismo tecnológico sostenible || Tulum leads transition towards smart sustainable eco-tourism || Tulum ku nu'uktik eco-turismo yéetel tecnología ti'al u kanik le luum",
        slug: "tulum-ecoturismo-tecnologico-sostenible",
        content: `Quintana Roo se encuentra a la vanguardia de la sustentabilidad hotelera. Hoteles boutique en Tulum y Cancún han implementado microrredes de energía solar avanzadas acompañadas de plantas potabilizadoras que procesan agua pluvial mediante sensores de inteligencia artificial.

Esta modernización responde a la creciente demanda de viajeros 'premium'. || Quintana Roo is leading the hotel sustainability frontier. Boutique resorts in Tulum and Cancún have rolled out custom solar microgrids and smart rainwater treatment plants monitored by real-time AI sensors.

This modernization addresses a high surge of premium digital nomads. || Hoteles boutique ti' Tulum yéetel Cancún ts'o'ok u patiko'ob paneles solares yéetel ja' ku ch'a'ik u ya'alil le k'áax yéetel Inteligencia Artificial. Le digital nómadas ku ya'aliko'ob ku meyaj jach ma'alob.

La región ha experimentado un crecimiento acelerado gracias a las nuevas políticas de inversión extranjera directa, lo que ha generado miles de empleos en el sector tecnológico y de servicios. Las empresas internacionales están buscando expandir sus horizontes hacia el sureste mexicano.

El desarrollo de infraestructura ha sido clave. La construcción de nuevas vías de transporte y la ampliación de la red de fibra óptica permiten a los negocios locales operar a niveles competitivos globales, atrayendo a inversionistas de primer nivel.

Además, la riqueza cultural y gastronómica de la zona ofrece una excelente calidad de vida, combinando la tradición milenaria con la vanguardia tecnológica. Esto resulta muy atractivo para los nómadas digitales y profesionales remotos.

Se espera que en los próximos años, los proyectos de energía renovable complementen esta expansión, asegurando un desarrollo sustentable y un compromiso real con el cuidado del medio ambiente y los ecosistemas locales.

Las autoridades continúan trabajando de la mano con la iniciativa privada para garantizar que este progreso sea equitativo y beneficie a todas las comunidades, promoviendo la educación digital en las escuelas rurales.

The region has experienced accelerated growth thanks to new foreign direct investment policies, which have generated thousands of jobs in the technology and services sectors. International companies are looking to expand their horizons toward southeastern Mexico.

Infrastructure development has been key. The construction of new transportation routes and the expansion of the fiber optic network allow local businesses to operate at global competitive levels, attracting top-tier investors.

Furthermore, the cultural and gastronomic wealth of the area offers an excellent quality of life, combining ancient tradition with technological avant-garde. This is very attractive to digital nomads and remote professionals.

It is expected that in the coming years, renewable energy projects will complement this expansion, ensuring sustainable development and a real commitment to caring for the environment and local ecosystems.

Authorities continue to work hand in hand with the private sector to ensure that this progress is equitable and benefits all communities, promoting digital education in rural schools.`,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        state: "Quintana Roo",
        category: "Economía",
        published: true,
      },
      {
        title: "Las Startups de Inteligencia Artificial transforman la economía de la CDMX || AI Startups transform Ciudad de México's digital economy || AI Startups ku k'exik u ko'olel ta'ak'in ti' Ciudad de México",
        slug: "startups-ia-economia-cdmx",
        content: `La Ciudad de México ha reportado un aumento del 150% en la creación de incubadoras de software especializadas en inteligencia artificial generativa durante el último semestre. Distritos como Condesa, Roma y Polanco concentran la mayor densidad de nómadas digitales del continente.

Inversionistas globales señalan que la CDMX ofrece una mezcla ideal de talento bilingüe especializado. || Mexico City has reported a 150% increase in generative AI software incubators during the last six months. Districts like Condesa, Roma, and Polanco now host the highest density of tech-nomads on the continent.

Global venture capital groups note that CDMX offers the perfect mix of bilingual engineering talents. || Ciudad de México ya'an maanal ti' 150% u bin yáax najilo'ob meyaj ti' Inteligencia Artificial. Distritos je'ex Condesa yéetel Roma ya'an ya'ab máak meyajil tecnología bilingüe.

La región ha experimentado un crecimiento acelerado gracias a las nuevas políticas de inversión extranjera directa, lo que ha generado miles de empleos en el sector tecnológico y de servicios. Las empresas internacionales están buscando expandir sus horizontes hacia el sureste mexicano.

El desarrollo de infraestructura ha sido clave. La construcción de nuevas vías de transporte y la ampliación de la red de fibra óptica permiten a los negocios locales operar a niveles competitivos globales, atrayendo a inversionistas de primer nivel.

Además, la riqueza cultural y gastronómica de la zona ofrece una excelente calidad de vida, combinando la tradición milenaria con la vanguardia tecnológica. Esto resulta muy atractivo para los nómadas digitales y profesionales remotos.

Se espera que en los próximos años, los proyectos de energía renovable complementen esta expansión, asegurando un desarrollo sustentable y un compromiso real con el cuidado del medio ambiente y los ecosistemas locales.

Las autoridades continúan trabajando de la mano con la iniciativa privada para garantizar que este progreso sea equitativo y beneficie a todas las comunidades, promoviendo la educación digital en las escuelas rurales.

The region has experienced accelerated growth thanks to new foreign direct investment policies, which have generated thousands of jobs in the technology and services sectors. International companies are looking to expand their horizons toward southeastern Mexico.

Infrastructure development has been key. The construction of new transportation routes and the expansion of the fiber optic network allow local businesses to operate at global competitive levels, attracting top-tier investors.

Furthermore, the cultural and gastronomic wealth of the area offers an excellent quality of life, combining ancient tradition with technological avant-garde. This is very attractive to digital nomads and remote professionals.

It is expected that in the coming years, renewable energy projects will complement this expansion, ensuring sustainable development and a real commitment to caring for the environment and local ecosystems.

Authorities continue to work hand in hand with the private sector to ensure that this progress is equitable and benefits all communities, promoting digital education in rural schools.`,
        imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        state: "CDMX",
        category: "Política",
        published: true,
      },
      {
        title: "Guadalajara expande su Silicon Valley con automatización robótica || Guadalajara expands its Silicon Valley with advanced robotic automation || Guadalajara ku ya'abtal Silicon Valley yéetel robótica",
        slug: "guadalajara-silicon-valley-automatizacion-robotica",
        content: `El estado de Jalisco continúa consolidándose como la capital de la manufactura electrónica en México. Plantas manufactureras automatizadas en el corredor industrial de Guadalajara han integrado brazos robóticos de última generación controlados por visión artificial para la confección de semiconductores.

Este avance acelera la producción de circuitos integrados. || The state of Jalisco continues to secure its crown as Mexico's high-tech electronic manufacturing powerhouse. Automated factories in Guadalajara's industrial corridor have successfully integrated cutting-edge computer-vision robotic arms for semiconductor packaging.

This technological jump speeds up integrated circuit assembly. || Jalisco u yáax kajil manufactura electrónica ti' México. Najilo'ob meyaj ti' Guadalajara ts'o'ok u patiko'ob brazos robóticos yéetel visión artificial ti'al u patik chips.

La región ha experimentado un crecimiento acelerado gracias a las nuevas políticas de inversión extranjera directa, lo que ha generado miles de empleos en el sector tecnológico y de servicios. Las empresas internacionales están buscando expandir sus horizontes hacia el sureste mexicano.

El desarrollo de infraestructura ha sido clave. La construcción de nuevas vías de transporte y la ampliación de la red de fibra óptica permiten a los negocios locales operar a niveles competitivos globales, atrayendo a inversionistas de primer nivel.

Además, la riqueza cultural y gastronómica de la zona ofrece una excelente calidad de vida, combinando la tradición milenaria con la vanguardia tecnológica. Esto resulta muy atractivo para los nómadas digitales y profesionales remotos.

Se espera que en los próximos años, los proyectos de energía renovable complementen esta expansión, asegurando un desarrollo sustentable y un compromiso real con el cuidado del medio ambiente y los ecosistemas locales.

Las autoridades continúan trabajando de la mano con la iniciativa privada para garantizar que este progreso sea equitativo y beneficie a todas las comunidades, promoviendo la educación digital en las escuelas rurales.

The region has experienced accelerated growth thanks to new foreign direct investment policies, which have generated thousands of jobs in the technology and services sectors. International companies are looking to expand their horizons toward southeastern Mexico.

Infrastructure development has been key. The construction of new transportation routes and the expansion of the fiber optic network allow local businesses to operate at global competitive levels, attracting top-tier investors.

Furthermore, the cultural and gastronomic wealth of the area offers an excellent quality of life, combining ancient tradition with technological avant-garde. This is very attractive to digital nomads and remote professionals.

It is expected that in the coming years, renewable energy projects will complement this expansion, ensuring sustainable development and a real commitment to caring for the environment and local ecosystems.

Authorities continue to work hand in hand with the private sector to ensure that this progress is equitable and benefits all communities, promoting digital education in rural schools.`,
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        state: "Jalisco",
        category: "Deportes",
        published: true,
      },
      {
        title: "Monterrey lidera la industria nacional con la Gigafábrica de electromovilidad || Monterrey leads national industry with major electromobility Gigafactory || Monterrey ku nu'uktik Gigafactory ti'al túumben coches eléctricos",
        slug: "monterrey-gigafabrica-electromovilidad",
        content: `Nuevo León ha dado un salto colosal en la industria pesada al inaugurar las primeras naves de manufactura inteligente dedicadas a sistemas de baterías para automóviles eléctricos de nueva generación en Monterrey. La gigafábrica de electromovilidad creará más de 12,000 empleos directos.

El auge del nearshoring continúa atrayendo inversión masiva. || Nuevo León has taken a massive leap in heavy industry by opening the first smart manufacturing facilities dedicated to new-generation electric vehicle battery packs in Monterrey. The electromobility gigafactory will generate over 12,000 direct, highly skilled tech jobs.

The nearshoring boom continues to channel massive capital inflows. || Nuevo León ts'o'ok u jist'ik u yáax najil meyaj baterías ti'al coches eléctricos ti' Monterrey. Le Gigafactory ku ts'áaik maanal ti' 12,000 meyajo'ob ti'al tuláakal máak.

La región ha experimentado un crecimiento acelerado gracias a las nuevas políticas de inversión extranjera directa, lo que ha generado miles de empleos en el sector tecnológico y de servicios. Las empresas internacionales están buscando expandir sus horizontes hacia el sureste mexicano.

El desarrollo de infraestructura ha sido clave. La construcción de nuevas vías de transporte y la ampliación de la red de fibra óptica permiten a los negocios locales operar a niveles competitivos globales, atrayendo a inversionistas de primer nivel.

Además, la riqueza cultural y gastronómica de la zona ofrece una excelente calidad de vida, combinando la tradición milenaria con la vanguardia tecnológica. Esto resulta muy atractivo para los nómadas digitales y profesionales remotos.

Se espera que en los próximos años, los proyectos de energía renovable complementen esta expansión, asegurando un desarrollo sustentable y un compromiso real con el cuidado del medio ambiente y los ecosistemas locales.

Las autoridades continúan trabajando de la mano con la iniciativa privada para garantizar que este progreso sea equitativo y beneficie a todas las comunidades, promoviendo la educación digital en las escuelas rurales.

The region has experienced accelerated growth thanks to new foreign direct investment policies, which have generated thousands of jobs in the technology and services sectors. International companies are looking to expand their horizons toward southeastern Mexico.

Infrastructure development has been key. The construction of new transportation routes and the expansion of the fiber optic network allow local businesses to operate at global competitive levels, attracting top-tier investors.

Furthermore, the cultural and gastronomic wealth of the area offers an excellent quality of life, combining ancient tradition with technological avant-garde. This is very attractive to digital nomads and remote professionals.

It is expected that in the coming years, renewable energy projects will complement this expansion, ensuring sustainable development and a real commitment to caring for the environment and local ecosystems.

Authorities continue to work hand in hand with the private sector to ensure that this progress is equitable and benefits all communities, promoting digital education in rural schools.`,
        imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        state: "Nuevo León",
        category: "Economía",
        published: true,
      },
    ],
  });

  console.log("Database seeded successfully with trilingual, multi-state articles!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
