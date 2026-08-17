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
    <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-24 lg:pb-12 animate-fadeIn space-y-6">
      
      {/* 1. GREETING / MOMENT */}
      <div className="text-center space-y-1">
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          {getTimeGreeting()}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-light tracking-wide max-w-lg mx-auto">
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
      <div className="relative flex flex-col items-center justify-center py-2">
        <AwenSpeechCloud 
          message={cloudMessage}
          isVisible={isCloudVisible}
          onTalkMore={onOpenTalk}
          onExplain={() => setIsExplainOpen(true)}
          onInsights={onOpenInsights}
        />

        <AwenSpirit 
          expression={isNightMode ? "sleeping" : (evaluation?.emotionalState || mascotExpression || "happy")}
          wellnessState={awenState?.wellnessState || AWEN_STATES.BALANCED}
          size={220}
          interactive={true}
          onClick={handleAwenTap}
          caption="Tap AWEN"
        />

        {/* State Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>State: {awenState?.wellnessState || 'BALANCED'}</span>
        </div>
      </div>

      {/* 3. ONE PRIMARY INSIGHT HERO */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 text-left shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Today's Primary Observation
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {telemetry.isHardware ? 'ESP32 Live' : 'Demo Stream'}
          </span>
        </div>

        <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
          "{insight.title}"
        </p>

        {/* Baseline vs Current Signal Strip */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono block">Current</span>
            <span className="text-lg font-heading font-bold text-white block">{telemetry?.heartRate || 64.0} bpm</span>
            <span className="text-[9px] text-slate-400">{telemetry?.activity || 'Resting'}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono block">Personal Baseline</span>
            <span className="text-lg font-heading font-bold text-cyan-300 block">{restingHr.toFixed(1)} bpm</span>
            <span className="text-[9px] text-slate-400">Quiet Signature</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-mono block">Baseline Delta</span>
            <span className={`text-lg font-heading font-bold block ${hrDelta > 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {hrDelta > 0 ? `+${hrDelta}` : hrDelta} bpm
            </span>
            <span className="text-[9px] text-slate-400">Expected Variation</span>
          </div>
        </div>
      </div>

      {/* 4. WHY AWEN NOTICED (Expandable Accordion) */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden text-left transition-all">
        <button
          onClick={() => setIsExplainOpen(!isExplainOpen)}
          className="w-full p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Why did AWEN notice this observation?</span>
          </span>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExplainOpen ? 'rotate-90' : ''}`} />
        </button>

        {isExplainOpen && (
          <div className="px-4 pb-4 space-y-3 text-xs text-slate-300 font-light border-t border-white/5 pt-3 animate-fadeIn">
            <p className="italic text-cyan-200/90">"{insight.explanation.summary}"</p>
            <ul className="space-y-1.5 pt-1">
              {insight.explanation.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. WHAT NOW? (Focused Action) */}
      <div className="glass-card p-5 rounded-3xl border border-cyan-500/20 bg-cyan-950/20 text-left space-y-3">
        <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-mono font-semibold block">What Now?</span>
        <p className="text-xs sm:text-sm text-slate-200 font-light">
          "Take a short 2-minute quiet pause to let your heart rate settle back toward your resting baseline."
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={onOpenTalk}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>Talk with AWEN</span>
          </button>
          <button
            onClick={onOpenInsights}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
          >
            View 7-day pattern →
          </button>
        </div>
      </div>

      {/* 6. TODAY'S SIGNALS (Supporting Evidence Grid) */}
      <div className="space-y-2 text-left">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">Supporting Signal Context</span>
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-3.5 rounded-2xl border border-white/10 text-left space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-semibold uppercase">Heart Rate</span>
              <Heart className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="text-base font-heading font-bold text-white block">{telemetry?.heartRate || 64.0} bpm</span>
            <span className="text-[9px] text-slate-400 block">{telemetry?.activity || 'Resting'}</span>
          </div>

          <div className="glass-card p-3.5 rounded-2xl border border-white/10 text-left space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-semibold uppercase">SpO₂</span>
              <ActivityIcon className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <span className="text-base font-heading font-bold text-white block">{telemetry?.spo2 || 98.6}%</span>
            <span className="text-[9px] text-sky-300 block">Optimal</span>
          </div>

          <div className="glass-card p-3.5 rounded-2xl border border-white/10 text-left space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-semibold uppercase">Skin Temp</span>
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-base font-heading font-bold text-white block">{telemetry?.temperature || 36.6}°C</span>
            <span className="text-[9px] text-slate-400 block">Nominal</span>
          </div>
        </div>
      </div>

      {/* 7. OPTIONAL EVENING CHECK-IN */}
      <div className="glass-card p-5 rounded-3xl border border-white/10 flex items-center justify-between text-left space-x-4">
        <div>
          <h4 className="font-heading text-sm font-bold text-white">Daily Evening Check-in</h4>
          <p className="text-xs text-slate-400 mt-0.5 font-light">Log subjective context to refine personal observations.</p>
        </div>
        <button
          onClick={() => setCheckinStep(1)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-colors shrink-0"
        >
          Check in
        </button>
      </div>

      {/* Check-in Modal */}
      {checkinStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4 shadow-2xl text-left bg-[#0d1527]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Step {checkinStep} of 2 — Daily Check-in
              </span>
              <button onClick={() => setCheckinStep(0)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {checkinStep === 1 ? (
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-white">How did today feel?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {FEELINGS.map((f) => (
                    <button
                      key={f.label}
                      onClick={() => setCheckinStep(2)}
                      className="p-3.5 rounded-2xl glass-card hover:bg-white/10 border border-white/10 text-xs font-medium text-white flex items-center gap-3 transition-colors"
                    >
                      <span className="text-2xl">{f.emoji}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-white">What best describes today?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ACTIVITIES_CHECKIN.map((act) => (
                    <button
                      key={act.label}
                      onClick={() => {
                        onSelectActivity(act.label);
                        setCheckinStep(0);
                      }}
                      className="p-3.5 rounded-2xl glass-card hover:bg-white/10 border border-white/10 text-xs font-medium text-white flex items-center gap-3 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4 shadow-2xl text-left bg-[#0d1527] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Why AWEN Reached This Conclusion</span>
              </h3>
              <button onClick={() => setIsExplainOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Explanation Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Summary</span>
              <p className="text-xs text-slate-200 font-light leading-relaxed italic">
                "{insight.explanation.summary}"
              </p>
            </div>

            {/* Physiological Factors Breakdown */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Evaluated Signal Factors</span>
              {insight.explanation.bullets.map((bullet, idx) => (
                <div key={idx} className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 flex items-start gap-2.5 text-xs text-slate-300 font-light">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Non-clinical Disclaimer Banner */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-300 font-light">
              AWEN uses non-clinical statistical comparison against your personal baseline signature to provide supportive wellness observations.
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsExplainOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-md shadow-cyan-600/30 hover:bg-cyan-500 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const TodayScreen = React.memo(TodayScreenComponent);
