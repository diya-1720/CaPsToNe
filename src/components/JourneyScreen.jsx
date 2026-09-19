import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Calendar, TrendingUp, ShieldCheck, Loader2, Info, Database, Clock, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';
import { insightEngine } from '../services/insightEngine';

export const JourneyScreen = ({ baselineData, evaluation, currentUser }) => {
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [history, readings] = await Promise.all([
        apiService.fetchWeeklyHeartRateHistory(),
        apiService.getReadingsHistory(25)
      ]);
      setWeeklyHistory(history || []);
      setRecentReadings(readings || []);
    } catch (e) {
      console.warn("Could not load journey data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 lg:pb-12 space-y-6 animate-fadeIn text-left">
      
      {/* 1. TITLE & SUBTITLE */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] text-[var(--accent-green-dark)] text-xs font-mono font-bold tracking-wider uppercase shadow-[2px_2px_0px_#111]">
          <Compass className="w-4 h-4 text-[var(--accent-green-dark)]" />
          <span>Longitudinal Pattern Learning · SQLite Single Source of Truth</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight uppercase">
              Your Journey
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl">
              See how your personal physiological patterns evolve over time compared against your own learned baseline.
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 neo-surface border-2 border-[var(--border-strong)] text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111]"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh SQLite</span>
          </button>
        </div>

        {/* 4-Stage Progression Strip */}
        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { num: '01', title: 'TODAY', desc: 'Hourly Chronology' },
              { num: '02', title: 'DAYS', desc: '7-Day History' },
              { num: '03', title: 'WEEKS', desc: 'Baseline Stability' },
              { num: '04', title: 'BODY PATTERN', desc: 'Personal Signature' }
            ].map((stg, idx) => (
              <div 
                key={stg.num}
                className={`p-2.5 border-2 border-[var(--border-strong)] ${
                  idx <= 1 
                    ? 'bg-[var(--accent-green)] text-[var(--text-primary)] shadow-[2px_2px_0px_#111]' 
                    : 'bg-[var(--surface-secondary)] text-[var(--text-muted)] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span>{stg.num}</span>
                  {idx <= 1 && <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />}
                </div>
                <span className="font-heading text-xs font-extrabold block truncate uppercase mt-0.5">
                  {stg.title}
                </span>
                <span className="text-[9px] font-mono font-medium block truncate">
                  {stg.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PRIMARY VISUAL HERO: 7-DAY GRAPH */}
      <div className="neo-surface p-5 sm:p-7 space-y-4 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] relative overflow-hidden">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between border-b-2 border-[var(--border-strong)] pb-3 gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-green-dark)]" />
            <span className="font-heading text-sm font-bold text-[var(--text-primary)] uppercase">
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
              <span className="font-medium">Loading history from SQLite...</span>
            </div>
          ) : validDays.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--surface-secondary)] border border-dashed border-[var(--border-strong)]">
              <span className="font-bold text-sm text-[var(--text-primary)] mb-1">No sensor data available yet</span>
              <span>AWEN is observing your daily pattern. Daily averages will appear here automatically as telemetry readings are received from your device.</span>
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
                stroke="var(--text-primary)"
                strokeWidth="2.5"
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
                      <circle cx={x} cy={y} r={isSelected ? "6" : "4"} fill={isSelected ? "#32E875" : "var(--text-primary)"} stroke={isSelected ? "#111111" : "var(--bg-base)"} strokeWidth="2" />
                      <text x={x} y={y - 10} fill="var(--text-primary)" fontSize="8" textAnchor="middle" fontWeight="700">
                        {Math.round(pt.averageHeartRate)}
                      </text>
                    </>
                  ) : (
                    <circle cx={x} cy={baselineY} r="3" fill="var(--border-strong)" opacity="0.4" />
                  )}
                  <text x={x} y="96" fill={isSelected ? "#15803D" : "var(--text-secondary)"} fontSize="9" textAnchor="middle" fontWeight={isSelected ? "700" : "500"}>
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between pt-3 border-t-2 border-[var(--border-strong)] text-[11px] text-[var(--text-secondary)] font-bold gap-3 uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--text-primary)] inline-block" /> Daily Resting Avg
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[var(--accent-green-bg)] border border-[var(--accent-green)] inline-block" /> Normal Range
            </span>
          </div>
          <span className="text-[10px] bg-[var(--surface-secondary)] px-2 py-1 border border-[var(--border-strong)]">
            Tap node for detail
          </span>
        </div>
      </div>

      {/* 3. SELECTED DAY PANEL */}
      {selectedDay && (
        <div className="p-4 neo-surface border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-strong)] pb-2">
            <span className="font-heading text-sm font-bold text-[var(--accent-green-dark)] uppercase">
              {selectedDay.label} Inspection ({selectedDay.date})
            </span>
            <button 
              onClick={() => setSelectedDay(null)} 
              className="text-xs font-bold px-2 py-1 border border-[var(--border-strong)] bg-[var(--surface-primary)] hover:bg-[var(--surface-tertiary)]"
            >
              Close
            </button>
          </div>
          <div className="text-xs font-mono font-bold flex flex-wrap gap-2 pt-1">
            <span className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)]">Avg Resting: <strong className="text-[var(--accent-green-dark)]">{selectedDay.averageHeartRate} bpm</strong></span>
            <span className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)]">Samples: <strong>{selectedDay.sampleCount}</strong></span>
            {selectedDay.averageSpo2 && <span className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)]">Avg SpO2: <strong>{selectedDay.averageSpo2}%</strong></span>}
            {selectedDay.averageTemp && <span className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)]">Avg Temp: <strong>{selectedDay.averageTemp}°C</strong></span>}
          </div>
        </div>
      )}

      {/* 4. REAL SQLITE READINGS HISTORY TABLE */}
      <div className="neo-surface p-5 sm:p-6 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] space-y-3">
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2.5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--accent-green-dark)]" />
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Persisted Sensor Readings in SQLite ({recentReadings.length} Records)
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">
            Single Source of Truth
          </span>
        </div>

        {recentReadings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-secondary)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-secondary)]">
            No sensor readings saved in the database yet. Connect hardware or transmit telemetry to POST /api/readings.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-secondary)] border-b-2 border-[var(--border-strong)] text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)]">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Heart Rate</th>
                  <th className="p-2">SpO₂</th>
                  <th className="p-2">Temp</th>
                  <th className="p-2">Activity</th>
                  <th className="p-2">Device ID</th>
                  <th className="p-2">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)] font-mono">
                {recentReadings.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="p-2 whitespace-nowrap text-[11px]">
                      {new Date(r.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-2 font-bold text-[var(--text-primary)]">
                      {(r.heart_rate ?? r.bpm) ? `${Number(r.heart_rate ?? r.bpm).toFixed(1)} BPM` : '--'}
                    </td>
                    <td className="p-2 text-[var(--accent-green-dark)]">
                      {r.spo2 ? `${r.spo2.toFixed(1)}%` : '--'}
                    </td>
                    <td className="p-2 text-amber-600">
                      {r.temperature ? `${r.temperature.toFixed(1)}°C` : '--'}
                    </td>
                    <td className="p-2 font-sans font-medium text-[var(--text-secondary)]">
                      {r.activity_state || 'Resting'}
                    </td>
                    <td className="p-2 text-[10px] text-[var(--text-muted)]">
                      {r.device_id}
                    </td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-[9px] font-bold uppercase">
                        {r.data_source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. WHAT AWEN IS LEARNING (PATTERN STORY) */}
      <div className="neo-surface p-5 sm:p-7 space-y-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--border-strong)] pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
            <span>Baseline Learning Progress</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)]">
            {validDays.length >= 3 ? `${validDays.length} DAYS RECORDED` : 'OBSERVATION STAGE'}
          </span>
        </div>

        <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--text-primary)]">
          {weeklyRef.title}
        </h3>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
          {weeklyRef.body}
        </p>
      </div>

      {/* 6. PERSONAL BASELINE FOOTER STRIP */}
      <div className="neo-surface p-5 sm:p-6 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[4px_4px_0px_#111] flex flex-wrap sm:flex-nowrap items-center justify-between gap-6">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] tracking-wider block">Personal Resting Signature</span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{restingHr.toFixed(1)}</span>
            <span className="text-xs font-bold text-[var(--text-secondary)]">BPM</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold block">±{hrStdDev.toFixed(1)} bpm natural corridor</span>
        </div>

        <div className="space-y-0.5 text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-[var(--border-strong)]">
          <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] tracking-wider block">Confidence Tier</span>
          <span className="font-heading text-sm font-extrabold text-[var(--accent-green-dark)] block">{confidenceState}</span>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono block">{validDays.length} days observed in SQLite</span>
        </div>
      </div>

    </div>
  );
};
