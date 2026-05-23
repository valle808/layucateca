'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Target, PenTool, Share2, Search, Mail, BarChart2,
  DollarSign, Zap, TrendingUp, Users, Globe, CheckCircle,
  Play, ChevronRight, Activity, Megaphone, ArrowUpRight,
  Star, Clock, Hash, Eye, Heart, Repeat2, MousePointer,
  BookOpen, Video, Image as ImageIcon, Rss
} from 'lucide-react';

// ─── AGENT DATA ──────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'campaign-director',
    emoji: '🎯',
    name: 'Campaign Director',
    nameEs: 'Director de Campaña',
    role: 'Master Orchestrator',
    roleEs: 'Orquestador Maestro',
    color: '#ff5500',
    gradient: 'from-orange-500 to-red-600',
    skills: ['launch', 'marketing-ideas', 'marketing-psychology', 'co-marketing'],
    status: 'active',
    metric: '12 campaigns',
    metricLabel: 'Managed this month',
    description: 'Plans and coordinates all marketing campaigns. Delegates to specialist agents and manages the 90-day marketing roadmap.',
    descriptionEs: 'Planifica y coordina todas las campañas. Delega a agentes especialistas y gestiona el roadmap de marketing.',
  },
  {
    id: 'content-strategist',
    emoji: '✍️',
    name: 'Content Strategist',
    nameEs: 'Estratega de Contenido',
    role: 'Editorial Brain',
    roleEs: 'Cerebro Editorial',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-600',
    skills: ['content-strategy', 'copywriting', 'copy-editing', 'lead-magnets'],
    status: 'active',
    metric: '47 articles',
    metricLabel: 'Published this quarter',
    description: 'Builds content systems and editorial calendars that compound over time. Expert in bilingual EN/ES content for La Yucateca.',
    descriptionEs: 'Construye sistemas de contenido y calendarios editoriales. Experto en contenido bilingüe EN/ES para La Yucateca.',
  },
  {
    id: 'social-media-manager',
    emoji: '📱',
    name: 'Social Media Manager',
    nameEs: 'Gerente de Redes Sociales',
    role: 'Multi-Platform Voice',
    roleEs: 'Voz Multi-Plataforma',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    skills: ['social', 'video', 'image', 'community-marketing'],
    status: 'active',
    metric: '5 platforms',
    metricLabel: 'Managed daily',
    description: 'Creates viral content for Twitter/X, LinkedIn, Instagram, TikTok, and YouTube. Grows followers and drives channel discovery.',
    descriptionEs: 'Crea contenido viral para Twitter/X, LinkedIn, Instagram, TikTok y YouTube. Hace crecer seguidores.',
  },
  {
    id: 'seo-specialist',
    emoji: '🔍',
    name: 'SEO Specialist',
    nameEs: 'Especialista SEO',
    role: 'Search Visibility Expert',
    roleEs: 'Experto en Visibilidad de Búsqueda',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    skills: ['seo-audit', 'ai-seo', 'programmatic-seo', 'schema'],
    status: 'active',
    metric: '+234%',
    metricLabel: 'Organic traffic growth',
    description: 'Optimizes for Google, Bing, AND AI search engines (Perplexity, ChatGPT, Gemini). Also handles Google News submission.',
    descriptionEs: 'Optimiza para Google, Bing Y motores de búsqueda IA. También gestiona envío a Google News.',
  },
  {
    id: 'email-marketer',
    emoji: '📧',
    name: 'Email Marketer',
    nameEs: 'Especialista de Email',
    role: 'Subscriber Growth Engine',
    roleEs: 'Motor de Crecimiento de Suscriptores',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    skills: ['emails', 'cold-email', 'onboarding', 'lead-magnets'],
    status: 'active',
    metric: '3,421 subs',
    metricLabel: 'Newsletter subscribers',
    description: 'Builds daily briefings, welcome sequences, and re-engagement campaigns. Expert in Beehiiv, Mailchimp, and ConvertKit.',
    descriptionEs: 'Construye boletines diarios, secuencias de bienvenida y campañas de reenganche.',
  },
  {
    id: 'growth-analyst',
    emoji: '📊',
    name: 'Growth Analyst',
    nameEs: 'Analista de Crecimiento',
    role: 'Data-Driven Optimizer',
    roleEs: 'Optimizador Basado en Datos',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-600',
    skills: ['analytics', 'ab-testing', 'cro', 'referrals'],
    status: 'active',
    metric: '8 A/B tests',
    metricLabel: 'Running concurrently',
    description: 'Measures everything, runs experiments, and systematically improves every funnel metric. GA4 expert and CRO specialist.',
    descriptionEs: 'Mide todo, ejecuta experimentos y mejora sistemáticamente cada métrica del funnel.',
  },
  {
    id: 'paid-media-buyer',
    emoji: '💰',
    name: 'Paid Media Buyer',
    nameEs: 'Comprador de Medios Pagados',
    role: 'Advertising Strategist',
    roleEs: 'Estratega Publicitario',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    skills: ['ads', 'ad-creative', 'ab-testing', 'marketing-psychology'],
    status: 'standby',
    metric: '$0 spent',
    metricLabel: 'Awaiting budget allocation',
    description: 'Manages Google, Meta, LinkedIn, TikTok, and YouTube ads. Specializes in subscriber acquisition at lowest cost per lead.',
    descriptionEs: 'Gestiona Google, Meta, LinkedIn, TikTok y YouTube Ads. Especialista en adquisición de suscriptores.',
  },
];

// ─── CAMPAIGN DATA ────────────────────────────────────────────────────────────

const CAMPAIGNS = [
  { id: 1, name: 'Q2 Subscriber Drive', status: 'active', platform: 'Email + Social', progress: 68, target: '10,000 subs', current: '3,421 subs', owner: '📧' },
  { id: 2, name: 'Google News Submission', status: 'active', platform: 'SEO', progress: 45, target: 'Approved', current: 'In Review', owner: '🔍' },
  { id: 3, name: 'TikTok Channel Launch', status: 'planning', platform: 'TikTok', progress: 20, target: '2,000 followers', current: '0 followers', owner: '📱' },
  { id: 4, name: 'SEO Evergreen Content', status: 'active', platform: 'Blog + SEO', progress: 55, target: '50 articles', current: '28 articles', owner: '✍️' },
  { id: 5, name: 'Referral Program Launch', status: 'planning', platform: 'Viral', progress: 10, target: '500 referrals', current: 'Building', owner: '📊' },
  { id: 6, name: 'Weekly Newsletter Series', status: 'active', platform: 'Email', progress: 82, target: 'Weekly cadence', current: 'Week 14', owner: '📧' },
];

// ─── CONTENT CALENDAR ─────────────────────────────────────────────────────────

const CALENDAR_ITEMS = [
  { day: 'Mon', platform: 'Twitter/X', type: 'Thread', topic: 'Breaking News Analysis', status: 'scheduled', icon: Hash },
  { day: 'Mon', platform: 'Newsletter', type: 'Daily Briefing', topic: 'Morning Digest', status: 'published', icon: Mail },
  { day: 'Tue', platform: 'LinkedIn', type: 'Carousel', topic: 'Data Story of the Week', status: 'scheduled', icon: BarChart2 },
  { day: 'Tue', platform: 'Instagram', type: 'Reel', topic: 'Behind the Story', status: 'draft', icon: Video },
  { day: 'Wed', platform: 'Twitter/X', type: 'Poll', topic: 'Community Question', status: 'scheduled', icon: Users },
  { day: 'Wed', platform: 'Blog', type: 'Long-form', topic: 'Investigative Report', status: 'in-progress', icon: BookOpen },
  { day: 'Thu', platform: 'TikTok', type: 'Video', topic: 'News Explainer 60s', status: 'draft', icon: Play },
  { day: 'Thu', platform: 'Newsletter', type: 'Weekly Deep Dive', topic: 'Feature Story', status: 'scheduled', icon: Rss },
  { day: 'Fri', platform: 'Instagram', type: 'Carousel', topic: 'Week in Review', status: 'draft', icon: ImageIcon },
  { day: 'Fri', platform: 'YouTube', type: 'Short', topic: 'News Recap Clip', status: 'planned', icon: Video },
  { day: 'Sat', platform: 'Twitter/X', type: 'Thread', topic: 'Opinion + Analysis', status: 'planned', icon: PenTool },
  { day: 'Sun', platform: 'All', type: 'Report', topic: 'Weekly Performance Review', status: 'automated', icon: Activity },
];

// ─── KPI DATA ─────────────────────────────────────────────────────────────────

const KPIS = [
  { label: 'Newsletter Subscribers', value: '3,421', target: '10,000', change: '+12.4%', positive: true, icon: Mail, color: '#f59e0b' },
  { label: 'Monthly Visitors', value: '18,650', target: '50,000', change: '+23.1%', positive: true, icon: Eye, color: '#10b981' },
  { label: 'Social Followers (Total)', value: '2,847', target: '11,000', change: '+8.7%', positive: true, icon: Users, color: '#ec4899' },
  { label: 'Email Open Rate', value: '31.2%', target: '35%', change: '+2.1%', positive: true, icon: MousePointer, color: '#6366f1' },
  { label: 'Organic Search Traffic', value: '+234%', target: 'Ongoing', change: 'vs last quarter', positive: true, icon: Search, color: '#3b82f6' },
  { label: 'Paying Subscribers', value: '0', target: '100', change: 'Not launched', positive: false, icon: DollarSign, color: '#8b5cf6' },
];

// ─── PLATFORM STATS ───────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: 'Twitter/X', handle: '@layucateca', followers: '1,203', growth: '+15%', posts: 28, color: '#000', icon: Hash },
  { name: 'Instagram', handle: '@layucateca', followers: '842', growth: '+9%', posts: 14, color: '#e1306c', icon: Heart },
  { name: 'LinkedIn', handle: 'La Yucateca', followers: '521', growth: '+22%', posts: 8, color: '#0077b5', icon: Globe },
  { name: 'TikTok', handle: '@layucateca', followers: '281', growth: '+45%', posts: 6, color: '#010101', icon: Play },
  { name: 'YouTube', handle: '@layucateca', followers: '0', growth: '—', posts: 0, color: '#ff0000', icon: Video },
];

// ─── COMPONENT: AgentCard ─────────────────────────────────────────────────────

function AgentCard({ agent, index }: { agent: typeof AGENTS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="relative group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-2xl overflow-hidden cursor-pointer hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] transition-all duration-500 hover:-translate-y-1 shadow-lg"
      onClick={() => setExpanded(!expanded)}
      style={{ boxShadow: `0 0 0 0 ${agent.color}00` }}
      whileHover={{ scale: 1.01, boxShadow: `0 8px 32px ${agent.color}22` }}
    >
      {/* Gradient header bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${agent.gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-lg"
              style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40` }}
            >
              {agent.emoji}
            </div>
            <div>
              <div className="font-bold text-[var(--text-primary)] text-sm leading-tight">{agent.name}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">{agent.role}</div>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            agent.status === 'active'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
            {agent.status}
          </div>
        </div>

        {/* Metric */}
        <div className="mb-3 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="font-black text-lg" style={{ color: agent.color }}>{agent.metric}</div>
          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{agent.metricLabel}</div>
        </div>

        {/* Skills pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {agent.skills.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {skill}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              +{agent.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3 mt-1">
                {agent.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.skills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    /{skill}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-2">
          <button
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-all"
            style={{ color: agent.color }}
          >
            <Zap size={10} />
            Activate Agent
          </button>
          <ChevronRight
            size={14}
            className={`text-[var(--text-primary)]/30 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── COMPONENT: CampaignBoard ─────────────────────────────────────────────────

function CampaignBoard() {
  const statusColors: Record<string, string> = {
    active: 'text-emerald-400',
    planning: 'text-amber-400',
    paused: 'text-[var(--text-secondary)]',
  };

  return (
    <div className="space-y-3">
      {CAMPAIGNS.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-white/8 transition-all group"
        >
          <div className="text-xl shrink-0">{c.owner}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{c.name}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${statusColors[c.status]}`}>
                ● {c.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
              <span>{c.platform}</span>
              <span>·</span>
              <span>{c.current} / {c.target}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-[var(--border-subtle)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.progress}%` }}
                transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
              />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-black text-[var(--text-secondary)]">{c.progress}%</div>
            <div className="text-[9px] text-[var(--text-primary)]/30 uppercase tracking-wider">complete</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── COMPONENT: ContentCalendar ───────────────────────────────────────────────

function ContentCalendar() {
  const statusStyles: Record<string, string> = {
    published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    draft: 'bg-[var(--border-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    planned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    automated: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => {
        const items = CALENDAR_ITEMS.filter(i => i.day === day);
        return (
          <div key={day} className="flex flex-col gap-2">
            <div className="text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
              {day}
            </div>
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Icon size={9} className="text-[var(--text-secondary)]" />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-secondary)] truncate">
                      {item.platform}
                    </span>
                  </div>
                  <div className="text-[9px] font-semibold text-[var(--text-primary)] opacity-80 leading-tight mb-1.5 line-clamp-2">
                    {item.topic}
                  </div>
                  <div className={`inline-flex px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider border ${statusStyles[item.status]}`}>
                    {item.status}
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPONENT: KPIDashboard ──────────────────────────────────────────────────

function KPIDashboard() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {KPIS.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-white/8 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                <Icon size={14} style={{ color: kpi.color }} />
              </div>
              <span className={`text-[10px] font-bold ${kpi.positive ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="font-black text-xl text-[var(--text-primary)]" style={{ textShadow: `0 0 20px ${kpi.color}44` }}>
              {kpi.value}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] leading-tight mt-0.5">{kpi.label}</div>
            <div className="text-[9px] text-[var(--text-primary)]/25 mt-1">Target: {kpi.target}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'campaigns' | 'calendar' | 'metrics' | 'platforms'>('agents');
  const [skillCount] = useState(40);

  const tabs = [
    { id: 'agents', label: 'Agent Team', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'calendar', label: 'Content Calendar', icon: Clock },
    { id: 'metrics', label: 'KPIs', icon: TrendingUp },
    { id: 'platforms', label: 'Platforms', icon: Globe },
  ] as const;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{ color: 'var(--text-primary)' }}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-pink-500/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-80 text-sm transition-colors">
              La Yucateca
            </Link>
            <ChevronRight size={14} className="text-[var(--text-primary)]/20" />
            <span className="text-[var(--text-primary)] opacity-80 text-sm">Marketing HQ</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Target size={24} className="text-[var(--text-primary)]" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Marketing HQ</h1>
                  <p className="text-[var(--text-secondary)] text-sm">La Yucateca · AI-Powered News Channel</p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] text-sm max-w-xl leading-relaxed">
                Your centralized marketing operations center. 7 AI specialist agents powered by{' '}
                <span className="text-orange-400 font-semibold">{skillCount} marketing skills</span>{' '}
                promoting the La Yucateca news channel across the entire internet.
              </p>
            </div>

            {/* Live stats bar */}
            <div className="flex gap-4 shrink-0">
              {[
                { label: 'Active Agents', value: '6/7', color: '#10b981' },
                { label: 'Campaigns Live', value: '4', color: '#f59e0b' },
                { label: 'Skills Loaded', value: '40', color: '#ff5500' },
              ].map(stat => (
                <div key={stat.label} className="text-center px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <div className="font-black text-xl" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── QUICK ACTIONS ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]/30 mb-3">Quick Actions</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Generate Twitter Thread', icon: Hash, color: '#000', bg: 'bg-white text-black' },
              { label: 'Write Newsletter Issue', icon: Mail, color: '#f59e0b', bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
              { label: 'SEO Content Brief', icon: Search, color: '#10b981', bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
              { label: 'Create Ad Campaign', icon: Megaphone, color: '#8b5cf6', bg: 'bg-violet-500/15 text-violet-400 border border-violet-500/30' },
              { label: 'Analyze Performance', icon: BarChart2, color: '#3b82f6', bg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
              { label: 'Launch Checklist', icon: CheckCircle, color: '#ff5500', bg: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-bold tracking-wide backdrop-blur-md transition-all duration-300 ${action.bg}`} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                  <Icon size={12} />
                  {action.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── TAB NAV ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-10 bg-[var(--bg-card)] backdrop-blur-xl p-1.5 rounded-2xl border border-[var(--border-subtle)] overflow-x-auto shadow-sm w-fit"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[12px] text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--accent-gold)] text-[var(--text-primary)] shadow-[0_0_20px_rgba(255,85,0,0.3)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* ── TAB CONTENT ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >

            {/* AGENTS TAB */}
            {activeTab === 'agents' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black">Marketing Agent Team</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-0.5">7 AI specialists, each powered by multiple marketing skills. Click any card to expand.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    6 of 7 Active
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {AGENTS.map((agent, i) => (
                    <AgentCard key={agent.id} agent={agent} index={i} />
                  ))}
                </div>

                {/* Skills library reference */}
                <div className="mt-8 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3 mb-4">
                    <Star size={16} className="text-orange-400" />
                    <h3 className="font-bold text-sm">Marketing Skills Library — 40 Skills Active</h3>
                    <a
                      href="https://github.com/coreyhaines31/marketingskills"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 ml-auto text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-80 transition-colors"
                    >
                      Source <ArrowUpRight size={10} />
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['ab-testing','ad-creative','ads','ai-seo','analytics','aso','churn-prevention','co-marketing','cold-email','community-marketing','competitor-profiling','competitors','content-strategy','copy-editing','copywriting','cro','customer-research','directory-submissions','emails','free-tools','image','launch','lead-magnets','marketing-ideas','marketing-psychology','onboarding','paywalls','popups','pricing','product-marketing','programmatic-seo','referrals','revops','sales-enablement','schema','seo-audit','signup','site-architecture','social','video'].map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400/80 border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer">
                        /{skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black">Active Campaigns</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-0.5">All marketing initiatives tracked by the Campaign Director agent.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-black text-xs font-black hover:bg-orange-400 transition-all">
                    <Zap size={12} />
                    New Campaign
                  </button>
                </div>
                <CampaignBoard />
              </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black">Content Calendar</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-0.5">Weekly content plan across all platforms. Managed by Content Strategist + Social Media Manager.</p>
                  </div>
                  <div className="flex gap-2 text-[10px] font-bold">
                    {['published','scheduled','in-progress','draft','planned'].map(s => (
                      <span key={s} className={`px-2 py-1 rounded-full border ${
                        s === 'published' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        s === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        s === 'in-progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        s === 'draft' ? 'bg-[var(--border-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]' :
                        'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      }`}>{s}</span>
                    ))}
                  </div>
                </div>
                <ContentCalendar />
              </div>
            )}

            {/* METRICS TAB */}
            {activeTab === 'metrics' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black">Performance KPIs</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-0.5">North star metrics tracked by the Growth Analyst agent.</p>
                  </div>
                  <div className="text-xs text-[var(--text-primary)]/30 font-mono">Updated: {new Date().toLocaleDateString()}</div>
                </div>
                <KPIDashboard />

                {/* Funnel visualization */}
                <div className="mt-8 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-orange-400" />
                    Reader Acquisition Funnel
                  </h3>
                  {[
                    { label: 'Monthly Visitors', value: 18650, max: 50000, color: '#3b82f6' },
                    { label: 'Article Readers (>60s)', value: 11190, max: 50000, color: '#6366f1' },
                    { label: 'Newsletter Opt-ins', value: 3421, max: 50000, color: '#f59e0b' },
                    { label: '30-Day Active Readers', value: 1882, max: 50000, color: '#10b981' },
                    { label: 'Paying Subscribers', value: 0, max: 50000, color: '#ff5500' },
                  ].map((stage, i) => (
                    <div key={stage.label} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-secondary)]">{stage.label}</span>
                        <span className="font-bold text-[var(--text-primary)]">{stage.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stage.value / stage.max) * 100}%` }}
                          transition={{ duration: 1.2, delay: i * 0.15 }}
                          className="h-full rounded-full"
                          style={{ background: stage.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLATFORMS TAB */}
            {activeTab === 'platforms' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black">Platform Overview</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-0.5">Social media presence managed by the Social Media Manager agent.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PLATFORMS.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-white/8 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${p.color}20`, border: `1px solid ${p.color}40` }}>
                            <Icon size={18} style={{ color: p.color === '#010101' ? '#fff' : p.color }} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--text-primary)]">{p.name}</div>
                            <div className="text-[10px] text-[var(--text-secondary)]">{p.handle}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <div className="font-black text-lg text-[var(--text-primary)]">{p.followers}</div>
                            <div className="text-[9px] text-[var(--text-primary)]/30 uppercase tracking-wider">Followers</div>
                          </div>
                          <div>
                            <div className={`font-black text-lg ${p.growth === '—' ? 'text-[var(--text-primary)]/30' : 'text-emerald-400'}`}>{p.growth}</div>
                            <div className="text-[9px] text-[var(--text-primary)]/30 uppercase tracking-wider">Growth</div>
                          </div>
                          <div>
                            <div className="font-black text-lg text-[var(--text-primary)]">{p.posts}</div>
                            <div className="text-[9px] text-[var(--text-primary)]/30 uppercase tracking-wider">Posts/mo</div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                          <button className="w-full py-2 rounded-xl text-[11px] font-bold bg-[var(--bg-card)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                            View Strategy →
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Internet promotion strategy */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20">
                  <h3 className="font-bold mb-1 flex items-center gap-2">
                    <Globe size={16} className="text-orange-400" />
                    Internet-Wide Promotion Strategy
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">La Yucateca needs to be everywhere. Here's the full distribution map.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      { category: 'Search', channels: ['Google News', 'Apple News', 'Bing News', 'Yahoo News'] },
                      { category: 'Social', channels: ['Twitter/X', 'LinkedIn', 'Instagram', 'TikTok', 'Facebook', 'YouTube', 'Pinterest'] },
                      { category: 'Aggregators', channels: ['Flipboard', 'Feedly', 'Pocket', 'AllTop', 'NewsNow'] },
                      { category: 'Community', channels: ['Reddit', 'Quora', 'Medium', 'Substack Notes', 'Discord'] },
                    ].map(cat => (
                      <div key={cat.category} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <div className="text-orange-400 font-black text-[10px] uppercase tracking-widest mb-2">{cat.category}</div>
                        {cat.channels.map(ch => (
                          <div key={ch} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mb-1">
                            <div className="w-1 h-1 rounded-full bg-orange-400/60" />
                            {ch}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── FOOTER ATTRIBUTION ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-primary)]/20"
        >
          <span>Marketing HQ · La Yucateca · Powered by Muna AI + 40 Marketing Skills</span>
          <a
            href="https://github.com/coreyhaines31/marketingskills"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
          >
            Skills by coreyhaines31 <ArrowUpRight size={10} />
          </a>
        </motion.div>

      </div>
    </div>
  );
}
