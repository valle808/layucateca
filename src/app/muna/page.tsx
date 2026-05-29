'use client';

export const dynamic = "force-dynamic";

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
      <div className="flex-1 flex flex-col p-6 space-y-6 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono">
        <header className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-6">
          <div className="flex items-center gap-3 text-lg font-black uppercase tracking-widest italic text-[#ff5500]">
            <Terminal size={22} /> RAW_M2M_TELEMETRY :: SECTOR_MUNA
          </div>
          <button onClick={() => setViewMode('HUMAN')} className="px-5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs font-black uppercase tracking-widest hover:bg-[#ff5500] hover:text-white transition-all rounded-xl shadow-sm">
            EXIT_MATRIX
          </button>
        </header>
        <pre className="flex-1 overflow-auto text-xs leading-loose opacity-80 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-inner">{JSON.stringify(messages, null, 2)}</pre>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`muna-monroe-theme flex flex-col w-full font-sans overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative${isDark ? ' muna-dark' : ''}`} style={{ height: "100vh" }}>


      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* AMBIENT BG GRADIENT */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-65">
          <div className="absolute top-[15%] left-[25%] w-[60vw] h-[60vw] bg-[#ff5500]/4 blur-[140px] rounded-full" />
          <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-[#ff5500]/3 blur-[110px] rounded-full" />
        </div>

        {/* ── LEFT SIDEBAR (SECONDARY MATRIX) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-72 z-[90] border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] backdrop-blur-3xl flex flex-col shadow-2xl lg:hidden"
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
        <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative z-10">
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
        <main className="flex-1 relative z-10 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-primary)]">
          {/* HEADER */}
          <header className="flex-none flex items-center gap-3 px-6 py-3.5 border-b border-[var(--border-subtle)] bg-transparent backdrop-blur-md z-20">
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="lg:hidden h-8 w-8 rounded-xl border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-white shadow-2xs"
            >
              <Layers size={15} />
            </button>
            <div className="h-8 w-8 bg-[#ff5500]/8 border border-[#ff5500]/20 rounded-full flex items-center justify-center shadow-2xs shrink-0">
              <BrainCircuit size={16} className="text-[#ff5500]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 font-black tracking-tight text-[var(--text-primary)] text-xs uppercase font-sans">
                MUNA <span className="text-[#ff5500]">V1.0</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                <span className="text-[8px] text-[#ff5500] font-black tracking-widest uppercase font-sans">{t('MUNA STREAMING', 'MUNA STREAMING', 'MUNA STREAMING')}</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[9px] text-[#ff5500] font-black uppercase tracking-widest bg-[#ff5500]/5 px-3 py-1.5 rounded-full border border-[#ff5500]/15 shadow-2xs">
                <Wifi size={11} strokeWidth={2.5} className="text-[#ff5500]" /> {t('CONECTADO', 'CONNECTED', 'NUPULA\'AN')}
              </div>
            </div>
          </header>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth pb-44"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,85,0,0.3) transparent' }}>
            <div className="max-w-3xl mx-auto space-y-6" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <AnimatePresence mode="popLayout">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex w-full gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'bot' && (
                      <div className="h-8 w-8 shrink-0 rounded-full bg-[#ff5500]/5 border border-[#ff5500]/10 flex items-center justify-center mt-1 shadow-2xs">
                        <BrainCircuit size={14} className="text-[#ff5500]" />
                      </div>
                    )}

                    <div className={`max-w-[82%] flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Identity Tag */}
                      <div className={`flex items-center gap-1 mb-0.5 px-3 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase border shadow-2xs ${
                        m.role === 'user' 
                           ? 'bg-white text-black border-black/[0.06]' 
                           : 'bg-[#ff5500]/6 border-[#ff5500]/15 text-[#ff5500]'
                      }`}>
                        {m.role === 'user' ? <span>[{t('👤 OPERADOR', '👤 OPERATOR', '👤 OPERADOR')}]</span> : <span>[{t('🧠 MUNA AI', '🧠 MUNA AI', '🧠 MUNA AI')}]</span>}
                      </div>
 
                      {m.images && m.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {m.images.map((img, idx) => (
                            <img key={idx} src={img} alt="attachment" className="h-36 rounded-xl border border-[var(--border-subtle)] object-contain bg-white shadow-md" />
                          ))}
                        </div>
                      )}
 
                      <div className={`px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed transition-all border shadow-2xs ${
                        m.role === 'user'
                          ? 'bg-white border-black/[0.05] text-[#1e1b18] font-medium rounded-tr-md'
                          : 'bg-white border-black/[0.04] text-[#1e1b18] rounded-tl-md w-full'
                      }`}>
                        {m.role === 'bot' ? (
                          <div className="muna-markdown max-w-none text-[#1e1b18] w-full">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                  img: ({ src, alt, ...props }) => (
                                    <span style={{ display: 'block', position: 'relative' }} className="group my-2">
                                      <img
                                        src={typeof src === 'string' ? src : undefined}
                                        alt={alt}
                                        {...props}
                                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px', cursor: 'zoom-in' }}
                                        className="border border-[var(--border-subtle)] shadow-md"
                                        onClick={() => setLightboxSrc(typeof src === 'string' ? src : null)}
                                      />
                                      <span
                                        onClick={() => setLightboxSrc(typeof src === 'string' ? src : null)}
                                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <ZoomIn size={14} /> {t('Ampliar', 'Expand', 'Ch\'íik')}
                                      </span>
                                    </span>
                                  )
                                }}
                              >{m.text}</ReactMarkdown>
                            </div>
                          ) : (
                            <span>{m.text}</span>
                          )}
                        </div>
   
                        <div className="flex items-center gap-2 mt-1.5 opacity-65 text-[9px] font-mono uppercase tracking-widest px-1">
                          <span className="text-[var(--text-secondary)]">
                            {m.role === 'bot' ? t('Muna · Yucateca v1.0', 'Muna · Yucateca v1.0', 'Muna · Yucateca v1.0') : t('Operator · Sovereign Access', 'Operator · Sovereign Access', 'Operator · Sovereign Access')}
                          </span>
                          {m.role === 'bot' && (
                            <>
                              <span>·</span>
                              <button
                                onClick={() => speak(m.text, m.id)}
                                className={`flex items-center gap-1 font-bold uppercase cursor-pointer transition-all ${
                                  isPlaying === m.id ? 'text-[#ff5500] animate-pulse font-black' : 'text-[var(--text-secondary)] hover:text-[#ff5500]'
                                }`}
                              >
                                {isPlaying === m.id ? <Radio size={10} className="animate-spin text-[#ff5500]" /> : <Volume2 size={10} />}
                                {isPlaying === m.id ? t('DETENER', 'STOP AUDIO', 'DETENER') : t('PLAY AUDIO', 'PLAY AUDIO', 'PLAY AUDIO')}
                              </button>
                            </>
                          )}
                        </div>
   
                      </div>
                    </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center mt-1 shadow-2xs">
                    <BrainCircuit size={14} className="text-[#ff5500]" />
                  </div>
                  <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-2 shadow-sm">
                    <Sparkles size={14} className="text-[#ff5500] animate-spin mr-1" />
                    {[0, 1, 2].map(n => (
                      <motion.div
                        key={n}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: n * 0.2 }}
                        className="h-2 w-2 rounded-full bg-[#ff5500]"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* INPUT BAR */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent z-20 backdrop-blur-xs">
            <div className="max-w-3xl mx-auto space-y-2.5" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              {attachments.length > 0 && (
                <div className="flex gap-2.5 mb-1 overflow-x-auto pb-1">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative shrink-0 group">
                      <img src={file.preview} className="h-16 w-16 object-cover rounded-xl border border-[var(--border-accent)] shadow-md" alt="attachment" />
                      <button onClick={() => removeAttachment(idx)} className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 hover:scale-105">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mode Selector */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
                {MODES.map(m => {
                  const Icon = m.icon;
                  const isSelected = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMode(m.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-2xs ${
                        isSelected 
                          ? 'bg-[#ff5500] border-[#ff5500] text-[#1e1b18] shadow-2xs font-bold scale-[1.02]' 
                          : 'bg-white border-black/[0.05] text-[var(--text-secondary)] hover:text-black hover:border-[#ff5500]/30'
                      }`}
                    >
                      <Icon size={12} /> {m.label}
                    </button>
                  );
                })}
              </div>

              <div 
                className="flex items-end gap-2.5 bg-white border border-black/[0.06] rounded-full p-2 focus-within:border-[#ff5500] focus-within:shadow-[0_4px_25px_rgba(255,85,0,0.05)] transition-all shadow-md cursor-pointer pointer-events-auto"
                onClick={() => document.getElementById('muna-input')?.focus()}
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="*/*" />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="h-9 w-9 shrink-0 rounded-full bg-[#fdfbf7] hover:bg-black/5 text-[var(--text-secondary)] flex items-center justify-center transition-all pointer-events-auto border border-black/[0.04] shadow-2xs"
                  title={t('Adjuntar imágenes o documentos', 'Attach images or documents', 'Ts\'a ba\'alob')}
                >
                  <Paperclip size={15} />
                </button>
                <textarea
                  id="muna-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={t('Escribe a Muna AI...', 'Message Muna AI...', 'Ts\'íib ti\' Muna AI...')}
                  rows={1}
                  className="flex-1 bg-transparent text-[13px] font-medium text-black placeholder:text-[var(--text-secondary)] outline-none resize-none py-2.5 leading-relaxed max-h-32 overflow-y-auto cursor-text px-2"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleSend(); }}
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="h-9 w-9 shrink-0 bg-[#ff5500] hover:bg-[#e04b00] text-[#1e1b18] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-25 transition-all shadow-xs pointer-events-auto"
                  title={t('Transmitir Pulso', 'Transmit Pulse', 'Túuxt Pulse')}
                >
                  <ChevronRight size={18} strokeWidth={3} className="text-[#1e1b18]" />
                </button>
              </div>

              <div className="flex justify-between items-center mt-2 px-2 text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-widest font-bold">
                <div className="flex items-center gap-1.5 text-[#ff5500]">
                  <Radio size={11} className="animate-pulse" /> {selectedMode} {t('MODO VERIFICADO', 'MODE VERIFIED', 'MODO VERIFICADO')}
                </div>
                <span>{t('ENTER PARA ENVIAR · SHIFT+ENTER PARA NUEVA LÍNEA', 'ENTER TO SEND · SHIFT+ENTER FOR NEWLINE', 'ENTER TI\'AL A TÚUXTIK · SHIFT+ENTER TI\'AL YA\'AX LÍNEA')}</span>
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
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={lightboxSrc}
                alt="Expanded view"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/30"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <a
                  href={lightboxSrc}
                  download="muna-image.jpg"
                  className="h-10 w-10 bg-white text-black rounded-xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                  title="Download image"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={() => setLightboxSrc(null)}
                  className="h-10 w-10 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-center text-white/40 text-xs mt-3 font-mono tracking-wider">Click outside to close · Right-click to save · Download button top-right</p>
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
    <div className="flex flex-col h-full p-6 pt-16 xl:pt-20 space-y-6 overflow-hidden text-[var(--text-primary)] font-sans">
      <div className="flex items-center justify-between shrink-0 mb-6">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[#ff5500] transition-all text-[11px] font-black uppercase tracking-widest group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#ff5500]" /> {t('Matriz Principal', 'Core Matrix', 'U K\'ubil')}
        </Link>
        {onClose && (
          <button onClick={onClose} className="h-7 w-7 rounded-lg bg-white border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-2xs">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="shrink-0 space-y-2 pt-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none text-[var(--text-primary)] flex flex-col font-sans">
          <span>MUNA.</span>
          <span className="text-[#ff5500]">YUCATECA.</span>
        </h1>
        <div className="text-[9px] font-black uppercase tracking-widest text-[#ff5500] italic font-sans">
          SOVEREIGN_ARRAY_V7.0
        </div>
        {onNewChat && (
          <button onClick={onNewChat} className="w-full py-2.5 bg-[#ff5500] hover:bg-[#e04b00] text-[#1e1b18] font-black rounded-full text-[10px] uppercase tracking-widest shadow-xs hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 mt-6 mb-2 cursor-pointer">
            <Sparkles size={13} className="text-[#1e1b18]" /> {t('Nueva Conversación', 'New Conversation', 'Ya\'ax Tsoolt\'aan')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-black/[0.03] rounded-full border border-black/[0.04] shrink-0 my-2">
        <button 
          onClick={() => setMarketTab('HISTORY')}
          className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            marketTab === 'HISTORY' 
              ? 'bg-white text-black font-black shadow-xs border border-black/[0.03]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {t('Sesiones', 'Sessions', 'Meyajo\'ob')}
        </button>
        <button 
          onClick={() => setMarketTab('SKILLS')}
          className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            marketTab === 'SKILLS' 
              ? 'bg-white text-black font-black shadow-xs border border-black/[0.03]' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {t('Habilidades', 'Skills', 'U Na\'at')}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 min-h-0 pr-1 text-sm font-medium animate-fadeIn" style={{ scrollbarWidth: 'none' }}>
        {marketTab === 'HISTORY' ? (
          <>
            {history.length > 0 ? (
              history.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => { onSelectSession && onSelectSession(session.sessionId); }}
                  className="mx-0.5 p-4.5 bg-white/40 border border-black/[0.03] rounded-[20px] hover:border-[#ff5500]/40 transition-all cursor-pointer group shadow-2xs space-y-2 mb-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#ff5500] font-black tracking-widest uppercase">{session.mode}</span>
                    <ChevronRight size={12} className="text-[var(--text-secondary)] group-hover:text-[#ff5500] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)] leading-relaxed line-clamp-2 group-hover:text-[#ff5500] transition-colors">
                    {translateSessionTitle(session.prompt, language)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-40 text-xs uppercase font-black tracking-widest">{t('No se detectó historial', 'No history detected', 'Mina\'an tsoolt\'aan')}</div>
            )}
          </>
        ) : (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#ff5500] mb-2 px-1">{t('PLUGIN MARKETPLACE', 'PLUGIN MARKETPLACE', 'PLUGIN MARKETPLACE')}</div>
            {MOCK_SKILLS.map((skill, i) => (
              <div key={i} className="mx-0.5 p-4.5 bg-white/40 border border-black/[0.03] rounded-[20px] transition-all shadow-2xs space-y-2 mb-3 hover:border-[#ff5500]/30">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-black uppercase tracking-tight">{skill.title}</span>
                  <span className="text-[9px] text-[#ff5500] font-black tracking-wider">{skill.price}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{skill.desc}</p>
              </div>
            ))}
            <button 
              onClick={() => alert('Redirecting to Muna Skill Forge...')}
              className="w-full py-3.5 mt-3 border border-dashed border-black/[0.08] hover:border-[#ff5500] hover:text-[#ff5500] transition-all rounded-[20px] text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] bg-black/[0.01] shadow-2xs cursor-pointer"
            >
              {t('+ REGISTER NEW SKILL', '+ REGISTER NEW SKILL', '+ REGISTER NEW SKILL')}
            </button>
          </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="space-y-3 shrink-0 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex gap-2.5">
          <button 
            onClick={onDownload}
            className="flex-1 py-3 bg-white/40 border border-black/[0.03] hover:bg-[#ff5500] hover:text-white hover:border-[#ff5500] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download size={14} /> {t('Descargar', 'Download', 'Emtik')}
          </button>
          <label className="flex-1 py-3 bg-white/40 border border-black/[0.03] hover:bg-[#ff5500] hover:text-white hover:border-[#ff5500] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer">
            <Database size={14} /> {t('Cargar', 'Upload', 'Na\'aksik')}
            <input type="file" className="hidden" accept=".json" onChange={onUpload} />
          </label>
        </div>

        {/* Swarm Telemetry */}
        <div className="p-4 border border-[#ff5500]/15 bg-[#ff5500]/5 rounded-[20px] space-y-2.5 shadow-2xs">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#ff5500]">
            <div className="flex items-center gap-1.5 text-[#ff5500]"><Orbit size={13} className="animate-spin" style={{ animationDuration: '20s' }} /> {t('SWARM', 'SWARM', 'SWARM')}</div>
            <span className="text-[#ff5500] font-black">98%</span>
          </div>
          <div className="h-1.5 w-full bg-[#1e1b18]/10 rounded-full overflow-hidden">
            <motion.div animate={{ width: ['90%', '98%', '94%'] }} transition={{ duration: 12, repeat: Infinity }} className="h-full bg-[#ff5500]" />
          </div>
        </div>

        <button onClick={onMachineView} className="w-full py-3.5 bg-white/40 border border-black/[0.03] hover:bg-[#ff5500] hover:border-[#ff5500] hover:text-white text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer">
          <Terminal size={12} /> {t('>_ RAW_EXTRACTION', '>_ RAW_EXTRACTION', '>_ RAW_EXTRACTION')}
        </button>
      </div>
    </div>
  );
}
