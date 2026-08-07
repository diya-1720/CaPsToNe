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

      // Draw PPG Line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8'; // Sky blue pulse line
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;

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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Central AWEN Hub + Live Wellness Index */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-radial-glow">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Wellness Index Level & Confidence */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personal Baseline Active</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Current Wellness Index
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {evaluation?.wellnessIndex || "Balanced"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Always Positive
                </span>
              </div>
            </div>

            {/* Confidence Score Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">AI Confidence Score</span>
                <span className="text-blue-300 font-semibold">{evaluation?.confidenceScore || 96}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${evaluation?.confidenceScore || 96}%` }}
                />
              </div>
            </div>

            {/* Explainability Trigger Button */}
            <button
              onClick={onOpenExplainability}
              className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors pt-2 group"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="underline underline-offset-4 decoration-blue-500/40 group-hover:decoration-blue-400">
                Why did AWEN reach this conclusion?
              </span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Center: Floating AWEN Companion Entity Hub */}
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
          <div className="lg:col-span-4 space-y-3 glass-card p-5 rounded-2xl border border-white/10 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Today's Insight</span>
              </span>
              <span className="text-[10px] text-slate-400">Context Filtered</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-white/5">
              "{evaluation?.explainability?.summary || "Physiological metrics closely match your 5-day resting baseline."}"
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
              <span className="text-slate-400">Recent Recovery:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>22 bpm / min (Optimal)</span>
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Main Metric Cards Grid (Heart Rate, SpO2, Temperature, Live PPG Waveform) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Heart Rate Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Heart Rate</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">
              {telemetry?.heartRate || 65.0}
            </span>
            <span className="text-xs text-slate-400">bpm</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
            <span>Baseline: 64.0 bpm</span>
            <span className={`font-semibold ${evaluation?.baselineComparison?.hrDelta > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {evaluation?.baselineComparison?.hrDelta >= 0 ? '+' : ''}{evaluation?.baselineComparison?.hrDelta || 0} bpm
            </span>
          </div>
        </div>

        {/* SpO2 Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SpO₂ Saturation</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <ActivityIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">
              {telemetry?.spo2 || 98.6}%
            </span>
            <span className="text-xs text-slate-400">Oxygen</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
            <span>Baseline: 98.6%</span>
            <span className="text-emerald-400 font-semibold">Stable</span>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Body Temp</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">
              {telemetry?.temperature || 36.6}°C
            </span>
            <span className="text-xs text-slate-400">Skin</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
            <span>Baseline: 36.6°C</span>
            <span className="text-slate-300 font-medium">Nominal</span>
          </div>
        </div>

        {/* Live PPG Pulse Waveform */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Real-time PPG Stream</span>
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          </div>
          
          <div className="w-full h-16 bg-slate-950/80 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center p-1">
            <canvas ref={ppgCanvasRef} width={220} height={60} className="w-full h-full" />
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            PPG Optical Sensor Stream ({telemetry?.isHardware ? 'ESP32 Hardware' : 'Simulated'})
          </p>
        </div>

      </div>

      {/* Daily Context & Check-in Selector Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Daily Context & Mood Check-in</span>
            </h3>
            <p className="text-xs text-slate-400">
              Providing physical context prevents false stress triggers when you're working, climbing stairs, or exercising.
            </p>
          </div>

          {/* Quick Scenario Preset Simulator */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-400 pl-2">Simulate Context:</span>
            <button
              onClick={() => onScenarioChange('normal')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Resting
            </button>
            <button
              onClick={() => onScenarioChange('stairs')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
            >
              Stairs (+34 bpm)
            </button>
            <button
              onClick={() => onScenarioChange('caffeine')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
            >
              Caffeine Work
            </button>
          </div>
        </div>

        {/* Current Activity Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Select Current Physical Activity:</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((act) => (
              <button
                key={act}
                onClick={() => onSelectActivity(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  telemetry?.activity === act
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400'
                    : 'glass-card text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Check-in Options */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-semibold text-slate-300">How do you feel right now?</label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => onSelectMood(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  telemetry?.mood === m
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400'
                    : 'glass-card text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Today's Recommendations & Micro-Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">Bio-Feedback Breathing</h4>
              <p className="text-[11px] text-slate-400">2-minute 4-7-8 breathing sequence</p>
            </div>
          </div>
          <button
            onClick={onOpenBreathing}
            className="w-full py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
          >
            Start Sequence
          </button>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">Hydration & Movement</h4>
              <p className="text-[11px] text-slate-400">Optimal recovery window detected</p>
            </div>
          </div>
          <button
            onClick={onOpenChat}
            className="w-full py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
          >
            Ask AWEN Guidance
          </button>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-white">Focus & Screen Break</h4>
              <p className="text-[11px] text-slate-400">Recommended dip window at 3:30 PM</p>
            </div>
          </div>
          <button
            onClick={onOpenExplainability}
            className="w-full py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-medium transition-colors"
          >
            View AI Reasoning
          </button>
        </div>

      </div>

    </div>
  );
};
