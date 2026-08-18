import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Zap, ShieldCheck, Heart, Sparkles, Filter } from 'lucide-react';

export const TrendsView = ({ baselineData }) => {
  const [timeframe, setTimeframe] = useState('weekly'); // daily, weekly, monthly

  // Mock trend series comparing Personal Baseline vs Actual Telemetry
  const WEEKLY_DATA = [
    { label: "Mon", baselineHr: 64, actualHr: 65, spo2: 98.6, recovery: 22, score: "Balanced" },
    { label: "Tue", baselineHr: 64, actualHr: 68, spo2: 98.4, recovery: 20, score: "Good" },
    { label: "Wed", baselineHr: 64, actualHr: 64, spo2: 98.8, recovery: 24, score: "Excellent" },
    { label: "Thu", baselineHr: 64, actualHr: 72, spo2: 98.1, recovery: 19, score: "Good" },
    { label: "Fri", baselineHr: 64, actualHr: 66, spo2: 98.5, recovery: 22, score: "Balanced" },
    { label: "Sat", baselineHr: 64, actualHr: 63, spo2: 99.0, recovery: 25, score: "Excellent" },
    { label: "Sun", baselineHr: 64, actualHr: 65, spo2: 98.7, recovery: 23, score: "Balanced" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 neo-surface p-6  border border-2 border-[var(--border-strong)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1  bg-blue-500/10 border border-2 border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Longitudinal Analytics</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
            Physiological Trends & Insights
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-bold">
            Compare your actual telemetry against your learned 5-day baseline signature over time.
          </p>
        </div>

        {/* Timeframe Selector Tabs */}
        <div className="flex items-center gap-1 bg-[var(--surface-primary)] p-1.5  border border-2 border-[var(--border-strong)]">
          {['daily', 'weekly', 'monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5  text-xs font-semibold capitalize transition-all ${
                timeframe === t
                  ? 'bg-blue-600 text-[var(--text-primary)] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]'
                  : 'text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] font-bold'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Card: Heart Rate Baseline vs Actual */}
      <div className="neo-surface p-6  border border-2 border-[var(--border-strong)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--text-primary)]" />
              <span>Heart Rate Baseline vs. Actual (BPM)</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-bold">
              Dashed line represents your personal resting baseline (64 bpm).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-blue-400" />
              <span className="text-[var(--text-secondary)] font-bold">Actual HR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-emerald-400" />
              <span className="text-[var(--text-secondary)] font-bold">Baseline (64 bpm)</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Bar & Line Chart */}
        <div className="w-full h-64 pt-6 pb-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
            {/* Horizontal Grid lines */}
            <line x1="40" y1="20" x2="680" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="40" y1="80" x2="680" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="40" y1="140" x2="680" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Baseline 64 bpm Dashed Reference Line */}
            <line x1="40" y1="100" x2="680" y2="100" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Bar & Data Plotting */}
            {WEEKLY_DATA.map((d, index) => {
              const x = 70 + index * 90;
              const barHeight = (d.actualHr - 40) * 3;
              const y = 180 - barHeight;

              return (
                <g key={d.label} className="group cursor-pointer">
                  {/* Bar */}
                  <rect
                    x={x - 16}
                    y={y}
                    width={32}
                    height={barHeight}
                    rx={8}
                    fill="url(#barGradient)"
                    className="transition-all duration-300 group-hover:opacity-80"
                  />
                  {/* Actual Value Label */}
                  <text x={x} y={y - 8} fill="#ffffff" fontSize="11" fontWeight="600" textAnchor="middle">
                    {d.actualHr}
                  </text>
                  {/* Day Label */}
                  <text x={x} y="195" fill="#94a3b8" fontSize="11" textAnchor="middle">
                    {d.label}
                  </text>
                </g>
              );
            })}

            {/* SVG Gradient definitions */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Secondary Metrics: SpO2 Stability & Cardiovascular Recovery Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-sm font-semibold text-[var(--text-primary)]">SpO₂ Oxygen Stability</h4>
            <span className="text-xs text-[var(--accent-green-dark)] font-semibold">98.5% Weekly Avg</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-bold">
            No hypoxic events or unnatural oxygen dips recorded across 7 days.
          </p>
          <div className="w-full bg-[var(--surface-primary)] p-3  border border-2 border-[var(--border-strong)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)] font-bold">Stability Index:</span>
            <span className="text-[var(--text-primary)] font-semibold">High (99.1%)</span>
          </div>
        </div>

        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-sm font-semibold text-[var(--text-primary)]">Recovery Velocity Trend</h4>
            <span className="text-xs text-[var(--text-primary)] font-semibold">+2.1 bpm/min improvement</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-bold">
            Post-exertion recovery speed improved following regular daily walk breaks.
          </p>
          <div className="w-full bg-[var(--surface-primary)] p-3  border border-2 border-[var(--border-strong)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)] font-bold">Cardiovascular Recovery:</span>
            <span className="text-[var(--accent-green-dark)] font-semibold">Optimal</span>
          </div>
        </div>

      </div>

    </div>
  );
};
