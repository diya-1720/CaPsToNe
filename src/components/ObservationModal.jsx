import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AwenSpirit } from './AwenSpirit';

export const ObservationModal = ({ isOpen, onClose, onStartObservation, onConfirmObservation, onSkipObservation }) => {
  if (!isOpen) return null;

  const handleStart = () => {
    if (onStartObservation) onStartObservation();
    else if (onConfirmObservation) onConfirmObservation();
    if (onClose) onClose();
  };

  const handleSkip = () => {
    if (onSkipObservation) onSkipObservation();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
      <div className="relative w-full max-w-md neo-surface p-6 sm:p-8 space-y-6 text-center max-h-[90dvh] overflow-y-auto">
        
        {/* Awen Living Mascot in Learning Mode */}
        <div className="flex justify-center py-2 relative z-10">
          <AwenSpirit expression="thinking" size={180} interactive={false} />
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] flex items-center justify-center gap-2">
            <span>Welcome to AWEN 🌱</span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs mx-auto">
            I'm going to learn your normal physiological pattern before making strong observations.
          </p>
        </div>

        <div className="p-4 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-left space-y-2 shadow-[2px_2px_0px_#111]">
          <div className="font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-green-dark)] shrink-0" />
            <span>3–7 Day Observation Mode</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed pl-6">
            During this period, I observe your quiet resting heart rate, SpO₂, and activity contexts without jumping to stress conclusions.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleStart}
            className="w-full py-3 neo-btn neo-btn-primary text-sm font-bold flex items-center justify-center gap-2"
          >
            <span>Start Observation Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-2"
          >
            I Already Have Baseline Data
          </button>
        </div>

      </div>
    </div>
  );
};
