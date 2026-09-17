import React, { useState } from 'react';
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
  ChevronUp
} from 'lucide-react';
import { apiService } from '../services/apiService';

export const TodayScreen = ({
  telemetry,
  evaluation,
  awenState,
  onSelectActivity,
  currentUser,
  baselineData
}) => {
  const isConnected = Boolean(telemetry?.isHardware);
  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';

  // State for Check-in
  const [selectedFeeling, setSelectedFeeling] = useState('Good');
  const [selectedTags, setSelectedTags] = useState(['Studying']);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Chronological Stream Events (G-6)
  const TIMELINE_EVENTS = [
    {
      id: 'evt_1',
      time: '08:00 AM',
      title: 'Morning Resting Baseline',
      hr: '62.0 BPM',
      delta: '-2.0 vs base',
      type: 'resting',
      status: 'Resting Normal',
      details: 'Waking parasympathetic reading established 2 BPM below baseline midpoint. Normal circadian rise.'
    },
    {
      id: 'evt_2',
      time: '11:45 AM',
      title: 'Stair Climbing & Physical Lift',
      hr: '98.0 BPM',
      delta: '+34.0 lift',
      type: 'exertion',
      status: 'Settled in 88s',
      details: 'Expected cardiovascular elevation from stair ascent. Rate settled smoothly back inside baseline within 88 seconds.'
    },
    {
      id: 'evt_3',
      time: '02:30 PM',
      title: 'Cognitive Focus & Study Period',
      hr: '68.5 BPM',
      delta: '+4.5 cognitive',
      type: 'cognitive',
      status: 'Focused Effort',
      details: 'Subtle sympathetic tone increase during concentrated cognitive task. Correctly categorized as mental effort, avoiding false stress alarm.'
    },
    {
      id: 'evt_4',
      time: '06:15 PM',
      title: 'Evening Outdoor Walking',
      hr: '84.0 BPM',
      delta: '+20.0 motion',
      type: 'walking',
      status: 'Light Movement',
      details: 'Sustained aerobic motion with optimal tissue perfusion. Recovery prompt within 120 seconds post-stroll.'
    },
    {
      id: 'evt_5',
      time: 'Live Stream',
      title: isConnected ? 'Current Live Signal' : 'Evening Wind-Down Standby',
      hr: isConnected && telemetry?.heartRate ? `${telemetry.heartRate} BPM` : '-- BPM',
      delta: isConnected && telemetry?.heartRate ? `${Math.round(telemetry.heartRate - restingHr)} vs base` : 'Awaiting hardware',
      type: 'live',
      status: isConnected ? 'Active Telemetry' : 'Standby',
      details: isConnected ? 'Live continuous monitoring comparing incoming beats against your learned signature.' : 'Connect your ESP32 sensor to add real-time events to your timeline.'
    }
  ];

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
      setTimeout(() => setIsSaved(false), 3500);
    } catch (e) {}
  };

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
            {isConnected ? '88% · OPTIMAL' : 'STANDBY · AWAITING SIGNAL'}
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
            94 %
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Within ±4.8 BPM Corridor
          </span>
        </div>

        {/* Card 2: Recovery Velocity */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Recovery Velocity</span>
            <TrendingUp className="w-4 h-4 text-[var(--accent-green-dark)]" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            1.8 min
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Post-exertion settling
          </span>
        </div>

        {/* Card 3: Exertion Episodes */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Exertion Episodes</span>
            <Footprints className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            3 events
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Motion context filtered
          </span>
        </div>

        {/* Card 4: Quiet Rest Duration */}
        <div className="metric-card border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="metric-label">Quiet Rest Duration</span>
            <Moon className="w-4 h-4 text-purple-600" />
          </div>
          <span className="metric-value text-2xl block text-[var(--text-primary)]">
            7.4 hrs
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
            Parasympathetic rest
          </span>
        </div>

      </div>

      {/* ── 3. TWO-COLUMN MAIN WORKSPACE (7 Cols Left, 5 Cols Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (7 Cols): Hourly Chronological Timeline (G-6) & Donut Chart (G-5) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hourly Timeline Container */}
          <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Hourly Chronological Timeline (G-6)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
                Tap node to inspect
              </span>
            </div>

            {/* Vertical Timeline Axis */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-strong)]">
              {TIMELINE_EVENTS.map((evt) => {
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
          </div>

          {/* Activity & Energy Donut Chart (G-5) */}
          <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Activity & Energy Distribution (G-5)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
                4,328 STEPS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Donut SVG */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="38" stroke="#E5E7EB" strokeWidth="14" fill="none" />
                    {/* Quiet Rest (62%) */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      stroke="#15803D" strokeWidth="14" fill="none"
                      strokeDasharray="148 238" strokeDashoffset="0"
                    />
                    {/* Walking (26%) */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      stroke="#D97706" strokeWidth="14" fill="none"
                      strokeDasharray="62 238" strokeDashoffset="-148"
                    />
                    {/* Stairs / Exercise (12%) */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      stroke="#818cf8" strokeWidth="14" fill="none"
                      strokeDasharray="28 238" strokeDashoffset="-210"
                    />
                  </svg>
                  {/* Center Steps Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-heading font-extrabold text-lg text-[var(--text-primary)]">4,328</span>
                    <span className="text-[9px] font-mono uppercase font-bold text-[var(--text-muted)]">STEPS TODAY</span>
                  </div>
                </div>
              </div>

              {/* Donut Breakdown Legend */}
              <div className="sm:col-span-7 space-y-2.5 text-xs font-mono">
                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#15803D] border border-black shrink-0" />
                    <span className="font-bold">Quiet Rest (Baseline)</span>
                  </div>
                  <span className="font-extrabold text-sm">62 %</span>
                </div>

                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#D97706] border border-black shrink-0" />
                    <span className="font-bold">Light Walking & Studying</span>
                  </div>
                  <span className="font-extrabold text-sm">26 %</span>
                </div>

                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#818cf8] border border-black shrink-0" />
                    <span className="font-bold">Moderate Movement & Stairs</span>
                  </div>
                  <span className="font-extrabold text-sm">12 %</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (5 Cols): Daily Subjective Check-in & Synthesis ── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Subjective Check-in Card */}
          <div className="neo-surface p-5 sm:p-6 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Daily Subjective Context Check-in</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                STEP 1 OF 1
              </span>
            </div>

            {/* Question 1: How did you feel */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] block">
                1. How are you feeling overall today?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FEELINGS.map(f => (
                  <button
                    key={f.label}
                    onClick={() => setSelectedFeeling(f.label)}
                    className={`p-2.5 border-2 border-[var(--border-strong)] text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedFeeling === f.label
                        ? 'bg-[var(--accent-green)] shadow-[2px_2px_0px_#111] -translate-y-0.5'
                        : 'bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)]'
                    }`}
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Tags */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] block">
                2. Activity & context tags:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TAGS.map(t => {
                  const isChecked = selectedTags.includes(t.label);
                  return (
                    <button
                      key={t.label}
                      onClick={() => toggleTag(t.label)}
                      className={`p-2 border-2 border-[var(--border-strong)] text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                        isChecked
                          ? 'bg-[var(--text-primary)] text-white shadow-[2px_2px_0px_#111]'
                          : 'bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 3: Observations */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] block">
                3. Subjective notes / journaling:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notice any afternoon fatigue, coffee intake, or exercise..."
                className="w-full p-2.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[2px_2px_0px_#111] transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSaveCheckin}
              className="w-full py-3 bg-[var(--accent-green)] hover:bg-[var(--accent-green-mid)] text-[var(--text-primary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Check-In Saved to Database! ✓</span>
                </>
              ) : (
                <span>Save Today's Check-In</span>
              )}
            </button>
          </div>

          {/* AWEN Summary Synthesis Box */}
          <div className="neo-surface p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <span>AWEN Summary Synthesis</span>
            </span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Cardiovascular resilience remained strong throughout the daylight period. The 3 motion episodes settled back inside your ±4.8 BPM baseline corridor in an average of 1.8 minutes.
            </p>
            <div className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs font-bold text-[var(--text-primary)]">
              💡 Tip: Maintain a calm environment 45 minutes prior to sleep for optimal heart rate deceleration.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
