import React from 'react';
import { ShieldCheck, Heart, Activity, ChevronRight } from 'lucide-react';

export const BaselineHeroCard = ({ insight, currentUser, onOpenDetails }) => {
  const restingHr = insight?.baseline?.restingHr ? Number(insight.baseline.restingHr) : 64.0;
  const hrStdDev = insight?.baseline?.hrStdDev ? Number(insight.baseline.hrStdDev) : 4.8;
  const currentHr = insight?.metrics?.hr || 64.0;
  const confidenceState = insight?.baseline?.confidenceState || 'Stable baseline';
  const isHardware = insight?.isHardware || false;

  const hrDelta = Math.round((currentHr - restingHr) * 10) / 10;
  const minRange = Math.max(40, Math.round(restingHr - hrStdDev));
  const maxRange = Math.round(restingHr + hrStdDev);

  // Position calculation for visual indicator bar (40 bpm to 120 bpm scale)
  const getPercent = (val) => Math.max(0, Math.min(100, ((val - 40) / 80) * 100));
  const currentPos = getPercent(currentHr);
  const minPos = getPercent(minRange);
  const maxPos = getPercent(maxRange);

  return (
    <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl text-left relative overflow-hidden group">
      
      {/* Ambient background glow for baseline hero */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <Heart className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight">
              Your Personal Baseline
            </h2>
            <p className="text-[11px] text-slate-400 font-light">
              AWEN compares you against your own normal rhythm
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] sm:text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{confidenceState}</span>
          </span>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${isHardware ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
            {isHardware ? 'ESP32 Live' : 'Demo Stream'}
          </span>
        </div>
      </div>

      {/* Hero Heart Rate Comparison Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 items-center">
        {/* Current Reading vs Baseline */}
        <div className="sm:col-span-1 bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Current Reading
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">
              {currentHr}
            </span>
            <span className="text-xs text-slate-400 font-mono">bpm</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium pt-0.5">
            <span className={hrDelta > 8 ? "text-amber-400" : hrDelta < -8 ? "text-cyan-300" : "text-emerald-400"}>
              {hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm
            </span>
            <span className="text-slate-400 text-[10px] font-light">vs resting baseline ({restingHr.toFixed(1)})</span>
          </div>
        </div>

        {/* Visual Baseline Range Gauge Bar */}
        <div className="sm:col-span-2 space-y-2 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between text-[11px] font-medium text-slate-300">
            <span>Usual Resting Range</span>
            <span className="text-cyan-300 font-mono">{minRange} – {maxRange} bpm</span>
          </div>

          {/* Scale Gauge Track */}
          <div className="relative w-full h-3 bg-slate-800/80 rounded-full overflow-hidden my-2">
            {/* Baseline Normal Range Fill */}
            <div 
              className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-400/50"
              style={{ left: `${minPos}%`, width: `${maxPos - minPos}%` }}
              title="Your Learned Resting Range"
            />
            {/* Live Point Marker */}
            <div 
              className={`absolute top-0 bottom-0 w-2.5 rounded-full transition-all duration-500 shadow-md ${
                currentHr > maxRange ? 'bg-amber-400 shadow-amber-400/50' : currentHr < minRange ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-emerald-400 shadow-emerald-400/50'
              }`}
              style={{ left: `calc(${currentPos}% - 5px)` }}
              title={`Live: ${currentHr} bpm`}
            />
          </div>

          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>40 bpm</span>
            <span>Resting: {restingHr.toFixed(1)} bpm</span>
            <span>120 bpm</span>
          </div>
        </div>
      </div>

      {/* Explanatory Banner Link */}
      {onOpenDetails && (
        <button
          onClick={onOpenDetails}
          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">View activity offsets & body pattern signature</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      )}

    </div>
  );
};
