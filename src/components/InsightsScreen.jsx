import React, { useState } from 'react';
import { 
  BarChart3, 
  Heart, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Activity, 
  Info,
  Calendar
} from 'lucide-react';

export const InsightsScreen = ({ baselineData, currentUser }) => {
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedPoint, setSelectedPoint] = useState(null);

  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';
  const hrVariance = baselineData?.hrStdDev ? Number(baselineData.hrStdDev).toFixed(1) : '4.8';
  const confidence = currentUser?.baseline_confidence || baselineData?.confidence || 'Stable baseline';

  // 7-Day comparative points for curve (G-8)
  const POINTS = [
    { day: 'Mon', date: 'Sep 11', hr: 63.5, samples: 48 },
    { day: 'Tue', date: 'Sep 12', hr: 65.2, samples: 54 },
    { day: 'Wed', date: 'Sep 13', hr: 64.0, samples: 50 },
    { day: 'Thu', date: 'Sep 14', hr: 67.8, samples: 62 },
    { day: 'Fri', date: 'Sep 15', hr: 64.5, samples: 45 },
    { day: 'Sat', date: 'Sep 16', hr: 62.8, samples: 38 },
    { day: 'Sun', date: 'Sep 17', hr: 64.2, samples: 52 }
  ];

  // Map HR (40 to 120 bpm) to SVG Y coordinate (160 to 20)
  const getY = (val) => Math.max(20, Math.min(160, 160 - ((val - 40) / 80) * 140));

  const baseNum = Number(restingHr) || 64.0;
  const varNum = Number(hrVariance) || 4.8;
  const baselineY = getY(baseNum);
  const bandTopY = getY(baseNum + varNum);
  const bandBottomY = getY(baseNum - varNum);

  // SVG Coordinates
  const svgCoords = POINTS.map((pt, idx) => ({
    ...pt,
    x: 60 + idx * 95,
    y: getY(pt.hr)
  }));

  const pathD = svgCoords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12 space-y-6 animate-fadeIn text-left">
      
      {/* ── 1. HEADER & TIMEFRAME CONTROLS ── */}
      <div className="neo-surface p-5 sm:p-7 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--text-primary)]" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--text-secondary)]">
              Longitudinal Baseline Analytics
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[var(--text-primary)]">
            Wellness Insights
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Statistical comparison between active telemetry and learned resting baseline corridors.
          </p>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: '24h', label: 'Last 24 Hours' },
            { id: '7d', label: '7-Day Trend' },
            { id: '30d', label: '30-Day Trend' }
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 transition-all ${
                timeframe === tf.id
                  ? 'bg-[var(--accent-green)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]'
                  : 'bg-[var(--surface-secondary)] border-[var(--border-strong)] hover:bg-[var(--surface-tertiary)]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. ROW OF 4 ANALYTICS METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Resting HR Stability */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Resting HR Stability</span>
            <Heart className="w-4 h-4 text-[var(--accent-danger)]" />
          </div>
          <span className="metric-value text-2xl block text-[var(--accent-green-dark)]">
            98 % High
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Corridor Conformity
          </span>
        </div>

        {/* Card 2: Cardiovascular Recovery */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Cardiovascular Recovery</span>
            <TrendingUp className="w-4 h-4 text-[var(--accent-green-dark)]" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            2.2 min
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Prompt Settling Velocity
          </span>
        </div>

        {/* Card 3: Stress Balance Index */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Stress Balance Index</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            31 <span className="text-xs font-normal font-sans text-[var(--text-secondary)]">/ 100</span>
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Optimal Autonomic Balance
          </span>
        </div>

        {/* Card 4: Signature Confidence */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Signature Confidence</span>
            <ShieldCheck className="w-4 h-4 text-[var(--accent-green-dark)]" />
          </div>
          <span className="metric-value text-xl block text-[var(--accent-green-dark)] truncate">
            {confidence}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            7 Cycles Evaluated
          </span>
        </div>

      </div>

      {/* ── 3. 2-COLUMN DEEP DIVE GRID (8 Cols Left, 4 Cols Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (8 Cols): 7-Day Comparative Baseline Curve (G-8) ── */}
        <div className="lg:col-span-8 neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <span>7-Day Comparative Baseline Curve (G-8)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
              Corridor: {baseNum.toFixed(1)} ±{varNum.toFixed(1)} BPM
            </span>
          </div>

          {/* SVG Chart Viewport */}
          <div className="w-full h-64 pt-2 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180">
              
              {/* Horizontal Gridlines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#E5E7EB" strokeWidth="1" />
              <text x="30" y="24" fill="#9CA3AF" fontSize="10" fontMono="true" textAnchor="end">120</text>

              <line x1="40" y1="90" x2="680" y2="90" stroke="#E5E7EB" strokeWidth="1" />
              <text x="30" y="94" fill="#9CA3AF" fontSize="10" fontMono="true" textAnchor="end">80</text>

              <line x1="40" y1="160" x2="680" y2="160" stroke="#E5E7EB" strokeWidth="1" />
              <text x="30" y="164" fill="#9CA3AF" fontSize="10" fontMono="true" textAnchor="end">40</text>

              {/* Shaded Baseline Band (±4.8 BPM) */}
              <rect 
                x="40" 
                y={bandTopY} 
                width="640" 
                height={Math.max(6, bandBottomY - bandTopY)} 
                fill="#32E875" 
                fillOpacity="0.12" 
              />

              {/* Center Baseline Guide Line */}
              <line 
                x1="40" y1={baselineY} 
                x2="680" y2={baselineY} 
                stroke="#15803D" strokeWidth="1.5" strokeDasharray="6 4" 
              />

              {/* Data Path */}
              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#111111" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Interactive Data Points */}
              {svgCoords.map((pt, idx) => {
                const isSelected = selectedPoint?.day === pt.day;
                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer"
                    onClick={() => setSelectedPoint(isSelected ? null : pt)}
                  >
                    <circle 
                      cx={pt.x} cy={pt.y} 
                      r={isSelected ? "6" : "4.5"} 
                      fill={isSelected ? "#32E875" : "#111111"} 
                      stroke={isSelected ? "#111111" : "#FFFFFF"} 
                      strokeWidth="2" 
                    />
                    <text 
                      x={pt.x} y={pt.y - 10} 
                      fill="var(--text-primary)" fontSize="10" fontMono="true" fontWeight="700" textAnchor="middle"
                    >
                      {pt.hr}
                    </text>
                    <text 
                      x={pt.x} y="178" 
                      fill={isSelected ? "#15803D" : "#6B7280"} fontSize="10" fontMono="true" fontWeight={isSelected ? "700" : "500"} textAnchor="middle"
                    >
                      {pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Footer Legend */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t-2 border-[var(--border-strong)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-black inline-block" /> Daily Resting Avg
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[var(--accent-green-bg)] border border-[var(--accent-green)] inline-block" /> Calibrated Corridor (±{varNum} BPM)
              </span>
            </div>
            <span>7 Days Analyzed</span>
          </div>

          {/* Point Inspector */}
          {selectedPoint && (
            <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs font-mono font-bold flex items-center justify-between animate-fadeIn">
              <span>{selectedPoint.day} ({selectedPoint.date}): <strong className="text-[var(--accent-green-dark)]">{selectedPoint.hr} BPM</strong></span>
              <span>Samples: {selectedPoint.samples}</span>
              <button onClick={() => setSelectedPoint(null)} className="underline text-red-600">Close</button>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (4 Cols): Behavioral Synthesis & Spread (G-9) ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Behavioral Synthesis Card */}
          <div className="neo-surface p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-[var(--border-strong)] pb-2.5">
              <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Behavioral Synthesis
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Physical exertion episodes produced an expected +32.0 BPM average elevation, settling back inside baseline in under 2.5 minutes. Autonomic tone recovers smoothly without lingering sympathetic drive.
            </p>
            <div className="p-2.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-[11px] font-mono font-bold">
              ✓ Non-exertional stress alarms: 0
            </div>
          </div>

          {/* Weekly Activity Spread Progress Bars (G-9) */}
          <div className="neo-surface p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2.5">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Activity Spread (G-9)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                WEEKLY
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              
              {/* Rest 62% */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Quiet Rest (Baseline)</span>
                  <span className="text-[var(--accent-green-dark)]">62 %</span>
                </div>
                <div className="w-full bg-[var(--surface-secondary)] h-3 border-2 border-[var(--border-strong)]">
                  <div className="bg-[var(--accent-green)] h-full w-[62%]" />
                </div>
              </div>

              {/* Walking 26% */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Walking & Studying</span>
                  <span className="text-amber-600">26 %</span>
                </div>
                <div className="w-full bg-[var(--surface-secondary)] h-3 border-2 border-[var(--border-strong)]">
                  <div className="bg-amber-400 h-full w-[26%]" />
                </div>
              </div>

              {/* Exertion 12% */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Moderate Exertion</span>
                  <span className="text-indigo-600">12 %</span>
                </div>
                <div className="w-full bg-[var(--surface-secondary)] h-3 border-2 border-[var(--border-strong)]">
                  <div className="bg-indigo-400 h-full w-[12%]" />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
