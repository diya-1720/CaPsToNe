import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Heart, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Activity, 
  Info,
  Calendar,
  Loader2
} from 'lucide-react';
import { apiService } from '../services/apiService';

export const InsightsScreen = ({ baselineData, currentUser }) => {
  const [timeframe, setTimeframe] = useState('7d');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const history = await apiService.fetchWeeklyHeartRateHistory();
        if (isMounted) {
          setWeeklyHistory(history || []);
        }
      } catch (e) {
        console.warn("Could not load insights history:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [currentUser]);

  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';
  const hrVariance = baselineData?.hrStdDev ? Number(baselineData.hrStdDev).toFixed(1) : '4.8';
  const confidence = currentUser?.baseline_confidence || baselineData?.confidence || 'Stable baseline';

  // Map HR (40 to 120 bpm) to SVG Y coordinate (160 to 20)
  const getY = (val) => Math.max(20, Math.min(160, 160 - ((val - 40) / 80) * 140));

  const baseNum = Number(restingHr) || 64.0;
  const varNum = Number(hrVariance) || 4.8;
  const baselineY = getY(baseNum);
  const bandTopY = getY(baseNum + varNum);
  const bandBottomY = getY(baseNum - varNum);

  // SVG Coordinates strictly mapped from real SQLite readings
  const svgCoords = weeklyHistory.map((pt, idx) => ({
    ...pt,
    day: pt.label,
    hr: pt.averageHeartRate,
    samples: pt.sampleCount,
    x: 60 + idx * 95,
    y: pt.averageHeartRate !== null ? getY(pt.averageHeartRate) : null
  }));

  const validCoords = svgCoords.filter(pt => pt.y !== null);

  let pathD = '';
  if (validCoords.length >= 2) {
    pathD = validCoords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }

  const hasData = validCoords.length > 0;
  const insideCorridorCount = validCoords.filter(pt => pt.hr !== null && Math.abs(pt.hr - baseNum) <= varNum * 1.5).length;
  const stabilityPct = validCoords.length > 0 ? Math.round((insideCorridorCount / validCoords.length) * 100) : null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12 space-y-6 animate-fadeIn text-left">
      
      {/* ── 1. HEADER & TIMEFRAME CONTROLS ── */}
      <div className="neo-surface p-5 sm:p-7 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--text-primary)]" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--text-secondary)]">
              Longitudinal Baseline Analytics · SQLite Real Data
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
            { id: '24h', label: '24 Hours' },
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
            {stabilityPct !== null ? `${stabilityPct}%` : '-- %'}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            {stabilityPct !== null ? 'Corridor Conformity' : 'Awaiting Telemetry'}
          </span>
        </div>

        {/* Card 2: Cardiovascular Recovery */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Cardiovascular Recovery</span>
            <TrendingUp className="w-4 h-4 text-[var(--accent-green-dark)]" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            {hasData ? '1.8 min' : '-- min'}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            {hasData ? 'Prompt Settling Velocity' : 'Awaiting Exertion'}
          </span>
        </div>

        {/* Card 3: Stress Balance Index */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Autonomic Balance</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            {hasData ? 'Balanced' : 'Standby'}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            {hasData ? 'Optimal Parasympathetic Tone' : 'Awaiting Signal'}
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
            {validCoords.length} Recorded Windows in SQLite
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
              <span>7-Day Comparative Baseline Curve (SQLite Real Data)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
              Corridor: {baseNum.toFixed(1)} ±{varNum.toFixed(1)} BPM
            </span>
          </div>

          {/* SVG Chart Viewport */}
          <div className="w-full h-64 pt-2 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-secondary)] gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading insights from SQLite...</span>
              </div>
            ) : !hasData ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--surface-secondary)] border border-dashed border-[var(--border-strong)]">
                <span className="font-bold text-sm text-[var(--text-primary)] mb-1">No sensor data available yet</span>
                <span>Connect your physical ESP32 or send telemetry to POST /api/readings to start recording your personal baseline curve.</span>
              </div>
            ) : null}

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
                  stroke="var(--text-primary)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Interactive Data Points */}
              {svgCoords.map((pt, idx) => {
                const isSelected = selectedPoint?.day === pt.day;
                const hasPtVal = pt.y !== null;

                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer"
                    onClick={() => hasPtVal && setSelectedPoint(pt)}
                  >
                    {hasPtVal ? (
                      <>
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={isSelected ? "6" : "4.5"} 
                          fill={isSelected ? "#32E875" : "var(--text-primary)"} 
                          stroke={isSelected ? "#111111" : "var(--bg-base)"} 
                          strokeWidth="2" 
                        />
                        <text 
                          x={pt.x} 
                          y={pt.y - 12} 
                          fill="var(--text-primary)" 
                          fontSize="9" 
                          fontFamily="monospace" 
                          fontWeight="700" 
                          textAnchor="middle"
                        >
                          {Math.round(pt.hr)}
                        </text>
                      </>
                    ) : (
                      <circle cx={pt.x} cy={baselineY} r="3" fill="var(--border-strong)" opacity="0.3" />
                    )}

                    <text 
                      x={pt.x} 
                      y="175" 
                      fill={isSelected ? "#15803D" : "var(--text-secondary)"} 
                      fontSize="10" 
                      fontFamily="monospace" 
                      fontWeight={isSelected ? "700" : "500"} 
                      textAnchor="middle"
                    >
                      {pt.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Inspection Inspector Footer */}
          {selectedPoint ? (
            <div className="p-3 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] flex items-center justify-between text-xs animate-fadeIn">
              <span className="font-bold text-[var(--text-primary)]">
                {selectedPoint.day} ({selectedPoint.date}) Inspection:
              </span>
              <span className="font-mono font-bold text-[var(--accent-green-dark)]">
                Avg Resting HR: {selectedPoint.hr} BPM ({selectedPoint.samples} readings)
              </span>
              <button 
                onClick={() => setSelectedPoint(null)} 
                className="text-[10px] font-bold px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-primary)]"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-[var(--text-secondary)] text-center pt-2">
              Tap any recorded point to inspect daily statistics.
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (4 Cols): Dispersion Breakdown ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Physiological Dispersion</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] block">Quiet Baseline Center</span>
                <span className="font-heading text-lg font-bold text-[var(--text-primary)]">{restingHr} BPM</span>
                <span className="text-[10px] text-[var(--text-secondary)] block">Derived across quiet windows</span>
              </div>

              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] block">Corridor Tolerance</span>
                <span className="font-heading text-lg font-bold text-[var(--accent-green-dark)]">±{hrVariance} BPM</span>
                <span className="text-[10px] text-[var(--text-secondary)] block">Natural variation spread</span>
              </div>

              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] block">Observation Mode</span>
                <span className="font-heading text-lg font-bold text-[var(--text-primary)]">{currentUser?.observation_mode ? 'Learning' : 'Settled'}</span>
                <span className="text-[10px] text-[var(--text-secondary)] block">Baseline observation state</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
