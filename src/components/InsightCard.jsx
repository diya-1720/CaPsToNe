import React, { useState, useEffect, useRef } from 'react';
import { Eye, HelpCircle, Play, CheckCircle2, Clock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { insightEngine } from '../services/insightEngine';

export const InsightCard = ({ insight, onOpenExplain }) => {
  const [isPauseActive, setIsPauseActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [startHr, setStartHr] = useState(null);
  const [followUpResult, setFollowUpResult] = useState(null);

  const timerRef = useRef(null);
  const liveHr = insight?.metrics?.hr || 64.0;
  const restingHr = insight?.baseline?.restingHr || 64.0;

  // Handle starting the 2-minute pause action
  const handleStartPause = () => {
    setStartHr(liveHr);
    setIsPauseActive(true);
    setTimerSeconds(120);
    setFollowUpResult(null);
  };

  // Timer countdown & live telemetry follow-up evaluation
  useEffect(() => {
    if (isPauseActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsPauseActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPauseActive]);

  // Compute live follow-up using real telemetry while pause is active or completed
  useEffect(() => {
    if (startHr !== null && liveHr !== undefined) {
      const res = insightEngine.evaluateFollowUp(startHr, liveHr, restingHr);
      setFollowUpResult(res);
    }
  }, [liveHr, startHr, restingHr]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. Low-Noise Model: If reading is normal, show calm status banner
  if (!insight?.isSignificant) {
    return (
      <div className="glass-card p-4 sm:p-5 rounded-3xl border border-white/10 flex items-center justify-between text-left space-x-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-white">
              {insight?.observe?.title || "Balanced Resting Rhythm"}
            </h3>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              {insight?.observe?.summary || "Your physiological readings match your personal baseline."}
            </p>
          </div>
        </div>

        {onOpenExplain && (
          <button
            onClick={onOpenExplain}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors shrink-0 text-xs flex items-center gap-1 font-medium"
            title="Why did AWEN confirm this?"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Details</span>
          </button>
        )}
      </div>
    );
  }

  // 2. Active Observation Experience for Significant Observations
  return (
    <div className="glass-card p-5 sm:p-6 rounded-3xl border border-cyan-500/30 space-y-4 shadow-xl text-left bg-gradient-to-b from-[#0a1224] to-[#080d18] relative overflow-hidden">
      
      {/* Top Header Tag */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            Observation Notice
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Confidence: {insight?.baseline?.confidenceState || 'Stable Baseline'}
        </span>
      </div>

      {/* STEP 1: OBSERVE */}
      <div className="space-y-1">
        <h3 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{insight.observe.title}</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
          {insight.observe.summary}
        </p>
      </div>

      {/* STEP 2: UNDERSTAND (Contextual Explanation Bullets) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
          Context & Reasoning
        </span>
        <ul className="space-y-1.5 text-xs text-slate-300 font-light">
          {insight.explanation.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* STEP 3 & 4: ACT & FOLLOW-UP */}
      <div className="pt-1 space-y-3">
        {!isPauseActive && startHr === null && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
            <div>
              <h4 className="text-xs font-bold text-cyan-300">Suggested Next Action</h4>
              <p className="text-[11px] text-slate-300 font-light mt-0.5">
                {insight.action.instruction}
              </p>
            </div>
            <button
              onClick={handleStartPause}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start 2-Min Pause</span>
            </button>
          </div>
        )}

        {/* Active 2-Minute Pause State */}
        {isPauseActive && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>2-Minute Pause Active</span>
              </span>
              <span className="font-mono text-sm font-bold text-indigo-200 bg-indigo-900/60 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                {formatTimer(timerSeconds)}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-light">
              Sit comfortably and breathe normally. AWEN is watching your recovery curve in real time.
            </p>

            {/* Real-time Follow-Up Feedback */}
            {followUpResult && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Pause Start: {followUpResult.startHr} bpm</span>
                  <span className="text-[10px] text-cyan-300 font-mono">Live: {followUpResult.currentHr} bpm</span>
                </div>
                <p className="text-xs text-emerald-300 font-medium pt-0.5">
                  {followUpResult.summary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Completed Action Follow-Up Results */}
        {!isPauseActive && startHr !== null && followUpResult && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pause Completed & Observed</span>
              </span>
              <button
                onClick={handleStartPause}
                className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-normal"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Repeat</span>
              </button>
            </div>
            <p className="text-xs text-slate-200 font-light">
              {followUpResult.summary}
            </p>
          </div>
        )}
      </div>

      {/* STEP 5: LEARN */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{insight.learning.summary}</span>
        </span>
        {onOpenExplain && (
          <button
            onClick={onOpenExplain}
            className="text-cyan-400 hover:underline shrink-0 text-[11px] font-medium"
          >
            Why did AWEN notice this? →
          </button>
        )}
      </div>

    </div>
  );
};
