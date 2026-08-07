import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * AwenSpeechCloud Component
 * Soft organic glass speech bubble positioned directly ABOVE AWEN.
 * Features a soft downward tail pointing to AWEN, clean 2-3 lines of text,
 * and an optional "Talk more →" action button.
 */
export const AwenSpeechCloud = ({ message, isVisible, onTalkMore }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="absolute -top-28 left-1/2 -translate-x-1/2 z-40 w-72 sm:w-80 pointer-events-auto animate-fadeIn duration-300">
      
      {/* Main Glass Speech Cloud Body */}
      <div className="relative glass-card p-4 rounded-3xl border border-cyan-400/30 shadow-2xl bg-[#0e172a]/95 backdrop-blur-xl text-left space-y-2">
        
        {/* Cloud Message Text (Max 2-3 lines) */}
        <p className="text-xs text-slate-100 font-light leading-relaxed tracking-wide">
          "{message}"
        </p>

        {/* Action Link: Talk More */}
        <div className="flex justify-end pt-1 border-t border-white/5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTalkMore();
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 transition-colors group"
          >
            <span>Talk more</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
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
