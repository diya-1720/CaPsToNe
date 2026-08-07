import React from 'react';
import { Compass, Sparkles, Calendar, TrendingUp, ShieldCheck } from 'lucide-react';

export const JourneyScreen = ({ baselineData, evaluation }) => {
  const WEEKLY_POINTS = [
    { day: "Mon", actual: 65 },
    { day: "Tue", actual: 67 },
    { day: "Wed", actual: 64 },
    { day: "Thu", actual: 70 },
    { day: "Fri", actual: 66 },
    { day: "Sat", actual: 63 },
    { day: "Sun", actual: 65 }
  ];

  return (
    <div className="min-h-[calc(100dvh-100px)] w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32 space-y-6 animate-fadeIn">
      
      {/* Screen Title */}
      <div className="space-y-1 text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
          <Compass className="w-3.5 h-3.5" />
          <span>Your Wellness Journey</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
          Journey & Reflection
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Personalized observations over time compared with your body pattern.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Today's Insight & Single Line Graph */}
        <div className="space-y-6">
          {/* Card 1: Today's Insight */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Today's Insight</span>
              </span>
              <span className="text-[10px] text-slate-400">Aug 07, 2026</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light italic bg-slate-900/60 p-4 rounded-2xl border border-white/5">
              "{evaluation?.explainability?.summary || "You seem to be doing well today. Your body looks relaxed compared to your usual pattern."}"
            </p>
          </div>

          {/* Card 2: Single Minimal Line Graph */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Your Weekly Pattern</span>
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-medium">64 bpm resting</span>
            </div>

            {/* Clean SVG Line Graph */}
            <div className="w-full h-40 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100">
                <line x1="10" y1="50" x2="310" y2="50" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 4" />

                <path
                  d="M 20 45 L 65 35 L 110 50 L 155 20 L 200 40 L 245 55 L 290 45"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {WEEKLY_POINTS.map((pt, i) => {
                  const x = 20 + i * 45;
                  const y = 100 - (pt.actual - 40) * 1.6;
                  return (
                    <g key={pt.day}>
                      <circle cx={x} cy={y} r="3.5" fill="#38bdf8" stroke="#080d18" strokeWidth="1.5" />
                      <text x={x} y="95" fill="#94a3b8" fontSize="9" textAnchor="middle">
                        {pt.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Reflections */}
        <div className="space-y-6">
          {/* Card 3: Weekly Reflection */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 text-left">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Weekly Reflection</span>
            </span>
            <h3 className="font-heading text-base sm:text-lg font-semibold text-white">
              Smooth Recovery Trend
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Throughout this week, your heart rate recovered quickly after moving around or walking. Staircase climbing caused expected temporary heart rate increases that settled within 90 seconds.
            </p>
          </div>

          {/* Card 4: Monthly Reflection */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-2 text-left">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monthly Reflection</span>
            </span>
            <h3 className="font-heading text-base sm:text-lg font-semibold text-white">
              Your Quiet Hours
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              AWEN observed your natural quiet period occurring daily around 3:30 PM. Taking a short 5-minute pause during this window helped maintain your energy stability.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
