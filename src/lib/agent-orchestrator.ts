// Agent types and orchestrator
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description: { es: string; en: string; my: string };
  status: 'active' | 'idle' | 'paused' | 'error';
  type: 'ai' | 'automation' | 'hybrid';
  capabilities: string[];
  budgetLimit: number;
  costUsed: number;
  lastHeartbeat: string | null;
  heartbeatInterval: number; // minutes
  tasksCompleted: number;
  tasksInProgress: number;
  tasksFailed: number;
  createdAt: string;
  model?: string;
  icon: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  title: { es: string; en: string; my: string };
  description: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  result?: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: { es: string; en: string; my: string };
  category: string;
  agentIds: string[];
  enabled: boolean;
  usageCount: number;
}

// Default agents for La Yucateca
export const defaultAgents: AgentConfig[] = [
  {
    id: 'muna-ai',
    name: 'Muna AI',
    role: 'Chief AI Assistant',
    description: { es: 'Asistente principal de IA autónoma', en: 'Primary autonomous AI assistant', my: 'Nojoch wíinik ya\'ax na\'at' },
    status: 'active',
    type: 'ai',
    capabilities: ['chat', 'translation', 'voice', 'recommendations'],
    budgetLimit: 50,
    costUsed: 12.45,
    lastHeartbeat: new Date().toISOString(),
    heartbeatInterval: 1,
    tasksCompleted: 1247,
    tasksInProgress: 3,
    tasksFailed: 12,
    createdAt: '2024-01-15T00:00:00Z',
    model: 'Gemini Pro',
    icon: '🤖'
  },
  {
    id: 'news-crew',
    name: 'News Crew',
    role: 'Content Journalist',
    description: { es: 'Motor de generación de noticias automatizado', en: 'Automated news generation engine', my: 'Máakina ts\'íib péektsilo\'ob' },
    status: 'active',
    type: 'ai',
    capabilities: ['rss-scraping', 'article-writing', 'image-generation', 'facebook-publishing'],
    budgetLimit: 30,
    costUsed: 8.20,
    lastHeartbeat: new Date().toISOString(),
    heartbeatInterval: 60,
    tasksCompleted: 856,
    tasksInProgress: 1,
    tasksFailed: 24,
    createdAt: '2024-02-01T00:00:00Z',
    model: 'Gemini Pro',
    icon: '📰'
  },
  {
    id: 'marketing-agent',
    name: 'Marketing Agent',
    role: 'Growth Strategist',
    description: { es: 'Agente de marketing y crecimiento', en: 'Marketing and growth agent', my: 'Ajk\'iin marketing' },
    status: 'idle',
    type: 'ai',
    capabilities: ['seo', 'social-media', 'analytics', 'content-strategy'],
    budgetLimit: 25,
    costUsed: 3.10,
    lastHeartbeat: null,
    heartbeatInterval: 1440,
    tasksCompleted: 45,
    tasksInProgress: 0,
    tasksFailed: 2,
    createdAt: '2024-03-15T00:00:00Z',
    model: 'Gemini Flash',
    icon: '📈'
  },
  {
    id: 'support-agent',
    name: 'Community Support',
    role: 'Support Specialist',
    description: { es: 'Agente de soporte comunitario', en: 'Community support agent', my: 'Ajwáantaj kajnáalil' },
    status: 'paused',
    type: 'hybrid',
    capabilities: ['ticket-response', 'faq', 'escalation', 'sentiment-analysis'],
    budgetLimit: 20,
    costUsed: 1.50,
    lastHeartbeat: null,
    heartbeatInterval: 5,
    tasksCompleted: 189,
    tasksInProgress: 0,
    tasksFailed: 5,
    createdAt: '2024-04-01T00:00:00Z',
    model: 'Gemini Flash',
    icon: '💬'
  },
  {
    id: 'analytics-agent',
    name: 'Analytics Engine',
    role: 'Data Analyst',
    description: { es: 'Motor de análisis de datos', en: 'Data analytics engine', my: 'Máakina xook datos' },
    status: 'active',
    type: 'automation',
    capabilities: ['metrics-tracking', 'report-generation', 'anomaly-detection'],
    budgetLimit: 15,
    costUsed: 2.80,
    lastHeartbeat: new Date().toISOString(),
    heartbeatInterval: 30,
    tasksCompleted: 432,
    tasksInProgress: 2,
    tasksFailed: 8,
    createdAt: '2024-05-01T00:00:00Z',
    model: 'Custom Pipeline',
    icon: '📊'
  }
];

export const defaultTasks: AgentTask[] = [
  { id: 't1', agentId: 'news-crew', title: { es: 'Generar noticias diarias', en: 'Generate daily news', my: 'Beetik péektsilo\'ob k\'iinil' }, description: 'Auto-generate and publish news from RSS feeds', status: 'in_progress', priority: 'high', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 't2', agentId: 'muna-ai', title: { es: 'Atender consultas de usuarios', en: 'Handle user queries', my: 'Nu\'uktik k\'áat chi\'o\'ob' }, description: 'Respond to user conversations in the chatbot', status: 'in_progress', priority: 'high', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 't3', agentId: 'analytics-agent', title: { es: 'Reporte semanal de métricas', en: 'Weekly metrics report', my: 'Tuukul semáanal' }, description: 'Generate weekly analytics summary', status: 'queued', priority: 'medium', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const defaultSkills: AgentSkill[] = [
  { id: 's1', name: 'Natural Language Chat', description: { es: 'Conversación natural multilingüe', en: 'Multilingual natural conversation', my: 'T\'aan natural múultiplicado' }, category: 'Communication', agentIds: ['muna-ai', 'support-agent'], enabled: true, usageCount: 4521 },
  { id: 's2', name: 'RSS News Scraping', description: { es: 'Recolección de noticias RSS', en: 'RSS news collection', my: 'Moliktik péektsil RSS' }, category: 'Content', agentIds: ['news-crew'], enabled: true, usageCount: 856 },
  { id: 's3', name: 'Article Generation', description: { es: 'Generación de artículos con IA', en: 'AI article generation', my: 'Beetik ts\'íibo\'ob yéetel IA' }, category: 'Content', agentIds: ['news-crew', 'marketing-agent'], enabled: true, usageCount: 1243 },
  { id: 's4', name: 'SEO Analysis', description: { es: 'Análisis de SEO', en: 'SEO analysis', my: 'Xook SEO' }, category: 'Marketing', agentIds: ['marketing-agent'], enabled: true, usageCount: 45 },
  { id: 's5', name: 'Sentiment Analysis', description: { es: 'Análisis de sentimiento', en: 'Sentiment analysis', my: 'Xook muuk\'il áanal' }, category: 'Analytics', agentIds: ['support-agent', 'analytics-agent'], enabled: true, usageCount: 189 },
  { id: 's6', name: 'Voice Synthesis', description: { es: 'Síntesis de voz natural', en: 'Natural voice synthesis', my: 'Beetik t\'aan' }, category: 'Communication', agentIds: ['muna-ai'], enabled: true, usageCount: 324 },
  { id: 's7', name: 'Image Generation', description: { es: 'Generación de imágenes', en: 'Image generation', my: 'Beetik áanalo\'ob' }, category: 'Content', agentIds: ['news-crew'], enabled: true, usageCount: 512 },
  { id: 's8', name: 'Social Media Publishing', description: { es: 'Publicación en redes sociales', en: 'Social media publishing', my: 'Ts\'áaik ich redes sociales' }, category: 'Marketing', agentIds: ['news-crew', 'marketing-agent'], enabled: true, usageCount: 234 },
];
