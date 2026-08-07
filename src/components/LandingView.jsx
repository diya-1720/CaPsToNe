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
          <div className="inline-block glass-panel px-6 py-3.5 rounded-2xl border border-blue-500/20 shadow-xl shadow-blue-500/10">
            <p className="font-heading text-xl sm:text-2xl lg:text-3xl font-medium tracking-wide text-slate-100 transition-all duration-700 ease-out">
              "{dialogues[dialogueIndex]}"
            </p>
          </div>
        </div>

        {/* Subtitle & Value Proposition */}
        <p className="max-w-2xl text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Traditional stress monitors compare your heart rate against generic population thresholds. 
          <span className="text-blue-400 font-medium"> AWEN learns your unique physiological baseline</span> over 3–7 days, filtering out staircase climbing, caffeine, and daily exercise to prevent false alarms.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <button
            onClick={onStartBaseline}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 group"
          >
            <span>Begin Baseline Learning</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl glass-panel hover:bg-slate-800/80 text-slate-200 hover:text-white font-medium text-sm border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <Play className="w-4 h-4 text-blue-400 fill-blue-400/20" />
            <span>Try Interactive Demo</span>
          </button>
        </div>

        {/* Healthcare Startup Quality Guarantee Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 w-full max-w-3xl border-t border-white/10 mt-6">
          <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-white/5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Brain className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-slate-200">Zero False Positives</h4>
              <p className="text-[11px] text-slate-400">Staircase & exercise filtering</p>
            </div>
          </div>

          <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-white/5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-slate-200">Transparent AI</h4>
              <p className="text-[11px] text-slate-400">Clear explainability for every score</p>
            </div>
          </div>

          <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-white/5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-slate-200">ESP32 IoT Ready</h4>
              <p className="text-[11px] text-slate-400">MAX30102 Web Serial & REST stream</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
