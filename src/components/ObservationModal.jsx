import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AwenSpirit } from './AwenSpirit';

export const ObservationModal = ({ isOpen, onClose, onStartObservation, onSkipObservation }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6 text-center bg-[#0d1527]">
        
        {/* Awen Living Mascot in Learning Mode */}
        <div className="flex justify-center py-2">
          <AwenSpirit expression="thinking" size={180} interactive={false} />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span>Welcome to AWEN 🌱</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            I'm going to learn your normal physiological pattern before making strong observations.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-300 text-left space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>3–7 Day Observation Mode</span>
          </div>
          <p className="text-[11px] text-slate-300 font-light">
            During this period, I observe your quiet resting heart rate, SpO₂, and activity contexts without jumping to stress conclusions.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              onStartObservation();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Observation Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onSkipObservation();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
          >
            I already have baseline data
          </button>
        </div>

      </div>
    </div>
  );
};
