import React from 'react';
import { Sun, Compass, MessageCircle, User } from 'lucide-react';

/**
 * Mobile-First Responsive Bottom Navigation Bar
 * Tabs: Today, Journey, Talk to Awen, You
 */
const BottomNavComponent = ({ activeTab, setActiveTab }) => {
  if (activeTab === 'talk') return null;

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
      id: 'you',
      label: 'You',
      icon: User,
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-2 bg-gradient-to-t from-[#080d18] via-[#080d18]/90 to-transparent pointer-events-none transition-all duration-300">
      <div className="max-w-md mx-auto glass-card rounded-3xl p-1 sm:p-1.5 border border-white/10 shadow-2xl flex items-center justify-around pointer-events-auto backdrop-blur-xl">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center min-w-[72px] py-1.5 px-3 sm:px-4 rounded-2xl transition-all duration-300 touch-manipulation select-none ${
                isActive 
                  ? 'text-cyan-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Active Tab Glow Pill */}
              {isActive && (
                <div className="absolute inset-0 bg-cyan-500/15 rounded-2xl border border-cyan-500/30 transition-all duration-300 shadow-sm shadow-cyan-500/20" />
              )}

              <IconComponent className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const BottomNav = React.memo(BottomNavComponent);


