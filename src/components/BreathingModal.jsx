import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Sparkles, CheckCircle2, Play, Pause } from 'lucide-react';
import { AwenEntity } from './AwenEntity';

export const BreathingModal = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState("Inhale"); // Inhale (4s), Hold (7s), Exhale (8s)
  const [timer, setTimer] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) return prev - 1;

        // Switch 4-7-8 Breathing Phases
        if (phase === "Inhale") {
          setPhase("Hold");
          return 7;
        } else if (phase === "Hold") {
          setPhase("Exhale");
          return 8;
        } else {
          setPhase("Inhale");
          setCyclesCompleted((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isActive, phase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
      <div className="relative w-full max-w-lg neo-surface p-6 sm:p-8 max-h-[90dvh] overflow-y-auto flex flex-col items-center text-center space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] transition-colors"
        >
          <X className="w-5 h-5 text-[var(--text-primary)]" />
        </button>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-green-bg)] border-2 border-[var(--accent-green-dark)] text-[var(--accent-green-dark)] text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_var(--accent-green-dark)]">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Bio-Feedback Recalibration</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
            4-7-8 Guided Breathing
          </h3>
          <p className="text-xs font-medium text-[var(--text-secondary)] max-w-sm">
            Synchronize your breath with AWEN's pulsing core to lower non-exertional stress
          </p>
        </div>

        {/* AWEN Animated Entity Synced to Breath */}
        <div className="py-2 transform transition-transform duration-1000">
          <AwenEntity 
            state="relaxed" 
            size={240} 
            interactive={false} 
            subtext={`${phase.toUpperCase()} — ${timer}s remaining`}
          />
        </div>

        {/* Phase Indicator Card */}
        <div className="w-full p-4 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Current Phase</span>
            <div className="text-xl font-heading font-bold text-[var(--accent-green-dark)] flex items-center gap-2">
              <span>{phase}</span>
              <span className="text-sm font-mono opacity-80">({timer}s)</span>
            </div>
          </div>

          <div className="text-right space-y-0.5 border-l-2 border-[var(--border-strong)] pl-4">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Completed Cycles</span>
            <div className="text-lg font-heading font-bold text-[var(--text-primary)]">
              {cyclesCompleted} / 4
            </div>
          </div>
        </div>

        {/* Play/Pause Control */}
        <div className="flex items-center justify-center gap-3 pt-4 w-full border-t-2 border-[var(--border-strong)]">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--text-primary)] text-white hover:bg-[var(--accent-green-dark)] font-bold uppercase tracking-wide text-xs border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause Sequence' : 'Resume Sequence'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] font-bold uppercase tracking-wide text-xs border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
