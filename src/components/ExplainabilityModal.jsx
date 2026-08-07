import React from 'react';
import { X, HelpCircle, ShieldCheck, CheckCircle, Activity, Brain, ArrowUpRight, Lock } from 'lucide-react';

export const ExplainabilityModal = ({ isOpen, onClose, evaluation, telemetry }) => {
  if (!isOpen) return null;

  const factors = evaluation?.explainability?.factors || [
    { title: "Baseline Delta", detail: "+0 bpm from expected", status: "normal" },
    { title: "Activity Context", detail: "Filtered (Resting)", status: "active" },
    { title: "SpO₂ Saturation", detail: "98.6% (Normal)", status: "normal" },
    { title: "Model Confidence", detail: "96% match", status: "high" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">
                Explainable AI Reasoning
              </h3>
              <p className="text-xs text-slate-400">
                Transparent breakdown of why AWEN reached this wellness score
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Diagnosis Callout */}
        <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
            <span>Assessment: {evaluation?.wellnessIndex || "Balanced"}</span>
            <span>Confidence: {evaluation?.confidenceScore || 96}%</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic">
            "{evaluation?.explainability?.summary || "Physiological metrics closely align with your 5-day resting baseline."}"
          </p>
        </div>

        {/* Factor Breakdown List */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Physiological Factors Evaluated
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            {factors.map((f, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3.5 rounded-xl glass-card border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  <span className="font-medium text-slate-200">{f.title}</span>
                </div>
                <span className="text-slate-300 font-mono text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/5">
                  {f.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table: Generic Threshold vs AWEN Personal Baseline */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 text-xs">
          <div className="font-semibold text-slate-200 flex items-center justify-between border-b border-white/5 pb-2">
            <span>Metric</span>
            <span className="text-rose-400">Generic Threshold</span>
            <span className="text-emerald-400">AWEN Baseline</span>
          </div>

          <div className="flex justify-between text-slate-300 py-1 border-b border-white/5">
            <span>Staircase HR Spike</span>
            <span className="text-rose-400 font-mono">Flagged (Stressed)</span>
            <span className="text-emerald-400 font-mono">Filtered (Physical Exertion)</span>
          </div>

          <div className="flex justify-between text-slate-300 py-1">
            <span>Resting HR Baseline</span>
            <span className="text-slate-400 font-mono">Population Avg (72 bpm)</span>
            <span className="text-emerald-400 font-mono">Your Avg ({evaluation?.baselineComparison?.restingHr || 64} bpm)</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-white/10">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>On-device Baseline Privacy</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
