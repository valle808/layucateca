/**
 * Editorial Profile — La Yucateca
 * Read by the AI Writer agent on every generation run.
 * Defines what to cover, the voice, and quality rules.
 */

export const EDITORIAL_PROFILE = {
  channel: 'La Yucateca',
  platform: 'layucateca.com',
  voice: 'Professional yet accessible. Bilingual (ES primary for local/regional, EN for tech/global). Facts first, balanced perspective. No clickbait. Community-focused journalism.',
  
  categories: {
    'Local': {
      lang: 'es' as const,
      focus: 'Noticias del sureste mexicano: Yucatán, Campeche, Quintana Roo, CDMX, Jalisco, Nuevo León. Eventos locales, política municipal, desarrollo urbano, turismo.',
      antiPatterns: ['Notas de relleno sin impacto local', 'Rumores sin fuente', 'Publicidad disfrazada de noticia'],
      sources: ['Punto Medio', 'El Diario de Yucatan', 'Sipse', 'PorEsto Yucatán', 'El Universal'],
    },
    'Política': {
      lang: 'es' as const,
      focus: 'Política mexicana y regional: gobierno federal, congresos estatales, elecciones, reforma. Análisis político balanceado sin sesgo partidista.',
      antiPatterns: ['Propaganda de partido', 'Opiniones sin hechos', 'Noticias viejas presentadas como nuevas'],
      sources: ['Animal Político', 'La Jornada', 'Reforma', 'Milenio'],
    },
    'Economía': {
      lang: 'es' as const,
      focus: 'Economía mexicana, finanzas personales, empresas locales, turismo económico, inversiones en el sureste.',
      antiPatterns: ['Rondas de financiamiento bajo $10M sin impacto local', 'Jerga financiera sin explicación'],
      sources: ['El Economista MX', 'Expansión', 'Reuters ES', 'BBC Mundo'],
    },
    'Deportes': {
      lang: 'es' as const,
      focus: 'Fútbol mexicano (Liga MX), deportes regionales, atletismo, beisbol, béisbol yucateco, deportes olímpicos.',
      antiPatterns: ['Resultados sin contexto', 'Solo estadísticas sin narrativa'],
      sources: ['ESPN Deportes', 'AS Mexico', 'Marca'],
    },
    'Cultura': {
      lang: 'es' as const,
      focus: 'Cultura maya, patrimonio yucateco, arte, gastronomía regional, fiestas tradicionales, turismo cultural.',
      antiPatterns: ['Cultura de celebridades sin relevancia local', 'Listas superficiales'],
      sources: ['El País Cultura', 'La Jornada'],
    },
    'Tecnología': {
      lang: 'en' as const, // Tech content in English
      focus: 'AI, startups, tech policy, digital innovation, Mexico tech ecosystem, fintech, cybersecurity.',
      antiPatterns: ['Generic "AI will change everything" pieces', 'Press releases repackaged as news'],
      sources: ['TechCrunch', 'Xataka México', 'Hipertextual', 'Expansión'],
    },
    'Internacional': {
      lang: 'es' as const,
      focus: 'Noticias internacionales con impacto en México y Latinoamérica: geopolítica, economía global, migración, clima.',
      antiPatterns: ['Noticias sin relevancia para lectores latinoamericanos'],
      sources: ['BBC Mundo', 'EFE Noticias', 'AFP ES', 'Reuters ES'],
    },
    'Entretenimiento': {
      lang: 'es' as const,
      focus: 'Cine, música, streaming, cultura pop latinoamericana, eventos de entretenimiento en México.',
      antiPatterns: ['Escándalos de celebridades sin substancia', 'Rumores sin confirmar'],
      sources: ['Vogue México', 'El País Cultura'],
    },
  },

  // Quality rules (from OpenClaw editorial principles)
  rules: [
    'Generate 1 high-quality article per run. Quality > quantity.',
    'Always cite 2+ real sources from the RSS fetch.',
    'Include a clear headline (H1), intro paragraph, 3-5 body sections, and conclusion.',
    'Minimum 400 words, maximum 800 words.',
    'Include a compelling meta description (155 chars max).',
    'Generate SEO-friendly slug from headline.',
    'No duplicates: check last 50 articles for similar titles.',
    'Always include the date and source attribution.',
    'For local Yucatán content, mention specific locations when relevant.',
    'Bilingual: if category lang is "es", write in Spanish. If "en", write in English.',
  ],

  seoRules: [
    'Headline should be 50-60 characters for SEO.',
    'First paragraph must include the main keyword naturally.',
    'Use subheadings (H2/H3) to break up content.',
    'Include 1-2 relevant internal link suggestions.',
    'Meta description should be action-oriented and include the keyword.',
  ],

  facebookPostTemplate: (title: string, summary: string, url: string, category: string) => 
    `📰 ${title}\n\n${summary}\n\n🔗 Lee más: ${url}\n\n#LaYucateca #${category} #Noticias #Yucatan`,
};

export type EditorialCategory = keyof typeof EDITORIAL_PROFILE.categories;
