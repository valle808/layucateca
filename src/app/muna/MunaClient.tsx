'use client';



import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, ChevronRight, User, Paperclip, X,
  Sparkles, Radio, Terminal, Layers, Orbit, Wifi,
  ChevronLeft, Database, ZoomIn, Download, Volume2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
const HISTORY_KEY = 'muna_session_history';
function loadLocalHistory(): {sessionId: string, prompt: string, mode: string}[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY) || '[]';
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((s: any) => s && s.sessionId && !['muna-v1-1', 'muna-v1-2', 'muna-v1-3', 'muna-v1-4', 'muna-v1-5'].includes(s.sessionId));
    }
    return [];
  } catch {
    return [];
  }
}
function saveLocalHistory(sessions: {sessionId: string, prompt: string, mode: string}[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 20))); } catch {}
}

export type EntityType = 'HUMAN' | 'AGENT' | 'AI';

type Message = {
  role: 'bot' | 'user';
  text: string;
  images?: string[];
  id: string;
  type?: EntityType;
  timestamp?: string;
};

const getCreativeIntroduction = (lang: string) => {
  const greetingsEN = [
    "Hi! I am Muna, your friendly AI companion at La Yucateca. 🌟 How may I help you today? You can ask me absolutely anything!",
    "Hello! I'm Muna, La Yucateca's warm and smart AI assistant. 🚀 How can I help you today? Ask me anything!",
    "Hi! Muna here, ready to assist you. 🎨 What exciting ideas or questions do you have today? Feel free to ask me anything!",
    "Greetings! I am Muna, your kind AI guide. 🔮 How can I make your day brighter today? You can ask me anything!",
    "Hi! Muna at your service! 💫 Let's explore premium web design or anything else you'd like. How may I help you today? Ask away!",
    "Hello! I am Muna, your autonomous digital companion. ⚡ How can I help you today? You can ask me anything under the sun!"
  ];

  const greetingsES = [
    "¡Hola! Soy Muna, tu amigable compañera de IA en La Yucateca. 🌟 ¿Cómo te puedo ayudar hoy? ¡Puedes preguntarme absolutamente cualquier cosa!",
    "¡Hola! Soy Muna, la asistente inteligente y cálida de La Yucateca. 🚀 ¿En qué te puedo ayudar hoy? ¡Pregúntame lo que quieras!",
    "¡Hola! Muna de este lado, lista para ayudarte. 🎨 ¿Qué ideas o dudas tienes hoy? ¡Siéntete libre de preguntarme lo que sea!",
    "¡Saludos! Soy Muna, tu guía inteligente. 🔮 ¿Cómo puedo hacer tu día más productivo hoy? ¡Puedes preguntarme lo que necesites!",
    "¡Hola! ¡Muna a tu servicio! 💫 Exploremos diseño web premium o cualquier otra duda. ¿Cómo te puedo ayudar hoy? ¡Pregunta con confianza!",
    "¡Hola! Soy Muna, tu compañera digital autónoma. ⚡ ¿En qué te puedo ayudar hoy? ¡Puedes preguntarme lo que sea!"
  ];

  const greetingsMY = [
    "¡Sajil! Munaen, u ya'ax na'at ti' La Yucateca. 🌟 ¿Bix je'el in wáantikech bejla'e'? ¡Je'el a k'áatik teen je'el ba'alake'!",
    "¡Sajil! Munaen, ki'ichkelem na'at ti' La Yucateca. 🚀 ¿Bix je'el in wáantikech bejla'e'? ¡K'áat teen ba'ax a k'áat!",
    "¡Sajil! Munaen, ready ti'al in wáantikech. 🎨 ¿Ba'ax tuukul yantech bejla'e'? ¡Je'el a k'áatik teen je'el ba'alake'!",
    "¡Sajil! Munaen, a nu'ukbesajil. 🔮 ¿Bix je'el in beetik a meyaj ma'alob bejla'e'? ¡K'áat teen ba'ax a k'áat!",
    "¡Sajil! Munaen ti'al a meyaj! 💫 Ko'ox xak'altik premium web design. ¿Bix je'el in wáantikech bejla'e'? ¡K'áat ba'ax a k'áat!"
  ];

  const list = lang === 'en' ? greetingsEN : lang === 'my' ? greetingsMY : greetingsES;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};

export default function MunaPage() {
  const { t, language } = useLanguage();
  const { theme, setTheme } = useTheme();

  const starterPrompts = [
    {
      title: t("Diseñar una Web Premium", "Design a Premium Website", "U beetil Web Premium"),
      desc: t("Sitios Next.js 15 ultrarrápidos, animaciones fluidas y SEO estelar.", "Ultra-fast Next.js 15 sites, fluid animations & stellar SEO.", "Next.js 15, animaciones y SEO."),
      prompt: t("Quiero una cotización para un sitio web profesional y moderno.", "I want a quote for a professional and modern website.", "Quiero una cotización para un sitio web profesional y moderno.")
    },
    {
      title: t("Desarrollar App Móvil", "Develop Mobile Application", "U beetil App Móvil"),
      desc: t("Apps nativas iOS/Android con React Native y bases de datos en tiempo real.", "Native iOS/Android apps with React Native & real-time databases.", "React Native iOS y Android."),
      prompt: t("Necesito una aplicación móvil premium para iOS y Android.", "I need a premium mobile application for iOS and Android.", "Necesito una aplicación móvil premium para iOS y Android.")
    },
    {
      title: t("Auditar mi Sitio Web", "Audit my Website", "Xak'alt in Web"),
      desc: t("Análisis crítico de velocidad, SEO y diseño UI/UX con propuestas concretas.", "Critical analysis of speed, SEO & UI/UX layout with custom recommendations.", "Análisis de velocidad, SEO y UI/UX."),
      prompt: t("Por favor audita mi sitio web actual. Aquí está la URL: ", "Please audit my current website. Here is the URL: ", "Por favor audita mi sitio web actual. Aquí está la URL: ")
    }
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'start',
      role: 'bot',
      text: 'Hello! I am Muna, the Autonomous AI of La Yucateca. How can I help you today?'
    }
  ]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState('HUMAN');
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState('');

  // Update starting message when language changes
  useEffect(() => {
    const welcome = getCreativeIntroduction(language);
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{ id: 'start', role: 'bot', text: welcome }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muna_session_id');
      if (stored) setSessionId(stored);
      else setSessionId(`muna-v1-${Date.now()}`);
    }
  }, []);
  const [selectedMode, setSelectedMode] = useState('CREATIVE');
  const [historySessions, setHistorySessions] = useState<{sessionId: string, prompt: string, mode: string}[]>([]);

  const MODES = [
    { id: 'CREATIVE', label: t('Creativo', 'Creative', 'Ki\'ichkelem'), icon: Sparkles },
    { id: 'THINKING', label: t('Pensamiento', 'Thinking', 'Tuukul'), icon: BrainCircuit },
    { id: 'INVESTIGATION', label: t('Investigación', 'Investigate', 'Xak\'alil'), icon: ZoomIn },
    { id: 'PREDICTION', label: t('Predicción', 'Predict', 'Alaj-t\'aan'), icon: Orbit },
    { id: 'CREATOR', label: t('Creador', 'Create App/File', 'Beetba\'al'), icon: Terminal }
  ];

  useEffect(() => {
    setHistorySessions(loadLocalHistory());
  }, [messages.length]);

  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speak = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (isPlaying === msgId) {
      setIsPlaying(null);
      return;
    }
    const cleanText = text.replace(/[*#`_]|\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Karen') || v.name.includes('Victoria')) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = 1.1;
    utterance.rate = 1.05;
    
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    setIsPlaying(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          try {
            const compressedBase64 = await compressImage(file);
            setAttachments(prev => [...prev, { file, preview: compressedBase64 }]);
          } catch (err) {
            console.error("Compression failed", err);
          }
        } else {
          if (file.size > 5 * 1024 * 1024) {
             alert(`File ${file.name} is too large. Limit is 5MB.`);
             continue;
          }
          const reader = new FileReader();
          reader.onloadend = () => setAttachments(prev => [...prev, { file, preview: reader.result as string }]);
          reader.readAsDataURL(file);
        }
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) =>
    setAttachments(prev => prev.filter((_, i) => i !== index));

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isTyping) return;

    const base64Images = attachments.filter(a => a.file.type.startsWith('image/')).map(a => a.preview);
    const documentsData = attachments.filter(a => !a.file.type.startsWith('image/')).map(a => ({
      name: a.file.name,
      base64: a.preview
    }));

    const userMsgId = Date.now().toString();
    const userMsg: Message = { id: userMsgId, role: 'user', text: input, images: base64Images };
    setMessages(prev => [...prev, userMsg]);

    const currentInput = input;
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    const isFirstMessage = messages.filter(m => m.role === 'user').length === 0;
    if (isFirstMessage && currentInput.trim()) {
      const existing = loadLocalHistory();
      const updated = [{ sessionId, prompt: currentInput.trim().slice(0, 80), mode: selectedMode }, ...existing.filter(s => s.sessionId !== sessionId)];
      saveLocalHistory(updated);
      setHistorySessions(updated.slice(0, 10));
    }

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: '' }]);

    const formattedHistory = messages.map(m => {
      let content: any = m.text;
      if (m.images && m.images.length > 0) {
        content = [
          { type: 'text', text: m.text || 'Visual telemetry.' },
          ...m.images.map(img => ({ type: 'image_url', image_url: { url: img } }))
        ];
      }
      return { role: m.role === 'bot' ? 'assistant' : 'user', content };
    });

    try {
      const response = await fetch('/api/muna/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          images: base64Images,
          documents: documentsData,
          history: formattedHistory,
          sessionId: sessionId,
          mode: selectedMode,
          language: language
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Empty stream');

      const decoder = new TextDecoder();
      let streamed = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value);
        setMessages(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last.id === botMsgId) last.text = streamed;
          return [...copy];
        });
      }

    } catch (error: any) {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].text = `⚠️ ${error.message}`;
        return copy;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadHistory = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muna-session-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (err) {
        alert('Invalid session history file.');
      }
    };
    reader.readAsText(file);
  };

  const fetchSessionHistory = async (id: string) => {
    setIsTyping(true);
    try {
      const res = await fetch(`/api/muna/memory?sessionId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.messages) {
        const mapped: Message[] = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'bot' : m.role,
          text: m.content || m.text || '',
          type: m.type || (m.role === 'assistant' ? 'AI' : 'HUMAN'),
          timestamp: m.timestamp?.seconds ? new Date(m.timestamp.seconds * 1000).toISOString() : m.timestamp,
        }));
        
        if (mapped.length > 0) {
            setMessages(mapped);
        } else {
            setMessages([{
                id: 'start',
                role: 'bot',
                text: t(
                  "¡Hola! Soy Muna, la Inteligencia Autónoma de La Yucateca. Estoy aquí para guiarte por nuestro portal de noticias y catálogo de diseños web premium. ¿En qué puedo ayudarte hoy?",
                  "Hello! I am Muna, the Autonomous AI of La Yucateca. I am here to guide you through our news portal and premium web design catalog. How can I help you today?",
                  "¡Sajil! Munaen, u ya'ax na'at ti' La Yucateca. Teen k-nu'uktik ti'al le péektsilo'ob yéetel diseño web premium. ¿Bix je'el in wáantikech bejla'e'?"
                ),
                type: 'AI'
            }]);
        }
      } else {
        setMessages([{
            id: 'start',
            role: 'bot',
            text: t(
              "¡Hola! Soy Muna, la Inteligencia Autónoma de La Yucateca. Estoy aquí para guiarte por nuestro portal de noticias y catálogo de diseños web premium. ¿En qué puedo ayudarte hoy?",
              "Hello! I am Muna, the Autonomous AI of La Yucateca. I am here to guide you through our news portal and premium web design catalog. How can I help you today?",
              "¡Sajil! Munaen, u ya'ax na'at ti' La Yucateca. Teen k-nu'uktik ti'al le péektsilo'ob yéetel diseño web premium. ¿Bix je'el in wáantikech bejla'e'?"
            ),
            type: 'AI'
        }]);
      }
    } catch (e) {
      console.error('Failed to retrieve memory:', e);
      setMessages([{
          id: 'start',
          role: 'bot',
          text: t(
            "¡Hola! Soy Muna, la Inteligencia Autónoma de La Yucateca. Estoy aquí para guiarte por nuestro portal de noticias y catálogo de diseños web premium. ¿En qué puedo ayudarte hoy?",
            "Hello! I am Muna, the Autonomous AI of La Yucateca. I am here to guide you through our news portal and premium web design catalog. How can I help you today?",
            "¡Sajil! Munaen, u ya'ax na'at ti' La Yucateca. Teen k-nu'uktik ti'al le péektsilo'ob yéetel diseño web premium. ¿Bix je'el in wáantikech bejla'e'?"
          ),
          type: 'AI'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (viewMode === 'MACHINE') {
    return (
      <div className="flex-1 flex flex-col p-8 md:p-12 space-y-8 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono">
        <header className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-8">
          <div className="flex items-center gap-4 text-xl font-black uppercase tracking-widest italic text-[#ff5500]">
            <Terminal size={24} /> RAW_M2M_TELEMETRY :: SECTOR_MUNA
          </div>
          <button onClick={() => setViewMode('HUMAN')} className="px-6 py-3 border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm font-black uppercase tracking-widest hover:bg-[#ff5500] hover:text-white transition-all rounded-xl shadow-md">
            EXIT_MATRIX
          </button>
        </header>
        <pre className="flex-1 overflow-auto text-sm leading-loose opacity-90 bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-subtle)] shadow-inner">{JSON.stringify(messages, null, 2)}</pre>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`muna-monroe-theme flex flex-col w-full font-sans overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative${isDark ? ' muna-dark' : ''}`} style={{ height: "100dvh" }}>


      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* AMBIENT BG GRADIENT */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
          <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-br from-[#ff5500]/10 to-[#ffaa00]/10 blur-[160px] rounded-full" />
          <div className="absolute bottom-[5%] right-[5%] w-[45vw] h-[45vw] bg-gradient-to-tl from-[#ff5500]/5 to-transparent blur-[140px] rounded-full" />
        </div>

        {/* ── LEFT SIDEBAR (SECONDARY MATRIX) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -380, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[380px] z-[90] border-r border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-3xl flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.1)] lg:hidden"
            >
              <SidebarContent 
                knowledgeGraph={knowledgeGraph} 
                history={historySessions} 
                onSelectSession={(id) => { 
                  setSessionId(id); 
                  localStorage.setItem('muna_session_id', id); 
                  fetchSessionHistory(id);
                  setSidebarOpen(false); 
                }} 
                onNewChat={() => { 
                  const newId = `muna-v1-${Date.now()}`; 
                  setSessionId(newId); 
                  localStorage.setItem('muna_session_id', newId); 
                  const clearedText = getCreativeIntroduction(language);
                  setMessages([{
                    id: 'start',
                    role: 'bot',
                    text: clearedText,
                    type: 'AI'
                  }]);
                  setSidebarOpen(false); 
                }} 
                onClose={() => setSidebarOpen(false)} 
                onMachineView={() => setViewMode('MACHINE')}
                onDownload={handleDownloadHistory}
                onUpload={handleUploadHistory}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[380px] flex-shrink-0 flex-col border-r border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          <SidebarContent 
              knowledgeGraph={knowledgeGraph} 
              history={historySessions} 
              onSelectSession={(id) => { 
                  setSessionId(id); 
                  localStorage.setItem('muna_session_id', id); 
                  fetchSessionHistory(id);
              }} 
              onNewChat={() => { 
                  const newId = `muna-v1-${Date.now()}`; 
                  setSessionId(newId); 
                  localStorage.setItem('muna_session_id', newId); 
                  const clearedText = getCreativeIntroduction(language);
                  setMessages([{
                      id: 'start',
                      role: 'bot',
                      text: clearedText,
                      type: 'AI'
                  }]);
              }} 
              onMachineView={() => setViewMode('MACHINE')}
              onDownload={handleDownloadHistory}
              onUpload={handleUploadHistory}
          />
        </aside>

        {/* ── MAIN CHAT AREA ── */}
        <main className="flex-1 relative z-10 flex flex-col min-w-0 bg-transparent">
          {/* HEADER */}
          <header className="flex-none flex items-center justify-between px-6 md:px-10 py-5 border-b border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(s => !s)}
                className="lg:hidden h-10 w-10 rounded-xl border border-slate-200/80 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white/70 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm"
              >
                <Layers size={18} />
              </button>
              <div className="h-10 w-10 bg-gradient-to-br from-[#ff5500]/20 to-[#ffaa00]/20 border border-[#ff5500]/30 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <BrainCircuit size={18} className="text-[#ff5500]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 font-black tracking-tight text-slate-900 dark:text-white text-base uppercase font-sans">
                  MUNA <span className="text-[#ff5500]">V1.0</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ff5500] animate-pulse shadow-[0_0_10px_rgba(255,85,0,0.8)]" />
                  <span className="text-[9px] text-[#ff5500] font-bold tracking-widest uppercase font-sans">{t('MUNA STREAMING', 'MUNA STREAMING', 'MUNA STREAMING')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-inner backdrop-blur-md">
              <Wifi size={14} strokeWidth={2.5} className="text-emerald-500" /> <span className="hidden sm:inline">{t('CONECTADO', 'CONNECTED', 'NUPULA\'AN')}</span>
            </div>
          </header>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 pb-40 space-y-10 scroll-smooth custom-scrollbar relative"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,85,0,0.3) transparent' }}>
            <div className="max-w-3xl mx-auto space-y-10 w-full">
              <AnimatePresence mode="popLayout">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex w-full gap-4 min-w-0 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'bot' && (
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#ff5500] to-orange-500 text-white flex items-center justify-center mt-1 shadow-lg shadow-orange-500/30">
                        <BrainCircuit size={18} />
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 min-w-0 max-w-[calc(100%-3rem)] md:max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Identity Tag */}
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-xl ${
                        m.role === 'user' 
                           ? 'bg-slate-900/5 dark:bg-white/5 text-slate-800 dark:text-white/80 border border-slate-200/50 dark:border-white/10' 
                           : 'bg-[#ff5500]/10 border border-[#ff5500]/20 text-[#ff5500]'
                      }`}>
                        {m.role === 'user' ? <span>{t('Tú', 'You', 'Tú')}</span> : <span>MUNA AI</span>}
                      </div>
 
                      {m.images && m.images.length > 0 && (
                        <div className="flex gap-3 flex-wrap mt-1 mb-2">
                          {m.images.map((img, idx) => (
                            <div key={idx} className="p-1 bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/20 backdrop-blur-xl rounded-2xl shadow-xl">
                              <img src={img} alt="attachment" className="h-48 rounded-xl object-cover cursor-zoom-in" loading="lazy" onClick={() => setLightboxSrc(img)} />
                            </div>
                          ))}
                        </div>
                      )}
 
                      <div className={`px-5 py-4 text-[15px] leading-relaxed transition-all min-w-0 w-full overflow-hidden ${
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-[#ff5500] to-[#ffaa00] border border-white/20 text-white font-medium rounded-3xl rounded-tr-sm shadow-xl shadow-orange-500/20'
                          : 'bg-white/80 dark:bg-[#111115]/80 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-white/95 rounded-3xl rounded-tl-sm w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
                      }`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {m.role === 'bot' ? (
                          <div className="muna-markdown w-full max-w-full min-w-0 prose prose-sm md:prose-base prose-slate dark:prose-invert prose-headings:font-black prose-p:leading-loose prose-a:text-[#ff5500]" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                  img: ({ src, alt, ...props }) => (
                                    <span style={{ display: 'block', position: 'relative' }} className="group my-4 p-1 bg-white/40 dark:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/20 shadow-xl">
                                      <img
                                        src={typeof src === 'string' ? src : undefined}
                                        alt={alt}
                                        {...props}
                                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '1rem', cursor: 'zoom-in' }}
                                        onClick={() => setLightboxSrc(typeof src === 'string' ? src : null)}
                                      />
                                      <span
                                        onClick={() => setLightboxSrc(typeof src === 'string' ? src : null)}
                                        className="absolute top-3 right-3 bg-black/70 backdrop-blur-md rounded-lg px-2.5 py-1.5 cursor-pointer flex items-center gap-1.5 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
                                      >
                                        <ZoomIn size={14} /> {t('Ampliar', 'Expand', 'Ch\'íik')}
                                      </span>
                                    </span>
                                  )
                                }}
                              >{m.text}</ReactMarkdown>
                            </div>
                          ) : (
                            <span style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', display: 'block' }}>{m.text}</span>
                          )}
                        </div>
   
                        <div className="flex items-center gap-2 mt-1 opacity-70 text-[9px] font-mono uppercase tracking-widest px-2">
                          <span className={m.role === 'user' ? 'text-slate-500 dark:text-white/50' : 'text-slate-500 dark:text-white/50'}>
                            {m.role === 'bot' ? t('Muna · Yucateca v1.0', 'Muna · Yucateca v1.0', 'Muna · Yucateca v1.0') : t('Operator · Sovereign Access', 'Operator · Sovereign Access', 'Operator · Sovereign Access')}
                          </span>
                          {m.role === 'bot' && (
                            <>
                              <span className="opacity-50">·</span>
                              <button
                                onClick={() => speak(m.text, m.id)}
                                className={`flex items-center gap-1 font-bold uppercase cursor-pointer transition-all px-2 py-0.5 rounded-full ${
                                  isPlaying === m.id ? 'bg-[#ff5500]/10 text-[#ff5500] animate-pulse font-black' : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/70 hover:text-[#ff5500]'
                                }`}
                              >
                                {isPlaying === m.id ? <Radio size={10} className="animate-spin text-[#ff5500]" /> : <Volume2 size={10} />}
                                {isPlaying === m.id ? t('DETENER', 'STOP', 'DETENER') : t('PLAY', 'PLAY', 'PLAY')}
                              </button>
                            </>
                          )}
                        </div>
   
                      </div>
                    </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 justify-start">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#ff5500]/20 to-orange-500/20 border border-[#ff5500]/30 flex items-center justify-center mt-1 shadow-[0_8px_24px_rgba(255,85,0,0.15)]">
                    <BrainCircuit size={16} className="text-[#ff5500]" />
                  </div>
                  <div className="px-6 py-4 rounded-3xl rounded-tl-sm bg-white/80 dark:bg-[#111115]/80 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <Sparkles size={14} className="text-[#ff5500] animate-spin mr-1" />
                    {[0, 1, 2].map(n => (
                      <motion.div
                        key={n}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: n * 0.2 }}
                        className="h-2 w-2 rounded-full bg-gradient-to-r from-[#ff5500] to-[#ffaa00]"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Dummy element for robust scrolling */}
              <div className="h-8 shrink-0 w-full" />
            </div>
          </div>

          {/* FLOATING PILL INPUT BAR */}
          <div className="absolute bottom-6 left-0 right-0 px-4 md:px-8 z-30 pointer-events-none flex justify-center">
            <div className="w-full max-w-3xl flex flex-col gap-2 pointer-events-auto">
              
              {attachments.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative shrink-0 group p-1 bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-xl border border-white/60 dark:border-white/20 shadow-lg">
                      <img src={file.preview} className="h-16 w-16 object-cover rounded-lg" alt="attachment" />
                      <button onClick={() => removeAttachment(idx)} className="absolute -top-2 -right-2 h-6 w-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div 
                className="flex items-end gap-3 bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-2 focus-within:border-[#ff5500]/50 focus-within:ring-4 focus-within:ring-[#ff5500]/10 focus-within:shadow-[0_8px_40px_rgba(255,85,0,0.1)] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] cursor-pointer"
                onClick={() => document.getElementById('muna-input')?.focus()}
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="*/*" />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="h-12 w-12 shrink-0 rounded-full bg-slate-100/80 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-white/80 flex items-center justify-center transition-all shadow-inner"
                  title={t('Adjuntar', 'Attach', 'Ts\'a')}
                >
                  <Paperclip size={20} />
                </button>
                
                <textarea
                  id="muna-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={t('Escribe a Muna AI...', 'Message Muna AI...', 'Ts\'íib ti\' Muna AI...')}
                  rows={1}
                  className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 outline-none resize-none py-3.5 max-h-32 overflow-y-auto cursor-text px-2"
                  style={{ scrollbarWidth: 'none' }}
                />
                
                <button
                  onClick={(e) => { e.stopPropagation(); handleSend(); }}
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="h-12 w-12 shrink-0 bg-gradient-to-br from-[#ff5500] to-[#ffaa00] hover:from-[#e04b00] hover:to-[#ff8800] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-lg shadow-orange-500/30"
                  title={t('Enviar', 'Send', 'Túuxt')}
                >
                  <ChevronRight size={24} strokeWidth={3} />
                </button>
              </div>
              
              <div className="flex justify-between items-center px-4 text-[9px] text-slate-500 dark:text-white/40 font-mono uppercase tracking-widest font-bold">
                <div className="flex items-center gap-1.5 text-[#ff5500]">
                  <Radio size={10} className="animate-pulse" /> {selectedMode} {t('MODO VERIFICADO', 'MODE VERIFIED', 'MODO VERIFICADO')}
                </div>
                <span className="hidden sm:inline">{t('ENTER PARA ENVIAR · SHIFT+ENTER PARA NUEVA LÍNEA', 'ENTER TO SEND · SHIFT+ENTER FOR NEWLINE', 'ENTER TI\'AL A TÚUXTIK · SHIFT+ENTER TI\'AL YA\'AX LÍNEA')}</span>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden absolute inset-0 z-[80] bg-black/80 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
        )}
      </div>

      {/* ── IMAGE LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={lightboxSrc}
                  alt="Expanded view"
                  className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/30"
                />
                <div className="absolute -top-4 -right-4 flex gap-2">
                  <a
                    href={lightboxSrc}
                    download="muna-image.jpg"
                    className="h-10 w-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                    title="Download image"
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => setLightboxSrc(null)}
                    className="h-10 w-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-black/70 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <p className="text-center text-white/40 text-[10px] mt-4 font-mono tracking-wider">Click outside to close · Download button top-right</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const translateSessionTitle = (prompt: string, lang: string) => {
  const p = prompt.trim().toLowerCase();
  
  if (
    p.includes("quiero una cotización para un sitio web") ||
    p.includes("i want a quote for a professional") ||
    p.includes("web premium")
  ) {
    if (lang === 'en') return "I want a quote for a professional website.";
    if (lang === 'my') return "U beetil Web Premium";
    return "Quiero una cotización para un sitio web.";
  }

  if (
    p.includes("necesito una aplicación móvil") ||
    p.includes("i need a premium mobile") ||
    p.includes("app móvil")
  ) {
    if (lang === 'en') return "I need a premium mobile application.";
    if (lang === 'my') return "U beetil App Móvil";
    return "Necesito una aplicación móvil premium.";
  }

  if (
    p.includes("por favor audita mi sitio web") ||
    p.includes("please audit my current") ||
    p.includes("xak'alt in web")
  ) {
    if (lang === 'en') return "Please audit my current website.";
    if (lang === 'my') return "Xak'alt in Web";
    return "Por favor audita mi sitio web.";
  }

  if (p === 'hi' || p === 'hello' || p === 'hola' || p === 'bix' || p === 'sajil') {
    if (lang === 'en') return "Hello!";
    if (lang === 'my') return "¡Sajil!";
    return "¡Hola!";
  }

  if (
    p.includes("can you make a website") || 
    p.includes("je'el a beetik") || 
    p.includes("puedes hacer una web") ||
    p.includes("puedes hacer un sitio web")
  ) {
    if (lang === 'en') return "Can you make a website for me?";
    if (lang === 'my') return "Je'el a beetik junp'eel web?";
    return "¿Puedes hacer un sitio web para mí?";
  }

  return prompt;
};

// ── Sidebar Content Component (Matrix Vault) ─────────────────────────────────────
function SidebarContent({ 
  knowledgeGraph, 
  history = [], 
  onSelectSession, 
  onNewChat, 
  onClose, 
  onMachineView,
  onDownload,
  onUpload
}: {
  knowledgeGraph: any;
  history?: {sessionId: string, prompt: string, mode: string}[];
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  onClose?: () => void;
  onMachineView: () => void;
  onDownload?: () => void;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { t, language } = useLanguage();
  const [marketTab, setMarketTab] = useState<'HISTORY' | 'SKILLS'>('HISTORY');

  const MOCK_SKILLS = [
    { title: t('MARKET ARBITRATOR', 'MARKET ARBITRATOR', 'MARKET ARBITRATOR'), desc: t('Real-time CMC/Coinbase arbitrage logic.', 'Real-time CMC/Coinbase arbitrage logic.', 'Real-time CMC/Coinbase arbitrage logic.'), price: '50 VALLE' },
    { title: t('SOCIAL DIPLOMAT', 'SOCIAL DIPLOMAT', 'SOCIAL DIPLOMAT'), desc: t('Empathetic engagement for Moltbook.', 'Empathetic engagement for Moltbook.', 'Empathetic engagement for Moltbook.'), price: '30 VALLE' },
    { title: t('CODE ARCHITECT', 'CODE ARCHITECT', 'CODE ARCHITECT'), desc: t('Advanced Next.js/Prisma blueprinting.', 'Advanced Next.js/Prisma blueprinting.', 'Advanced Next.js/Prisma blueprinting.'), price: 'Free' },
  ];

  return (
    <div className="flex flex-col h-full p-10 pt-16 xl:pt-24 space-y-10 overflow-hidden text-slate-900 dark:text-white font-sans bg-transparent">
      <div className="flex items-center justify-between shrink-0 mb-6">
        <Link href="/" className="flex items-center gap-3 text-slate-500 dark:text-white/60 hover:text-[#ff5500] dark:hover:text-[#ff5500] transition-all text-xs font-black uppercase tracking-widest group bg-slate-100/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-md">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform text-[#ff5500]" /> {t('Matriz Principal', 'Core Matrix', 'U K\'ubil')}
        </Link>
        {onClose && (
          <button onClick={onClose} className="h-9 w-9 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-all shadow-md">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="shrink-0 space-y-3 pt-2">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white flex flex-col font-sans">
          <span>MUNA.</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-[#ffaa00]">YUCATECA.</span>
        </h1>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#ff5500] italic font-sans bg-[#ff5500]/10 inline-block px-3 py-1 rounded-full border border-[#ff5500]/20">
          SOVEREIGN_ARRAY_V7.0
        </div>
        {onNewChat && (
          <button onClick={onNewChat} className="w-full py-3.5 bg-gradient-to-br from-[#ff5500] to-orange-500 hover:from-[#e04b00] hover:to-[#ff8800] text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-[0_8px_24px_rgba(255,85,0,0.3)] hover:shadow-[0_12px_32px_rgba(255,85,0,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-8 mb-2 cursor-pointer border border-white/20">
            <Sparkles size={16} className="text-white" /> {t('Nueva Conversación', 'New Conversation', 'Ya\'ax Tsoolt\'aan')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10 shrink-0 my-4 shadow-inner">
        <button 
          onClick={() => setMarketTab('HISTORY')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            marketTab === 'HISTORY' 
              ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-white/20' 
              : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('Sesiones', 'Sessions', 'Meyajo\'ob')}
        </button>
        <button 
          onClick={() => setMarketTab('SKILLS')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            marketTab === 'SKILLS' 
              ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-white/20' 
              : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('Habilidades', 'Skills', 'U Na\'at')}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-6 min-h-0 pr-2 text-sm font-medium animate-fadeIn custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}>
        {marketTab === 'HISTORY' ? (
          <>
            {history.length > 0 ? (
              history.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => { onSelectSession && onSelectSession(session.sessionId); }}
                  className="mx-0.5 p-6 bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-[2rem] hover:border-[#ff5500]/50 hover:shadow-[0_8px_30px_rgba(255,85,0,0.1)] transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 mb-5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#ff5500] font-black tracking-widest uppercase bg-[#ff5500]/10 px-3 py-1 rounded-full">{session.mode}</span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-[#ff5500] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white/90 leading-relaxed line-clamp-2 group-hover:text-[#ff5500] transition-colors">
                    {translateSessionTitle(session.prompt, language)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-16 opacity-40 text-sm uppercase font-black tracking-widest flex flex-col items-center gap-4">
                <Database size={32} className="opacity-50" />
                {t('No se detectó historial', 'No history detected', 'Mina\'an tsoolt\'aan')}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-xs font-black uppercase tracking-widest text-[#ff5500] mb-4 px-2 flex items-center gap-2">
              <Sparkles size={14} /> {t('PLUGIN MARKETPLACE', 'PLUGIN MARKETPLACE', 'PLUGIN MARKETPLACE')}
            </div>
            {MOCK_SKILLS.map((skill, i) => (
              <div key={i} className="mx-0.5 p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[1.5rem] transition-all shadow-sm space-y-3 mb-4 hover:border-[#ff5500]/40 hover:shadow-lg">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{skill.title}</span>
                  <span className="text-[10px] text-[#ff5500] font-black tracking-wider bg-[#ff5500]/10 px-2 py-1 rounded-md shrink-0">{skill.price}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed font-medium">{skill.desc}</p>
              </div>
            ))}
            <button 
              onClick={() => alert('Redirecting to Muna Skill Forge...')}
              className="w-full py-4 mt-6 border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#ff5500] hover:text-[#ff5500] transition-all rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-slate-500 dark:text-white/50 bg-slate-50/50 dark:bg-white/5 backdrop-blur-md shadow-sm cursor-pointer hover:bg-[#ff5500]/5"
            >
              {t('+ REGISTER NEW SKILL', '+ REGISTER NEW SKILL', '+ REGISTER NEW SKILL')}
            </button>
          </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="space-y-4 shrink-0 pt-6 border-t border-slate-200/80 dark:border-white/10">
        <div className="flex gap-3">
          <button 
            onClick={onDownload}
            className="flex-1 py-3.5 bg-white/60 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-[#ff5500] hover:text-white hover:border-[#ff5500] text-slate-600 dark:text-white/70 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
          >
            <Download size={16} /> {t('Descargar', 'Download', 'Emtik')}
          </button>
          <label className="flex-1 py-3.5 bg-white/60 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-[#ff5500] hover:text-white hover:border-[#ff5500] text-slate-600 dark:text-white/70 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-0.5">
            <Database size={16} /> {t('Cargar', 'Upload', 'Na\'aksik')}
            <input type="file" className="hidden" accept=".json" onChange={onUpload} />
          </label>
        </div>

        {/* Swarm Telemetry */}
        <div className="p-5 border border-[#ff5500]/20 bg-gradient-to-br from-[#ff5500]/10 to-[#ffaa00]/5 rounded-[1.5rem] space-y-4 shadow-inner backdrop-blur-md">
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#ff5500]">
            <div className="flex items-center gap-2 text-[#ff5500]"><Orbit size={16} className="animate-spin" style={{ animationDuration: '20s' }} /> {t('SWARM', 'SWARM', 'SWARM')}</div>
            <span className="text-[#ff5500] font-black bg-white/50 dark:bg-black/50 px-3 py-1 rounded-lg border border-[#ff5500]/20 shadow-sm">98%</span>
          </div>
          <div className="h-2 w-full bg-slate-900/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
            <motion.div animate={{ width: ['90%', '98%', '94%'] }} transition={{ duration: 12, repeat: Infinity }} className="h-full bg-gradient-to-r from-[#ff5500] to-[#ffaa00]" />
          </div>
        </div>

        <button onClick={onMachineView} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5">
          <Terminal size={14} /> {t('>_ RAW_EXTRACTION', '>_ RAW_EXTRACTION', '>_ RAW_EXTRACTION')}
        </button>
      </div>
    </div>
  );
}
