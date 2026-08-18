import React, { useState, useEffect } from 'react';
import { AwenEntity } from './AwenEntity';
import { ArrowRight, Play, Shield, Activity, Sparkles, Brain, CheckCircle2 } from 'lucide-react';

export const LandingView = ({ onStartBaseline, onTryDemo }) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const dialogues = [
    "Hello. I'm Awen.",
    "Before I understand your stress,",
    "I first need to understand YOU."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setDialogueIndex((prev) => (prev < dialogues.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(timer);
  }, [dialogues.length]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12 bg-radial-glow overflow-hidden">
      
      {/* Background Micro Particle Ambient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Floating AWEN Entity Hero */}
        <div className="relative mb-2">
          <AwenEntity 
            state="learning" 
            size={320} 
            interactive={true}
            subtext="Click AWEN anytime to initiate context dialogue"
          />
        </div>

        {/* Dynamic Interactive Dialogue Box */}
        <div className="min-h-[90px] flex flex-col items-center justify-center">
          <div className="inline-block neo-surface px-6 py-3.5  border border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] shadow-[2px_2px_0px_#111]">
            <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-medium tracking-wide text-[var(--text-primary)] transition-all duration-700 ease-out">
              "{dialogues[dialogueIndex]}"
            </p>
          </div>
        </div>

        {/* Subtitle & Value Proposition */}
        <p className="max-w-2xl text-sm sm:text-base text-[var(--text-secondary)] font-bold font-normal leading-relaxed">
          Traditional stress monitors compare your heart rate against generic population thresholds. 
          <span className="text-[var(--text-primary)] font-medium"> AWEN learns your unique physiological baseline</span> over 3–7 days, filtering out staircase climbing, caffeine, and daily exercise to prevent false alarms.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <button
            onClick={onStartBaseline}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4  bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] hover:from-blue-500 hover:to-indigo-500 text-[var(--text-primary)] font-medium text-sm shadow-[4px_4px_0px_#111] shadow-[2px_2px_0px_#111] hover:shadow-[2px_2px_0px_#111] hover:scale-[1.02] transition-all duration-300 group"
          >
            <span>Begin Baseline Learning</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4  neo-surface hover:bg-[var(--surface-primary)] text-[var(--text-primary)] font-bold hover:text-[var(--text-primary)] font-medium text-sm border border-2 border-[var(--border-strong)] hover:border-2 border-[var(--border-strong)] transition-all duration-300"
          >
            <Play className="w-4 h-4 text-[var(--text-primary)] fill-blue-400/20" />
            <span>Try Interactive Demo</span>
          </button>
        </div>

        {/* Healthcare Startup Quality Guarantee Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 w-full max-w-3xl border-t border-2 border-[var(--border-strong)] mt-6">
          <div className="flex items-center gap-3 neo-surface p-3.5  border border-2 border-[var(--border-strong)]">
            <div className="p-2 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-[var(--text-primary)]">
              <Brain className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] font-bold">Zero False Positives</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-bold">Staircase & exercise filtering</p>
            </div>
          </div>

          <div className="flex items-center gap-3 neo-surface p-3.5  border border-2 border-[var(--border-strong)]">
            <div className="p-2 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-[var(--text-primary)]">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] font-bold">Transparent AI</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-bold">Clear explainability for every score</p>
            </div>
          </div>

          <div className="flex items-center gap-3 neo-surface p-3.5  border border-2 border-[var(--border-strong)]">
            <div className="p-2 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-[var(--text-primary)]">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] font-bold">ESP32 IoT Ready</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-bold">MAX30102 Web Serial & REST stream</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
