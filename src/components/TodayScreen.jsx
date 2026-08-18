import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AwenSpirit } from './AwenSpirit';
import { AwenSpeechCloud } from './AwenSpeechCloud';
import { evaluateAwenSpeech } from '../services/speechEngine';
import { insightEngine } from '../services/insightEngine';
import { BaselineHeroCard } from './BaselineHeroCard';
import { InsightCard } from './InsightCard';
import { Heart, Activity as ActivityIcon, Thermometer, HelpCircle, ChevronRight, X, ShieldCheck, Radio, Sparkles } from 'lucide-react';
import { AWEN_STATES } from '../services/stateEngine';

const TodayScreenComponent = ({ 
  telemetry, 
  evaluation, 
  awenState,
  onSelectActivity, 
  onSelectMood,
  onOpenTalk,
  onOpenInsights,
  isNightMode,
  currentUser,
  baselineData
}) => {
  const firstName = currentUser?.name?.split(' ')[0] || '';
  const getTimeGreeting = () => {
    const h = new Date().getHours();
    const suffix = firstName ? `, ${firstName}` : '';
    if (h < 12) return `Good Morning${suffix}.`;
    if (h < 17) return `Good Afternoon${suffix}.`;
    if (h < 22) return `Good Evening${suffix}.`;
    return `Rest Well${suffix}.`;
  };

  const [cloudMessage, setCloudMessage] = useState('');
  const [isCloudVisible, setIsCloudVisible] = useState(false);
  const [mascotExpression, setMascotExpression] = useState('happy');
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  
  // Daily check-in tracking
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [checkinStep, setCheckinStep] = useState(0);

  const cloudTimerRef = useRef(null);

  // Compute unified insight from insightEngine (memoized for 60fps responsiveness)
  const insight = useMemo(() => {
    return insightEngine.evaluateInsight(
      telemetry,
      evaluation,
      awenState,
      baselineData
    );
  }, [
    telemetry?.heartRate, 
    telemetry?.spo2, 
    telemetry?.temperature, 
    telemetry?.activity, 
    awenState?.wellnessState, 
    baselineData?.restingHr
  ]);

  // Handle Mascot Tap / Click Interaction
  const handleAwenTap = () => {
    const wellnessContext = {
      heartRate: telemetry?.heartRate || 64,
      baselineHeartRate: baselineData?.restingHr || 64,
      spo2: telemetry?.spo2 || 98.6,
      temperature: telemetry?.temperature || 36.6,
      activityState: telemetry?.activity || "Resting",
      sleepQuality: "Good",
      observationMode: awenState?.wellnessState === AWEN_STATES.LEARNING,
      isNightMode: isNightMode
    };

    const speechResult = evaluateAwenSpeech(wellnessContext);

    setCloudMessage(speechResult.text);
    setMascotExpression(speechResult.expression);
    setIsCloudVisible(true);

    if (cloudTimerRef.current) {
      clearTimeout(cloudTimerRef.current);
    }
    cloudTimerRef.current = setTimeout(() => {
      setIsCloudVisible(false);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (cloudTimerRef.current) {
        clearTimeout(cloudTimerRef.current);
      }
    };
  }, []);

  const FEELINGS = [
    { label: "Great", emoji: "😊" },
    { label: "Good", emoji: "🙂" },
    { label: "Okay", emoji: "😐" },
    { label: "Difficult", emoji: "😔" }
  ];

  const ACTIVITIES_CHECKIN = [
    { label: "Studying", icon: "📚" },
    { label: "Exercise", icon: "🏃" },
    { label: "Work", icon: "💻" },
    { label: "Poor Sleep", icon: "😴" },
    { label: "Feeling Unwell", icon: "😷" },
    { label: "Walking", icon: "🚶" }
  ];

  const restingHr = insight?.baseline?.restingHr || 64.0;
  const hrDelta = Math.round(((telemetry?.heartRate || 64.0) - restingHr) * 10) / 10;

  return (
    <>
      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 lg:pb-12 animate-fadeIn space-y-6">
      
      {/* 1. GREETING / MOMENT */}
      <div className="space-y-1">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {getTimeGreeting()}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] font-medium">
          {awenState?.wellnessState === AWEN_STATES.LEARNING 
            ? "AWEN is currently observing your daily resting pattern."
            : awenState?.wellnessState === AWEN_STATES.WATCHFUL
            ? "AWEN noticed a higher resting rate than your personal baseline."
            : awenState?.wellnessState === AWEN_STATES.ACTIVE
            ? "AWEN is tracking your active movement pattern."
            : awenState?.wellnessState === AWEN_STATES.WIND_DOWN
            ? "AWEN is easing into your evening quiet hours."
            : "Your personalized body baseline is active."}
        </p>
      </div>

      {/* 2. AWEN MOMENT (Living Mascot Stage) */}
      <div className="relative flex flex-col items-center justify-center py-8 pt-44 neo-surface">
        <AwenSpeechCloud 
          message={cloudMessage}
          isVisible={isCloudVisible}
          onTalkMore={onOpenTalk}
          onExplain={() => setIsExplainOpen(true)}
          onInsights={onOpenInsights}
        />

        <div className="relative z-10 transition-transform duration-300 hover:scale-105 cursor-pointer" onClick={handleAwenTap}>
          <AwenSpirit 
            expression={evaluation?.emotionalState || mascotExpression || "happy"}
            wellnessState={awenState?.wellnessState || AWEN_STATES.BALANCED}
            size={200}
            interactive={true}
            onClick={handleAwenTap}
            caption="Tap AWEN"
          />
        </div>

        {/* State Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-strong)] bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-mono shadow-[2px_2px_0px_#111]">
          <span className="w-1.5 h-1.5  bg-[var(--accent-green)] shrink-0" />
          <span className="font-bold uppercase tracking-widest">
            {awenState?.wellnessState || 'BALANCED'}
          </span>
        </div>
      </div>

      {/* 3. ONE PRIMARY INSIGHT HERO */}
      <div className="neo-surface p-5 sm:p-6 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--awen-aqua)]" />
            <span className="font-heading text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
              Today's Primary Observation
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono px-2 py-1 bg-[var(--surface-level-2)] rounded-md">
            {telemetry.isHardware ? 'ESP32 LIVE' : 'DEMO STREAM'}
          </span>
        </div>

        <p className="text-lg sm:text-xl font-medium leading-relaxed">
          "{insight.title}"
        </p>

        {/* Baseline vs Current Signal Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-4  bg-[var(--surface-level-2)] space-y-1">
            <span className="text-[11px] text-[var(--text-secondary)] font-mono font-medium uppercase tracking-wider">Current</span>
            <span className="text-2xl font-heading font-bold block">{telemetry?.heartRate || 64.0} <span className="text-sm font-sans text-[var(--text-secondary)] font-normal">BPM</span></span>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase">{telemetry?.activity || 'Resting'}</span>
          </div>

          <div className="p-4  bg-[var(--surface-level-2)] space-y-1">
            <span className="text-[11px] text-[var(--text-secondary)] font-mono font-medium uppercase tracking-wider">Personal Baseline</span>
            <span className="text-2xl font-heading font-bold text-[var(--awen-teal)] block">{restingHr.toFixed(1)} <span className="text-sm font-sans text-[var(--text-secondary)] font-normal">BPM</span></span>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase">Quiet Signature</span>
          </div>

          <div className="p-4  bg-[var(--surface-level-2)] space-y-1">
            <span className="text-[11px] text-[var(--text-secondary)] font-mono font-medium uppercase tracking-wider">Baseline Delta</span>
            <span className={`text-2xl font-heading font-bold block ${hrDelta > 8 ? 'text-[var(--accent-danger)]' : 'text-[var(--awen-teal)]'}`}>
              {hrDelta > 0 ? `+${hrDelta}` : hrDelta} <span className="text-sm font-sans text-[var(--text-secondary)] font-normal">BPM</span>
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase">Expected Variation</span>
          </div>
        </div>
      </div>

      {/* 4. WHY AWEN NOTICED (Expandable Accordion) */}
      <div className="neo-surface overflow-hidden text-left">
        <button
          onClick={() => setIsExplainOpen(!isExplainOpen)}
          className="w-full p-4 flex items-center justify-between text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <span className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-[var(--accent-green-dark)] shrink-0" />
            <span>Why did AWEN notice this?</span>
          </span>
          <ChevronRight className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isExplainOpen ? 'rotate-90' : ''}`} />
        </button>

        {isExplainOpen && (
          <div className="px-4 pb-4 space-y-3 text-sm text-[var(--text-secondary)] border-t border-[var(--border-light)] pt-4 animate-fadeIn bg-[var(--surface-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">"{insight.explanation.summary}"</p>
            <ul className="space-y-2">
              {insight.explanation.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-green)] border border-[var(--accent-green-dark)] mt-2 shrink-0" />
                  <span className="font-medium">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. WHAT NOW? (Focused Action) */}
      <div className="neo-surface p-5 text-left space-y-3">
        <span className="text-xs uppercase tracking-widest text-[var(--accent-green-dark)] font-mono font-bold block">Recommended Action</span>
        <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
          <span className="highlight-yellow">"Take a short 2-minute quiet pause to let your heart rate settle back toward your resting baseline."</span>
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={onOpenTalk}
            className="nb-btn-green px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <ActivityIcon className="w-4 h-4 shrink-0" />
            <span>Talk with AWEN</span>
          </button>
          <button
            onClick={onOpenInsights}
            className="nb-btn px-5 py-2.5 text-sm"
          >
            View 7-Day Pattern
          </button>
        </div>
      </div>

      {/* 6. TODAY'S SIGNALS (Supporting Evidence Grid) */}
      <div className="space-y-3 text-left">
        <span className="section-label block px-1">Supporting Signal Context</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="metric-card text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="metric-label">Heart Rate</span>
              <Heart className="w-3.5 h-3.5 text-[var(--accent-danger)]" />
            </div>
            <div>
              <span className="metric-value text-2xl block">{telemetry?.heartRate || 64.0} <span className="text-xs text-[var(--text-secondary)] font-normal font-sans">BPM</span></span>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">{telemetry?.activity || 'Resting'}</span>
            </div>
          </div>

          <div className="metric-card text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="metric-label">SpO₂</span>
              <ActivityIcon className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
            </div>
            <div>
              <span className="metric-value text-2xl block">{telemetry?.spo2 || 98.6}<span className="text-xs text-[var(--text-secondary)] font-normal font-sans">%</span></span>
              <span className="text-[10px] font-bold text-[var(--accent-green-dark)] uppercase block">Optimal</span>
            </div>
          </div>

          <div className="metric-card text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="metric-label">Skin Temp</span>
              <Thermometer className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
            </div>
            <div>
              <span className="metric-value text-2xl block">{telemetry?.temperature || 36.6}<span className="text-xs text-[var(--text-secondary)] font-normal font-sans">°C</span></span>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. OPTIONAL EVENING CHECK-IN */}
      <div className="neo-surface p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 text-left">
        <div>
          <h4 className="font-heading text-base font-bold text-[var(--text-primary)]">Daily Check-in</h4>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Log subjective context to refine personal observations.</p>
        </div>
        <button
          onClick={() => setCheckinStep(1)}
          className="neo-btn px-6 py-2.5 text-sm font-bold shrink-0 w-full sm:w-auto text-center"
        >
          Check In
        </button>
      </div>
      </div>

      {/* Check-in Modal */}
      {checkinStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
          <div className="relative w-full max-w-md neo-surface p-6 text-left">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
              <span className="section-label">
                Step {checkinStep} of 2 — Daily Check-in
              </span>
              <button onClick={() => setCheckinStep(0)} className="p-1.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {checkinStep === 1 ? (
              <div className="space-y-4 mt-4">
                <h3 className="font-heading text-xl font-bold">How did today feel?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FEELINGS.map((f) => {
                    const isSelected = selectedFeeling === f.label;
                    return (
                      <button
                        key={f.label}
                        onClick={() => {
                          setSelectedFeeling(f.label);
                          setTimeout(() => setCheckinStep(2), 300);
                        }}
                        className={`p-4 border-[2px] border-[var(--border-strong)] text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_#111]
                          ${isSelected 
                            ? 'bg-[var(--accent-green)] translate-x-[2px] translate-y-[2px] shadow-none' 
                            : 'bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                          }
                        `}
                      >
                        <span className="text-2xl">{f.emoji}</span>
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <h3 className="font-heading text-xl font-bold">What best describes today?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITIES_CHECKIN.map((act) => (
                    <button
                      key={act.label}
                      onClick={() => {
                        onSelectActivity(act.label);
                        setSelectedFeeling(null); // reset for next time
                        setCheckinStep(0);
                      }}
                      className="p-4 border-[2px] border-[var(--border-strong)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] shadow-[2px_2px_0px_#111] active:shadow-none text-center"
                    >
                      <span className="text-xl">{act.icon}</span>
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Plain-Language Explainability Reasoning Modal */}
      {isExplainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
          <div className="relative w-full max-w-md neo-surface p-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
              <h3 className="font-heading text-base font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Why AWEN Reached This Conclusion</span>
              </h3>
              <button onClick={() => setIsExplainOpen(false)} className="p-1.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 mt-4 border border-[var(--border-light)] bg-[var(--surface-secondary)] space-y-2">
              <span className="section-label block">Summary</span>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                "{insight.explanation.summary}"
              </p>
            </div>

            {/* Signal Factors */}
            <div className="space-y-2 mt-4">
              <span className="section-label block">Evaluated Signal Factors</span>
              {insight.explanation.bullets.map((bullet, idx) => (
                <div key={idx} className="bg-[var(--surface-secondary)] border border-[var(--border-light)] p-3 flex items-start gap-3 text-sm font-medium">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-green)] border border-[var(--accent-green-dark)] mt-1.5 shrink-0" />
                  <span className="text-[var(--text-primary)]">{bullet}</span>
                </div>
              ))}
            </div>

            {/* Non-clinical Disclaimer */}
            <div className="p-3 mt-4 border border-[var(--accent-warm)] bg-[var(--accent-warm-bg)] text-xs text-[var(--text-secondary)] font-medium">
              AWEN uses non-clinical statistical comparison against your personal baseline signature to provide supportive wellness observations.
            </div>

            <div className="pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setIsExplainOpen(false)}
                className="neo-btn neo-btn-primary px-6 py-2.5 text-sm font-bold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export const TodayScreen = React.memo(TodayScreenComponent);
