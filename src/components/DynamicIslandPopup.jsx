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
      <div className="glass-card p-4 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-3 bg-[#0d1527]/90 backdrop-blur-2xl">
        
        {/* Dynamic Island Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-heading font-semibold text-cyan-300 flex items-center gap-1">
              <span>AWEN Companion</span>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="text-left space-y-1 pt-0.5">
          <h4 className="font-heading text-sm font-bold text-white">
            Hi {userName || 'there'} 👋
          </h4>
          <p className="text-xs text-slate-200 font-light leading-relaxed">
            Your body looks calmer than yesterday. How can I help today?
          </p>
        </div>

        {/* 3 Quick Action Buttons */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onTalk();
            }}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-200" />
              <span>Talk with Me</span>
            </span>
            <span className="text-[10px] opacity-80">Chat</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onExplain();
            }}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Explain My Wellness</span>
            </span>
            <span className="text-[10px] text-slate-400">Reasoning</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onInsights();
            }}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Show Today's Insights</span>
            </span>
            <span className="text-[10px] text-slate-400">Journey</span>
          </button>
        </div>

      </div>
    </div>
  );
};
