import React from 'react';
import { ArrowRight, MessageCircle, Heart, TrendingUp } from 'lucide-react';

/**
 * AwenSpeechCloud Component
 * Neo-Brutalist speech bubble positioned directly ABOVE AWEN.
 * Features a downward tail pointing to AWEN, clean 2-3 lines of text,
 * and quick contextual options (Talk to AWEN, Explain My Wellness, Today's Insight).
 */
const AwenSpeechCloudComponent = ({ message, isVisible, onTalkMore, onExplain, onInsights }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="absolute bottom-[104%] left-1/2 -translate-x-1/2 z-40 w-72 sm:w-80 mb-2 pointer-events-auto animate-fadeIn duration-200">
      
      {/* Main Neo-Brutalist Speech Cloud Body */}
      <div className="relative neo-surface p-4 space-y-3 bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111]">
        
        <p className="text-xs font-bold uppercase tracking-wide leading-relaxed">
          <span className="highlight-yellow">"{message}"</span>
        </p>

        {/* Interactive Options */}
        <div className="pt-2 border-t-2 border-[var(--border-strong)] space-y-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onTalkMore) onTalkMore();
            }}
            className="w-full py-2 px-3 bg-[var(--text-primary)] hover:bg-[var(--accent-green-dark)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none group"
          >
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3 text-white" />
              <span>Talk to AWEN</span>
            </span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            {onExplain && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExplain();
                }}
                className="py-1.5 px-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-[var(--text-primary)] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <Heart className="w-3 h-3 text-[var(--accent-danger)]" />
                <span>Explain</span>
              </button>
            )}

            {onInsights && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInsights();
                }}
                className="py-1.5 px-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-[var(--text-primary)] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <TrendingUp className="w-3 h-3 text-[var(--accent-green-dark)]" />
                <span>Insights</span>
              </button>
            )}
          </div>
        </div>

        {/* Downward Tail */}
        <div 
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[12px] border-l-transparent 
                     border-r-[12px] border-r-transparent 
                     border-t-[12px] border-t-[var(--border-strong)]" 
        />
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[10px] border-l-transparent 
                     border-r-[10px] border-r-transparent 
                     border-t-[10px] border-t-[var(--surface-primary)] z-10" 
        />
      </div>

    </div>
  );
};

export const AwenSpeechCloud = React.memo(AwenSpeechCloudComponent);
