import React from 'react';
import { Home, Sun, Compass, BarChart3, MessageCircle, Settings } from 'lucide-react';

/**
 * Neo-Brutalist Mobile Bottom Navigation Bar (md:hidden)
 * Solid off-white panel · black top border · green active indicator
 * 6 mobile tabs: Home, Today, Journey, Insights, AI Chat, Settings
 */
const BottomNavComponent = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home',     label: 'Home',     icon: Home },
    { id: 'today',    label: 'Today',    icon: Sun },
    { id: 'journey',  label: 'Journey',  icon: Compass },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'talk',     label: 'AI Chat',  icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50 w-full bg-[var(--surface-primary)] 
        border-t-2 border-[var(--border-strong)] shadow-[0_-4px_0px_#111111]
        md:hidden
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile Navigation"
    >
      <div className="w-full flex items-stretch">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                relative flex flex-col items-center justify-center flex-1
                py-2.5 px-1 gap-1 touch-manipulation select-none
                border-r border-[var(--border-strong)] last:border-r-0
                transition-all duration-100
                ${isActive
                  ? 'bg-[var(--text-primary)] text-white'
                  : 'bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)]'
                }
              `}
            >
              {/* Green active top border on mobile */}
              <span
                className={`absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-150 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ backgroundColor: 'var(--accent-green)' }}
              />

              <IconComponent
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[var(--accent-green)]' : 'text-[var(--text-primary)]'
                }`}
              />
              <span
                className={`text-[9px] font-bold tracking-tight uppercase leading-none truncate w-full px-0.5 text-center ${
                  isActive ? 'text-white' : 'text-[var(--text-primary)]'
                }`}
              >
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
