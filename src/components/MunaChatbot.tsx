// Trusted-Source: Antigravity
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { usePathname } from "next/navigation";

interface Message {
  sender: "user" | "muna";
  text: string;
  timestamp?: string;
}

export default function MunaChatbot() {
  const pathname = usePathname();
  if (pathname === "/muna") return null;

  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize welcome message when language changes
  useEffect(() => {
    const welcomeText = t(
      "¡Hola! Soy Muna, la Inteligencia Autónoma de La Yucateca. Estoy aquí para guiarte por nuestro portal de noticias y catálogo de diseños web premium. ¿En qué puedo ayudarte hoy?",
      "Hello! I am Muna, the Autonomous AI of La Yucateca. I am here to guide you through our news portal and premium web design catalog. How can I help you today?",
      "¡Sajil! Munaen, u ya'ax na'at ti' La Yucateca. Teen k-nu'uktik ti'al le péektsilo'ob yéetel diseño web premium. ¿Bix je'el in wáantikech bejla'e'?"
    );
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([{ sender: "muna", text: welcomeText, timestamp: time }]);
  }, [language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Remove Muna metadata if present
      const cleanText = text.replace(/^\[🧠 MUNA AI\]\s*/i, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === "my" ? "es-MX" : language === "es" ? "es-MX" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    // Add user message
    const userMsg = { sender: "user" as const, text, timestamp: time };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/muna/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
          sessionId: "muna-session-layucateca",
          language: language
        }),
      });

      setIsTyping(false);

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      const munaTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      // Initialize empty AI message
      setMessages((prev) => [...prev, { sender: "muna", text: "", timestamp: munaTime }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text += chunk;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Muna Engine Error:", error);
      setIsTyping(false);
      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { sender: "muna", text: "[ERROR] Neural link severed. Please check system configuration.", timestamp: errTime }]);
    }
  };

  const clearChat = () => {
    const welcomeText = t(
      "¡Hola! Soy Muna, la Inteligencia Autónoma de La Yucateca. Estoy aquí para guiarte por nuestro portal de noticias y catálogo de diseños web premium. ¿En qué puedo ayudarte hoy?",
      "Hello! I am Muna, the Autonomous AI of La Yucateca. I am here to guide you through our news portal and premium web design catalog. How can I help you today?",
      "¡Sajil! Munaen, u ya'ax na'at ti' La Yucateca. Teen k-nu'uktik ti'al le péektsilo'ob yéetel diseño web premium. ¿Bix je'el in wáantikech bejla'e'?"
    );
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([{ sender: "muna", text: welcomeText, timestamp: time }]);
  };

  return (
    <>
      {/* Floating Chat Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "rgba(5, 5, 5, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(255, 85, 0, 0.2)",
          zIndex: 9999,
          color: "#ffffff",
          animation: "float 4s ease-in-out infinite",
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
          e.currentTarget.style.background = "rgba(255, 85, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "rgba(5, 5, 5, 0.7)";
        }}
        title="Muna AI Assistant"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {/* Glowing badge */}
        <span
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "12px",
            height: "12px",
            background: "var(--accent-gold)",
            borderRadius: "50%",
            border: "2px solid #050505",
            boxShadow: "0 0 8px var(--accent-gold)",
            animation: "pulse-glow 1.5s infinite alternate",
          }}
        />
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="animate-fadeInUp"
          style={{
            position: "fixed",
            bottom: "105px",
            right: "20px",
            left: "20px",
            maxWidth: "390px",
            marginLeft: "auto",
            height: "540px",
            background: "var(--bg-card)",
            backdropFilter: "blur(30px)",
            border: "1px solid var(--border-accent)",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
            zIndex: 9999,
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 20px",
              background: "linear-gradient(135deg, rgba(255, 85, 0, 0.15) 0%, rgba(5, 5, 8, 0.95) 100%)",
              borderBottom: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(255, 85, 0, 0.1)",
                  border: "1px solid var(--border-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "var(--accent-gold)",
                  boxShadow: "0 0 10px rgba(255, 85, 0, 0.2)",
                }}
              >
                M
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  Muna AI
                </h4>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px #10b981" }}></span>
                  {t("Autónoma en línea", "Autonomous AI online", "Meyaj bejla'e'")}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Clear chat button */}
              <button
                onClick={clearChat}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  opacity: 0.6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.background = "none"; }}
                title={t("Limpiar chat", "Clear chat", "Puch chat")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: msg.sender === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: msg.sender === "user" ? "linear-gradient(135deg, var(--accent-gold) 0%, #ff3300 100%)" : "rgba(255,255,255,0.03)",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    border: "1px solid var(--border-subtle)",
                    position: "relative",
                    boxShadow: msg.sender === "user" ? "0 4px 12px rgba(255, 85, 0, 0.2)" : "none",
                  }}
                >
                  <div style={{ wordBreak: "break-word" }}>
                    {msg.text}
                  </div>

                  {msg.timestamp && (
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: msg.sender === "user" ? "rgba(255,255,255,0.7)" : "var(--text-secondary)",
                        textAlign: "right",
                        marginTop: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {msg.timestamp}
                    </div>
                  )}

                  {msg.sender === "muna" && (
                    <button
                      onClick={() => speakText(msg.text)}
                      style={{
                        position: "absolute",
                        right: "-28px",
                        bottom: "6px",
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                        opacity: 0.5,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                      title="Read aloud"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "12px 18px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "18px 18px 18px 2px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ width: "8px", height: "8px", background: "var(--accent-gold)", borderRadius: "50%", animation: "pulse-typing 1.2s infinite ease-in-out" }} />
                <div style={{ width: "8px", height: "8px", background: "var(--accent-gold)", borderRadius: "50%", animation: "pulse-typing 1.2s infinite ease-in-out 0.2s" }} />
                <div style={{ width: "8px", height: "8px", background: "var(--accent-gold)", borderRadius: "50%", animation: "pulse-typing 1.2s infinite ease-in-out 0.4s" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action chips */}
          <div style={{ display: "flex", gap: "6px", padding: "10px 20px", overflowX: "auto", borderTop: "1px solid var(--border-subtle)" }}>
            {[
              { label: t("Servicios", "Services", "Servicios"), query: "servicios" },
              { label: t("Noticias K'iin", "K'iin News", "Péektsil"), query: "noticias" },
              { label: t("Denunciar", "Report Issue", "Denunciar"), query: "denunciar" },
              { label: t("Mercado", "Marketplace", "Mercado"), query: "mercado" },
              { label: t("Ayuda", "Help", "Ayuda"), query: "ayuda" },
            ].map((chip) => (
              <button
                key={chip.query}
                onClick={() => handleSend(chip.label)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-gold)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "rgba(255, 85, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            style={{
              padding: "14px 20px 20px",
              display: "flex",
              gap: "10px",
              background: "rgba(5, 5, 8, 0.9)",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <input
              type="text"
              placeholder={t("Pregúntale a Muna...", "Ask Muna...", "K'áat chi' ti' Muna...")}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "16px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-gold)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
            />
            <button
              type="submit"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-gold)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "var(--accent-gold)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--text-primary)";
                e.currentTarget.style.color = "var(--bg-primary)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Styled animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes pulse-typing {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 4px var(--accent-gold);
          }
          100% {
            box-shadow: 0 0 12px var(--accent-gold);
          }
        }
      `}</style>
    </>
  );
}
