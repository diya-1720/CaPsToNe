import React from 'react';
import { Sun, Compass, User } from 'lucide-react';

/**
 * Neo-Brutalist Bottom Navigation Bar
 * Solid off-white panel · black top border · green active indicator
 */
const BottomNavComponent = ({ activeTab, setActiveTab }) => {
  if (activeTab === 'talk') return null;

  const navItems = [
    { id: 'today',   label: 'Today',   icon: Sun },
    { id: 'journey', label: 'Journey', icon: Compass },
    { id: 'you',     label: 'You',     icon: User },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50 w-full bg-[var(--surface-primary)] border-t-2 border-[var(--border-strong)] shadow-[0_-4px_0px_#111111]
        md:static md:w-auto md:bg-transparent md:border-t-0 md:shadow-none md:flex-1 md:flex md:justify-center md:pb-0
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="w-full max-w-lg mx-auto flex items-stretch md:max-w-none md:justify-center md:gap-2">
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
                py-3.5 px-2 gap-1 touch-manipulation select-none
                border-r-2 border-[var(--border-strong)] last:border-r-0
                transition-all duration-100
                md:flex-row md:flex-none md:px-4 md:py-2 md:border-2 md:shadow-[2px_2px_0px_#111] md:active:translate-x-[1px] md:active:translate-y-[1px] md:active:shadow-none
                ${isActive
                  ? 'bg-[var(--text-primary)] text-white md:shadow-[2px_2px_0px_var(--accent-green-dark)] md:border-[var(--border-strong)]'
                  : 'bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] md:text-[var(--text-primary)]'
                }
              `}
            >
              {/* Green active top border on mobile only */}
              <span
                className={`absolute top-0 left-0 right-0 h-[4px] md:hidden transition-opacity duration-150 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ backgroundColor: 'var(--accent-green-dark)' }}
              />

              <IconComponent
                className={`w-5 h-5 md:w-4 md:h-4 shrink-0 ${
                  isActive ? 'text-[var(--accent-green)] md:text-[var(--accent-green)]' : 'text-[var(--text-primary)] md:text-[var(--text-primary)]'
                }`}
              />
              <span
                className={`text-[10px] md:text-xs font-bold tracking-widest uppercase leading-none ${
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
