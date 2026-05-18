"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeContext";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseRadius: number;
}

export default function AgentKinBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particleCount = Math.min(80, Math.floor((width * height) / 15000));
    const particles: Particle[] = [];
    const fov = 500;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: (Math.random() - 0.5) * 1000,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.8,
        baseRadius: Math.random() * 2.5 + 1.5,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    let isMouseMoving = false;
    let mouseTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
      }, 2000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isLight = theme === "light";
      const particleColor = isLight ? "rgba(26, 18, 8, 0.4)" : "rgba(255, 255, 255, 0.45)";
      const glowColor = isLight ? "rgba(184, 137, 42, 0.3)" : "rgba(255, 77, 0, 0.5)";
      const lineColorBase = isLight ? "26, 18, 8" : "255, 255, 255";
      const accentLineColor = isLight ? "184, 137, 42" : "255, 77, 0";

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z < -fov) p.z += 1000;
        if (p.z > fov) p.z -= 1000;
        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;

        const scale = fov / (fov + p.z);
        const x2d = (p.x - width / 2) * scale + width / 2;
        const y2d = (p.y - height / 2) * scale + height / 2;

        // Mouse interaction (repulsion & acceleration)
        const dx = mouseX - x2d;
        const dy = mouseY - y2d;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180 && isMouseMoving) {
          const force = (180 - dist) / 180;
          p.vx -= (dx / dist) * force * 0.2;
          p.vy -= (dy / dist) * force * 0.2;

          // Connect interactive mouse glow line
          ctx.beginPath();
          ctx.moveTo(x2d, y2d);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(${accentLineColor}, ${force * 0.5})`;
          ctx.lineWidth = force * 1.5;
          ctx.stroke();
        }

        // Dampen velocity back to normal
        p.vx = p.vx * 0.98 + (Math.sign(p.vx) || 1) * 0.01;
        p.vy = p.vy * 0.98 + (Math.sign(p.vy) || 1) * 0.01;

        const r = p.baseRadius * scale;
        if (x2d >= 0 && x2d <= width && y2d >= 0 && y2d <= height && scale > 0) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, Math.max(0.5, r), 0, Math.PI * 2);
          ctx.fillStyle = dist < 120 ? glowColor : particleColor;
          ctx.fill();
        }
      });

      // Connect neighboring particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const s1 = fov / (fov + p1.z);
          const s2 = fov / (fov + p2.z);

          if (s1 < 0 || s2 < 0) continue;

          const x1 = (p1.x - width / 2) * s1 + width / 2;
          const y1 = (p1.y - height / 2) * s1 + height / 2;
          const x2 = (p2.x - width / 2) * s2 + width / 2;
          const y2 = (p2.y - height / 2) * s2 + height / 2;

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(${lineColorBase}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(mouseTimeout);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      id="glow-canvas"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
