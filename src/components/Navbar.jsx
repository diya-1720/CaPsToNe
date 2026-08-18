import React from 'react';
import { Activity, Cpu, Sparkles, Flame, ShieldCheck, BarChart3, Award, RefreshCw } from 'lucide-react';

export const Navbar = ({ 
  currentView, 
  setCurrentView, 
  telemetry, 
  onOpenIoT, 
  onOpenChat, 
  onOpenBreathing,
  baselineData 
}) => {
  return (
    <header className="sticky top-0 z-40 w-full neo-surface border-b border-2 border-[var(--border-strong)] px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('dashboard')}
        >
          <div className="relative w-9 h-9  bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] p-[1.5px] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111] group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <div className="w-3.5 h-3.5  bg-blue-400 animate-pulse shadow-[2px_2px_0px_#111]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-xl tracking-wider bg-clip-text text-transparent bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111]">
                AWEN
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-primary)] bg-blue-500/10 px-1.5 py-0.5 rounded border border-2 border-[var(--border-strong)]">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold font-medium -mt-0.5 hidden sm:block">
              Physiological Intelligence System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--surface-primary)] p-1  border border-2 border-[var(--border-strong)]">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5  text-xs font-medium transition-all duration-200 ${
              currentView === 'dashboard'
                ? 'bg-blue-600/90 text-[var(--text-primary)] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]'
                : 'text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] font-bold hover:bg-[var(--surface-secondary)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('baseline')}
            className={`flex items-center gap-2 px-4 py-1.5  text-xs font-medium transition-all duration-200 ${
              currentView === 'baseline'
                ? 'bg-blue-600/90 text-[var(--text-primary)] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]'
                : 'text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] font-bold hover:bg-[var(--surface-secondary)]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Baseline Profile</span>
          </button>

          <button
            onClick={() => setCurrentView('trends')}
            className={`flex items-center gap-2 px-4 py-1.5  text-xs font-medium transition-all duration-200 ${
              currentView === 'trends'
                ? 'bg-blue-600/90 text-[var(--text-primary)] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]'
                : 'text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] font-bold hover:bg-[var(--surface-secondary)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Trends & Insights</span>
          </button>

          <button
            onClick={() => setCurrentView('achievements')}
            className={`flex items-center gap-2 px-4 py-1.5  text-xs font-medium transition-all duration-200 ${
              currentView === 'achievements'
                ? 'bg-blue-600/90 text-[var(--text-primary)] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]'
                : 'text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] font-bold hover:bg-[var(--surface-secondary)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Achievements</span>
          </button>
        </nav>

        {/* Action Controls & Hardware Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* IoT ESP32 Connection Badge */}
          <button
            onClick={onOpenIoT}
            className="flex items-center gap-2 px-2.5 py-1.5  bg-[var(--surface-primary)] hover:bg-[var(--surface-primary)] border border-2 border-[var(--border-strong)] text-xs font-medium transition-colors"
            title="ESP32 MAX30102 IoT Configuration"
          >
            <Cpu className={`w-3.5 h-3.5 ${telemetry?.isHardware ? 'text-[var(--accent-green-dark)] animate-pulse' : 'text-[var(--text-primary)]'}`} />
            <span className="hidden lg:inline text-[var(--text-secondary)] font-bold">
              {telemetry?.isHardware ? 'ESP32 MAX30102' : 'IoT Sim Stream'}
            </span>
            <span className={`w-2 h-2  ${telemetry?.isHardware ? 'bg-emerald-400 shadow-[2px_2px_0px_#111]' : 'bg-blue-400'}`} />
          </button>

          {/* Guided Bio-Feedback Breathing Trigger */}
          <button
            onClick={onOpenBreathing}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5  bg-emerald-500/10 hover:bg-emerald-500/20 border border-2 border-[var(--border-strong)] text-[var(--accent-green-dark)] text-xs font-medium transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Breathing</span>
          </button>

          {/* AI Companion Trigger */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3.5 py-1.5  bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] hover:from-blue-500 hover:to-indigo-500 text-[var(--text-primary)] text-xs font-medium shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111] transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Ask AWEN</span>
          </button>

        </div>

      </div>
    </header>
  );
};
