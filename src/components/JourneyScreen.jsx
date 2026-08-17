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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-24 lg:pb-12 space-y-6 animate-fadeIn">
      
      {/* 1. TITLE & SUBTITLE */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
          <Compass className="w-3.5 h-3.5" />
          <span>Your Wellness Journey</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Your Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-light">
          See how your personal physiological patterns change over time compared against your own baseline.
        </p>
      </div>

      {/* 2. PRIMARY VISUAL HERO: 7-DAY GRAPH */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 text-left shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-heading text-xs sm:text-sm font-bold text-white">
              7-Day Resting Pattern & Baseline Range
            </span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono">
            Baseline: {restingHr.toFixed(1)} bpm (±{hrStdDev.toFixed(1)})
          </span>
        </div>

        {/* Spacious SVG Graph Stage */}
        <div className="w-full h-56 pt-2 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading history...</span>
            </div>
          ) : validDays.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-slate-400 font-light leading-relaxed">
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
              fill="#34d399" 
              fillOpacity="0.08" 
              rx="4"
            />

            {/* Baseline Center Dash Line */}
            <line x1="10" y1={baselineY} x2="310" y2={baselineY} stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Real Recorded Data Connection Line */}
            {svgPathD && (
              <path
                d={svgPathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Day Dots & Interactive Inspection */}
            {weeklyHistory.map((pt, i) => {
              const x = 20 + i * 45;
              const hasValue = pt.averageHeartRate !== null;
              const y = hasValue ? getY(pt.averageHeartRate) : baselineY;
              const isSelected = selectedDay?.date === pt.date;

              return (
                <g key={pt.date || i} className="cursor-pointer" onClick={() => hasValue && setSelectedDay(pt)}>
                  {hasValue ? (
                    <>
                      <circle cx={x} cy={y} r={isSelected ? "7" : "5"} fill={isSelected ? "#06b6d4" : "#38bdf8"} stroke="#080d18" strokeWidth="2" />
                      <text x={x} y={y - 10} fill="#e2e8f0" fontSize="8" textAnchor="middle" fontWeight="bold">
                        {Math.round(pt.averageHeartRate)}
                      </text>
                    </>
                  ) : (
                    <circle cx={x} cy={baselineY} r="2" fill="#475569" opacity="0.4" />
                  )}
                  <text x={x} y="96" fill={isSelected ? "#06b6d4" : "#94a3b8"} fontSize="9" textAnchor="middle" fontWeight={isSelected ? "bold" : "normal"}>
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block" /> Daily Resting Avg
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded inline-block" /> Normal Range
            </span>
          </div>
          <span>Tap day dot for detail</span>
        </div>
      </div>

      {/* 3. SELECTED DAY PANEL */}
      {selectedDay ? (
        <div className="glass-card p-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 text-left space-y-1 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-cyan-300">
              {selectedDay.label} Inspection ({selectedDay.date})
            </span>
            <button onClick={() => setSelectedDay(null)} className="text-[10px] text-slate-400 hover:text-white underline">
              Close
            </button>
          </div>
          <div className="text-xs text-slate-200 font-light flex flex-wrap gap-4 pt-1">
            <span>Average Resting Rate: <strong>{selectedDay.averageHeartRate} bpm</strong></span>
            <span>Recorded Samples: <strong>{selectedDay.sampleCount}</strong></span>
            <span>Deviation: <strong className="text-emerald-300">Within usual range</strong></span>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic text-center">
          Tap any recorded day node on the graph to inspect daily readings breakdown.
        </div>
      )}

      {/* 4. WHAT AWEN IS LEARNING (PATTERN STORY) */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>What AWEN Is Learning</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {validDays.length >= 3 ? `${validDays.length} Days Analyzed` : 'Calibration'}
          </span>
        </div>

        <h3 className="font-heading text-base sm:text-lg font-bold text-white">
          {weeklyRef.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
          {weeklyRef.body}
        </p>

        {validDays.length >= 3 && (
          <p className="text-xs text-slate-400 leading-relaxed font-light bg-purple-950/20 p-3.5 rounded-2xl border border-purple-500/15 pt-2">
            AWEN detected that your recorded resting averages remained within a stable ±{hrStdDev} bpm range of your {restingHr.toFixed(1)} bpm baseline signature.
          </p>
        )}
      </div>

      {/* 5. PERSONAL BASELINE FOOTER STRIP */}
      <div className="glass-card p-5 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4 text-left">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Personal Resting Signature</span>
          <span className="font-heading text-lg font-bold text-white">{restingHr.toFixed(1)} bpm</span>
          <span className="text-[10px] text-slate-400 block">±{hrStdDev.toFixed(1)} bpm usual range</span>
        </div>

        <div className="space-y-0.5 text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Baseline Confidence</span>
          <span className="font-heading text-xs font-bold text-emerald-400 uppercase tracking-wider block">{confidenceState}</span>
          <span className="text-[10px] text-slate-400 block">{validDays.length} days observed</span>
        </div>
      </div>

    </div>
  );
};
