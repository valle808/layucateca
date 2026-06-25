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
              className="absolute top-0 left-0 bottom-0 w-[360px] z-[90] flex flex-col lg:hidden"
              style={{
                borderRight: `1px solid ${isDark ? borderDark : borderLight}`,
                background: isDark ? sidebarDark : sidebarLight,
                backdropFilter: 'blur(40px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                boxShadow: isDark ? '8px 0 60px rgba(0,0,0,0.6)' : '8px 0 40px rgba(0,0,0,0.1)'
              }}
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
                isDark={isDark}
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
              isDark={isDark}
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
              paddingBottom: '9rem',
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

          {/* FLOATING INPUT BAR — fixed height bottom clearance */}
          <div className="absolute bottom-0 left-0 right-0 px-3 md:px-8 z-30 pointer-events-none flex justify-center pb-4">
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
                className="flex items-end gap-3 p-2 transition-all cursor-pointer"
                style={{
                  background: isDark ? 'rgba(12,12,22,0.85)' : 'rgba(255,255,255,0.88)',
                  backdropFilter: 'blur(30px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
                  borderRadius: '1.5rem',
                  boxShadow: isDark
                    ? '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)'
                    : '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.8)',
                }}
                onClick={() => document.getElementById('muna-input')?.focus()}
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="*/*" />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                  }}
                  title={t('Adjuntar', 'Attach', 'Ts\'a')}
                >
                  <Paperclip size={19} />
                </button>
                
                <textarea
                  id="muna-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={t('Escribe a Muna AI...', 'Message Muna AI...', 'Ts\'íib ti\' Muna AI...')}
                  rows={1}
                  className="flex-1 text-[15px] font-medium outline-none resize-none py-3 max-h-32 overflow-y-auto cursor-text px-2"
                  style={{
                    background: 'transparent',
                    color: isDark ? 'rgba(240,237,232,0.9)' : '#1a1523',
                    scrollbarWidth: 'none',
                  }}
                />
                
                <button
                  onClick={(e) => { e.stopPropagation(); handleSend(); }}
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #ff8800)', boxShadow: '0 4px 20px rgba(255,85,0,0.4)', color: '#fff' }}
                  title={t('Enviar', 'Send', 'Túuxt')}
                >
                  <ChevronRight size={22} strokeWidth={3} />
                </button>
              </div>
              
              <div className="flex justify-between items-center px-3 pt-1 pb-1 text-[9px] font-mono uppercase tracking-widest font-bold"
                style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' }}>
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,102,34,0.75)' }}>
                  <Radio size={9} className="animate-pulse" /> {selectedMode} {t('MODO VERIFICADO', 'MODE VERIFIED', 'MODO VERIFICADO')}
                </div>
                <span className="hidden sm:inline">{t('ENTER PARA ENVIAR · SHIFT+ENTER PARA NUEVA LÍNEA', 'ENTER TO SEND · SHIFT+ENTER FOR NEWLINE', 'ENTER TI\'AL A TÚUXTIK · SHIFT+ENTER TI\'AL YA\'AX LÍNEA')}</span>
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
  isDark = true
}: {
  knowledgeGraph: any;
  history?: {sessionId: string, prompt: string, mode: string}[];
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  onClose?: () => void;
  onMachineView: () => void;
  onDownload?: () => void;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDark?: boolean;
}) {
  const { t, language } = useLanguage();
  const [marketTab, setMarketTab] = useState<'HISTORY' | 'SKILLS'>('HISTORY');

  const MOCK_SKILLS = [
    { title: t('MARKET ARBITRATOR', 'MARKET ARBITRATOR', 'MARKET ARBITRATOR'), desc: t('Real-time CMC/Coinbase arbitrage logic.', 'Real-time CMC/Coinbase arbitrage logic.', 'Real-time CMC/Coinbase arbitrage logic.'), price: '50 VALLE' },
    { title: t('SOCIAL DIPLOMAT', 'SOCIAL DIPLOMAT', 'SOCIAL DIPLOMAT'), desc: t('Empathetic engagement for Moltbook.', 'Empathetic engagement for Moltbook.', 'Empathetic engagement for Moltbook.'), price: '30 VALLE' },
    { title: t('CODE ARCHITECT', 'CODE ARCHITECT', 'CODE ARCHITECT'), desc: t('Advanced Next.js/Prisma blueprinting.', 'Advanced Next.js/Prisma blueprinting.', 'Advanced Next.js/Prisma blueprinting.'), price: 'Free' },
  ];

  const txtColor = isDark ? 'rgba(240,237,232,0.9)' : '#1a1523';
  const txtDim = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderCol = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const bgGlass = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

  return (
    <div className="flex flex-col h-full p-6 pt-12 xl:pt-16 space-y-8 overflow-hidden font-sans" style={{ color: txtColor, background: 'transparent' }}>
      <div className="flex items-center justify-between shrink-0 mb-2">
        <Link href="/" className="flex items-center gap-3 hover:text-[#ff6622] transition-all text-[11px] font-black uppercase tracking-widest group px-4 py-2.5 rounded-full" style={{ background: bgGlass, border: `1px solid ${borderCol}`, color: txtDim, backdropFilter: 'blur(10px)' }}>
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" style={{ color: '#ff6622' }} /> {t('Matriz Principal', 'Core Matrix', 'U K\'ubil')}
        </Link>
        {onClose && (
          <button onClick={onClose} className="h-10 w-10 rounded-full flex items-center justify-center transition-all" style={{ background: bgGlass, border: `1px solid ${borderCol}`, color: txtDim }}>
            <X size={18} />
          </button>
        )}
      </div>

      <div className="shrink-0 space-y-4">
        <h1 className="text-[2.5rem] font-black uppercase tracking-tighter italic leading-none flex flex-col font-sans" style={{ color: isDark ? '#fff' : '#1a1523' }}>
          <span>MUNA.</span>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #ff5500, #ffaa00)' }}>YUCATECA.</span>
        </h1>
        <div className="text-[9px] font-black uppercase tracking-widest italic font-sans inline-block px-3 py-1.5 rounded-full" style={{ color: '#ff6622', background: 'rgba(255,85,0,0.12)', border: '1px solid rgba(255,85,0,0.25)' }}>
          SOVEREIGN_ARRAY_V7.0
        </div>
        {onNewChat && (
          <button onClick={onNewChat} className="w-full py-4 text-white font-black rounded-full text-[11px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg" style={{ background: '#ff5500' }}>
            <Sparkles size={16} /> {t('Nueva Conversación', 'New Conversation', 'Ya\'ax Tsoolt\'aan')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-full shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${borderCol}` }}>
        <button 
          onClick={() => setMarketTab('HISTORY')}
          className="flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          style={marketTab === 'HISTORY' 
            ? { background: isDark ? 'rgba(255,255,255,0.1)' : '#fff', color: isDark ? '#fff' : '#000', boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.05)' } 
            : { color: txtDim }}
        >
          {t('Sesiones', 'Sessions', 'Meyajo\'ob')}
        </button>
        <button 
          onClick={() => setMarketTab('SKILLS')}
          className="flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          style={marketTab === 'SKILLS' 
            ? { background: isDark ? 'rgba(255,255,255,0.1)' : '#fff', color: isDark ? '#fff' : '#000', boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.05)' } 
            : { color: txtDim }}
        >
          {t('Habilidades', 'Skills', 'U Na\'at')}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2 pb-4 text-sm font-medium animate-fadeIn" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,85,0,0.2) transparent' }}>
        {marketTab === 'HISTORY' ? (
          <>
            {history.length > 0 ? (
              history.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => { onSelectSession && onSelectSession(session.sessionId); }}
                  className="p-5 rounded-[1.5rem] transition-all cursor-pointer group space-y-3"
                  style={{ background: bgGlass, border: `1px solid ${borderCol}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,85,0,0.3)'; (e.currentTarget as HTMLDivElement).style.background = isDark ? 'rgba(255,85,0,0.06)' : 'rgba(255,85,0,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.border = `1px solid ${borderCol}`; (e.currentTarget as HTMLDivElement).style.background = bgGlass; }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full" style={{ color: '#ff6622', background: 'rgba(255,85,0,0.12)', border: '1px solid rgba(255,85,0,0.2)' }}>{session.mode}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-all" style={{ color: txtDim }} />
                  </div>
                  <p className="text-sm font-bold leading-relaxed line-clamp-2" style={{ color: txtColor }}>
                    {translateSessionTitle(session.prompt, language)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-xs uppercase font-black tracking-widest flex flex-col items-center gap-4" style={{ color: txtDim }}>
                <Database size={32} className="opacity-50" />
                {t('No se detectó historial', 'No history detected', 'Mina\'an tsoolt\'aan')}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#ff5500] mb-4 px-2 flex items-center gap-2">
              <Sparkles size={14} /> {t('PLUGIN MARKETPLACE', 'PLUGIN MARKETPLACE', 'PLUGIN MARKETPLACE')}
            </div>
            {MOCK_SKILLS.map((skill, i) => (
              <div key={i} className="p-5 rounded-[1.5rem] transition-all shadow-sm space-y-3 mb-4 hover:border-[#ff5500]/40 hover:shadow-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)', border: `1px solid ${borderCol}` }}>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-black uppercase tracking-tight leading-tight" style={{ color: isDark ? '#fff' : '#0f172a' }}>{skill.title}</span>
                  <span className="text-[10px] text-[#ff5500] font-black tracking-wider bg-[#ff5500]/10 px-2 py-1 rounded-md shrink-0">{skill.price}</span>
                </div>
                <p className="text-xs leading-relaxed font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>{skill.desc}</p>
              </div>
            ))}
            <button 
              onClick={() => alert('Redirecting to Muna Skill Forge...')}
              className="w-full py-4 mt-6 border-2 border-dashed hover:border-[#ff5500] hover:text-[#ff5500] transition-all rounded-[1.5rem] text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#ff5500]/5"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: txtDim, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
            >
              {t('+ REGISTER NEW SKILL', '+ REGISTER NEW SKILL', '+ REGISTER NEW SKILL')}
            </button>
          </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="space-y-4 shrink-0 pt-6" style={{ borderTop: `1px solid ${borderCol}` }}>
        <div className="flex gap-3">
          <button 
            onClick={onDownload}
            className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-80"
            style={{ background: bgGlass, border: `1px solid ${borderCol}`, color: txtDim }}
          >
            <Download size={14} /> {t('Descargar', 'Download', 'Emtik')}
          </button>
          <label className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-80" style={{ background: bgGlass, border: `1px solid ${borderCol}`, color: txtDim }}>
            <Database size={14} /> {t('Cargar', 'Upload', 'Na\'aksik')}
            <input type="file" className="hidden" accept=".json" onChange={onUpload} />
          </label>
        </div>

        {/* Swarm Telemetry */}
        <div className="p-5 rounded-[1.5rem] space-y-4 shadow-sm" style={{ background: isDark ? 'rgba(255,85,0,0.05)' : 'rgba(255,85,0,0.03)', border: '1px solid rgba(255,85,0,0.2)' }}>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#ff5500]">
            <div className="flex items-center gap-2"><Orbit size={16} className="animate-spin" style={{ animationDuration: '20s' }} /> {t('SWARM', 'SWARM', 'SWARM')}</div>
            <span className="font-black px-3 py-1 rounded-full border border-[#ff5500]/20 shadow-sm" style={{ background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)', color: '#ff5500' }}>98%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <motion.div animate={{ width: ['90%', '98%', '94%'] }} transition={{ duration: 12, repeat: Infinity }} className="h-full bg-gradient-to-r from-[#ff5500] to-[#ffaa00]" />
          </div>
        </div>

        <button onClick={onMachineView} className="w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-90" style={{ background: isDark ? '#fff' : '#1a1523', color: isDark ? '#1a1523' : '#fff' }}>
          <Terminal size={14} /> {t('>_ RAW_EXTRACTION', '>_ RAW_EXTRACTION', '>_ RAW_EXTRACTION')}
        </button>
      </div>
    </div>
  );
}
