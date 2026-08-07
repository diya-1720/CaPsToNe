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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl flex flex-col items-center text-center space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Bio-Feedback Recalibration</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-white">
            4-7-8 Guided Breathing
          </h3>
          <p className="text-xs text-slate-400">
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
        <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Current Phase</span>
            <div className="text-xl font-heading font-bold text-emerald-400 flex items-center gap-2">
              <span>{phase}</span>
              <span className="text-sm text-slate-400 font-mono">({timer}s)</span>
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Completed Cycles</span>
            <div className="text-lg font-heading font-bold text-white">
              {cyclesCompleted} / 4
            </div>
          </div>
        </div>

        {/* Play/Pause Control */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause Sequence' : 'Resume Sequence'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
