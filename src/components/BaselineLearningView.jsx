import React, { useState } from 'react';
import { AwenEntity } from './AwenEntity';
import { CheckCircle, Sparkles, Activity, Clock, ShieldCheck, Heart, Zap, ArrowRight } from 'lucide-react';

export const BaselineLearningView = ({ onCompleteBaseline, baselineData }) => {
  const [activeDay, setActiveDay] = useState(5); // Simulated Day 5 of 7
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);

  const DISCOVERIES = [
    {
      day: 1,
      title: "Resting Baseline Acquired",
      quote: "Today I learned your average resting heart rate is 64 bpm.",
      detail: "Captured 4,200 quiet state telemetry points between 7:00 AM and 11:30 PM.",
      icon: Heart,
      color: "text-blue-400"
    },
    {
      day: 2,
      title: "Work & Cognitive Load Signature",
      quote: "I noticed your heart rate naturally increases by +6 bpm during desk work.",
      detail: "AWEN registered this as normal focus effort, preventing false stress alerts.",
      icon: Clock,
      color: "text-indigo-400"
    },
    {
      day: 3,
      title: "Aerobic Recovery Velocity",
      quote: "You recover quickly after light walking (~22 bpm drop per minute).",
      detail: "Your cardiovascular recovery velocity is in the top 15th percentile for young adults.",
      icon: Zap,
      color: "text-emerald-400"
    },
    {
      day: 4,
      title: "Staircase Exertion Signature",
      quote: "Stair climbing causes a temporary +34 bpm rise, returning to baseline within 90s.",
      detail: "AWEN tagged this as physical exertion context, eliminating false stress alarms.",
      icon: Activity,
      color: "text-amber-400"
    },
    {
      day: 5,
      title: "Daily Circadian Rhythm",
      quote: "Your heart rate reaches its lowest natural dip at 3:30 PM.",
      detail: "This circadian pattern helps tailor optimal break and focus recommendations.",
      icon: Sparkles,
      color: "text-purple-400"
    }
  ];

  const handleFinish = () => {
    setIsGeneratingSignature(true);
    setTimeout(() => {
      setIsGeneratingSignature(false);
      onCompleteBaseline();
    }, 1600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <AwenEntity state="learning" size={140} interactive={false} />
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3–7 Day Physiological Baseline Mode</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                Learning Your Unique Body Signature
              </h2>
              <p className="text-sm text-slate-300 max-w-xl">
                Instead of reporting generic stress levels, AWEN is observing your resting heart rate, oxygen stability, and activity patterns to create your personal baseline.
              </p>
            </div>
          </div>

          {/* Progress Circle & Trigger */}
          <div className="flex flex-col items-center bg-slate-900/80 p-5 rounded-2xl border border-white/10 text-center min-w-[200px]">
            <span className="text-3xl font-heading font-bold text-blue-400">Day 5 of 7</span>
            <span className="text-xs text-slate-400 mt-1">71% Baseline Learned</span>
            <button
              onClick={handleFinish}
              disabled={isGeneratingSignature}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isGeneratingSignature ? (
                <span>Generating Signature...</span>
              ) : (
                <>
                  <span>Generate Signature</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>AWEN's Baseline Discoveries</span>
          </h3>
          <span className="text-xs text-slate-400">Updated in real time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DISCOVERIES.map((disc) => {
            const IconComponent = disc.icon;
            return (
              <div 
                key={disc.day}
                className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    Day {disc.day} Discovery
                  </span>
                  <IconComponent className={`w-5 h-5 ${disc.color}`} />
                </div>

                <div className="space-y-2">
                  <h4 className="font-heading text-base font-semibold text-slate-100">
                    {disc.title}
                  </h4>
                  <p className="text-xs italic text-blue-200/90 leading-relaxed bg-blue-950/30 p-2.5 rounded-xl border border-blue-500/10">
                    "{disc.quote}"
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal border-t border-white/5 pt-3">
                  {disc.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
