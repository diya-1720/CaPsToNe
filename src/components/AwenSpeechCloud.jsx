import React from 'react';
import { ArrowRight, MessageCircle, Heart, TrendingUp } from 'lucide-react';

/**
 * AwenSpeechCloud Component
 * Soft organic glass speech bubble positioned directly ABOVE AWEN.
 * Features a soft downward tail pointing to AWEN, clean 2-3 lines of text,
 * and quick contextual options (Talk to AWEN, Explain My Wellness, Today's Insight).
 */
const AwenSpeechCloudComponent = ({ message, isVisible, onTalkMore, onExplain, onInsights }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="absolute -top-36 left-1/2 -translate-x-1/2 z-40 w-72 sm:w-80 pointer-events-auto animate-fadeIn duration-300">
      
      {/* Main Glass Speech Cloud Body */}
      <div className="relative glass-card p-4 rounded-3xl border border-cyan-400/30 shadow-2xl bg-[#0e172a]/95 backdrop-blur-xl text-left space-y-2.5">
        
        {/* Cloud Message Text */}
        <p className="text-xs text-slate-100 font-light leading-relaxed tracking-wide">
          "{message}"
        </p>

        {/* Interactive Options */}
        <div className="pt-2 border-t border-white/10 space-y-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onTalkMore) onTalkMore();
            }}
            className="w-full py-1.5 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-[11px] font-medium flex items-center justify-between transition-all group"
          >
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3 text-cyan-300" />
              <span>Talk to AWEN</span>
            </span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            {onExplain && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExplain();
                }}
                className="py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-medium border border-white/10 flex items-center justify-center gap-1 transition-colors"
              >
                <Heart className="w-3 h-3 text-rose-400" />
                <span>Explain Wellness</span>
              </button>
            )}

            {onInsights && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInsights();
                }}
                className="py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-medium border border-white/10 flex items-center justify-center gap-1 transition-colors"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Today's Insight</span>
              </button>
            )}
          </div>
        </div>

        {/* Soft Organic Downward Tail Pointing to AWEN */}
        <div 
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[10px] border-l-transparent 
                     border-r-[10px] border-r-transparent 
                     border-t-[10px] border-t-[#0e172a]" 
        />
      </div>

    </div>
  );
};

export const AwenSpeechCloud = React.memo(AwenSpeechCloudComponent);

