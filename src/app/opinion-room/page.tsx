"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { MessageSquare, Send, Users, Globe, Landmark, MapPin, Hash, Plus, Sparkles, Trophy, Lock, Unlock, KeyRound } from "lucide-react";

interface ChatRoom {
  id: string;
  name: string;
  slug: string;
  type: string;
  state?: string | null;
  city?: string | null;
  isPrivate?: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  authorName: string;
  authorId?: string | null;
  createdAt: string;
}

export default function OpinionRoomPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  
  // Custom room modal
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("CUSTOM");
  const [isNewRoomPrivate, setIsNewRoomPrivate] = useState(false);
  const [newRoomPassword, setNewRoomPassword] = useState("");

  // Private room unlock modal
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTargetSlug, setUnlockTargetSlug] = useState("");
  const [unlockPasswordInput, setUnlockPasswordInput] = useState("");
  const [unlockError, setUnlockError] = useState("");

  // Stored passwords for the session
  const [roomPasswords, setRoomPasswords] = useState<Record<string, string>>({});

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [fetchError, setFetchError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved passwords from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("layucateca_chat_passwords");
      if (saved) {
        setRoomPasswords(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse saved passwords", e);
    }
  }, []);

  // Save passwords to localStorage when updated
  useEffect(() => {
    if (Object.keys(roomPasswords).length > 0) {
      localStorage.setItem("layucateca_chat_passwords", JSON.stringify(roomPasswords));
    }
  }, [roomPasswords]);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (e) {
      console.error("Failed to load rooms", e);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (slug: string, showLoading = false) => {
    if (showLoading) setLoadingMessages(true);
    setFetchError("");
    try {
      const pw = roomPasswords[slug] || "";
      const url = `/api/chat/messages?roomSlug=${slug}${pw ? `&roomPassword=${encodeURIComponent(pw)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        if (res.status === 401) {
          // If unauthorized and it's our active room, we need to prompt
          setMessages([]);
          setFetchError("Esta sala es privada. Requiere contraseña.");
        }
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  // Poll for messages in active room every 2 seconds
  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    
    // Initial fetch
    fetchMessages(activeRoom, true);

    const interval = setInterval(() => {
      fetchMessages(activeRoom, false);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRoom, roomPasswords]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");
    
    const pw = roomPasswords[activeRoom] || "";

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textToSend,
          authorName: user?.name || t("Invitado", "Guest", "Invitado"),
          authorId: user?.id || null,
          roomSlug: activeRoom,
          roomPassword: pw,
        }),
      });

      if (res.ok) {
        fetchMessages(activeRoom, false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al enviar mensaje");
      }
    } catch (e) {
      console.error("Error sending message", e);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          type: newRoomType,
          isPrivate: isNewRoomPrivate,
          password: isNewRoomPrivate ? newRoomPassword : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewRoomName("");
        setIsNewRoomPrivate(false);
        setNewRoomPassword("");
        setShowModal(false);
        fetchRooms();
        
        if (data.room?.slug) {
          if (data.room.isPrivate && newRoomPassword) {
            setRoomPasswords(prev => ({ ...prev, [data.room.slug]: newRoomPassword }));
          }
          setActiveRoom(data.room.slug);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al crear la sala");
      }
    } catch (e) {
      console.error("Error creating room", e);
    }
  };

  const handleRoomClick = (room: ChatRoom) => {
    if (room.isPrivate && !roomPasswords[room.slug]) {
      // Need to unlock
      setUnlockTargetSlug(room.slug);
      setUnlockPasswordInput("");
      setUnlockError("");
      setShowUnlockModal(true);
    } else {
      setActiveRoom(room.slug);
    }
  };

  const handleUnlockRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPasswordInput) return;
    
    // Test the password by fetching messages
    setUnlockError("");
    try {
      const url = `/api/chat/messages?roomSlug=${unlockTargetSlug}&roomPassword=${encodeURIComponent(unlockPasswordInput)}`;
      const res = await fetch(url);
      
      if (res.ok) {
        // Success
        setRoomPasswords(prev => ({ ...prev, [unlockTargetSlug]: unlockPasswordInput }));
        setShowUnlockModal(false);
        setActiveRoom(unlockTargetSlug);
      } else {
        setUnlockError("Contraseña incorrecta.");
      }
    } catch (e) {
      setUnlockError("Error al verificar.");
    }
  };

  const currentRoomDetails = rooms.find((r) => r.slug === activeRoom);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col h-[calc(100vh-64px)] font-sans">
      
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff5500]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ff5500] tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-[#ff5500]" />
            <span>{t("Sala de Opinión", "Opinion Room", "Sala de Opinión")}</span>
          </h1>
          <p className="text-sm text-[rgba(255,255,255,0.6)] mt-2 font-medium">
            {t("Debates, reportes viales y conversaciones locales en tiempo real.", "Real-time chat, local news, and community talk.", "Debates de la península en tiempo real.")}
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-xl py-2 px-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <div className="p-1.5 bg-[rgba(255,215,0,0.1)] rounded-lg border border-[rgba(255,215,0,0.2)]">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[rgba(255,255,255,0.5)] uppercase font-bold tracking-wider block">Reputación</span>
              <span className="text-sm font-black text-white">{user.reputation?.score || 100} PTS</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 grow overflow-hidden min-h-[480px]">
        
        {/* Rooms Sidebar */}
        <div className="md:col-span-4 flex flex-col bg-[rgba(15,15,25,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center p-5 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] shrink-0">
            <span className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
              <Users className="w-5 h-5 text-[#ff5500]" />
              {t("Salas de Chat", "Chat Rooms", "Salas")}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 rounded-lg bg-[rgba(255,85,0,0.15)] border border-[rgba(255,85,0,0.3)] text-[#ff5500] hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(255,85,0,0.2)]"
              title={t("Crear Nueva Sala", "Create New Room", "Crear")}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto grow p-3 custom-scrollbar">
            {loadingRooms ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 text-sm font-medium text-[rgba(255,255,255,0.4)] gap-3">
                <span className="animate-spin w-6 h-6 border-2 border-[#ff5500] border-t-transparent rounded-full"></span>
                Cargando salas...
              </div>
            ) : (
              rooms.map((room) => {
                const isActive = room.slug === activeRoom;
                const isUnlocked = !room.isPrivate || !!roomPasswords[room.slug];

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-[rgba(255,85,0,0.15)] to-[rgba(255,85,0,0.05)] border-[#ff5500]/50 shadow-[0_0_15px_rgba(255,85,0,0.1)]"
                        : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-[#ff5500]/20' : 'bg-black/30 group-hover:bg-black/50'}`}>
                        {room.type === "PUBLIC" ? (
                          <Globe className={`w-4 h-4 ${isActive ? 'text-[#ff5500]' : 'text-white/60'}`} />
                        ) : room.type === "REGIONAL" ? (
                          <MapPin className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-white/60'}`} />
                        ) : (
                          <Hash className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-white/60'}`} />
                        )}
                      </div>
                      <div className="truncate pr-2">
                        <span className={`font-bold text-sm block truncate ${isActive ? 'text-white' : 'text-white/80'}`}>
                          {room.name}
                        </span>
                        {room.city && <span className="text-[10px] font-medium text-white/40 block mt-0.5">{room.city}, {room.state}</span>}
                      </div>
                    </div>
                    
                    {/* Private Lock Icon */}
                    {room.isPrivate && (
                      <div className="shrink-0">
                        {isUnlocked ? (
                          <Unlock className="w-4 h-4 text-emerald-400/70" />
                        ) : (
                          <Lock className="w-4 h-4 text-rose-400/70" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="md:col-span-8 flex flex-col bg-[rgba(15,15,25,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] h-full relative">
          
          {/* Room Title */}
          <div className="bg-[rgba(0,0,0,0.2)] border-b border-[rgba(255,255,255,0.05)] p-5 flex justify-between items-center shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ff5500]/10 rounded-lg border border-[#ff5500]/20">
                {currentRoomDetails?.isPrivate ? (
                  <Lock className="w-5 h-5 text-[#ff5500]" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-[#ff5500]" />
                )}
              </div>
              <div>
                <span className="font-black text-lg text-white block leading-tight">
                  {currentRoomDetails ? currentRoomDetails.name : "general"}
                </span>
                <span className="text-xs font-medium text-[rgba(255,255,255,0.5)]">
                  {currentRoomDetails?.type === "REGIONAL" ? "Sala Regional" : currentRoomDetails?.isPrivate ? "Sala Privada" : "Debate Libre"}
                </span>
              </div>
            </div>
            
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">En Vivo</span>
            </div>
          </div>

          {/* Messages list */}
          <div className="grow p-5 overflow-y-auto space-y-6 min-h-0 custom-scrollbar relative">
            
            {loadingMessages && messages.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="animate-spin w-8 h-8 border-2 border-[#ff5500] border-t-transparent rounded-full"></span>
              </div>
            ) : fetchError ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-white">{fetchError}</h3>
                <button 
                  onClick={() => handleRoomClick(currentRoomDetails!)}
                  className="btn-primary mt-2"
                >
                  Introducir Contraseña
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                <MessageSquare className="w-12 h-12 text-[#ff5500] mb-4 opacity-50" />
                <p className="text-lg font-medium text-white">Sala Vacía</p>
                <p className="text-sm text-white/60 mt-1 max-w-sm">
                  Aún no hay mensajes. ¡Sé el primero en iniciar la conversación!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.authorId === user?.id && user?.id != null;
                
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="shrink-0 flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                        isMe 
                          ? 'bg-gradient-to-br from-[#ff5500] to-[#cc4400] text-white border border-white/20' 
                          : 'bg-white/10 text-white/80 border border-white/10'
                      }`}>
                        {msg.authorName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className="flex items-baseline gap-2 px-1 mb-1">
                        <span className="text-xs font-bold text-white/90">{isMe ? 'Tú' : msg.authorName}</span>
                        <span className="text-[10px] font-medium text-white/40">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-[#ff5500] text-white rounded-tr-sm' 
                          : 'bg-white/10 text-white/90 border border-white/5 rounded-tl-sm backdrop-blur-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input */}
          <form 
            onSubmit={handleSendMessage} 
            className="p-4 bg-[rgba(0,0,0,0.3)] border-t border-[rgba(255,255,255,0.05)] flex gap-3 shrink-0 z-10"
          >
            <input
              type="text"
              placeholder={user ? "Escribe un mensaje..." : "Participa como invitado..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!!fetchError}
              className="input text-sm grow py-3 px-5 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] focus:border-[#ff5500]/50 focus:bg-[rgba(255,255,255,0.08)] rounded-xl placeholder-white/30"
            />
            <button
              type="submit"
              disabled={!!fetchError || !inputText.trim()}
              className="btn-primary px-6 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(255,85,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,85,0,0.4)] transition-all"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-[rgba(20,20,30,0.95)] border border-[rgba(255,85,0,0.4)] rounded-3xl max-w-md w-full p-8 space-y-6 animate-fadeInUp shadow-[0_0_80px_rgba(255,85,0,0.15)] relative overflow-hidden">
            
            {/* Modal Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff5500] to-orange-400"></div>
            
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-xl text-white flex items-center gap-3">
                <div className="p-2 bg-[#ff5500]/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#ff5500]" />
                </div>
                Crear Sala
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider block ml-1">Nombre de la Sala</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Debate Tren Maya"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="input text-sm w-full py-3 bg-black/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider block ml-1">Tipo de Sala</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="input text-sm w-full py-3 bg-black/20"
                >
                  <option value="CUSTOM">Tema Público / Comunidad</option>
                  <option value="REGIONAL">Ubicación / Geográfico</option>
                </select>
              </div>

              <div className="pt-2 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input 
                      type="checkbox" 
                      checked={isNewRoomPrivate}
                      onChange={(e) => {
                        setIsNewRoomPrivate(e.target.checked);
                        if (!e.target.checked) setNewRoomPassword("");
                      }}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isNewRoomPrivate ? 'bg-[#ff5500] border-[#ff5500]' : 'border-white/20 bg-black/30 group-hover:border-[#ff5500]/50'}`}>
                      {isNewRoomPrivate && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-[#ff5500] transition-colors flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Sala Privada (Requiere Contraseña)
                  </span>
                </label>
              </div>

              {isNewRoomPrivate && (
                <div className="space-y-1.5 animate-fadeInUp">
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wider block ml-1 flex items-center gap-2">
                    <KeyRound className="w-3 h-3" /> Contraseña de Administrador
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Establecer contraseña segura..."
                    value={newRoomPassword}
                    onChange={(e) => setNewRoomPassword(e.target.value)}
                    className="input text-sm w-full py-3 bg-rose-500/5 border-rose-500/30 focus:border-rose-500"
                  />
                  <p className="text-[10px] text-white/40 ml-1">Los usuarios necesitarán esta contraseña para acceder a la sala.</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary py-4 text-sm font-black tracking-wide uppercase rounded-xl mt-4 shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:shadow-[0_0_30px_rgba(255,85,0,0.5)] transition-all"
              >
                Crear y Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Unlock Room Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-[rgba(20,20,30,0.95)] border border-rose-500/40 rounded-3xl max-w-sm w-full p-8 space-y-6 animate-fadeInUp shadow-[0_0_80px_rgba(244,63,94,0.15)] relative overflow-hidden text-center">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
            
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mb-2">
              <Lock className="w-8 h-8 text-rose-500" />
            </div>

            <div>
              <h3 className="font-black text-xl text-white">Sala Privada</h3>
              <p className="text-sm text-white/60 mt-2">Esta sala requiere una contraseña para ingresar.</p>
            </div>

            <form onSubmit={handleUnlockRoom} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="password"
                  required
                  placeholder="Introduce la contraseña"
                  value={unlockPasswordInput}
                  onChange={(e) => setUnlockPasswordInput(e.target.value)}
                  className="input text-center text-sm w-full py-3 bg-black/30 border-white/10 focus:border-rose-500 focus:bg-rose-500/5"
                  autoFocus
                />
                {unlockError && <p className="text-xs text-rose-500 font-bold animate-pulse">{unlockError}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="w-1/3 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white font-bold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm shadow-[0_4px_14px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.4)] transition-all flex justify-center items-center gap-2"
                >
                  <Unlock className="w-4 h-4" /> Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Styles specific to this page if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 85, 0, 0.5);
        }
      `}} />
    </main>
  );
}
