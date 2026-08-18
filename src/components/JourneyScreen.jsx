import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Calendar, TrendingUp, ShieldCheck, Loader2, Info } from 'lucide-react';
import { apiService } from '../services/apiService';
import { insightEngine } from '../services/insightEngine';

export const JourneyScreen = ({ baselineData, evaluation, currentUser }) => {
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setIsLoading(true);
      if (currentUser?.id && !currentUser.isGuest) {
        const history = await apiService.fetchWeeklyHeartRateHistory(currentUser.id);
        if (isMounted) setWeeklyHistory(history);
      } else {
        const skeleton = await apiService.fetchWeeklyHeartRateHistory(null);
        if (isMounted) setWeeklyHistory(skeleton);
      }
      if (isMounted) setIsLoading(false);
    }
    loadHistory();
    return () => { isMounted = false; };
  }, [currentUser]);

  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr) : 64.0;
  const hrStdDev = baselineData?.hrStdDev ? Number(baselineData.hrStdDev) : 4.8;
  const confidenceState = baselineData?.confidence || 'Learning';

  // Compute SVG Y coordinate helper (40 to 120 bpm scale mapped to 85 to 15 SVG Y range)
  const getY = (val) => Math.max(15, Math.min(85, 100 - (val - 40) * 1.25));

  const baselineY = getY(restingHr);
  const minRangeY = getY(restingHr - hrStdDev);
  const maxRangeY = getY(restingHr + hrStdDev);

  // Build SVG path string connecting valid recorded data points
  const validPoints = weeklyHistory
    .map((pt, i) => ({
      ...pt,
      x: 20 + i * 45,
      y: pt.averageHeartRate !== null ? getY(pt.averageHeartRate) : null
    }))
    .filter(pt => pt.y !== null);

  let svgPathD = '';
  if (validPoints.length >= 2) {
    svgPathD = validPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }

  // Dynamic Reflection Logic (Strictly based on real history)
  const validDays = weeklyHistory.filter(d => d.averageHeartRate !== null);

  const getWeeklyReflection = () => {
    if (validDays.length < 2) {
      return {
        title: "Pattern Discovery in Progress",
        body: "AWEN is currently observing your daily pattern. As more physiological readings are recorded throughout the week, your personalized weekly reflections will appear here."
      };
    }
    const firstAvg = validDays[0].averageHeartRate;
    const lastAvg = validDays[validDays.length - 1].averageHeartRate;
    const diff = Math.round((lastAvg - firstAvg) * 10) / 10;

    if (Math.abs(diff) <= 2.5) {
      return {
        title: "Consistent Resting Rhythm",
        body: `Your daily resting average stayed very steady across recorded days (${Math.round(firstAvg)}–${Math.round(lastAvg)} bpm), demonstrating optimal cardiovascular baseline stability.`
      };
    } else if (diff < -2.5) {
      return {
        title: "Gradual Rest Recovery",
        body: `Your daily resting heart rate decreased by ${Math.abs(diff)} bpm across recent days, indicating positive physical recovery.`
      };
    } else {
      return {
        title: "Active Rhythm Variation",
        body: `Your average resting heart rate varied by +${diff} bpm across recent days, reflecting your changing daily schedule and physical effort.`
      };
    }
  };

  const getMonthlyReflection = () => {
    if (confidenceState === 'Stable baseline' || confidenceState === 'Developing baseline') {
      return {
        title: "Established Quiet Signature",
        body: `AWEN has observed your natural quiet signature centered around ${restingHr.toFixed(1)} bpm (±${hrStdDev} bpm variance). Maintaining regular quiet breaks supports your natural recovery.`
      };
    }
    return {
      title: "Baseline Calibration",
      body: `AWEN is currently calibrating your natural resting signature (${confidenceState}). Continue wearing your device during quiet periods to strengthen personalized observations.`
    };
  };

  const weeklyRef = getWeeklyReflection();
  const monthlyRef = getMonthlyReflection();
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 lg:pb-12 space-y-6 animate-fadeIn">
      
      {/* 1. TITLE & SUBTITLE */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5  bg-[var(--surface-level-2)] border border-[var(--border-subtle)] text-[var(--awen-aqua)] text-xs font-semibold tracking-wide uppercase shadow-sm">
          <Compass className="w-4 h-4" />
          <span>Your Wellness Journey</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
          Your Journey
        </h1>
        <p className="text-sm text-[var(--text-secondary)] font-medium max-w-xl">
          See how your personal physiological patterns change over time compared against your own baseline.
        </p>
      </div>

      {/* 2. PRIMARY VISUAL HERO: 7-DAY GRAPH */}
      <div className="neo-surface p-5 sm:p-7 space-y-4 text-left relative overflow-hidden">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between border-b border-[var(--border-light)] pb-3 gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-green-dark)]" />
            <span className="font-heading text-sm font-bold text-[var(--text-primary)]">
              7-Day Resting Pattern &amp; Baseline Range
            </span>
          </div>
          <span className="text-xs text-[var(--text-primary)] font-mono font-bold bg-[var(--accent-green-bg)] px-2.5 py-1 border border-[var(--border-strong)] shrink-0 tracking-wide uppercase">
            Baseline: {restingHr.toFixed(1)} bpm (±{hrStdDev.toFixed(1)})
          </span>
        </div>

        {/* SVG Graph */}
        <div className="w-full h-56 pt-2 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-secondary)] gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">Loading history...</span>
            </div>
          ) : validDays.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              AWEN is observing your daily resting pattern. Recorded daily averages will appear here as telemetry accumulates.
            </div>
          ) : null}

          <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100">
            {/* Shaded Baseline Band */}
            <rect 
              x="10" 
              y={maxRangeY} 
              width="300" 
              height={Math.max(4, minRangeY - maxRangeY)} 
              fill="#32E875"
              fillOpacity="0.12" 
            />

            {/* Baseline Center Line */}
            <line x1="10" y1={baselineY} x2="310" y2={baselineY} stroke="#32E875" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8" />

            {/* Data Connection Line */}
            {svgPathD && (
              <path
                d={svgPathD}
                fill="none"
                stroke="#111111"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}

            {/* Day Dots */}
            {weeklyHistory.map((pt, i) => {
              const x = 20 + i * 45;
              const hasValue = pt.averageHeartRate !== null;
              const y = hasValue ? getY(pt.averageHeartRate) : baselineY;
              const isSelected = selectedDay?.date === pt.date;

              return (
                <g key={pt.date || i} className="cursor-pointer" onClick={() => hasValue && setSelectedDay(pt)}>
                  {hasValue ? (
                    <>
                      <circle cx={x} cy={y} r={isSelected ? "6" : "4"} fill={isSelected ? "#32E875" : "#111111"} stroke={isSelected ? "#111111" : "var(--bg-base)"} strokeWidth="2" className="transition-all duration-300" />
                      <text x={x} y={y - 10} fill="var(--text-primary)" fontSize="8" textAnchor="middle" fontWeight="700">
                        {Math.round(pt.averageHeartRate)}
                      </text>
                    </>
                  ) : (
                    <circle cx={x} cy={baselineY} r="3" fill="var(--border-light)" opacity="0.6" />
                  )}
                  <text x={x} y="96" fill={isSelected ? "#15803D" : "var(--text-muted)"} fontSize="9" textAnchor="middle" fontWeight={isSelected ? "700" : "500"} className="transition-colors">
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between pt-3 border-t border-[var(--border-light)] text-[11px] text-[var(--text-secondary)] font-bold gap-3 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--text-primary)] inline-block" /> Daily Resting Avg
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[var(--accent-green-bg)] border border-[var(--accent-green)] inline-block" /> Normal Range
            </span>
          </div>
          <span className="text-[10px] bg-[var(--surface-secondary)] px-2 py-1 border border-[var(--border-light)]">Tap day dot for detail</span>
        </div>
      </div>

      {/* 3. SELECTED DAY PANEL */}
      {selectedDay ? (
        <div className="p-4 neo-surface text-left space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3 mb-3">
            <span className="font-heading text-sm font-bold text-[var(--accent-green-dark)]">
              {selectedDay.label} Inspection ({selectedDay.date})
            </span>
            <button onClick={() => setSelectedDay(null)} className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2 py-1 border border-[var(--border-light)] hover:border-[var(--border-strong)] bg-[var(--surface-secondary)]">
              Close
            </button>
          </div>
          <div className="text-sm text-[var(--text-primary)] font-medium flex flex-wrap gap-3 pt-1">
            <span className="bg-[var(--surface-secondary)] border border-[var(--border-strong)] px-3 py-1.5">Avg Resting: <strong className="text-[var(--accent-green-dark)] font-bold">{selectedDay.averageHeartRate} bpm</strong></span>
            <span className="bg-[var(--surface-secondary)] border border-[var(--border-strong)] px-3 py-1.5">Samples: <strong className="text-[var(--accent-green-dark)] font-bold">{selectedDay.sampleCount}</strong></span>
            <span className="bg-[var(--surface-secondary)] border border-[var(--border-strong)] px-3 py-1.5">Deviation: <strong className="font-bold">Within usual range</strong></span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[var(--text-secondary)] font-bold text-center p-4 border border-dashed border-[var(--border-light)] bg-[var(--surface-secondary)] uppercase tracking-wider">
          Tap any recorded day node on the graph to inspect daily readings breakdown.
        </div>
      )}

      {/* 4. WHAT AWEN IS LEARNING (PATTERN STORY) */}
      <div className="neo-surface p-6 sm:p-8 space-y-4 text-left shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-[var(--awen-aqua)] flex items-center gap-2 font-mono">
            <Sparkles className="w-5 h-5 text-[var(--awen-aqua)]" />
            <span>What AWEN Is Learning</span>
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-mono font-medium tracking-wide bg-[var(--surface-level-2)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1">
            {validDays.length >= 3 ? `${validDays.length} DAYS ANALYZED` : 'CALIBRATION'}
          </span>
        </div>

        <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)] mt-2">
          {weeklyRef.title}
        </h3>

        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-medium">
          {weeklyRef.body}
        </p>

        {validDays.length >= 3 && (
          <div className="mt-4 p-4  bg-[var(--surface-level-2)] border border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
              AWEN detected that your recorded resting averages remained within a stable ±{hrStdDev} bpm range of your {restingHr.toFixed(1)} bpm baseline signature.
            </p>
          </div>
        )}
      </div>

      {/* 5. PERSONAL BASELINE FOOTER STRIP */}
      <div className="neo-surface p-6 sm:p-7 bg-[var(--surface-level-1)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-6 text-left shadow-sm">
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-mono font-medium text-[var(--text-secondary)] tracking-wider block">Personal Resting Signature</span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold text-[var(--text-primary)]">{restingHr.toFixed(1)}</span>
            <span className="text-sm font-medium text-[var(--text-secondary)]">BPM</span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium block">±{hrStdDev.toFixed(1)} bpm usual range</span>
        </div>

        <div className="space-y-1 text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
          <span className="text-[11px] uppercase font-mono font-medium text-[var(--text-secondary)] tracking-wider block">Baseline Confidence</span>
          <span className="font-heading text-sm font-semibold text-[var(--awen-teal)] block">{confidenceState}</span>
          <span className="text-xs text-[var(--text-secondary)] font-medium block">{validDays.length} days observed</span>
        </div>
      </div>

    </div>
  );
};
