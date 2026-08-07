import React from 'react';
import { ShieldCheck, Heart, Zap, Clock, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

export const PhysiologicalSignature = ({ baselineData, onProceedToDashboard }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Signature Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center relative overflow-hidden bg-radial-glow-green">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Baseline Signature Complete</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
          Your Personalized Physiological Signature
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          AWEN has learned your unique body metrics. Generic stress thresholds have been replaced with your individual baseline signature.
        </p>
      </div>

      {/* Signature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Resting Heart Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Resting Heart Rate</span>
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">64.0</span>
            <span className="text-xs text-slate-400">bpm</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Natural quiet-state average calculated over 5 days.
          </p>
        </div>

        {/* Recovery Speed */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Recovery Speed</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">22.0</span>
            <span className="text-xs text-slate-400">bpm / min</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Cardiovascular recovery rate following walking or stairs.
          </p>
        </div>

        {/* Daily Rhythm */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Daily Rhythm Peak</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-bold text-white">3:30 PM</span>
            <span className="text-xs text-slate-400">Dip</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Natural circadian quiet period observed daily.
          </p>
        </div>

        {/* Stress Recovery */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Stress Recovery Index</span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-emerald-400">High</span>
            <span className="text-xs text-slate-400">Recovery</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Rapid physiological stabilization following high focus.
          </p>
        </div>

        {/* Activity Pattern */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Activity Sensitivity</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-bold text-white">+34 bpm</span>
            <span className="text-xs text-slate-400">Staircase</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Exertion profile calibrated to eliminate false alarms.
          </p>
        </div>

        {/* SpO2 Baseline */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">SpO₂ Baseline</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">98.6%</span>
            <span className="text-xs text-slate-400">Avg</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Pulse oxygen saturation stability index.
          </p>
        </div>

      </div>

      {/* Button to proceed to main dashboard */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onProceedToDashboard}
          className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Enter Live Wellness Dashboard</span>
        </button>
      </div>

    </div>
  );
};
