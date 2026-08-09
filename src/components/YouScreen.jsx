import React, { useState } from 'react';
import { ShieldCheck, Mail, Sparkles, Cpu, ChevronRight, X, User, Lock, LogOut, Globe, Radio, AlertCircle } from 'lucide-react';

export const YouScreen = ({ 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onToggleObservation, 
  baselineData, 
  telemetryStream, 
  telemetry 
}) => {
  const [isIoTModalOpen, setIsIoTModalOpen] = useState(false);
  const [isConfirmStopOpen, setIsConfirmStopOpen] = useState(false);

  const isLearning = currentUser?.observation_mode || false;
  const confidenceState = currentUser?.baseline_confidence || (isLearning ? 'Learning' : 'Stable baseline');

  const DISCOVERIES = [
    {
      day: "Day 1",
      title: "Resting Heart Rate",
      quote: "I've discovered your average resting heart rate is 64 bpm.",
      detail: "Observed during quiet resting states throughout your daily routine."
    },
    {
      day: "Day 2",
      title: "Focus Signature",
      quote: "I've started recognizing your daily rhythm during desk work.",
      detail: "Recognized as focus effort, preventing non-exertional false warnings."
    },
    {
      day: "Day 3",
      title: "Movement Recovery",
      quote: "You recover quickly after light walking (~22 bpm drop per minute).",
      detail: "Your body settles smoothly back to your normal resting level."
    },
    {
      day: "Day 4",
      title: "Staircase Exertion",
      quote: "Stair climbing causes a brief temporary rise, returning to normal in 90s.",
      detail: "Activity context filter applied so stairs never trigger false warnings."
    }
  ];

  return (
    <div className="min-h-[calc(100dvh-100px)] w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32 space-y-6 animate-fadeIn">
      
      {/* Profile Header & Account */}
      <div className="flex items-center justify-between glass-card p-5 sm:p-6 rounded-3xl border border-white/10 text-left">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-[#080d18] rounded-[14px] flex items-center justify-center text-white font-heading font-bold text-xl sm:text-2xl">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>

          <div className="space-y-0.5">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-white">
              {currentUser?.name || 'Guest'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-light">
              {currentUser?.email || 'guest@awen.app'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] sm:text-xs font-medium border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Confidence: {confidenceState}</span>
            </div>
          </div>
        </div>

        {/* Auth Action Button */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl glass-card hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-colors flex items-center gap-1.5 text-xs"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30"
            >
              Sign In / Up
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Settings, Observation Mode Toggle & Body Pattern */}
        <div className="space-y-6">
          
          {/* Observation Mode Settings Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-purple-500/30 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Observation Mode Settings</span>
              </span>
              <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full ${isLearning ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {isLearning ? 'Learning Active' : 'Stable Baseline'}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {isLearning 
                ? "AWEN is currently observing your daily rhythm without making strong stress conclusions." 
                : "AWEN is actively using your 5-day learned baseline for personalized observations."}
            </p>

            {isLearning ? (
              <button
                onClick={() => setIsConfirmStopOpen(true)}
                className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-colors"
              >
                Stop Observation Mode
              </button>
            ) : (
              <button
                onClick={() => onToggleObservation(true)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all"
              >
                Restart Observation Mode
              </button>
            )}
          </div>

          {/* Your Body Pattern Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                Your Body Pattern
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono">AWEN-SIG-8841</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 block">Resting Heart Rate</span>
                <span className="text-base sm:text-lg font-heading font-bold text-white block">64.0 bpm</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 block">Recovery Speed</span>
                <span className="text-base sm:text-lg font-heading font-bold text-emerald-400 block">22 bpm/min</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 block">Your Quiet Hours</span>
                <span className="text-base sm:text-lg font-heading font-bold text-white block">3:30 PM</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 block">Staircase Filter</span>
                <span className="text-base sm:text-lg font-heading font-bold text-cyan-300 block">+34 bpm</span>
              </div>
            </div>
          </div>

          {/* Timezone & Demo Mode Controls */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Timezone & Demo Controls</span>
              </span>
              <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full ${telemetry?.isHardware ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                {telemetry?.isHardware ? 'ESP32 Hardware' : 'Demo Mode Active'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Saved Timezone: <strong className="text-slate-200">{currentUser?.timezone || 'Asia/Kolkata'}</strong>
            </p>

            <button
              onClick={() => setIsIoTModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Simulate Physical Activity Telemetry</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Discovery Journey & Monthly Letter */}
        <div className="space-y-6 text-left">
          {/* Monthly Letter from Awen */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-pink-400" />
                <span>Monthly Letter from Awen</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">August 2026</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light italic bg-slate-900/40 p-4 rounded-2xl border border-white/5">
              {`"Dear ${currentUser?.name?.split(' ')[0] || 'Friend'}, this month your body found a natural resting balance. Your heart rate recovery after walking improved by +2 bpm per minute. Remember that brief pauses during your quiet hours help your body restore its natural rhythm."`}
            </p>
          </div>

          {/* Discovery Journey */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Discovery Journey</span>
              </h2>
              <span className="text-[10px] sm:text-xs text-slate-400">Personal Growth</span>
            </div>

            <div className="space-y-3">
              {DISCOVERIES.map((disc, idx) => (
                <div key={idx} className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="font-semibold text-cyan-400 uppercase tracking-wider">{disc.day}</span>
                    <span className="text-slate-400">{disc.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm italic text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-white/5 font-light">
                    "{disc.quote}"
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-normal pt-0.5 font-light">
                    {disc.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal to Stop Observation Mode */}
      {isConfirmStopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl border border-purple-500/30 space-y-4 shadow-2xl text-left bg-[#0d1527]">
            <div className="flex items-center gap-2.5 text-purple-300 border-b border-white/10 pb-3">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <h3 className="font-heading text-base font-bold text-white">Stop Observation Mode?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Are you sure? AWEN will begin using your learned baseline for personalized observations.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmStopOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onToggleObservation(false);
                  setIsConfirmStopOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/30"
              >
                Stop Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IoT Pairing Modal */}
      {isIoTModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl text-left bg-[#0d1527]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-base font-bold text-white">ESP32 Telemetry Controls</h3>
              <button onClick={() => setIsIoTModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300">Simulate Physical Activity:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { telemetryStream?.setScenario('normal'); setIsIoTModalOpen(false); }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5"
                >
                  Resting (64 bpm)
                </button>
                <button
                  onClick={() => { telemetryStream?.setScenario('stairs'); setIsIoTModalOpen(false); }}
                  className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20"
                >
                  Stairs (+34 bpm)
                </button>
                <button
                  onClick={() => { telemetryStream?.setScenario('caffeine'); setIsIoTModalOpen(false); }}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20"
                >
                  Caffeine Work
                </button>
                <button
                  onClick={() => { telemetryStream?.setScenario('exercise'); setIsIoTModalOpen(false); }}
                  className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20"
                >
                  Running
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsIoTModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
