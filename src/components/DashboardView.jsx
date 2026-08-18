import React, { useState, useEffect, useRef } from 'react';
import { AwenEntity } from './AwenEntity';
import { 
  Heart, 
  Activity as ActivityIcon, 
  Thermometer, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  ArrowUpRight, 
  Sliders, 
  ChevronRight,
  BrainCircuit,
  Volume2
} from 'lucide-react';

export const DashboardView = ({ 
  telemetry, 
  evaluation, 
  onSelectActivity, 
  onSelectMood, 
  onOpenExplainability,
  onOpenBreathing,
  onOpenChat,
  onScenarioChange
}) => {
  const ppgCanvasRef = useRef(null);

  // Activities list from prompt
  const ACTIVITIES = [
    "Resting", "Studying", "Working", "Traveling", 
    "Walking", "Climbing Stairs", "Gym", "Running", "Feeling Unwell"
  ];

  // Mood options from prompt
  const MOODS = ["Relaxed", "Normal", "Busy", "Stressed"];

  // PPG Pulse Wave Animation Effect
  useEffect(() => {
    const canvas = ppgCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let phase = 0;
    const points = [];
    const maxPoints = 120;

    const renderWave = () => {
      phase += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Generate ECG/PPG style pulse waveform point
      const hr = telemetry?.heartRate || 65;
      const beatCycle = Math.sin(phase * (hr / 60));
      
      let waveY = canvas.height / 2;
      if (beatCycle > 0.85) {
        waveY -= (beatCycle - 0.85) * 60; // Systolic peak
      } else if (beatCycle > 0.7) {
        waveY += (beatCycle - 0.7) * 20; // Dicrotic notch
      }

      points.push(waveY);
      if (points.length > maxPoints) points.shift();

      // Draw PPG Line — black on white, technical look
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#111111';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      for (let i = 0; i < points.length; i++) {
        const x = (i / maxPoints) * canvas.width;
        const y = points[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => cancelAnimationFrame(animId);
  }, [telemetry?.heartRate]);

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-5">
      
      {/* Top Banner: Central AWEN Hub + Live Wellness Index */}
      <div className="neo-surface p-6 lg:p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Wellness Index Level & Confidence */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-strong)] bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personal Baseline Active</span>
            </div>

            <div>
              <span className="section-label block mb-1">Current Wellness Index</span>
              <div className="flex items-baseline gap-3 mt-1">
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                  {evaluation?.wellnessIndex || "Balanced"}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-[var(--accent-green)] text-[var(--text-primary)] border border-[var(--border-strong)] uppercase tracking-wider">
                  Always Positive
                </span>
              </div>
            </div>

            {/* Confidence Score Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--text-muted)] uppercase tracking-wider">AI Confidence</span>
                <span className="text-[var(--text-primary)] font-bold">{evaluation?.confidenceScore || 96}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--surface-secondary)] border border-[var(--border-strong)] overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-green)] transition-all duration-500"
                  style={{ width: `${evaluation?.confidenceScore || 96}%` }}
                />
              </div>
            </div>

            {/* Explainability Trigger */}
            <button
              onClick={onOpenExplainability}
              className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors pt-1 group"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="underline underline-offset-2 decoration-[var(--border-light)] group-hover:decoration-[var(--border-strong)]">
                Why did AWEN reach this conclusion?
              </span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Center: AWEN Companion Entity Hub */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-2">
            <AwenEntity 
              state={evaluation?.emotionalState || "relaxed"}
              size={230}
              interactive={true}
              onClick={onOpenChat}
              subtext="Click AWEN to open AI conversation"
            />
          </div>

          {/* Right: Today's Insight & Recovery Summary */}
          <div className="lg:col-span-4 space-y-3 p-5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-left">
            <div className="flex items-center justify-between">
              <span className="section-label flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
                <span>Today's Insight</span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Context Filtered</span>
            </div>

            <p className="text-xs text-[var(--text-primary)] leading-relaxed italic bg-[var(--surface-primary)] p-3 border border-[var(--border-light)]">
              "{evaluation?.explainability?.summary || "Physiological metrics closely match your 5-day resting baseline."}"
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-[var(--border-light)] text-xs">
              <span className="text-[var(--text-muted)] font-medium uppercase tracking-wider text-[10px]">Recent Recovery:</span>
              <span className="text-[var(--accent-green-dark)] font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>22 bpm / min (Optimal)</span>
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Heart Rate Card */}
        <div className="metric-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="metric-label">Heart Rate</span>
            <Heart className="w-4 h-4 text-[var(--accent-danger)]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="metric-value text-3xl">{telemetry?.heartRate || 65.0}</span>
            <span className="text-xs text-[var(--text-muted)] font-medium">bpm</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border-light)] pt-2">
            <span>Baseline: 64.0 bpm</span>
            <span className={`font-bold ${evaluation?.baselineComparison?.hrDelta > 10 ? 'text-[var(--accent-warm)]' : 'text-[var(--accent-green-dark)]'}`}>
              {evaluation?.baselineComparison?.hrDelta >= 0 ? '+' : ''}{evaluation?.baselineComparison?.hrDelta || 0}
            </span>
          </div>
        </div>

        {/* SpO2 Card */}
        <div className="metric-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="metric-label">SpO₂</span>
            <ActivityIcon className="w-4 h-4 text-[var(--accent-green-dark)]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="metric-value text-3xl">{telemetry?.spo2 || 98.6}</span>
            <span className="text-xs text-[var(--text-muted)] font-medium">%</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border-light)] pt-2">
            <span>Baseline: 98.6%</span>
            <span className="font-bold text-[var(--accent-green-dark)]">Stable</span>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="metric-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="metric-label">Body Temp</span>
            <Thermometer className="w-4 h-4 text-[var(--accent-warm)]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="metric-value text-3xl">{telemetry?.temperature || 36.6}</span>
            <span className="text-xs text-[var(--text-muted)] font-medium">°C</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border-light)] pt-2">
            <span>Baseline: 36.6°C</span>
            <span className="font-bold text-[var(--text-secondary)]">Nominal</span>
          </div>
        </div>

        {/* Live PPG Waveform */}
        <div className="metric-card space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="metric-label">PPG Stream</span>
            <span className="w-2 h-2  bg-[var(--accent-green)] border border-[var(--accent-green-dark)]" />
          </div>
          
          <div className="w-full h-14 bg-[var(--surface-secondary)] border border-[var(--border-light)] flex items-center p-1">
            <canvas ref={ppgCanvasRef} width={220} height={56} className="w-full h-full" />
          </div>

          <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wide text-center">
            {telemetry?.isHardware ? 'ESP32 Hardware' : 'Simulated'}
          </p>
        </div>

      </div>

      {/* Daily Context & Check-in Selector Bar */}
      <div className="neo-surface p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Daily Context & Mood Check-in</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Providing physical context prevents false stress triggers when you're working, climbing stairs, or exercising.
            </p>
          </div>

          {/* Quick Scenario Preset Simulator */}
          <div className="flex items-center gap-1.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] p-1">
            <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase pl-1">Sim:</span>
            <button
              onClick={() => onScenarioChange('normal')}
              className="px-2 py-1 text-xs font-bold border border-[var(--border-light)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] transition-colors"
            >
              Rest
            </button>
            <button
              onClick={() => onScenarioChange('stairs')}
              className="px-2 py-1 text-xs font-bold border border-[var(--border-light)] bg-[var(--accent-warm-bg)] text-[var(--accent-warm)] hover:opacity-80 transition-opacity"
            >
              Stairs
            </button>
            <button
              onClick={() => onScenarioChange('caffeine')}
              className="px-2 py-1 text-xs font-bold border border-[var(--border-light)] bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] hover:opacity-80 transition-opacity"
            >
              Caffeine
            </button>
          </div>
        </div>

        {/* Activity Selector */}
        <div className="space-y-2">
          <label className="section-label block">Select Current Physical Activity:</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((act) => (
              <button
                key={act}
                onClick={() => onSelectActivity(act)}
                className={`px-3 py-1.5 text-xs font-bold border transition-all duration-100 ${
                  telemetry?.activity === act
                    ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]'
                    : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Selector */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-light)]">
          <label className="section-label block">How do you feel right now?</label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => onSelectMood(m)}
                className={`px-3 py-1.5 text-xs font-bold border transition-all duration-100 ${
                  telemetry?.mood === m
                    ? 'bg-[var(--accent-green)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]'
                    : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Today's Recommendations & Micro-Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="neo-surface p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--accent-green-bg)]">
              <RefreshCw className="w-4 h-4 text-[var(--accent-green-dark)]" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[var(--text-primary)]">Bio-Feedback Breathing</h4>
              <p className="text-[11px] text-[var(--text-muted)]">2-minute 4-7-8 breathing sequence</p>
            </div>
          </div>
          <button
            onClick={onOpenBreathing}
            className="neo-btn neo-btn-primary w-full py-2 text-xs font-bold"
          >
            Start Sequence
          </button>
        </div>

        <div className="neo-surface p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)]">
              <Sparkles className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[var(--text-primary)]">Hydration & Movement</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Optimal recovery window detected</p>
            </div>
          </div>
          <button
            onClick={onOpenChat}
            className="neo-btn w-full py-2 text-xs font-bold"
          >
            Ask AWEN Guidance
          </button>
        </div>

        <div className="neo-surface p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)]">
              <BrainCircuit className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[var(--text-primary)]">Focus & Screen Break</h4>
              <p className="text-[11px] text-[var(--text-muted)]">Recommended dip window at 3:30 PM</p>
            </div>
          </div>
          <button
            onClick={onOpenExplainability}
            className="neo-btn w-full py-2 text-xs font-bold"
          >
            View AI Reasoning
          </button>
        </div>

      </div>

    </div>
  );
};
