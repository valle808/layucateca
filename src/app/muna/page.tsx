'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, ChevronRight, User, Paperclip, X,
  Sparkles, Radio, Terminal, Layers, Orbit, Wifi,
  ChevronLeft, Database, ZoomIn, Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';

const HISTORY_KEY = 'muna_session_history';
function loadLocalHistory(): {sessionId: string, prompt: string, mode: string}[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
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

export default function MunaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'start',
      role: 'bot',
      text: 'I am Muna — the autonomous AI of La Yucateca. Ask me anything.'
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
    { id: 'CREATIVE', label: 'Creative', icon: Sparkles },
    { id: 'THINKING', label: 'Thinking', icon: BrainCircuit },
    { id: 'INVESTIGATION', label: 'Investigate', icon: ZoomIn },
    { id: 'PREDICTION', label: 'Predict', icon: Orbit },
    { id: 'CREATOR', label: 'Create App/File', icon: Terminal }
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
          mode: selectedMode
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
                text: "Session history not found in neural vault. Initializing fresh buffer for " + id,
                type: 'AI'
            }]);
        }
      }
    } catch (e) {
      console.error('Failed to retrieve memory:', e);
      setMessages([{ id: 'error', role: 'bot', text: '⚠️ Memory retrieval failure. Pulse interrupted.', type: 'AI' }]);
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

  return (
    <div className="flex flex-col w-full font-sans overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative" style={{ height: "100vh" }}>
      {/* ── TOP CRYPTO TICKER BAR (MONROE STYLE) ── */}
      <div className="flex items-center h-9 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-bold overflow-x-auto shrink-0 select-none no-scrollbar">
        <div className="bg-[#ff5500] text-white px-4 h-full flex items-center gap-1.5 font-black shrink-0 tracking-wider text-[11px] shadow-sm">
          ⚡ LIVE MKT
        </div>
        <div className="flex items-center gap-8 px-6 shrink-0 tracking-wider text-[11px] text-[var(--text-secondary)] font-semibold">
          <span>SOL <strong className="text-[var(--text-primary)] font-black">$168.40</strong> <span className="text-emerald-500 font-bold ml-0.5">+3.05%</span></span>
          <span>XRP <strong className="text-[var(--text-primary)] font-black">$2.31</strong> <span className="text-rose-500 font-bold ml-0.5">-0.42%</span></span>
          <span>BNB <strong className="text-[var(--text-primary)] font-black">$648.20</strong> <span className="text-rose-500 font-bold ml-0.5">-1.21%</span></span>
          <span>VALLE <strong className="text-[var(--text-primary)] font-black">$1.00</strong> <span className="text-emerald-500 font-bold ml-0.5">+12.35%</span></span>
          <span>BTC <strong className="text-[var(--text-primary)] font-black">$103,240</strong> <span className="text-rose-500 font-bold ml-0.5">-2.27%</span></span>
          <span>ETH <strong className="text-[var(--text-primary)] font-black">$3,450</strong> <span className="text-emerald-500 font-bold ml-0.5">+1.40%</span></span>
          <span>MAYA <strong className="text-[var(--text-primary)] font-black">$14.20</strong> <span className="text-emerald-500 font-bold ml-0.5">+5.80%</span></span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* AMBIENT BG GRADIENT */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#ff5500]/5 blur-[180px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--accent-gold)]/5 blur-[160px] rounded-full" />
        </div>

        {/* ── LEFT SIDEBAR (SECONDARY MATRIX) ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-9 left-0 bottom-0 w-72 z-[90] border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] backdrop-blur-3xl flex flex-col shadow-2xl xl:hidden"
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
                  setMessages([{
                    id: 'start',
                    role: 'bot',
                    text: 'I am Muna — the autonomous AI of La Yucateca. Memory buffer cleared. How may I assist your digital journey today?',
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
        <aside className="hidden xl:flex w-72 flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative z-10">
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
                  setMessages([{
                      id: 'start',
                      role: 'bot',
                      text: 'I am Muna — the autonomous AI of La Yucateca. Memory buffer cleared. New mission parameters initialized.',
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
          <header className="flex-none flex items-center gap-3 px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-2xl shadow-sm">
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="xl:hidden h-8 w-8 rounded-xl border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-all"
            >
              <Layers size={16} />
            </button>
            <div className="h-8 w-8 bg-[#ff5500] text-white rounded-xl flex items-center justify-center shadow-md font-black">
              M
            </div>
            <div>
              <div className="flex items-center gap-2 font-black tracking-tight text-[var(--text-primary)] text-sm">
                MUNA <span className="text-[#ff5500]">V1.0</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                <span className="text-[10px] text-[#ff5500] font-black tracking-widest uppercase">MUNA STREAMING</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Wifi size={12} /> SYNCED
            </div>
          </header>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth pb-44"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,85,0,0.3) transparent' }}>
            <div className="max-w-3xl mx-auto space-y-6">
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
                      <div className="h-8 w-8 shrink-0 rounded-xl bg-[#ff5500] text-white flex items-center justify-center mt-1 shadow-md font-black text-xs">
                        M
                      </div>
                    )}

                    <div className={`max-w-[82%] flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Identity Tag */}
                      <div className={`flex items-center gap-1 mb-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border shadow-2xs ${
                        m.role === 'user' 
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--border-subtle)] opacity-80' 
                          : 'bg-[#ff5500]/10 border-[#ff5500]/30 text-[#ff5500]'
                      }`}>
                        {m.role === 'user' ? <span>[👤 OPERATOR]</span> : <span>[🧠 MUNA AI]</span>}
                      </div>

                      {m.images && m.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {m.images.map((img, idx) => (
                            <img key={idx} src={img} alt="attachment" className="h-36 rounded-xl border border-[var(--border-subtle)] object-contain bg-[var(--bg-card)] shadow-md" />
                          ))}
                        </div>
                      )}

                      <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed backdrop-blur-xl transition-all shadow-md ${
                        m.role === 'user'
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium rounded-tr-sm border border-[var(--border-subtle)]'
                          : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm'
                      }`}>
                        {m.role === 'bot' ? (
                          <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed prose-strong:text-[var(--text-primary)] prose-a:text-[#ff5500] prose-a:underline prose-code:bg-[var(--text-primary)]/10 prose-code:px-1 prose-code:rounded prose-pre:bg-[var(--bg-secondary)] prose-pre:border prose-pre:border-[var(--border-subtle)] text-[var(--text-primary)]">
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
                                      <ZoomIn size={14} /> Expand
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

                      <div className="flex items-center gap-3 mt-1.5 opacity-60">
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono px-1">
                          {m.role === 'bot' ? 'Muna AI · Yucateca Core' : 'Sovereign Operator'}
                        </span>
                        {m.role === 'bot' && m.text && (
                          <button onClick={() => speak(m.text, m.id)} className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 transition-colors ${isPlaying === m.id ? 'text-[#ff5500] font-bold animate-pulse' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                            {isPlaying === m.id ? <Radio size={10} className="animate-spin" /> : <Sparkles size={10} />}
                            {isPlaying === m.id ? 'Stop Audio' : 'Play Audio'}
                          </button>
                        )}
                      </div>
                    </div>

                    {m.role === 'user' && (
                      <div className="h-8 w-8 shrink-0 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center mt-1 shadow-md font-black text-xs">
                        U
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-[#ff5500] text-white flex items-center justify-center mt-1 shadow-md font-black text-xs">
                    M
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
            <div className="max-w-3xl mx-auto space-y-2.5">
              {attachments.length > 0 && (
                <div className="flex gap-2.5 mb-1 overflow-x-auto pb-1">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative shrink-0 group">
                      <img src={file.preview} className="h-16 w-16 object-cover rounded-xl border border-[var(--border-accent)] shadow-md" alt="attachment" />
                      <button onClick={() => removeAttachment(idx)} className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 hover:scale-100">
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
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-xs ${
                        isSelected 
                          ? 'bg-[#ff5500] border-[#ff5500] text-white shadow-[#ff5500]/30 font-bold scale-102' 
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]'
                      }`}
                    >
                      <Icon size={13} /> {m.label}
                    </button>
                  );
                })}
              </div>

              <div 
                className="flex items-end gap-2.5 bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-2xl p-2.5 focus-within:border-[#ff5500] focus-within:shadow-[0_4px_25px_rgba(255,85,0,0.15)] transition-all shadow-xl cursor-pointer pointer-events-auto"
                onClick={() => document.getElementById('muna-input')?.focus()}
              >
                <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="*/*" />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="h-9 w-9 shrink-0 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] text-[var(--text-secondary)] flex items-center justify-center transition-all pointer-events-auto border border-[var(--border-subtle)] shadow-2xs"
                  title="Attach images or documents"
                >
                  <Paperclip size={16} />
                </button>
                <textarea
                  id="muna-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Message Muna AI..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none resize-none py-2 leading-relaxed max-h-32 overflow-y-auto cursor-text px-1"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleSend(); }}
                  disabled={(!input.trim() && attachments.length === 0) || isTyping}
                  className="h-9 w-9 shrink-0 bg-[#ff5500] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-25 transition-all shadow-[0_4px_15px_rgba(255,85,0,0.4)] pointer-events-auto"
                  title="Transmit Pulse"
                >
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="flex justify-between items-center mt-2 px-1.5 text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest font-semibold">
                <div className="flex items-center gap-1.5 text-[#ff5500]">
                  <Radio size={12} className="animate-pulse" /> {selectedMode} MODE VERIFIED
                </div>
                <span>Enter to send · Shift+Enter for newline</span>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="xl:hidden fixed inset-0 z-[80] bg-black/80 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
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
  const [marketTab, setMarketTab] = useState<'HISTORY' | 'SKILLS'>('HISTORY');

  const MOCK_SKILLS = [
    { title: 'Yucateca News Core', desc: 'Real-time journalistic indexing & synthesis.', price: 'Free' },
    { title: 'Web Studio Architect', desc: 'Premium UI/UX layout generator.', price: 'Free' },
    { title: 'Maya Epigrapher', desc: 'Advanced cultural & linguistic analysis.', price: 'Free' },
  ];

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-hidden text-[var(--text-primary)] font-sans">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[#ff5500] transition-all text-[11px] font-black uppercase tracking-widest group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#ff5500]" /> Core Matrix
        </Link>
        {onClose && (
          <button onClick={onClose} className="h-7 w-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-2xs">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="shrink-0 space-y-3">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none text-[var(--text-primary)]">
          Muna.<br /><span className="text-[#ff5500]">Yucateca.</span>
        </h1>
        <p className="text-[11px] text-[#ff5500] font-black tracking-widest uppercase italic">SOVEREIGN_ARRAY_V1.0</p>
        {onNewChat && (
          <button onClick={onNewChat} className="w-full py-3 bg-[#ff5500] text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(255,85,0,0.3)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2">
            <Sparkles size={14} /> New Conversation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] shrink-0 shadow-inner">
        <button 
          onClick={() => setMarketTab('HISTORY')}
          className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            marketTab === 'HISTORY' 
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-black shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Sessions
        </button>
        <button 
          onClick={() => setMarketTab('SKILLS')}
          className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            marketTab === 'SKILLS' 
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-black shadow-sm' 
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Skills
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 min-h-0 pr-1 text-sm font-medium" style={{ scrollbarWidth: 'none' }}>
        {marketTab === 'HISTORY' ? (
          <>
            {history.length > 0 ? (
              history.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => { onSelectSession && onSelectSession(session.sessionId); }}
                  className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:border-[#ff5500] hover:shadow-[0_4px_15px_rgba(255,85,0,0.1)] transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-[#ff5500] uppercase tracking-widest font-black">{session.mode}</span>
                    <ChevronRight size={12} className="text-[var(--text-secondary)] group-hover:text-[#ff5500] transition-colors" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed line-clamp-2">{session.prompt}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-40 text-xs uppercase font-black tracking-widest">No history detected</div>
            )}
          </>
        ) : (
          <div className="space-y-3.5">
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-1">Plugin Vault</div>
            {MOCK_SKILLS.map((skill, i) => (
              <div key={i} className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:border-[#ff5500] hover:shadow-md transition-all cursor-pointer group shadow-2xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[#ff5500] transition-colors">{skill.title}</span>
                  <span className="text-[10px] text-emerald-500 font-black px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">{skill.price}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{skill.desc}</p>
              </div>
            ))}
            <button 
              onClick={() => alert('Redirecting to Muna Skill Forge...')}
              className="w-full py-3 mt-3 border border-dashed border-[var(--border-accent)] hover:border-[#ff5500] hover:text-[#ff5500] transition-all rounded-xl text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-card)] shadow-2xs"
            >
              + Register New Skill
            </button>
          </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="space-y-3 shrink-0 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex gap-2.5">
          <button 
            onClick={onDownload}
            className="flex-1 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download size={14} /> Download
          </button>
          <label className="flex-1 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer">
            <Database size={14} /> Upload
            <input type="file" className="hidden" accept=".json" onChange={onUpload} />
          </label>
        </div>

        {/* Swarm Telemetry */}
        <div className="p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-xl space-y-2.5 shadow-sm">
          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">
            <div className="flex items-center gap-2 text-[#ff5500]"><Orbit size={14} className="animate-spin" style={{ animationDuration: '20s' }} /> Swarm</div>
            <span className="text-emerald-500 font-bold">99.9%</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <motion.div animate={{ width: ['80%', '99.9%', '95%'] }} transition={{ duration: 10, repeat: Infinity }} className="h-full bg-[#ff5500]" />
          </div>
        </div>

        <button onClick={onMachineView} className="w-full py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[#ff5500] hover:border-[#ff5500] hover:text-white text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
          <Terminal size={14} /> raw_telemetry
        </button>
      </div>
    </div>
  );
}
