"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { 
  MessageSquare, Send, Users, Globe, MapPin, Hash, Plus, Sparkles, 
  Trophy, Lock, Unlock, KeyRound, Image as ImageIcon, Navigation, 
  UserCircle, X
} from "lucide-react";
import Footer from "@/components/Footer";

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
  imageUrl?: string | null;
  location?: string | null;
  createdAt: string;
}

export default function OpinionRoomPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  
  // Custom Display Name
  const [customName, setCustomName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState("");

  // Attachments
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedLocation, setAttachedLocation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load saved configurations from localStorage on mount
  useEffect(() => {
    try {
      const savedPws = localStorage.getItem("layucateca_chat_passwords");
      if (savedPws) setRoomPasswords(JSON.parse(savedPws));

      const savedName = localStorage.getItem("layucateca_custom_name");
      if (savedName) setCustomName(savedName);
    } catch (e) {
      console.error("Failed to parse localStorage", e);
    }
  }, []);

  // Save passwords
  useEffect(() => {
    if (Object.keys(roomPasswords).length > 0) {
      localStorage.setItem("layucateca_chat_passwords", JSON.stringify(roomPasswords));
    }
  }, [roomPasswords]);

  const saveCustomName = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tempName.trim() || user?.name || "Invitado";
    setCustomName(finalName);
    localStorage.setItem("layucateca_custom_name", finalName);
    setShowNameModal(false);
  };

  const getActiveDisplayName = () => {
    if (customName) return customName;
    if (user?.name) return user.name;
    return "Invitado";
  };

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

  const userScrolledUp = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    
    fetchMessages(activeRoom, true);
    const interval = setInterval(() => {
      fetchMessages(activeRoom, false);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRoom, roomPasswords]);

  // useEffect(() => {
  //   if (!userScrolledUp.current) {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      userScrolledUp.current = !isNearBottom;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es compatible con este navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAttachedLocation(`${position.coords.latitude},${position.coords.longitude}`);
      },
      () => {
        alert("No se pudo obtener la ubicación.");
      }
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedImage && !attachedLocation) return;

    const textToSend = inputText;
    const imgToSend = attachedImage;
    const locToSend = attachedLocation;

    setInputText("");
    setAttachedImage(null);
    setAttachedLocation(null);
    
    const pw = roomPasswords[activeRoom] || "";

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textToSend,
          imageUrl: imgToSend,
          location: locToSend,
          authorName: getActiveDisplayName(),
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
    
    setUnlockError("");
    try {
      const url = `/api/chat/messages?roomSlug=${unlockTargetSlug}&roomPassword=${encodeURIComponent(unlockPasswordInput)}`;
      const res = await fetch(url);
      
      if (res.ok) {
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
    <>
    <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col min-h-screen font-sans relative gap-12">
      
      {/* Glassmorphism ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#f8fafc] dark:bg-[#0a0a0c] transition-colors"></div>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-80">
        <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] bg-gradient-to-br from-[#ff5500]/10 to-[#ffaa00]/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[5%] right-[5%] w-[45vw] h-[45vw] bg-gradient-to-tl from-[#ff5500]/5 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Upper header */}
      <div className="flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center justify-center gap-4">
            <MessageSquare className="w-12 h-12 text-[#ff5500]" />
            <span>{t("Sala de Opinión", "Opinion Room", "Sala de Opinión")}</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-white/60 mt-6 font-medium max-w-3xl leading-relaxed">
            {t("Debates, reportes viales y conversaciones locales en tiempo real con una experiencia modernizada.", "Real-time chat, local news, and community talk with a modern experience.", "Debates de la península en tiempo real.")}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {/* Custom Name Display */}
          <button 
            onClick={() => {
              setTempName(getActiveDisplayName());
              setShowNameModal(true);
            }}
            className="flex items-center gap-3 bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 px-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/30 transition-colors">
              <UserCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 dark:text-white/50 uppercase font-bold tracking-wider block">{t("Tu Nombre", "Your Name", "Kaba'")}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[120px] block">{getActiveDisplayName()}</span>
            </div>
          </button>

          {user && (
            <div className="flex items-center gap-3 bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 px-5 shadow-sm">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-100 dark:border-yellow-500/20">
                <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-500 dark:text-white/50 uppercase font-bold tracking-wider block">{t("Reputación", "Reputation", "Reputación")}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{user.reputation?.score || 100} PTS</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 grow pb-12 w-full">
        
        {/* Rooms List (Sidebar on Desktop) */}
        <div className="flex flex-col lg:w-96 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all bg-white/40 dark:bg-black/20 backdrop-blur-[40px] border border-white/40 dark:border-white/10">
          <div className="bg-white/60 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/10 p-8 flex justify-between items-center shrink-0">
            <span className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-wide">
              <Users className="w-6 h-6 text-[#ff5500]" />
              {t("Salas de Chat", "Chat Rooms", "Salas")}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="p-3 rounded-2xl bg-gradient-to-br from-[#ff5500] to-orange-500 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_8px_20px_rgba(255,85,0,0.25)]"
              title={t("Crear Nueva Sala", "Create New Room", "Crear")}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-row overflow-x-auto lg:flex-col gap-4 p-6 custom-scrollbar items-stretch h-auto lg:h-[800px] overflow-y-auto bg-slate-50/30 dark:bg-black/5">
            {loadingRooms ? (
              <div className="flex flex-col items-center justify-center w-full py-4">
                <span className="animate-spin w-6 h-6 border-2 border-[#ff5500] border-t-transparent rounded-full"></span>
              </div>
            ) : (
              rooms.map((room) => {
                const isActive = room.slug === activeRoom;
                const isUnlocked = !room.isPrivate || !!roomPasswords[room.slug];

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={`min-w-[240px] lg:min-w-0 flex items-center justify-between gap-4 px-6 py-5 rounded-3xl border transition-all group ${
                      isActive
                        ? "bg-white/80 dark:bg-[#ff5500]/10 border-[#ff5500]/20 dark:border-[#ff5500]/30 shadow-[0_8px_30px_rgba(255,85,0,0.1)]"
                        : "bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 hover:border-white/60 dark:hover:border-white/20 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-[#ff5500] text-white shadow-md' : 'bg-white dark:bg-white/10 text-slate-500 dark:text-white/60 group-hover:bg-white dark:group-hover:text-white shadow-sm'}`}>
                        {room.type === "PUBLIC" ? (
                          <Globe className="w-5 h-5" />
                        ) : room.type === "REGIONAL" ? (
                          <MapPin className="w-5 h-5" />
                        ) : (
                          <Hash className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className={`font-black text-[15px] block truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-white/80'}`}>
                          {room.name}
                        </span>
                        {room.city && <span className="text-xs font-semibold text-slate-400 dark:text-white/40 block mt-1">{room.city}, {room.state}</span>}
                      </div>
                    </div>
                    
                    {room.isPrivate && (
                      <div className="shrink-0">
                        {isUnlocked ? (
                          <Unlock className="w-4 h-4 text-emerald-500/70" />
                        ) : (
                          <Lock className="w-4 h-4 text-rose-500/70" />
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
        <div className="flex flex-col grow rounded-[2.5rem] overflow-hidden h-[800px] relative transition-all shadow-2xl bg-white/40 dark:bg-black/20 backdrop-blur-[40px] border border-white/40 dark:border-white/10">
          
          {/* Room Title */}
          <div className="bg-white/5 dark:bg-black/20 border-b border-slate-200/50 dark:border-white/5 p-6 md:p-8 flex justify-between items-center shrink-0 z-10 backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="p-3.5 bg-gradient-to-br from-[#ff5500] to-orange-500 rounded-2xl shadow-[0_8px_32px_rgba(255,85,0,0.3)] text-white">
                {currentRoomDetails?.isPrivate ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  <MessageSquare className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white block leading-tight">
                  {currentRoomDetails ? currentRoomDetails.name : "general"}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-white/50 mt-1 block uppercase tracking-wider">
                  {currentRoomDetails?.type === "REGIONAL" ? t("Sala Regional", "Regional Room", "Sala Regional") : currentRoomDetails?.isPrivate ? t("Sala Privada", "Private Room", "Sala Privada") : t("Debate Libre", "Free Debate", "Debate Libre")}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full shadow-inner backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t("En Vivo", "Live", "En Vivo")}</span>
            </div>
          </div>

          {/* Messages list */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="grow p-6 md:p-8 overflow-y-auto space-y-10 custom-scrollbar relative bg-slate-50/10 dark:bg-black/5"
          >
            
            {loadingMessages && messages.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-[#ff5500]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#ff5500] rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : fetchError ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-2">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{fetchError}</h3>
                <button 
                  onClick={() => handleRoomClick(currentRoomDetails!)}
                  className="btn-primary mt-4 py-3.5 px-8 rounded-full shadow-lg shadow-orange-500/20"
                >
                  Introducir Contraseña
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-80 dark:opacity-60">
                <div className="w-24 h-24 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md flex items-center justify-center mb-6 border border-white dark:border-white/10 shadow-xl">
                  <MessageSquare className="w-10 h-10 text-slate-300 dark:text-white/20" />
                </div>
                <p className="text-xl font-bold text-slate-700 dark:text-white">Sala Vacía</p>
                <p className="text-sm text-slate-500 dark:text-white/50 mt-2 max-w-sm">
                  Aún no hay mensajes. ¡Sé el primero en iniciar la conversación!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.authorName === getActiveDisplayName() || (msg.authorId === user?.id && user?.id != null);
                
                return (
                  <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="shrink-0 flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
                        isMe 
                          ? 'bg-gradient-to-br from-[#ff5500] to-orange-500 text-white shadow-orange-500/20' 
                          : 'bg-white dark:bg-[#1a1a24] text-slate-600 dark:text-white/80 border border-slate-200 dark:border-white/10'
                      }`}>
                        {msg.authorName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                      <div className="flex items-baseline gap-2.5 px-2 mb-2">
                        <span className="text-[13px] font-black text-slate-700 dark:text-white/90 tracking-wide">{isMe ? 'Tú' : msg.authorName}</span>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 tracking-wider">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <div className={`flex flex-col gap-3 ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.content && (
                          <div className={`px-8 py-5 text-[17px] leading-relaxed shadow-lg backdrop-blur-2xl ${
                            isMe 
                              ? 'bg-gradient-to-br from-[#ff5500] to-[#ffaa00] text-white rounded-[2rem] rounded-tr-xl shadow-[0_10px_30px_rgba(255,85,0,0.25)] border border-white/20' 
                              : 'bg-white dark:bg-white/10 text-slate-800 dark:text-white border border-white/50 dark:border-white/10 rounded-[2rem] rounded-tl-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                          }`}>
                            {msg.content}
                          </div>
                        )}

                        {msg.imageUrl && (
                          <div className={`overflow-hidden shadow-lg border p-1 ${isMe ? 'border-orange-500/30 rounded-[2rem] rounded-tr-xl' : 'border-slate-200 dark:border-white/10 rounded-[2rem] rounded-tl-xl'} bg-white/20 dark:bg-white/5 backdrop-blur-md`}>
                            <img src={msg.imageUrl} alt="Adjunto" className="max-w-full md:max-w-sm max-h-72 object-cover rounded-3xl" loading="lazy" />
                          </div>
                        )}

                        {msg.location && (
                          <a 
                            href={`https://www.google.com/maps?q=${msg.location}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-4 px-5 py-4 shadow-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 ${
                              isMe 
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-3xl rounded-tr-md border border-white/20 shadow-[0_8px_24px_rgba(16,185,129,0.2)]' 
                                : 'bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl rounded-tl-md'
                            }`}
                          >
                            <div className="p-2.5 bg-white/25 rounded-full shrink-0">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="text-left pr-3">
                              <span className="block text-[15px] font-black tracking-tight">Ubicación Compartida</span>
                              <span className="block text-xs font-semibold opacity-80 uppercase tracking-widest mt-0.5">Abrir Maps</span>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachment Previews */}
          {(attachedImage || attachedLocation) && (
            <div className="p-3 bg-white/80 dark:bg-black/40 backdrop-blur-md border-t border-slate-200 dark:border-white/10 flex gap-3 overflow-x-auto">
              {attachedImage && (
                <div className="relative group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#ff5500]/50">
                    <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {attachedLocation && (
                <div className="relative group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MapPin className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Ubicación</span>
                  </div>
                  <button onClick={() => setAttachedLocation(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Send Input */}
          <form 
            onSubmit={handleSendMessage} 
            className="p-6 md:p-8 bg-white/60 dark:bg-black/40 border-t border-white/40 dark:border-white/10 flex gap-4 shrink-0 z-10 items-center backdrop-blur-xl"
          >
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-white dark:bg-white/5 text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-[#ff5500] dark:hover:text-[#ff5500] transition-colors border border-white dark:border-white/10 shadow-sm flex items-center justify-center shrink-0"
              title={t("Adjuntar Imagen", "Attach Image", "Adjuntar")}
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            
            <button
              type="button"
              onClick={handleShareLocation}
              className="w-16 h-16 rounded-full bg-white dark:bg-white/5 text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors border border-white dark:border-white/10 shadow-sm flex items-center justify-center shrink-0"
              title={t("Compartir Ubicación", "Share Location", "Ubicación")}
            >
              <Navigation className="w-6 h-6" />
            </button>

            <input
              type="text"
              placeholder={t("Escribe un mensaje asombroso...", "Write an awesome message...", "Ts'íibta'al junp'éel mensaje...")}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!!fetchError}
              className="input text-[17px] font-medium grow py-5 px-8 bg-white dark:bg-black/40 border border-white dark:border-white/10 focus:border-[#ff5500] focus:ring-4 focus:ring-[#ff5500]/10 rounded-full placeholder-slate-400 dark:placeholder-white/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] transition-all"
            />
            
            <button
              type="submit"
              disabled={!!fetchError || (!inputText.trim() && !attachedImage && !attachedLocation)}
              className="btn-primary px-10 h-[64px] rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.03] active:scale-95 transition-all"
            >
              <Send className="w-6 h-6 ml-1" />
            </button>
          </form>
        </div>
      </div>

      {/* Name Config Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14141e] border border-slate-200 dark:border-blue-500/30 rounded-3xl max-w-sm w-full p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(59,130,246,0.15)] relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 mb-2">
              <UserCircle className="w-8 h-8 text-blue-500" />
            </div>

            <div>
              <h3 className="font-black text-2xl text-slate-900 dark:text-white">Tu Identidad</h3>
              <p className="text-[14px] text-slate-500 dark:text-white/60 mt-2 leading-relaxed">
                Elige el nombre con el que te verán los demás en las salas.
              </p>
            </div>

            <form onSubmit={saveCustomName} className="space-y-5 pt-2">
              <input
                type="text"
                placeholder="Ej. JuanPerez99"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={25}
                className="input text-center text-lg font-bold w-full py-4 bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl"
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="w-1/3 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 font-bold text-[15px] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-[15px] shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14141e] border border-slate-200 dark:border-[#ff5500]/30 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(255,85,0,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ff5500] to-orange-400"></div>
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/10">
              <h3 className="font-black text-2xl text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 dark:bg-[#ff5500]/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-[#ff5500]" />
                </div>
                Crear Sala
              </h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">✕</button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider block ml-1">Nombre de la Sala</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Debate Tren Maya"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="input text-[15px] w-full py-3.5 px-4 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider block ml-1">Tipo de Sala</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="input text-[15px] w-full py-3.5 px-4 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]"
                >
                  <option value="CUSTOM">Tema Público / Comunidad</option>
                  <option value="REGIONAL">Ubicación / Geográfico</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors -mx-3">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <input 
                      type="checkbox" 
                      checked={isNewRoomPrivate}
                      onChange={(e) => {
                        setIsNewRoomPrivate(e.target.checked);
                        if (!e.target.checked) setNewRoomPassword("");
                      }}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isNewRoomPrivate ? 'bg-[#ff5500] border-[#ff5500]' : 'border-slate-300 dark:border-white/20 bg-white dark:bg-black/30 group-hover:border-[#ff5500]/50'}`}>
                      {isNewRoomPrivate && <span className="text-white text-sm">✓</span>}
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-slate-800 dark:text-white group-hover:text-[#ff5500] transition-colors flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Sala Privada (Requiere Contraseña)
                  </span>
                </label>
              </div>

              {isNewRoomPrivate && (
                <div className="space-y-2 animate-fadeInUp p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/30 rounded-2xl">
                  <label className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block ml-1 flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5" /> Contraseña de Administrador
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Establecer contraseña segura..."
                    value={newRoomPassword}
                    onChange={(e) => setNewRoomPassword(e.target.value)}
                    className="input text-[15px] w-full py-3.5 px-4 bg-white dark:bg-black/20 border-rose-200 dark:border-rose-500/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl"
                  />
                  <p className="text-[11px] text-rose-500/80 dark:text-white/50 ml-1 font-medium">Los usuarios necesitarán esta contraseña para acceder a la sala.</p>
                </div>
              )}

              <button type="submit" className="w-full btn-primary py-4 text-[15px] font-black tracking-wide uppercase rounded-2xl mt-6 shadow-[0_8px_20px_rgba(255,85,0,0.2)] dark:shadow-[0_0_20px_rgba(255,85,0,0.3)] hover:shadow-[0_12px_25px_rgba(255,85,0,0.3)] transition-all">
                Crear y Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Unlock Room Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14141e] border border-rose-200 dark:border-rose-500/40 rounded-3xl max-w-sm w-full p-8 space-y-6 shadow-[0_20px_60px_rgba(244,63,94,0.1)] dark:shadow-[0_0_80px_rgba(244,63,94,0.15)] relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-pink-500"></div>
            <div className="mx-auto w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-500/20 mb-2">
              <Lock className="w-10 h-10 text-rose-500" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-slate-900 dark:text-white">Sala Privada</h3>
              <p className="text-[15px] text-slate-500 dark:text-white/60 mt-2">Esta sala requiere una contraseña para ingresar.</p>
            </div>
            <form onSubmit={handleUnlockRoom} className="space-y-5 pt-2">
              <div className="space-y-2">
                <input
                  type="password"
                  required
                  placeholder="Introduce la contraseña"
                  value={unlockPasswordInput}
                  onChange={(e) => setUnlockPasswordInput(e.target.value)}
                  className="input text-center text-lg font-medium tracking-widest w-full py-4 bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-white/10 focus:border-rose-500 focus:bg-rose-50 dark:focus:bg-rose-500/5 rounded-2xl"
                />
                {unlockError && <p className="text-sm text-rose-500 font-bold animate-pulse pt-1">{unlockError}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowUnlockModal(false)} className="w-1/3 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 font-bold text-[15px] transition-all">Cancelar</button>
                <button type="submit" className="w-2/3 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[15px] shadow-[0_8px_20px_rgba(244,63,94,0.2)] transition-all flex justify-center items-center gap-2">
                  <Unlock className="w-5 h-5" /> Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 85, 0, 0.5); }
      `}} />
    </main>
    <Footer />
    </>
  );
}
