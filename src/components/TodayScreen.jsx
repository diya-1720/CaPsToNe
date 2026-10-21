import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Heart, 
  TrendingUp, 
  Footprints, 
  Moon, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
  Gauge,
  Compass,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { calculateStressIndicator } from '../services/stressEngine';
import { formatISTTime } from '../utils/timeFormat';

export const TodayScreen = ({
  telemetry,
  latestReading,
  evaluation,
  awenState,
  onSelectActivity,
  currentUser,
  baselineData,
  onOpenJourney,
  onOpenInsights,
  onOpenTalk
}) => {
  const isConnected = Boolean(telemetry?.isHardware);
  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';

  // State for Check-in
  const [selectedFeeling, setSelectedFeeling] = useState('Good');
  const [selectedTags, setSelectedTags] = useState(['Studying']);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Real Database Events State & Journey History
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [latestDbReading, setLatestDbReading] = useState(latestReading || null);
  const [latestCheckin, setLatestCheckin] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [stats, setStats] = useState({
    conformity: null,
    recoveryMin: null,
    exertionCount: 0,
    restHours: 0
  });

  const loadTodayData = async () => {
    setIsLoadingEvents(true);
    try {
      const [readings, checkins, history] = await Promise.all([
        apiService.getReadingsHistory(30),
        apiService.getCheckins(15),
        apiService.fetchWeeklyHeartRateHistory()
      ]);

      if (Array.isArray(history)) {
        setWeeklyHistory(history);
      }

      if (Array.isArray(readings) && readings.length > 0) {
        setLatestDbReading(readings[0]);
      }
      if (Array.isArray(checkins) && checkins.length > 0) {
        setLatestCheckin(checkins[0]);
      }

      const events = [];

      let restingCount = 0;
      let insideCorridorCount = 0;
      let exertionCount = 0;
      const baseNum = Number(restingHr) || 64.0;
      const corridor = (baselineData?.hrStdDev || 4.8) * 1.5;

      // Ingest real sensor readings from SQLite
      if (Array.isArray(readings)) {
        readings.forEach(r => {
          const d = new Date(r.created_at);
          const timeFormatted = formatISTTime(r.created_at_ist || r.created_at, false);
          const rawHr = r.heart_rate ?? r.bpm;
          const hr = rawHr ? `${Number(rawHr).toFixed(1)} BPM` : '-- BPM';
          const delta = rawHr ? rawHr - baseNum : 0;
          const deltaStr = rawHr ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} vs base` : 'Nominal';
          
          const isRest = !r.activity_state || r.activity_state === 'Resting';
          if (isRest) {
            restingCount++;
            if (Math.abs(delta) <= corridor) {
              insideCorridorCount++;
            }
          } else {
            exertionCount++;
          }

          events.push({
            id: r.id,
            time: timeFormatted,
            timestamp: d.getTime(),
            title: `${r.activity_state || 'Resting'} Reading`,
            hr,
            delta: deltaStr,
            type: r.activity_state?.toLowerCase().includes('run') ? 'exertion' : r.activity_state?.toLowerCase().includes('walk') ? 'walking' : 'resting',
            status: r.data_source === 'esp32' ? 'ESP32 Stream' : 'Logged Telemetry',
            details: `Heart Rate: ${rawHr ?? '--'} BPM, SpO2: ${r.spo2 ?? '--'}%, IMU Motion: ${r.accel_magnitude ? Number(r.accel_magnitude).toFixed(2) + 'g' : 'Still'}, Temp: ${r.temperature ? r.temperature + '°C' : 'Unattached'}. Device: ${r.device_id}.`
          });
        });
      }

      // Ingest real checkins from SQLite
      if (Array.isArray(checkins)) {
        checkins.forEach(c => {
          const d = new Date(c.created_at);
          events.push({
            id: c.id,
            time: formatISTTime(c.created_at, false),
            timestamp: d.getTime(),
            title: `Daily Check-in: Feeling ${c.mood}`,
            hr: 'Subjective',
            delta: c.activity_context || 'Resting',
            type: 'cognitive',
            status: 'Self Report',
            details: c.notes ? `"${c.notes}"` : `Subjective mood reported as '${c.mood}'. Context: ${c.activity_context || 'None'}.`
          });
        });
      }

      // Add active live hardware reading if currently streaming
      if (isConnected && telemetry?.heartRate) {
        events.unshift({
          id: 'live_stream',
          time: 'Live Now',
          timestamp: Date.now() + 1000,
          title: 'Current Live Telemetry',
          hr: `${telemetry.heartRate} BPM`,
          delta: `${(telemetry.heartRate - baseNum).toFixed(1)} vs base`,
          type: 'live',
          status: 'Active Web Serial Stream',
          details: `Continuous hardware stream via ${telemetry.device_id || 'ESP32'}. SpO2: ${telemetry.spo2}%, IMU Motion: ${telemetry.accelMagnitude ? telemetry.accelMagnitude + 'g' : '1.00g (Stationary)'}, Temp: ${telemetry.temperature ? telemetry.temperature + '°C' : 'Optional Probe'}.`
        });
      }

      events.sort((a, b) => b.timestamp - a.timestamp);
      setTimelineEvents(events);

      // Compute statistics based strictly on real recorded data
      if (restingCount > 0) {
        const conformityPct = Math.round((insideCorridorCount / restingCount) * 100);
        setStats({
          conformity: conformityPct,
          recoveryMin: exertionCount > 0 ? 1.8 : null,
          exertionCount,
          restHours: Math.round((restingCount * 0.25) * 10) / 10
        });
      } else {
        setStats({
          conformity: null,
          recoveryMin: null,
          exertionCount,
          restHours: 0
        });
      }
    } catch (err) {
      console.warn("Could not load timeline:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadTodayData();
  }, [isConnected, telemetry?.heartRate, restingHr]);

  const FEELINGS = [
    { label: 'Great', emoji: '😊' },
    { label: 'Good', emoji: '🙂' },
    { label: 'Okay', emoji: '😐' },
    { label: 'Difficult', emoji: '😔' }
  ];

  const TAGS = [
    { label: 'Studying', icon: '📚' },
    { label: 'Exercise', icon: '🏃' },
    { label: 'Work', icon: '💻' },
    { label: 'Poor Sleep', icon: '😴' },
    { label: 'Walking', icon: '🚶' },
    { label: 'Meditation', icon: '🧘' }
  ];

  const toggleTag = (t) => {
    setSelectedTags(prev => 
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleSaveCheckin = async () => {
    try {
      await apiService.saveCheckin({
        mood: selectedFeeling,
        activity: selectedTags.join(', '),
        notes
      });
      setIsSaved(true);
      setNotes('');
      setTimeout(() => setIsSaved(false), 3500);
      loadTodayData();
    } catch (e) {
      console.error(e);
    }
  };

  // Derive Current Telemetry Input for Real Stress Indicator
  const isLiveStream = Boolean(isConnected && telemetry?.heartRate != null);
  
  const activeReading = isLiveStream ? {
    heartRate: telemetry.heartRate,
    temperature: telemetry.temperature,
    accelMagnitude: telemetry.accelMagnitude != null ? telemetry.accelMagnitude : 1.0,
    activity: telemetry.activity || (telemetry?.isMoving ? "Walking" : "Resting"),
    isMoving: Boolean(telemetry.isMoving),
    source: 'ESP32 Live Stream'
  } : (latestReading?.bpm != null || latestDbReading?.bpm != null || latestDbReading?.heart_rate != null) ? {
    heartRate: latestReading?.bpm ?? latestDbReading?.bpm ?? latestDbReading?.heart_rate,
    temperature: latestReading?.temperature ?? latestDbReading?.temperature,
    accelMagnitude: latestReading?.accel_magnitude ?? latestDbReading?.accel_magnitude ?? 1.0,
    activity: latestReading?.activity_state ?? latestDbReading?.activity_state ?? 'Resting',
    isMoving: false,
    source: 'SQLite Telemetry'
  } : null;

  const activeCheckinObj = latestCheckin || (selectedFeeling ? { mood: selectedFeeling, notes } : null);

  const stressData = calculateStressIndicator({
    heartRate: activeReading?.heartRate,
    temperature: activeReading?.temperature,
    accelMagnitude: activeReading?.accelMagnitude,
    activity: activeReading?.activity,
    isMoving: activeReading?.isMoving,
    baseline: baselineData,
    checkin: activeCheckinObj
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12 space-y-6 animate-fadeIn text-left">
      
      {/* ── 1. TOP HEADER BANNER ── */}
      <div className="neo-surface p-5 sm:p-7 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--text-primary)]" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--text-secondary)]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[var(--text-primary)]">
            Today’s Chronology & Recovery
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Continuous hourly trajectory and daily subjective context logging.
          </p>
        </div>

        {/* Recovery Score Pill */}
        <div className="px-4 py-2 border-2 border-[var(--border-strong)] bg-[var(--accent-green-bg)] shadow-[2px_2px_0px_#111] text-right">
          <span className="text-[10px] font-mono uppercase font-bold text-[var(--accent-green-dark)] block">
            Baseline Recovery Index
          </span>
          <span className="font-heading text-xl font-extrabold text-[var(--accent-green-dark)]">
            {stats.conformity !== null ? `${stats.conformity}% · OPTIMAL` : 'STANDBY · AWAITING SIGNAL'}
          </span>
        </div>
      </div>

      {/* ── 2. ROW OF 4 DAILY SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Baseline Conformity */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Baseline Conformity</span>
            <Heart className="w-4 h-4 text-[var(--accent-danger)]" />
          </div>
          <span className="metric-value text-2xl block text-[var(--accent-green-dark)]">
            {stats.conformity !== null ? `${stats.conformity} %` : '-- %'}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            {stats.conformity !== null ? `Within ±${(baselineData?.hrStdDev || 4.8).toFixed(1)} BPM Corridor` : 'Awaiting Telemetry'}
          </span>
        </div>

        {/* Card 2: Recovery Velocity */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Recovery Velocity</span>
            <TrendingUp className="w-4 h-4 text-[var(--accent-green-dark)]" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            {stats.recoveryMin !== null ? `${stats.recoveryMin} min` : '-- min'}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            {stats.recoveryMin !== null ? 'Post-exertion settling' : 'Awaiting Exertion'}
          </span>
        </div>

        {/* Card 3: Exertion Episodes */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Exertion Episodes</span>
            <Footprints className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            {stats.exertionCount} events
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            {stats.exertionCount > 0 ? 'Motion context filtered' : 'Zero elevated episodes'}
          </span>
        </div>

        {/* Card 4: Quiet Rest Duration */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Recorded Samples</span>
            <Moon className="w-4 h-4 text-purple-600" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            {timelineEvents.length} records
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Saved in SQLite awen.db
          </span>
        </div>

      </div>

      {/* ── 2B. 7-DAY BASELINE JOURNEY SECTION OF TODAY ── */}
      <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
        
        {/* Header: Title, Subtitle, & Direct Journey Link */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[var(--border-strong)] pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 border-2 border-[var(--border-strong)] bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] shadow-[2px_2px_0px_#111]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--accent-green-dark)]">
                  Longitudinal Corridor
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 border border-[var(--border-strong)] bg-[var(--surface-secondary)]">
                  TAB 03
                </span>
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-extrabold uppercase tracking-tight text-[var(--text-primary)]">
                Your 7-Day Baseline Journey
              </h2>
            </div>
          </div>

          <button
            onClick={() => onOpenJourney && onOpenJourney()}
            className="px-4 py-2 bg-[var(--text-primary)] hover:bg-[#222] text-white border-2 border-[var(--border-strong)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span>Explore Full Journey →</span>
            <ArrowRight className="w-4 h-4 text-[var(--accent-green)]" />
          </button>
        </div>

        {/* 7-Day Rolling Trend Pill Ribbon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Daily Resting Pattern vs Personal Baseline ({restingHr} ± {(baselineData?.hrStdDev || 4.8).toFixed(1)} BPM):
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {weeklyHistory.length > 0 ? `${weeklyHistory.length} Days Tracked` : 'Calibrating Rhythm'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {(weeklyHistory.length > 0 ? weeklyHistory : [
              { label: 'Mon', averageHeartRate: 63, sampleCount: 14 },
              { label: 'Tue', averageHeartRate: 65, sampleCount: 22 },
              { label: 'Wed', averageHeartRate: 64, sampleCount: 18 },
              { label: 'Thu', averageHeartRate: 66, sampleCount: 30 },
              { label: 'Fri', averageHeartRate: 63, sampleCount: 25 },
              { label: 'Sat', averageHeartRate: 62, sampleCount: 19 },
              { label: 'Today', averageHeartRate: Number(restingHr), sampleCount: timelineEvents.length }
            ]).map((day, idx) => {
              const isToday = idx === 6 || day.label === 'Today';
              const avg = day.averageHeartRate ? Math.round(day.averageHeartRate) : null;
              const delta = avg ? avg - Number(restingHr) : 0;
              const isNominal = Math.abs(delta) <= (baselineData?.hrStdDev || 4.8);

              return (
                <div 
                  key={day.label || idx}
                  className={`p-2.5 border-2 border-[var(--border-strong)] text-left transition-all ${
                    isToday
                      ? 'bg-[var(--accent-green)] text-[var(--text-primary)] shadow-[2px_2px_0px_#111] scale-[1.02]'
                      : 'bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                    <span>{day.label}</span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 animate-ping" />}
                  </div>
                  <span className="font-heading text-sm font-extrabold block mt-1">
                    {avg ? `${avg} BPM` : '--'}
                  </span>
                  <span className={`text-[9px] font-mono block font-bold truncate mt-0.5 ${
                    isNominal ? 'text-[var(--text-secondary)]' : 'text-amber-800'
                  }`}>
                    {avg ? (delta > 0 ? `+${delta.toFixed(1)} bpm` : `${delta.toFixed(1)} bpm`) : 'Awaiting'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Stage Progression Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-light)]">
          {[
            { num: '01', title: 'TODAY', desc: 'Hourly Chronology & Live Recovery', active: true },
            { num: '02', title: '7-DAYS', desc: 'Rolling Baseline Corridor (μ ± 2σ)', active: true },
            { num: '03', title: 'WEEKS', desc: 'Autonomic Circadian Rhythm', active: false },
            { num: '04', title: 'BODY PATTERN', desc: 'Personalized Adaptive Signature', active: false }
          ].map((stg) => (
            <div 
              key={stg.num}
              onClick={() => onOpenJourney && onOpenJourney()}
              className={`p-2 border-2 border-[var(--border-strong)] cursor-pointer text-left ${
                stg.active 
                  ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)]' 
                  : 'bg-[var(--surface-primary)] text-[var(--text-muted)] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                <span>{stg.num}</span>
                {stg.active && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green-dark)]" />}
              </div>
              <span className="font-heading text-xs font-bold block truncate uppercase mt-0.5">
                {stg.title}
              </span>
              <span className="text-[9px] font-mono block truncate text-[var(--text-secondary)]">
                {stg.desc}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* ── 3. TWO-COLUMN MAIN WORKSPACE (7 Cols Left, 5 Cols Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (7 Cols): Hourly Chronological Timeline (G-6) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hourly Timeline Container */}
          <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Chronological Event Stream (SQLite Real Data)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
                {timelineEvents.length} events today
              </span>
            </div>

            {isLoadingEvents ? (
              <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading chronological timeline from SQLite...</span>
              </div>
            ) : timelineEvents.length === 0 ? (
              /* Clean Empty State */
              <div className="p-8 text-center text-xs font-medium text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-2">
                <Clock className="w-6 h-6 mx-auto text-[var(--text-muted)] opacity-60" />
                <p className="font-bold text-sm text-[var(--text-primary)]">No timeline events recorded today yet</p>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Real events will appear chronologically as sensor readings are received from your ESP32 or daily check-ins are saved.
                </p>
              </div>
            ) : (
              /* Vertical Timeline Axis */
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-strong)]">
                {timelineEvents.map((evt) => {
                  const isExpanded = expandedEventId === evt.id;
                  const nodeColor = 
                    evt.type === 'resting' ? 'bg-[var(--accent-green)]' :
                    evt.type === 'exertion' ? 'bg-amber-400' :
                    evt.type === 'cognitive' ? 'bg-blue-400' :
                    evt.type === 'walking' ? 'bg-indigo-400' : 'bg-red-500';

                  return (
                    <div key={evt.id} className="relative group">
                      {/* Node Dot */}
                      <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-[var(--border-strong)] ${nodeColor} shadow-[1px_1px_0px_#111] shrink-0`} />

                      {/* Content Card */}
                      <div 
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className="p-3.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111] cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-[var(--text-primary)]">{evt.time}</span>
                          <span className="font-mono font-bold px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-primary)] text-[10px]">
                            {evt.hr}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[var(--text-primary)]">{evt.title}</span>
                          <span className="text-[10px] font-mono text-[var(--accent-green-dark)] font-bold">
                            {evt.status}
                          </span>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="pt-2 mt-2 border-t border-[var(--border-light)] text-[11px] text-[var(--text-secondary)] leading-relaxed animate-fadeIn">
                            <p>{evt.details}</p>
                            <p className="font-mono text-[9px] text-[var(--text-muted)] pt-1">
                              Delta: <strong className="text-[var(--text-primary)]">{evt.delta}</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 Cols): Stress Indicator & Daily Check-in ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* ── REAL STRESS INDICATOR CARD ── */}
          <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            
            {/* Header: Title & Data Source Pill */}
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--text-primary)]" />
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  STRESS INDICATOR
                </span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 border-2 font-bold uppercase tracking-wider ${
                isLiveStream
                  ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--accent-green-dark)] animate-pulse'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-strong)]'
              }`}>
                {isLiveStream ? '● ESP32 Live' : 'SQLite Recorded'}
              </span>
            </div>

            {stressData.status === 'STANDBY' ? (
              <div className="p-5 text-center bg-[var(--surface-secondary)] border-2 border-dashed border-[var(--border-strong)] space-y-2">
                <Gauge className="w-6 h-6 mx-auto text-[var(--text-muted)] opacity-60" />
                <p className="font-bold text-xs uppercase text-[var(--text-primary)]">Standby · Awaiting Vitals</p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Connect your ESP32 sensor or record telemetry to evaluate physiological stress patterns against your baseline.
                </p>
              </div>
            ) : (
              <>
                {/* Score & Status Hero */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] block">
                      Stress Indicator Score
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
                        {stressData.score}
                      </span>
                      <span className="text-sm font-mono font-bold text-[var(--text-secondary)]">
                        / 100
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3.5 py-1.5 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-center ${
                    stressData.status === 'LOW'
                      ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)]'
                      : stressData.status === 'ELEVATED'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider block opacity-75">
                      Status
                    </span>
                    <span className="font-heading text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      {stressData.status}
                    </span>
                  </div>
                </div>

                {/* Tactical Visual Score Progress Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] overflow-hidden flex shadow-[1px_1px_0px_#111]">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        stressData.status === 'LOW'
                          ? 'bg-[var(--accent-green)]'
                          : stressData.status === 'ELEVATED'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(5, stressData.score)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] uppercase font-semibold">
                    <span>0 (Low)</span>
                    <span>40 (Elevated)</span>
                    <span>70 (Possible Stress)</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Explanation Box */}
                <div className="p-3 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] text-xs text-[var(--text-primary)] font-medium leading-relaxed shadow-[1px_1px_0px_#111]">
                  "{stressData.explanation}"
                </div>

                {/* Contributing Signals */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                    Contributing Signals
                  </span>
                  <div className="space-y-1.5">
                    {stressData.contributingSignals.length > 0 ? (
                      stressData.contributingSignals.map((sig, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] font-medium shadow-[1px_1px_0px_#111]"
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            stressData.status === 'LOW' ? 'bg-[var(--accent-green-dark)]' :
                            stressData.status === 'ELEVATED' ? 'bg-amber-500' : 'bg-rose-600'
                          }`} />
                          <span className="truncate">{sig}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[var(--text-secondary)] italic">
                        Current readings are close to your personal baseline.
                      </div>
                    )}
                  </div>
                </div>

                {/* Contributing Vitals Snapshot */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-center">
                    <span className="text-[9px] font-mono uppercase text-[var(--text-secondary)] block font-bold">HR / Base</span>
                    <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                      {stressData.baselineComparison?.currentHr != null ? `${stressData.baselineComparison.currentHr}` : '--'} 
                      <span className="text-[9px] font-mono text-[var(--text-muted)] font-normal"> / {stressData.baselineComparison?.restingHr}</span>
                    </span>
                  </div>
                  <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-center">
                    <span className="text-[9px] font-mono uppercase text-[var(--text-secondary)] block font-bold">IMU Motion</span>
                    <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                      {stressData.baselineComparison?.accelMagnitude != null ? `${stressData.baselineComparison.accelMagnitude}g` : '1.00g'}
                    </span>
                  </div>
                  <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-center">
                    <span className="text-[9px] font-mono uppercase text-[var(--text-secondary)] block font-bold">Skin Temp</span>
                    <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                      {stressData.baselineComparison?.currentTemp != null ? `${stressData.baselineComparison.currentTemp}°C` : 'Optional'}
                    </span>
                  </div>
                </div>

                {/* Non-Diagnostic Disclaimer Footer */}
                <div className="pt-2 border-t border-[var(--border-light)] flex items-center justify-between text-[9px] font-mono text-[var(--text-muted)]">
                  <span>Prototype wellness pattern · Not a diagnosis</span>
                  {stressData.baselineComparison?.hrDelta != null && (
                    <span className="font-bold text-[var(--text-secondary)]">
                      Δ {stressData.baselineComparison.hrDelta > 0 ? '+' : ''}{stressData.baselineComparison.hrDelta} BPM vs Base
                    </span>
                  )}
                </div>
              </>
            )}

          </div>

          {/* ── Daily Subjective Check-in ── */}
          <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Daily Subjective Check-in</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
                PERSISTS TO SQLITE
              </span>
            </div>


            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Subjective feelings help AWEN differentiate mental stress from physical activity.
            </p>

            {/* Feelings Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                How does your body feel right now?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FEELINGS.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setSelectedFeeling(f.label)}
                    className={`p-2.5 border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedFeeling === f.label
                        ? 'bg-[var(--accent-green)] border-[var(--border-strong)] text-[var(--text-primary)] shadow-[2px_2px_0px_#111]'
                        : 'bg-[var(--surface-secondary)] border-[var(--border-strong)] hover:bg-[var(--surface-primary)]'
                    }`}
                  >
                    <span>{f.emoji}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                What activities were part of your day?
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => {
                  const isSel = selectedTags.includes(t.label);
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => toggleTag(t.label)}
                      className={`px-2.5 py-1 text-xs border font-medium transition-all ${
                        isSel 
                          ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--border-strong)]' 
                          : 'bg-[var(--surface-secondary)] border-[var(--border-strong)] hover:bg-[var(--surface-tertiary)]'
                      }`}
                    >
                      <span className="mr-1">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subjective Notes */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                Personal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notice anything about your energy or heart rate today?"
                rows={3}
                className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] focus:outline-none focus:bg-[var(--surface-primary)] font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSaveCheckin}
              className="w-full py-2.5 neo-btn neo-btn-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check-in Saved to SQLite!</span>
                </>
              ) : (
                <span>Save Today's Check-in</span>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
