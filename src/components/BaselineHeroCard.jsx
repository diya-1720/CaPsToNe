import React from 'react';
import { ShieldCheck, Heart, Activity, ChevronRight } from 'lucide-react';

const BaselineHeroCardComponent = ({ insight, currentUser, onOpenDetails }) => {
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
    <div className="neo-surface p-5 sm:p-6  border border-2 border-[var(--border-strong)] space-y-4 shadow-[4px_4px_0px_#111] text-left relative overflow-hidden group">
      
      {/* Ambient background glow for baseline hero */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10  blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8  bg-cyan-500/20 border border-2 border-[var(--border-strong)] flex items-center justify-center text-[var(--text-primary)]">
            <Heart className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Your Personal Baseline
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)] font-bold font-light">
              AWEN compares you against your own normal rhythm
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5  bg-emerald-500/10 text-[var(--accent-green-dark)] border border-2 border-[var(--border-strong)] text-[10px] sm:text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{confidenceState}</span>
          </span>
          <span className={`text-[9px] font-mono px-2 py-0.5  border ${isHardware ? 'bg-emerald-500/10 border-2 border-[var(--border-strong)] text-[var(--accent-green-dark)]' : 'bg-cyan-500/10 border-2 border-[var(--border-strong)] text-[var(--text-primary)]'}`}>
            {isHardware ? 'ESP32 Live' : 'Demo Stream'}
          </span>
        </div>
      </div>

      {/* Hero Heart Rate Comparison Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 items-center">
        {/* Current Reading vs Baseline */}
        <div className="sm:col-span-1 bg-[var(--surface-primary)] p-4  border border-2 border-[var(--border-strong)] space-y-1">
          <span className="text-[10px] font-semibold text-[var(--text-secondary)] font-bold uppercase tracking-wider block">
            Current Reading
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-[var(--text-primary)]">
              {currentHr}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-bold font-mono">bpm</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium pt-0.5">
            <span className={hrDelta > 8 ? "text-amber-400" : hrDelta < -8 ? "text-[var(--text-primary)]" : "text-[var(--accent-green-dark)]"}>
              {hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm
            </span>
            <span className="text-[var(--text-secondary)] font-bold text-[10px] font-light">vs resting baseline ({restingHr.toFixed(1)})</span>
          </div>
        </div>

        {/* Visual Baseline Range Gauge Bar */}
        <div className="sm:col-span-2 space-y-2 bg-[var(--surface-primary)] p-4  border border-2 border-[var(--border-strong)]">
          <div className="flex justify-between text-[11px] font-medium text-[var(--text-secondary)] font-bold">
            <span>Usual Resting Range</span>
            <span className="text-[var(--text-primary)] font-mono">{minRange} – {maxRange} bpm</span>
          </div>

          {/* Scale Gauge Track */}
          <div className="relative w-full h-3 bg-[var(--surface-primary)]  overflow-hidden my-2">
            {/* Baseline Normal Range Fill */}
            <div 
              className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-2 border-[var(--border-strong)]"
              style={{ left: `${minPos}%`, width: `${maxPos - minPos}%` }}
              title="Your Learned Resting Range"
            />
            {/* Live Point Marker */}
            <div 
              className={`absolute top-0 bottom-0 w-2.5  transition-all duration-500 shadow-[2px_2px_0px_#111] ${
                currentHr > maxRange ? 'bg-amber-400 shadow-[2px_2px_0px_#111]' : currentHr < minRange ? 'bg-cyan-400 shadow-[2px_2px_0px_#111]' : 'bg-emerald-400 shadow-[2px_2px_0px_#111]'
              }`}
              style={{ left: `calc(${currentPos}% - 5px)` }}
              title={`Live: ${currentHr} bpm`}
            />
          </div>

          <div className="flex justify-between text-[9px] text-[var(--text-secondary)] font-mono">
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
          className="w-full py-2 px-3  bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] border border-2 border-[var(--border-strong)] text-xs text-[var(--text-secondary)] font-bold flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            <span className="truncate">View activity offsets & body pattern signature</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] font-bold shrink-0" />
        </button>
      )}

    </div>
  );
};

export const BaselineHeroCard = React.memo(BaselineHeroCardComponent);
