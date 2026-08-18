import React, { useState, useEffect, useRef } from 'react';
import { Eye, HelpCircle, Play, CheckCircle2, Clock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { insightEngine } from '../services/insightEngine';

const InsightCardComponent = ({ insight, onOpenExplain }) => {
  const [isPauseActive, setIsPauseActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [startHr, setStartHr] = useState(null);
  const [followUpResult, setFollowUpResult] = useState(null);

  const timerRef = useRef(null);
  const liveHr = insight?.metrics?.hr || 64.0;
  const restingHr = insight?.baseline?.restingHr || 64.0;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
      <div className="neo-surface p-4 sm:p-5  border border-2 border-[var(--border-strong)] flex items-center justify-between text-left space-x-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8  bg-emerald-500/10 border border-2 border-[var(--border-strong)] flex items-center justify-center text-[var(--accent-green-dark)] shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-[var(--text-primary)]">
              {insight?.observe?.title || "Balanced Resting Rhythm"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-bold font-light mt-0.5">
              {insight?.observe?.summary || "Your physiological readings match your personal baseline."}
            </p>
          </div>
        </div>

        {onOpenExplain && (
          <button
            onClick={onOpenExplain}
            className="p-2  bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] transition-colors shrink-0 text-xs flex items-center gap-1 font-medium"
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
    <div className="neo-surface p-5 sm:p-6  border border-2 border-[var(--border-strong)] space-y-4 shadow-[4px_4px_0px_#111] text-left bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] relative overflow-hidden">
      
      {/* Top Header Tag */}
      <div className="flex items-center justify-between border-b border-2 border-[var(--border-strong)] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2  bg-cyan-400 animate-ping shrink-0" />
          <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Observation Notice
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono">
          Confidence: {insight?.baseline?.confidenceState || 'Stable Baseline'}
        </span>
      </div>

      {/* STEP 1: OBSERVE */}
      <div className="space-y-1">
        <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Eye className="w-4 h-4 text-[var(--text-primary)] shrink-0" />
          <span className="highlight-yellow">{insight.observe.title}</span>
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-primary)] font-bold leading-relaxed font-light">
          {insight.observe.summary}
        </p>
      </div>

      {/* STEP 2: UNDERSTAND (Contextual Explanation Bullets) */}
      <div className="p-3.5  bg-[var(--surface-primary)] border border-2 border-[var(--border-strong)] space-y-2">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-secondary)] font-bold block">
          Context & Reasoning
        </span>
        <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] font-bold font-light">
          {insight.explanation.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5  bg-cyan-400 mt-1.5 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* STEP 3 & 4: ACT & FOLLOW-UP */}
      <div className="pt-1 space-y-3">
        {!isPauseActive && startHr === null && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-[var(--surface-secondary)] border border-2 border-[var(--border-strong)]">
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Suggested Next Action</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-bold mt-1">
                <span className="highlight-yellow">{insight.action.instruction}</span>
              </p>
            </div>
            <button
              onClick={handleStartPause}
              className="px-4 py-2.5 neo-btn text-xs font-bold flex items-center justify-center gap-2 shrink-0"
            >
              <Play className="w-3.5 h-3.5 text-[var(--text-primary)]" />
              <span>Start 2-Min Pause</span>
            </button>
          </div>
        )}

        {/* Active 2-Minute Pause State */}
        {isPauseActive && (
          <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-primary)] animate-spin" />
                <span>2-Minute Pause Active</span>
              </span>
              <span className="font-mono text-sm font-bold text-[var(--text-primary)] bg-[var(--surface-primary)] px-2.5 py-0.5 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
                {formatTimer(timerSeconds)}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-bold font-light">
              Sit comfortably and breathe normally. AWEN is watching your recovery curve in real time.
            </p>

            {/* Real-time Follow-Up Feedback */}
            {followUpResult && (
              <div className="p-3  bg-[var(--surface-primary)] border border-2 border-[var(--border-strong)] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono">Pause Start: {followUpResult.startHr} bpm</span>
                  <span className="text-[10px] text-[var(--text-primary)] font-mono">Live: {followUpResult.currentHr} bpm</span>
                </div>
                <p className="text-xs text-[var(--accent-green-dark)] font-medium pt-0.5">
                  {followUpResult.summary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Completed Action Follow-Up Results */}
        {!isPauseActive && startHr !== null && followUpResult && (
          <div className="p-4 bg-[var(--accent-green-bg)] border-2 border-[var(--border-strong)] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[var(--accent-green-dark)] font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Pause Completed & Observed</span>
              </span>
              <button
                onClick={handleStartPause}
                className="text-[10px] text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] font-bold flex items-center gap-1 font-normal"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Repeat</span>
              </button>
            </div>
            <p className="text-xs text-[var(--text-primary)] font-bold font-light">
              {followUpResult.summary}
            </p>
          </div>
        )}
      </div>

      {/* STEP 5: LEARN */}
      <div className="pt-2 border-t border-2 border-[var(--border-strong)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-bold">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{insight.learning.summary}</span>
        </span>
        {onOpenExplain && (
          <button
            onClick={onOpenExplain}
            className="text-[var(--text-primary)] hover:underline shrink-0 text-[11px] font-medium"
          >
            Why did AWEN notice this? →
          </button>
        )}
      </div>

    </div>
  );
};

export const InsightCard = React.memo(InsightCardComponent);
