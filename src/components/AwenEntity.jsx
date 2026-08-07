import React, { useEffect, useRef } from 'react';

/**
 * AWEN Crystalline Energy Entity Component
 * 
 * Visually represents AWEN as an organic, semi-transparent crystalline form
 * inspired by a soft peach/momo contour with glowing core, orbiting particles,
 * and state-aware color transitions (Blue, Green, Amber, Soft Coral).
 */
export const AwenEntity = ({ 
  state = "relaxed", // "learning" (blue), "relaxed" (green), "attention" (amber), "stress" (coral)
  size = 280, 
  interactive = true,
  onClick = null,
  subtext = ""
}) => {
  const canvasRef = useRef(null);

  // Emotional State Color Palettes (Primary Glow, Core Energy, Particles, Halo)
  const COLOR_PALETTES = {
    learning: {
      primary: 'rgba(59, 130, 246, 0.7)',    // Blue
      secondary: 'rgba(96, 165, 250, 0.9)',
      core: '#93c5fd',
      halo: 'rgba(59, 130, 246, 0.25)',
      particle: '#60a5fa',
      label: 'Learning Baseline'
    },
    relaxed: {
      primary: 'rgba(16, 185, 129, 0.7)',    // Green
      secondary: 'rgba(52, 211, 153, 0.9)',
      core: '#a7f3d0',
      halo: 'rgba(16, 185, 129, 0.25)',
      particle: '#34d399',
      label: 'Balanced Baseline'
    },
    attention: {
      primary: 'rgba(245, 158, 11, 0.75)',   // Amber
      secondary: 'rgba(251, 191, 36, 0.9)',
      core: '#fde68a',
      halo: 'rgba(245, 158, 11, 0.28)',
      particle: '#fbbf24',
      label: 'Attention Needed'
    },
    stress: {
      primary: 'rgba(244, 63, 94, 0.75)',    // Soft Coral
      secondary: 'rgba(251, 113, 133, 0.9)',
      core: '#fecdd3',
      halo: 'rgba(244, 63, 94, 0.28)',
      particle: '#fb7185',
      label: 'Physiological Variation'
    }
  };

  const currentPalette = COLOR_PALETTES[state] || COLOR_PALETTES.relaxed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Particle setup
    const particleCount = 14;
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      orbitRadius: 90 + Math.random() * 40,
      speed: 0.005 + Math.random() * 0.008,
      size: 1.5 + Math.random() * 2,
      pulseOffset: Math.random() * Math.PI * 2
    }));

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = size * 0.26;

      // 1. Draw Halo Glow
      const haloGlow = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.4,
        centerX, centerY, baseRadius * 2.2
      );
      haloGlow.addColorStop(0, currentPalette.halo);
      haloGlow.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = haloGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Organic Crystalline Momo/Peach Outer Shell
      ctx.save();
      ctx.translate(centerX, centerY);

      // Organic float & subtle morphing
      const floatY = Math.sin(time * 0.8) * 8;
      const breathing = Math.sin(time * 1.2) * 0.04 + 1;
      ctx.translate(0, floatY);
      ctx.scale(breathing, breathing);

      ctx.beginPath();
      const points = 16;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Organic peach-like contour (slight indentation on top like a momo/peach)
        const momoShape = 1 - 0.12 * Math.cos(angle * 2) * Math.sin(angle);
        const wave1 = Math.sin(angle * 3 + time * 1.2) * 4;
        const wave2 = Math.cos(angle * 5 - time * 0.8) * 3;
        const radius = baseRadius * momoShape + wave1 + wave2;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.quadraticCurveTo(
            Math.cos(angle - 0.1) * (radius + 2),
            Math.sin(angle - 0.1) * (radius + 2),
            x, y
          );
        }
      }
      ctx.closePath();

      // Organic Crystalline Gradient Fill
      const crystalGrad = ctx.createRadialGradient(
        -baseRadius * 0.3, -baseRadius * 0.3, baseRadius * 0.1,
        0, 0, baseRadius * 1.2
      );
      crystalGrad.addColorStop(0, currentPalette.core);
      crystalGrad.addColorStop(0.4, currentPalette.secondary);
      crystalGrad.addColorStop(0.8, currentPalette.primary);
      crystalGrad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');

      ctx.fillStyle = crystalGrad;
      ctx.fill();

      // Crystalline Facet Overlay Refractions
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.stroke();

      // Internal Refraction Lines (Soft Peach Energy Geometry)
      ctx.beginPath();
      ctx.moveTo(-baseRadius * 0.5, -baseRadius * 0.2);
      ctx.quadraticCurveTo(0, baseRadius * 0.4, baseRadius * 0.5, -baseRadius * 0.3);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.stroke();

      // 3. Inner Glowing Energy Core
      const coreRadius = baseRadius * 0.45 + Math.sin(time * 2) * 3;
      const coreGrad = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, coreRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, currentPalette.core);
      coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 4. Orbiting Micro-Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = centerX + Math.cos(p.angle) * p.orbitRadius;
        const py = centerY + Math.sin(p.angle) * (p.orbitRadius * 0.6) + floatY; // Elliptical orbit
        const opacity = 0.4 + Math.sin(time * 3 + p.pulseOffset) * 0.4;

        ctx.fillStyle = currentPalette.particle;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, size, currentPalette]);

  return (
    <div 
      className={`relative inline-flex flex-col items-center justify-center ${interactive ? 'cursor-pointer group' : ''}`}
      onClick={onClick}
    >
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size}
        className="transition-transform duration-500 group-hover:scale-105"
      />

      {/* Floating State Badge & Subtext */}
      <div className="absolute bottom-1 flex flex-col items-center text-center pointer-events-none">
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-colors duration-500 shadow-lg"
          style={{
            backgroundColor: currentPalette.halo,
            borderColor: currentPalette.secondary,
            color: '#ffffff',
            borderWidth: '1px'
          }}
        >
          {currentPalette.label}
        </span>
        {subtext && (
          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[200px] leading-tight">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
