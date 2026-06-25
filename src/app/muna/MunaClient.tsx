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

  const darkBg   = 'linear-gradient(135deg, #07070f 0%, #0d0d1a 40%, #110b08 100%)';
  const lightBg  = 'linear-gradient(135deg, #f0f4ff 0%, #f8f6ff 50%, #fff7f0 100%)';
  const darkText = '#f0ede8';
  const lightText = '#1a1523';

  const sidebarDark  = 'rgba(8,8,16,0.80)';
  const sidebarLight = 'rgba(255,255,255,0.75)';
  const headerDark   = 'rgba(8,8,16,0.70)';
  const headerLight  = 'rgba(255,255,255,0.80)';
  const borderDark   = 'rgba(255,255,255,0.07)';
  const borderLight  = 'rgba(0,0,0,0.08)';

  return (
    <div
      className="flex flex-col w-full font-sans relative"
      style={{
        height: '100dvh',
        overflow: 'hidden',
        background: isDark ? darkBg : lightBg,
        color: isDark ? darkText : lightText,
      }}
    >

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* AMBIENT BG GRADIENT */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[15%] w-[70vw] h-[70vw] bg-gradient-to-br from-[#ff5500]/20 to-[#ffaa00]/8 blur-[180px] rounded-full" />
          <div className="absolute bottom-[0%] right-[-5%] w-[50vw] h-[50vw] bg-gradient-to-tl from-[#ff5500]/10 to-transparent blur-[160px] rounded-full" />
          <div className="absolute top-[50%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-br from-purple-900/10 to-transparent blur-[140px] rounded-full" />
          {/* grid overlay */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,85,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* ── LEFT SIDEBAR (SECONDARY MATRIX) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -380, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[360px] z-[90] border-r border-white/[0.08] flex flex-col lg:hidden"
              style={{ background: 'rgba(8,8,16,0.88)', backdropFilter: 'blur(40px) saturate(1.5)', WebkitBackdropFilter: 'blur(40px) saturate(1.5)', boxShadow: '8px 0 60px rgba(0,0,0,0.6)' }}
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
        <aside
          className="hidden lg:flex w-[320px] xl:w-[360px] flex-shrink-0 flex-col relative z-10"
          style={{
            borderRight: `1px solid ${isDark ? borderDark : borderLight}`,
            background: isDark ? sidebarDark : sidebarLight,
            backdropFilter: 'blur(40px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
            boxShadow: isDark ? '4px 0 40px rgba(0,0,0,0.4)' : '4px 0 20px rgba(0,0,0,0.06)',
          }}
        >
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
          <header
            className="flex-none flex items-center justify-between px-4 md:px-8 py-4 z-20"
            style={{
              borderBottom: `1px solid ${isDark ? borderDark : borderLight}`,
              background: isDark ? headerDark : headerLight,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(s => !s)}
                className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center transition-all"
                style={{
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                }}
              >
                <Layers size={18} />
              </button>
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff5500, #ff8800)', boxShadow: '0 4px 16px rgba(255,85,0,0.4)' }}
              >
                <BrainCircuit size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 font-black tracking-tight text-base uppercase font-sans"
                  style={{ color: isDark ? '#fff' : '#1a1523' }}
                >
                  MUNA <span style={{ color: '#ff6622' }}>V1.0</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#ff6622', boxShadow: '0 0 8px rgba(255,85,0,0.9)' }} />
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,102,34,0.8)' }}>{t('MUNA STREAMING', 'MUNA STREAMING', 'MUNA STREAMING')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
              <Wifi size={14} strokeWidth={2.5} /> <span className="hidden sm:inline">{t('CONECTADO', 'CONNECTED', 'NUPULA\'AN')}</span>
            </div>
          </header>

          {/* MESSAGES */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 pt-10 scroll-smooth"
            style={{
              paddingBottom: '13rem',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,85,0,0.2) transparent',
            }}
          >
            <div className="max-w-3xl mx-auto space-y-8 w-full min-w-0">
              <AnimatePresence mode="popLayout">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex w-full gap-3 min-w-0 ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                    {m.role === 'bot' && (
                      <div
                        className="h-9 w-9 shrink-0 rounded-xl text-white flex items-center justify-center mt-1"
                        style={{ background: 'linear-gradient(135deg, #ff5500, #ff8800)', boxShadow: '0 4px 16px rgba(255,85,0,0.3)', minWidth: '2.25rem' }}
                      >
                        <BrainCircuit size={15} />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1.5 min-w-0 ${
                      m.role === 'user'
                        ? 'items-end max-w-[85%] md:max-w-[72%]'
                        : 'items-start max-w-[calc(100%-3rem)] md:max-w-[82%]'
                    }`}>
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase"
                        style={m.role === 'user'
                          ? { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }
                          : { background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)', color: '#ff7733' }
                        }
                      >
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
 
                      <div
                        className="px-5 py-4 text-[14.5px] leading-[1.75] min-w-0 w-full"
                        style={m.role === 'user' ? {
                          background: 'linear-gradient(135deg, #ff5500, #ff8800)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          fontWeight: 500,
                          borderRadius: '18px 18px 4px 18px',
                          boxShadow: '0 6px 24px rgba(255,85,0,0.28)',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        } : {
                          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                          color: isDark ? 'rgba(240,237,232,0.93)' : '#1a1523',
                          borderRadius: '4px 18px 18px 18px',
                          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.28)' : '0 4px 20px rgba(0,0,0,0.06)',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {m.role === 'bot' ? (
                          <div className="muna-markdown w-full max-w-full min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', color: isDark ? 'rgba(240,237,232,0.93)' : '#1a1523' }}>
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
   
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-mono uppercase tracking-widest px-2" style={{ opacity: 0.45 }}>
                          <span style={{ color: m.role === 'user' ? 'rgba(255,255,255,0.6)' : 'rgba(255,102,34,0.8)' }}>
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
                  <div className="h-10 w-10 shrink-0 rounded-2xl text-white flex items-center justify-center mt-1" style={{ background: 'linear-gradient(135deg, #ff5500, #ff8800)', boxShadow: '0 4px 20px rgba(255,85,0,0.35)' }}>
                    <BrainCircuit size={17} />
                  </div>
                  <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 20px 20px 20px', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
                    <Sparkles size={13} style={{ color: '#ff6622' }} className="animate-spin" />
                    {[0, 1, 2].map(n => (
                      <motion.div
                        key={n}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: n * 0.2 }}
                        className="h-2 w-2 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #ff5500, #ffaa00)' }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Dummy element for robust scrolling */}
              <div className="h-8 shrink-0 w-full" />
            </div>
          </div>

          {/* FLOATING INPUT — mode tabs + input pill */}
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-10 z-30 pointer-events-none flex justify-center pb-5">
            <div className="w-full max-w-3xl flex flex-col gap-2.5 pointer-events-auto">

              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative shrink-0 group p-1 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}` }}>
                      <img src={file.preview} className="h-14 w-14 object-cover rounded-lg" alt="attachment" />
                      <button onClick={() => removeAttachment(idx)} className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md">
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mode selector chips — above input */}
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const active = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap shrink-0 transition-all cursor-pointer"
                      style={active ? {
                        background: '#ff5500',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(255,85,0,0.4)',
                      } : {
                        background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)'}`,
                        color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(26,21,35,0.55)',
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <Icon size={12} />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Input pill */}
              <div
                className="flex items-center gap-3 px-4 transition-all"
                style={{
                  background: isDark ? 'rgba(12,12,24,0.93)' : 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '1.25rem',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.07)',
                  minHeight: '3.25rem',
                }}
                onClick={() => document.getElementById('muna-input')?.focus()}
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="*/*" />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="shrink-0 p-1 transition-colors"
                  style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.28)' }}
                  title={t('Adjuntar', 'Attach', "Ts'a")}
                >
                  <Paperclip size={17} />
                </button>

                <textarea
                  id="muna-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={t('Escribe a Muna AI...', 'Message Muna AI...', "Ts'íib ti' Muna AI...")}
                  rows={1}
                  className="flex-1 text-[15px] font-normal outline-none resize-none py-3.5 max-h-36 overflow-y-auto"
                  style={{ background: 'transparent', color: isDark ? 'rgba(240,237,232,0.92)' : '#1a1523', scrollbarWidth: 'none' }}
                />

                <button
                  onClick={(e) => { e.stopPropagation(); handleSend(); }}
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 transition-all"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #ff8800)', color: '#fff', boxShadow: '0 4px 14px rgba(255,85,0,0.4)' }}
                >
                  <ChevronRight size={17} strokeWidth={2.5} />
                </button>
              </div>

              {/* Status hint */}
              <div
                className="flex justify-between items-center px-2 text-[9px] font-mono uppercase tracking-widest"
                style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.22)' }}
              >
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,102,34,0.7)' }}>
                  <Radio size={8} className="animate-pulse" /> {selectedMode} {t('MODO VERIFICADO', 'MODE VERIFIED', 'MODO VERIFICADO')}
                </div>
                <span className="hidden sm:inline">{t('ENTER PARA ENVIAR · SHIFT+ENTER NUEVA LÍNEA', 'ENTER TO SEND · SHIFT+ENTER FOR NEWLINE', "ENTER TI'AL A TÚUXTIK")}</span>
              </div>

            </div>
          </div>
        </main>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden absolute inset-0 z-[80] bg-black/85 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
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
  onUpload,
}: {
  knowledgeGraph: any;
  history?: { sessionId: string; prompt: string; mode: string }[];
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  onClose?: () => void;
  onMachineView: () => void;
  onDownload?: () => void;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [marketTab, setMarketTab] = useState<'HISTORY' | 'SKILLS'>('HISTORY');

  const c = isDark
    ? {
        text: 'rgba(240,237,232,0.9)',
        sub: 'rgba(240,237,232,0.4)',
        border: 'rgba(255,255,255,0.07)',
        card: 'rgba(255,255,255,0.04)',
        cardHover: 'rgba(255,85,0,0.06)',
        navBg: 'rgba(255,255,255,0.05)',
        navBorder: 'rgba(255,255,255,0.1)',
        navColor: 'rgba(255,255,255,0.5)',
        tabBg: 'rgba(255,255,255,0.05)',
        tabActBg: 'rgba(255,85,0,0.15)',
        tabActClr: '#ff6622',
        tabActBdr: '1px solid rgba(255,85,0,0.25)',
        tabInClr: 'rgba(255,255,255,0.35)',
        toolBg: 'rgba(255,255,255,0.05)',
        toolBdr: 'rgba(255,255,255,0.09)',
        toolClr: 'rgba(255,255,255,0.5)',
        rawBg: '#fff',
        rawText: '#1a1523',
      }
    : {
        text: '#1a1523',
        sub: 'rgba(26,21,35,0.42)',
        border: 'rgba(0,0,0,0.07)',
        card: 'rgba(255,255,255,0.72)',
        cardHover: 'rgba(255,85,0,0.04)',
        navBg: 'rgba(0,0,0,0.04)',
        navBorder: 'rgba(0,0,0,0.08)',
        navColor: 'rgba(26,21,35,0.45)',
        tabBg: 'rgba(0,0,0,0.04)',
        tabActBg: '#ff5500',
        tabActClr: '#fff',
        tabActBdr: '1px solid #ff5500',
        tabInClr: 'rgba(26,21,35,0.38)',
        toolBg: 'rgba(0,0,0,0.03)',
        toolBdr: 'rgba(0,0,0,0.08)',
        toolClr: 'rgba(26,21,35,0.48)',
        rawBg: '#1a1523',
        rawText: '#fff',
      };

  const MOCK_SKILLS = [
    { title: 'MARKET ARBITRATOR', desc: 'Real-time CMC/Coinbase arbitrage logic.', price: '50 VALLE' },
    { title: 'SOCIAL DIPLOMAT', desc: 'Empathetic engagement for Moltbook.', price: '30 VALLE' },
    { title: 'CODE ARCHITECT', desc: 'Advanced Next.js/Prisma blueprinting.', price: 'Free' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans" style={{ color: c.text }}>
      {/* Top nav */}
      <div className="flex items-center justify-between px-5 pt-10 pb-3 xl:pt-14 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-full"
          style={{ background: c.navBg, border: `1px solid ${c.navBorder}`, color: c.navColor }}
        >
          <ChevronLeft size={13} style={{ color: '#ff6622' }} />
          {t('Matriz Principal', 'Core Matrix', "U K'ubil")}
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: c.navBg, border: `1px solid ${c.navBorder}`, color: c.navColor }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Brand */}
      <div className="px-5 pb-1 shrink-0">
        <h1
          className="text-4xl xl:text-5xl font-black uppercase tracking-tighter italic leading-[1.05] font-sans"
          style={{ color: isDark ? '#fff' : '#1a1523' }}
        >
          MUNA.
        </h1>
        <div
          className="text-3xl xl:text-4xl font-black uppercase tracking-tighter italic leading-[1.05]"
          style={{ backgroundImage: 'linear-gradient(135deg,#ff5500,#ffaa00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          YUCATECA.
        </div>
        <div
          className="mt-2.5 text-[9px] font-black uppercase tracking-widest inline-block px-2.5 py-1 rounded-full"
          style={{ color: '#ff6622', background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.18)' }}
        >
          SOVEREIGN_ARRAY_V7.0
        </div>
      </div>

      {/* New conversation */}
      {onNewChat && (
        <div className="px-5 pt-4 pb-2 shrink-0">
          <button
            onClick={onNewChat}
            className="w-full py-3.5 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#ff5500,#ff8800)', boxShadow: '0 6px 20px rgba(255,85,0,0.28)' }}
          >
            <Sparkles size={14} />
            {t('Nueva Conversación', 'New Conversation', "Ya'ax Tsoolt'aan")}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 pb-3 shrink-0">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: c.tabBg, border: `1px solid ${c.border}` }}>
          {(['HISTORY', 'SKILLS'] as const).map((tab) => {
            const active = marketTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setMarketTab(tab)}
                className="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                style={active ? { background: c.tabActBg, color: c.tabActClr, border: c.tabActBdr } : { color: c.tabInClr }}
              >
                {tab === 'HISTORY' ? t('Sesiones', 'Sessions', "Meyajo'ob") : t('Habilidades', 'Skills', "U Na'at")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable list */}
      <div
        className="flex-1 overflow-y-auto min-h-0 px-5 space-y-2.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,85,0,0.18) transparent' }}
      >
        {marketTab === 'HISTORY' ? (
          history.length > 0 ? (
            history.map((s) => (
              <div
                key={s.sessionId}
                onClick={() => onSelectSession?.(s.sessionId)}
                className="px-4 py-4 rounded-2xl transition-all cursor-pointer group"
                style={{ background: c.card, border: `1px solid ${c.border}` }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = c.cardHover;
                  el.style.border = '1px solid rgba(255,85,0,0.22)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = c.card;
                  el.style.border = `1px solid ${c.border}`;
                }}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                    style={{ color: '#ff6622', background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.16)' }}
                  >
                    {s.mode}
                  </span>
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-all" style={{ color: c.sub }} />
                </div>
                <p className="text-[13px] font-medium leading-snug line-clamp-2" style={{ color: c.text }}>
                  {translateSessionTitle(s.prompt, language)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-14 flex flex-col items-center gap-3" style={{ color: c.sub }}>
              <Database size={26} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t('Sin historial', 'No history detected', "Mina'an tsoolt'aan")}
              </span>
            </div>
          )
        ) : (
          <div className="space-y-2.5">
            {MOCK_SKILLS.map((sk, i) => (
              <div
                key={i}
                className="px-4 py-4 rounded-2xl space-y-1 transition-all"
                style={{ background: c.card, border: `1px solid ${c.border}` }}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-black uppercase tracking-tight" style={{ color: c.text }}>
                    {sk.title}
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md shrink-0" style={{ background: 'rgba(255,85,0,0.1)', color: '#ff6622' }}>
                    {sk.price}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: c.sub }}>
                  {sk.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pt-3 pb-5 space-y-3 shrink-0" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-75"
            style={{ background: c.toolBg, border: `1px solid ${c.toolBdr}`, color: c.toolClr }}
          >
            <Download size={13} /> {t('Descargar', 'Download', 'Emtik')}
          </button>
          <label
            className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-75"
            style={{ background: c.toolBg, border: `1px solid ${c.toolBdr}`, color: c.toolClr }}
          >
            <Database size={13} /> {t('Cargar', 'Upload', "Na'aksik")}
            <input type="file" className="hidden" accept=".json" onChange={onUpload} />
          </label>
        </div>

        <div className="px-4 py-3.5 rounded-2xl space-y-2.5" style={{ background: 'rgba(255,85,0,0.07)', border: '1px solid rgba(255,85,0,0.16)' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: '#ff6622' }}>
              <Orbit size={13} className="animate-spin" style={{ animationDuration: '20s' }} />
              SWARM
            </div>
            <span className="text-[11px] font-black" style={{ color: '#ff6622' }}>98%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }}>
            <motion.div
              animate={{ width: ['90%', '98%', '94%'] }}
              transition={{ duration: 12, repeat: Infinity }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#ff5500,#ffaa00)' }}
            />
          </div>
        </div>

        <button
          onClick={onMachineView}
          className="w-full py-3.5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-80"
          style={{ background: c.rawBg, color: c.rawText, boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Terminal size={13} /> {'>'}_RAW_EXTRACTION
        </button>
      </div>
    </div>
  );
}
