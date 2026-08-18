import React, { useState, useEffect } from 'react';
import { STATE_COLOR_THEMES, AWEN_STATES } from '../services/stateEngine';

/**
 * AWEN Living Spirit Component with State-Aware Color Reactivity
 * 
 * Features:
 * - 60 FPS vector rendering
 * - State Color Reactivity (LEARNING, BALANCED, ACTIVE, WATCHFUL, WIND_DOWN)
 * - Idle floating, breathing animation
 * - Automatic blinking every 3.8s
 * - Eye glance animation
 * - Waving fin gesture on tap
 * - Late-night sleeping mode with floating vector Zzz
 */
const AwenSpiritComponent = ({ 
  expression = "happy", // "happy", "thinking", "listening", "concerned", "sleeping", "celebrating"
  wellnessState = AWEN_STATES.BALANCED,
  size = 240,
  interactive = true,
  onClick = null,
  caption = ""
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  const isLateNight = new Date().getHours() >= 22 || new Date().getHours() < 6;
  const activeExpression = (isLateNight && expression === "happy") ? "sleeping" : expression;

  // Blinking cycle with cleanup
  useEffect(() => {
    let timeoutId = null;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      timeoutId = setTimeout(() => setIsBlinking(false), 160);
    }, 3800);

    return () => {
      clearInterval(blinkInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Occasional eye glance with cleanup
  useEffect(() => {
    let timeoutId = null;
    const glanceInterval = setInterval(() => {
      const randomX = (Math.random() - 0.5) * 4;
      const randomY = (Math.random() - 0.5) * 3;
      setEyeOffset({ x: randomX, y: randomY });
      timeoutId = setTimeout(() => setEyeOffset({ x: 0, y: 0 }), 1400);
    }, 6000);

    return () => {
      clearInterval(glanceInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Tap handler
  const handleClick = (e) => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 800);
    if (onClick) onClick(e);
  };

  // State-based color themes from stateEngine
  const theme = STATE_COLOR_THEMES[wellnessState] || STATE_COLOR_THEMES[AWEN_STATES.BALANCED];

  return (
    <div 
      className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer group' : ''}`}
      onClick={handleClick}
    >
      {/* Background Soft Aura Glow */}
      <div 
        className="absolute rounded-full transition-all duration-700 pointer-events-none animate-spirit-pulse"
        style={{
          width: size * 1.5,
          height: size * 1.5,
          background: `radial-gradient(circle, ${theme.auraColor} 0%, rgba(8,13,24,0) 70%)`
        }}
      />

      {/* Floating Spirit Body Container */}
      <div className={`relative animate-spirit-float transition-all duration-300 ${isWaving ? 'scale-110 -rotate-3' : 'group-hover:scale-105'}`}>
        
        {/* Sleeping Zzz Particles */}
        {activeExpression === "sleeping" && (
          <div className="absolute -top-12 -right-4 flex flex-col items-center gap-0.5">
            <span className="text-xs font-bold text-[var(--text-primary)] animate-bounce">Z</span>
            <span className="text-[10px] font-bold text-[var(--text-primary)] animate-bounce [animation-delay:0.2s]">z</span>
            <span className="text-[8px] font-bold text-[var(--text-primary)] animate-bounce [animation-delay:0.4s]">z</span>
          </div>
        )}

        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
        >
          <defs>
            {/* Mochi Glass Gradient */}
            <radialGradient id="mochiGrad" cx="35%" cy="30%" r="70%" fx="30%" fy="25%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="30%" stopColor={theme.bodyGrad[0]} stopOpacity="0.9" />
              <stop offset="70%" stopColor={theme.bodyGrad[1]} stopOpacity="0.85" />
              <stop offset="100%" stopColor={theme.bodyGrad[2]} stopOpacity="0.75" />
            </radialGradient>

            {/* Halo Gradient */}
            <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor={theme.finColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Halo Ring */}
          <ellipse 
            cx="100" 
            cy="28" 
            rx="36" 
            ry="9" 
            stroke="url(#haloGrad)" 
            strokeWidth="3.5" 
            fill="none" 
            className="animate-halo opacity-90"
            style={{ transformOrigin: '100px 28px' }}
          />

          {/* Tiny Chubby Legs / Feet (Attached underneath body) */}
          <path 
            d="M 76 154 C 70 173, 90 173, 88 156 Z" 
            fill="url(#mochiGrad)" 
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
          />
          <path 
            d="M 112 156 C 110 173, 130 173, 124 154 Z" 
            fill="url(#mochiGrad)" 
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
          />

          {/* Left Crystal Fin */}
          <path 
            d="M 52 75 C 32 65, 38 95, 58 92 Z" 
            fill={theme.finColor} 
            opacity="0.85"
            className="transition-all duration-500"
          />
          {/* Right Waving Crystal Fin */}
          <path 
            d={isWaving ? "M 148 75 C 178 50, 172 80, 142 92 Z" : "M 148 75 C 168 65, 162 95, 142 92 Z"} 
            fill={theme.finColor} 
            opacity="0.85"
            className="transition-all duration-300"
          />

          {/* Tiny Chubby Left Arm / Paw (State-Aware Gesture) */}
          <path 
            d={
              activeExpression === "thinking" || activeExpression === "listening"
                ? "M 40 114 C 22 104, 26 122, 42 126 Z"
                : activeExpression === "celebrating" || activeExpression === "happy"
                ? "M 40 114 C 20 108, 24 126, 42 126 Z"
                : "M 40 114 C 24 116, 26 132, 42 128 Z"
            } 
            fill="url(#mochiGrad)" 
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
            className="transition-all duration-300"
          />
          {/* Tiny Chubby Right Arm / Paw (Tap Waving Gesture & State-Aware) */}
          <path 
            d={
              isWaving 
                ? "M 160 114 C 184 96, 178 120, 158 126 Z" 
                : activeExpression === "celebrating" || activeExpression === "happy"
                ? "M 160 114 C 180 108, 176 126, 158 126 Z"
                : "M 160 114 C 176 116, 174 132, 158 128 Z"
            } 
            fill="url(#mochiGrad)" 
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
            className="transition-all duration-300"
          />

          {/* Organic Mochi Body */}
          <path 
            d="M 100 48 
               C 138 48, 162 70, 164 104 
               C 166 142, 140 162, 100 162 
               C 60 162, 34 142, 36 104 
               C 38 70, 62 48, 100 48 Z" 
            fill="url(#mochiGrad)" 
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
          />

          {/* Gloss Highlight Overlay */}
          <path 
            d="M 70 56 C 85 52, 115 52, 130 56 C 110 60, 90 60, 70 56 Z" 
            fill="#ffffff" 
            opacity="0.4"
          />

          {/* Eyes & Face Expressions */}
          <g className="transition-all duration-300" transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
            {activeExpression === "sleeping" ? (
              <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 74 100 Q 82 108 90 100" />
                <path d="M 110 100 Q 118 108 126 100" />
              </g>
            ) : isBlinking ? (
              <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round">
                <line x1="74" y1="102" x2="90" y2="102" />
                <line x1="110" y1="102" x2="126" y2="102" />
              </g>
            ) : (
              <>
                <circle 
                  cx={activeExpression === "thinking" ? 84 : 82} 
                  cy={activeExpression === "thinking" ? 98 : 101} 
                  r="7.5" 
                  fill="#0f172a" 
                />
                <circle 
                  cx={activeExpression === "thinking" ? 86 : 84} 
                  cy={activeExpression === "thinking" ? 96 : 99} 
                  r="2.5" 
                  fill="#ffffff" 
                />

                <circle 
                  cx={activeExpression === "thinking" ? 122 : 118} 
                  cy={activeExpression === "thinking" ? 98 : 101} 
                  r="7.5" 
                  fill="#0f172a" 
                />
                <circle 
                  cx={activeExpression === "thinking" ? 124 : 120} 
                  cy={activeExpression === "thinking" ? 96 : 99} 
                  r="2.5" 
                  fill="#ffffff" 
                />
              </>
            )}

            {/* Cheeks */}
            <circle cx="68" cy="110" r="5" fill="#f43f5e" opacity="0.3" />
            <circle cx="132" cy="110" r="5" fill="#f43f5e" opacity="0.3" />

            {/* Mouth */}
            {activeExpression === "happy" || activeExpression === "celebrating" ? (
              <path d="M 96 112 Q 100 117 104 112" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            ) : activeExpression === "concerned" ? (
              <path d="M 96 115 Q 100 111 104 115" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            ) : (
              <circle cx="100" cy="113" r="1.8" fill="#0f172a" />
            )}
          </g>

        </svg>

      </div>

      {caption && (
        <span className="mt-2 px-3 py-1 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
          {caption}
        </span>
      )}
    </div>
  );
};

export const AwenSpirit = React.memo(AwenSpiritComponent);

