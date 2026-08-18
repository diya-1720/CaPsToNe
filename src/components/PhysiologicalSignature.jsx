import React from 'react';
import { ShieldCheck, Heart, Zap, Clock, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

export const PhysiologicalSignature = ({ baselineData, onProceedToDashboard }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Signature Banner */}
      <div className="neo-surface p-8  border border-2 border-[var(--border-strong)] text-center relative overflow-hidden bg-radial-glow-green">
        <div className="inline-flex items-center gap-2 px-3 py-1  bg-emerald-500/10 border border-2 border-[var(--border-strong)] text-[var(--accent-green-dark)] text-xs font-medium mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Baseline Signature Complete</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Your Personalized Physiological Signature
        </h2>
        <p className="text-sm text-[var(--text-secondary)] font-bold max-w-xl mx-auto">
          AWEN has learned your unique body metrics. Generic stress thresholds have been replaced with your individual baseline signature.
        </p>
      </div>

      {/* Signature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Resting Heart Rate */}
        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-bold font-medium">Resting Heart Rate</span>
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-[var(--text-primary)]">64.0</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">bpm</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-bold">
            Natural quiet-state average calculated over 5 days.
          </p>
        </div>

        {/* Recovery Speed */}
        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-bold font-medium">Recovery Speed</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-[var(--text-primary)]">22.0</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">bpm / min</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-bold">
            Cardiovascular recovery rate following walking or stairs.
          </p>
        </div>

        {/* Daily Rhythm */}
        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-bold font-medium">Daily Rhythm Peak</span>
            <Clock className="w-5 h-5 text-[var(--text-primary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-bold text-[var(--text-primary)]">3:30 PM</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">Dip</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-bold">
            Natural circadian quiet period observed daily.
          </p>
        </div>

        {/* Stress Recovery */}
        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-bold font-medium">Stress Recovery Index</span>
            <Sparkles className="w-5 h-5 text-[var(--accent-green-dark)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-[var(--accent-green-dark)]">High</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">Recovery</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-bold">
            Rapid physiological stabilization following high focus.
          </p>
        </div>

        {/* Activity Pattern */}
        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-bold font-medium">Activity Sensitivity</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-bold text-[var(--text-primary)]">+34 bpm</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">Staircase</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-bold">
            Exertion profile calibrated to eliminate false alarms.
          </p>
        </div>

        {/* SpO2 Baseline */}
        <div className="neo-surface p-5  border border-2 border-[var(--border-strong)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-bold font-medium">SpO₂ Baseline</span>
            <ShieldCheck className="w-5 h-5 text-[var(--text-primary)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-[var(--text-primary)]">98.6%</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">Avg</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-bold">
            Pulse oxygen saturation stability index.
          </p>
        </div>

      </div>

      {/* Button to proceed to main dashboard */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onProceedToDashboard}
          className="flex items-center gap-3 px-8 py-3.5  bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] hover:from-emerald-400 hover:to-teal-500 text-[var(--text-primary)] font-semibold text-sm shadow-[4px_4px_0px_#111] shadow-[2px_2px_0px_#111] transition-all transform hover:scale-[1.02]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Enter Live Wellness Dashboard</span>
        </button>
      </div>

    </div>
  );
};
