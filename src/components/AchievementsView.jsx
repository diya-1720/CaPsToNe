import React from 'react';
import { Award, ShieldCheck, CheckCircle2, Zap, Calendar, Sparkles } from 'lucide-react';

export const AchievementsView = () => {
  const ACHIEVEMENTS = [
    {
      title: "Baseline Signature Completed",
      description: "Successfully established a 5-day physiological baseline signature.",
      date: "Aug 07, 2026",
      icon: ShieldCheck,
      color: "text-[var(--accent-green-dark)] border-2 border-[var(--border-strong)] bg-emerald-500/10",
      completed: true
    },
    {
      title: "Seven Healthy Check-ins",
      description: "Logged daily physical activity context for 7 consecutive days.",
      date: "Aug 06, 2026",
      icon: CheckCircle2,
      color: "text-[var(--text-primary)] border-2 border-[var(--border-strong)] bg-blue-500/10",
      completed: true
    },
    {
      title: "Recovery Velocity Improved",
      description: "Post-exertion recovery speed reached top 15th percentile.",
      date: "Aug 04, 2026",
      icon: Zap,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      completed: true
    },
    {
      title: "Balanced Week",
      description: "Maintained optimal physiological balance with zero false stress alerts.",
      date: "Aug 02, 2026",
      icon: Sparkles,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      completed: true
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="neo-surface p-6  border border-2 border-[var(--border-strong)] space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1  bg-blue-500/10 border border-2 border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-medium">
          <Award className="w-3.5 h-3.5" />
          <span>Wellness Milestones</span>
        </div>
        <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
          Minimal Physiological Achievements
        </h2>
        <p className="text-xs text-[var(--text-secondary)] font-bold">
          Recognizing long-term physiological consistency and baseline accuracy. Non-gamified milestones.
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ACHIEVEMENTS.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={index}
              className="neo-surface neo-surface-hover p-6  border border-2 border-[var(--border-strong)] flex items-start gap-4"
            >
              <div className={`p-3.5  border ${item.color} shrink-0`}>
                <IconComponent className="w-6 h-6" />
              </div>

              <div className="space-y-1 text-left flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono">{item.date}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-bold leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[var(--accent-green-dark)] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Milestone Verified</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
