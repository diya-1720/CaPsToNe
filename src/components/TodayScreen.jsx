import React, { useState, useEffect, useRef } from 'react';
import { AwenSpirit } from './AwenSpirit';
import { AwenSpeechCloud } from './AwenSpeechCloud';
import { evaluateAwenSpeech } from '../services/speechEngine';
import { Heart, Activity as ActivityIcon, Thermometer, HelpCircle, ChevronRight, X } from 'lucide-react';
import { AWEN_STATES } from '../services/stateEngine';

export const TodayScreen = ({ 
  telemetry, 
  evaluation, 
  awenState,
  onSelectActivity, 
  onSelectMood,
  onOpenTalk,
  onOpenInsights,
  isNightMode
}) => {
  const [cloudMessage, setCloudMessage] = useState('');
  const [isCloudVisible, setIsCloudVisible] = useState(false);
  const [mascotExpression, setMascotExpression] = useState('happy');
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [checkinStep, setCheckinStep] = useState(0);

  const cloudTimerRef = useRef(null);

  // Handle Mascot Tap / Click Interaction
  const handleAwenTap = () => {
    const wellnessContext = {
      heartRate: telemetry?.heartRate || 64,
      baselineHeartRate: evaluation?.baselineComparison?.restingHr || 64,
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

  return (
    <div className="relative min-h-[calc(100dvh-100px)] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32 animate-fadeIn">
      
      {/* Desktop 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
        {/* Left Column: Greeting, Living AWEN Stage, Wellness Card */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          
          {/* Top Greeting Header */}
          <div className="space-y-1">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Good Evening, Diya.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-light tracking-wide">
              {awenState?.wellnessState === AWEN_STATES.LEARNING 
                ? "AWEN is currently observing your daily pattern." 
                : "I'm happy to see you again."}
            </p>
          </div>

          {/* Main Living Character Hub with Floating Speech Cloud ABOVE */}
          <div className="relative flex flex-col items-center justify-center py-6 sm:py-8 my-2">
            
            {/* Floating Speech Cloud */}
            <AwenSpeechCloud 
              message={cloudMessage}
              isVisible={isCloudVisible}
              onTalkMore={onOpenTalk}
            />

            {/* Living AWEN Mascot with State-Aware Color Reactivity */}
            <AwenSpirit 
              expression={isNightMode ? "sleeping" : mascotExpression}
              wellnessState={awenState?.wellnessState || AWEN_STATES.BALANCED}
              size={260}
              interactive={true}
              onClick={handleAwenTap}
              caption="Tap AWEN"
            />
          </div>

          {/* Simplified Wellness Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3 shadow-xl text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Today's Wellness
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Confidence: {awenState?.confidence || 'Stable baseline'}
              </span>
            </div>

            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                {awenState?.wellnessState === AWEN_STATES.LEARNING
                  ? "Learning your normal pattern."
                  : "You're doing well today."}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-light leading-relaxed">
                {telemetry?.activity && telemetry.activity !== "Resting"
                  ? `Physical activity detected (${telemetry.activity.toLowerCase()}) — normal heart rate recovery.`
                  : "Your readings closely match your 5-day resting pattern."}
              </p>
            </div>

            {/* Plain Human Reasoning Button */}
            <button
              onClick={() => setIsExplainOpen(true)}
              className="w-full mt-1 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-cyan-300 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Why did AWEN suggest this?</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

        </div>

        {/* Right Column: Health Readings Cards, Evening Check-in */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-white hidden lg:block">
              Live Body Readings
            </h3>
            <p className="text-xs text-slate-400 hidden lg:block">
              Compared against your learned resting baseline.
            </p>
          </div>

          {/* Exactly Three Health Cards */}
          <div className="grid grid-cols-3 gap-3.5">
            {/* Heart Rate */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-2 text-left glass-card-hover">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Heart Rate</span>
                <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-heading font-bold text-white block">
                  {telemetry?.heartRate || 64.0}
                </span>
                <span className="text-[10px] text-slate-400 block">bpm</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-medium">Normal pattern</span>
            </div>

            {/* SpO2 */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-2 text-left glass-card-hover">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">SpO₂</span>
                <ActivityIcon className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-heading font-bold text-white block">
                  {telemetry?.spo2 || 98.6}%
                </span>
                <span className="text-[10px] text-slate-400 block">Oxygen</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-sky-300 font-medium">Stable</span>
            </div>

            {/* Temperature */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-2 text-left glass-card-hover">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Temp</span>
                <Thermometer className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-heading font-bold text-white block">
                  {telemetry?.temperature || 36.6}°C
                </span>
                <span className="text-[10px] text-slate-400 block">Skin</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Nominal</span>
            </div>
          </div>

          {/* Evening Check-in Bar */}
          <div className="glass-card p-5 rounded-3xl border border-white/10 flex items-center justify-between text-left space-x-4">
            <div>
              <h4 className="font-heading text-sm font-bold text-white">Daily Evening Check-in</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tell AWEN how today felt to personalize predictions.</p>
            </div>
            <button
              onClick={() => setCheckinStep(1)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-colors shrink-0"
            >
              Check in
            </button>
          </div>

        </div>

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

      {/* Explainability Reasoning Modal */}
      {isExplainOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4 shadow-2xl text-left bg-[#0d1527]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Why AWEN Suggested This</span>
              </h3>
              <button onClick={() => setIsExplainOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 font-medium">
              I suggested taking a quick break because:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>Your heart rate was slightly higher than your usual pattern while sitting.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>Physical activity level remained low ({telemetry?.activity || "Resting"}).</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>Similar patterns usually occur on your busy focus days.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsExplainOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-md shadow-cyan-600/30"
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
