import React from 'react';
import { MessageCircle, Heart, TrendingUp, X, Sparkles } from 'lucide-react';

/**
 * Apple Dynamic Island Style Floating Popup Card
 * Appears near AWEN when tapped.
 */
export const DynamicIslandPopup = ({ isOpen, onClose, onTalk, onExplain, onInsights, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="w-full max-w-sm mx-auto my-2 animate-fadeIn z-30">
      <div className="neo-surface p-4 space-y-3">
        
        {/* Dynamic Island Header */}
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--text-primary)] animate-ping border border-[var(--border-strong)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1">
              <span>AWEN Companion</span>
              <Sparkles className="w-3 h-3 text-[var(--accent-green-dark)]" />
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Message */}
        <div className="text-left space-y-1 pt-0.5">
          <h4 className="font-heading text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
            Hi {userName || 'there'} 👋
          </h4>
          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
            Your body looks calmer than yesterday. How can I help today?
          </p>
        </div>

        {/* 3 Quick Action Buttons */}
        <div className="grid grid-cols-1 gap-2 pt-1 border-t-2 border-[var(--border-strong)] mt-2">
          <button
            onClick={() => {
              onClose();
              onTalk();
            }}
            className="w-full py-2.5 px-3.5 bg-[var(--text-primary)] hover:bg-[var(--accent-green-dark)] text-white text-[10px] font-bold uppercase tracking-wider border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] flex items-center justify-between transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mt-2"
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Talk with Me</span>
            </span>
            <span className="text-[8px] opacity-80">Chat</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onExplain();
            }}
            className="w-full py-2.5 px-3.5 bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-wider border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] flex items-center justify-between transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[var(--accent-danger)]" />
              <span>Explain My Wellness</span>
            </span>
            <span className="text-[8px] text-[var(--text-secondary)]">Reasoning</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onInsights();
            }}
            className="w-full py-2.5 px-3.5 bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-wider border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] flex items-center justify-between transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <span>Show Today's Insights</span>
            </span>
            <span className="text-[8px] text-[var(--text-secondary)]">Journey</span>
          </button>
        </div>

      </div>
    </div>
  );
};
