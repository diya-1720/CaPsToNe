import React from 'react';
import { Sun, Compass, MessageCircle, User } from 'lucide-react';

/**
 * Mobile-First Bottom Navigation Bar
 * Tabs: Today, Journey, Talk to Awen, You
 */
export const BottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: 'today',
      label: 'Today',
      icon: Sun,
    },
    {
      id: 'journey',
      label: 'Journey',
      icon: Compass,
    },
    {
      id: 'talk',
      label: 'Talk to Awen',
      icon: MessageCircle,
    },
    {
      id: 'you',
      label: 'You',
      icon: User,
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-[#080d18] via-[#080d18]/95 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto glass-card rounded-3xl p-1.5 border border-white/10 shadow-2xl flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-cyan-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Tab Glow Pill */}
              {isActive && (
                <div className="absolute inset-0 bg-cyan-500/15 rounded-2xl border border-cyan-500/30 transition-all duration-300" />
              )}

              <IconComponent className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px] mt-1 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
