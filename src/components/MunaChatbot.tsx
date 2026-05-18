// Trusted-Source: Antigravity
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageContext";

interface Message {
  sender: "user" | "muna";
  text: string;
}

export default function MunaChatbot() {
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
    setMessages([{ sender: "muna", text: welcomeText }]);
  }, [language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "my" ? "es-MX" : language === "es" ? "es-MX" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: "user" as const, text };
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
          sessionId: "muna-session-layucateca"
        }),
      });

      setIsTyping(false);

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      // Initialize empty AI message
      setMessages((prev) => [...prev, { sender: "muna", text: "" }]);

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
      setMessages((prev) => [...prev, { sender: "muna", text: "[ERROR] Neural link severed. Please check system configuration." }]);
    }
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
          background: "rgba(5, 5, 5, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          zIndex: 9999,
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s",
          color: "#ffffff",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "rgba(5, 5, 5, 0.6)";
        }}
        title="Muna AI Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
          <rect x="4" y="6" width="16" height="12" rx="0"></rect>
          <line x1="8" y1="12" x2="16" y2="12"></line>
          <line x1="12" y1="2" x2="12" y2="6"></line>
        </svg>
        {/* Glowing badge */}
        <span
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "12px",
            height: "12px",
            background: "#ffffff",
            borderRadius: "50%",
            border: "2px solid #050505",
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
            right: "30px",
            width: "380px",
            height: "520px",
            background: "var(--bg-card)",
            backdropFilter: "blur(25px)",
            border: "1px solid var(--border-accent)",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-subtle)",
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
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                }}
              >
                M
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>Muna</h4>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", background: "var(--accent-gold)", borderRadius: "50%", display: "inline-block" }}></span>
                  {t("Autónoma en línea", "Autonomous AI online", "Meyaj bejla'e'")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}
            >
              ✕
            </button>
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: msg.sender === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                    background: msg.sender === "user" ? "var(--text-primary)" : "var(--bg-secondary)",
                    color: msg.sender === "user" ? "var(--bg-primary)" : "var(--text-primary)",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    border: "1px solid var(--border-subtle)",
                    position: "relative",
                  }}
                >
                  {msg.text}

                  {msg.sender === "muna" && (
                    <button
                      onClick={() => speakText(msg.text)}
                      style={{
                        position: "absolute",
                        right: "-30px",
                        bottom: "2px",
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        opacity: 0.6,
                      }}
                      title="Read aloud"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: "4px", padding: "12px 16px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                <span className="dot" style={{ width: "6px", height: "6px", background: "var(--text-secondary)", borderRadius: "50%", animation: "dot-blink 1.4s infinite linear" }} />
                <span className="dot" style={{ width: "6px", height: "6px", background: "var(--text-secondary)", borderRadius: "50%", animation: "dot-blink 1.4s infinite linear 0.2s" }} />
                <span className="dot" style={{ width: "6px", height: "6px", background: "var(--text-secondary)", borderRadius: "50%", animation: "dot-blink 1.4s infinite linear 0.4s" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action chips */}
          <div style={{ display: "flex", gap: "6px", padding: "10px 20px", overflowX: "auto", borderTop: "1px solid var(--border-subtle)" }}>
            {[
              { label: t("Diseño Web", "Web Design", "Diseño Web"), query: "servicios" },
              { label: t("Noticias K'iin", "K'iin News", "Péektsil"), query: "noticias" },
              { label: t("Quién es Muna?", "Who is Muna?", "Máaxen Muna?"), query: "quién es muna" },
            ].map((chip) => (
              <button
                key={chip.query}
                onClick={() => handleSend(chip.label)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "14px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-accent)",
                  color: "var(--text-primary)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--text-primary)";
                  e.currentTarget.style.color = "var(--bg-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-secondary)";
                  e.currentTarget.style.color = "var(--text-primary)";
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
              padding: "16px 20px 20px",
              display: "flex",
              gap: "10px",
              background: "var(--bg-secondary)",
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
                background: "var(--bg-card)",
                border: "1px solid var(--border-accent)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                outline: "none",
              }}
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
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Styled animation keyframes */}
      <style jsx global>{`
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
          }
          100% {
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
          }
        }
        @keyframes dot-blink {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </>
  );
}
