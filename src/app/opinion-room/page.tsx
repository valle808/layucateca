"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { MessageSquare, Send, Users, Globe, Landmark, MapPin, Hash, Plus, Sparkles, Trophy } from "lucide-react";

interface ChatRoom {
  id: string;
  name: string;
  slug: string;
  type: string;
  state?: string | null;
  city?: string | null;
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

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    try {
      const res = await fetch(`/api/chat/messages?roomSlug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
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
  }, [activeRoom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: textToSend,
          authorName: user?.name || t("Invitado", "Guest", "Invitado"),
          authorId: user?.id || null,
          roomSlug: activeRoom,
        }),
      });

      if (res.ok) {
        fetchMessages(activeRoom, false);
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewRoomName("");
        setShowModal(false);
        fetchRooms();
        if (data.room?.slug) {
          setActiveRoom(data.room.slug);
        }
      }
    } catch (e) {
      console.error("Error creating room", e);
    }
  };

  const currentRoomDetails = rooms.find((r) => r.slug === activeRoom);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      {/* Upper header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#ff5500]" />
            <span>{t("Sala de Opinión", "Opinion Room", "Sala de Opinión")}</span>
          </h1>
          <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">
            {t("Debates, reportes viales y conversaciones locales de la península en tiempo real.", "Real-time chat, local news, and community talk.", "Debates de la península en tiempo real.")}
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2 px-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <div className="text-left">
              <span className="text-[10px] text-[rgba(255,255,255,0.45)] uppercase block">Reputación</span>
              <span className="text-xs font-bold text-white">Score: {user.reputation?.score || 100} PTS</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 grow overflow-hidden min-h-[480px]">
        {/* Rooms Sidebar */}
        <div className="md:col-span-4 flex flex-col bg-[rgba(15,15,25,0.45)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 overflow-hidden h-full">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-3 mb-4 shrink-0">
            <span className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#ff5500]" />
              {t("Salas de Chat", "Chat Rooms", "Salas")}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="p-1 rounded bg-[rgba(255,85,0,0.1)] border border-[rgba(255,85,0,0.2)] text-[#ff5500] hover:bg-[rgba(255,85,0,0.2)] transition-all cursor-pointer"
              title={t("Crear Nueva Sala", "Create New Room", "Crear")}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto grow pr-1">
            {loadingRooms ? (
              <div className="text-center py-8 text-xs text-[rgba(255,255,255,0.4)]">Cargando salas...</div>
            ) : (
              rooms.map((room) => {
                const isActive = room.slug === activeRoom;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.slug)}
                    className={`w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isActive
                        ? "bg-[rgba(255,85,0,0.08)] border-[#ff5500] text-white"
                        : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.04)]"
                    }`}
                  >
                    {room.type === "PUBLIC" ? (
                      <Globe className="w-4 h-4 text-[#ff5500] shrink-0" />
                    ) : room.type === "REGIONAL" ? (
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Hash className="w-4 h-4 text-yellow-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="font-bold text-xs block">{room.name}</span>
                      {room.city && <span className="text-[9px] text-[rgba(255,255,255,0.4)]">{room.city}, {room.state}</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="md:col-span-8 flex flex-col bg-[rgba(15,15,25,0.45)] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden h-full">
          {/* Room Title */}
          <div className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.08)] p-4 flex justify-between items-center shrink-0">
            <div>
              <span className="font-bold text-sm text-white">
                #{currentRoomDetails ? currentRoomDetails.name : "general"}
              </span>
              <span className="text-[10px] text-[rgba(255,255,255,0.4)] ml-3">
                {currentRoomDetails?.type === "REGIONAL" ? "Sala Regional" : "Debate Libre"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE_SYNC_OK</span>
            </div>
          </div>

          {/* Messages list */}
          <div className="grow p-4 overflow-y-auto space-y-4 min-h-0">
            {loadingMessages ? (
              <div className="text-center py-12 text-xs text-[rgba(255,255,255,0.4)]">Cargando mensajes...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-xs text-[rgba(255,255,255,0.45)]">
                No hay mensajes en esta sala. ¡Sé el primero en participar!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/25 flex items-center justify-center font-bold text-xs text-[#ff5500] shrink-0">
                    {msg.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-white">{msg.authorName}</span>
                      <span className="text-[9px] text-[rgba(255,255,255,0.35)]">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-[rgba(255,255,255,0.85)] mt-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-xl py-2.5 px-4 max-w-lg leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-[rgba(255,255,255,0.02)] border-t border-[rgba(255,255,255,0.08)] flex gap-2 shrink-0">
            <input
              type="text"
              placeholder={user ? "Escribe un mensaje de forma segura..." : "Participa como invitado..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input text-xs grow py-2.5"
            />
            <button
              type="submit"
              className="btn-primary border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] px-5 py-2.5 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[rgba(15,15,25,0.95)] border border-[rgba(255,85,0,0.3)] rounded-2xl max-w-md w-full p-6 space-y-4 animate-fadeInUp shadow-[0_0_50px_rgba(255,85,0,0.15)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-3">
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ff5500]" />
                Crear Sala de Debate
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[rgba(255,255,255,0.5)] hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">Nombre de la Sala</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tren Maya Yucatán"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[rgba(255,255,255,0.5)] uppercase block mb-1">Tipo de Sala</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="input text-xs"
                >
                  <option value="CUSTOM">Tema de Comunidad (Público)</option>
                  <option value="REGIONAL">Ubicación / Geográfico</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full btn-primary border-[#ff5500] hover:bg-[rgba(255,85,0,0.1)] py-2.5 text-xs font-bold"
              >
                Crear y Unirse
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
