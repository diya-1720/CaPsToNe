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

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
      <div className="relative w-full max-w-xl neo-surface p-6 sm:p-8 space-y-6 max-h-[90dvh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111]">
              <Brain className="w-5 h-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
                Explainable AI Reasoning
              </h3>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                Transparent breakdown of why AWEN reached this wellness score
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Core Diagnosis Callout */}
        <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
            <span>Assessment: {evaluation?.wellnessIndex || "Balanced"}</span>
            <span>Confidence: {evaluation?.confidenceScore || 96}%</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic font-medium">
            "{evaluation?.explainability?.summary || "Physiological metrics closely align with your 5-day resting baseline."}"
          </p>
        </div>

        {/* Factor Breakdown List */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Physiological Factors Evaluated
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            {factors.map((f, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3.5 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111] text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[var(--text-primary)] border border-[var(--border-strong)]" />
                  <span className="font-bold uppercase tracking-wide text-[var(--text-primary)]">{f.title}</span>
                </div>
                <span className="text-[var(--text-secondary)] font-mono font-bold text-[11px] bg-[var(--surface-secondary)] px-2.5 py-1 border-2 border-[var(--border-strong)] shadow-[1px_1px_0px_#111]">
                  {f.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table: Generic Threshold vs AWEN Personal Baseline */}
        <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[3px_3px_0px_#111] space-y-2 text-[11px] font-bold uppercase tracking-wide">
          <div className="text-[var(--text-primary)] flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2 mb-2">
            <span className="w-1/3">Metric</span>
            <span className="w-1/3 text-center text-[var(--accent-danger)]">Generic Threshold</span>
            <span className="w-1/3 text-right text-[var(--accent-green-dark)]">AWEN Baseline</span>
          </div>

          <div className="flex justify-between items-center text-[var(--text-secondary)] py-2 border-b border-[var(--border-light)]">
            <span className="w-1/3">Staircase HR Spike</span>
            <span className="w-1/3 text-center text-[var(--accent-danger)] font-mono text-[10px]">Flagged (Stressed)</span>
            <span className="w-1/3 text-right text-[var(--accent-green-dark)] font-mono text-[10px]">Filtered (Exertion)</span>
          </div>

          <div className="flex justify-between items-center text-[var(--text-secondary)] py-2">
            <span className="w-1/3">Resting HR Baseline</span>
            <span className="w-1/3 text-center font-mono text-[10px]">Population Avg (72 bpm)</span>
            <span className="w-1/3 text-right text-[var(--accent-green-dark)] font-mono text-[10px]">Your Avg ({evaluation?.baselineComparison?.restingHr || 64} bpm)</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-[var(--border-strong)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[var(--accent-green-dark)]" />
            <span>On-device Baseline Privacy</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[var(--text-primary)] text-white hover:bg-[var(--accent-green-dark)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
