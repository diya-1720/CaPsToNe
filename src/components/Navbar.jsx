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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('dashboard')}
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
                AWEN
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
              Physiological Intelligence System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              currentView === 'dashboard'
                ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('baseline')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              currentView === 'baseline'
                ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Baseline Profile</span>
          </button>

          <button
            onClick={() => setCurrentView('trends')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              currentView === 'trends'
                ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Trends & Insights</span>
          </button>

          <button
            onClick={() => setCurrentView('achievements')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              currentView === 'achievements'
                ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-medium transition-colors"
            title="ESP32 MAX30102 IoT Configuration"
          >
            <Cpu className={`w-3.5 h-3.5 ${telemetry?.isHardware ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
            <span className="hidden lg:inline text-slate-300">
              {telemetry?.isHardware ? 'ESP32 MAX30102' : 'IoT Sim Stream'}
            </span>
            <span className={`w-2 h-2 rounded-full ${telemetry?.isHardware ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-blue-400'}`} />
          </button>

          {/* Guided Bio-Feedback Breathing Trigger */}
          <button
            onClick={onOpenBreathing}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Breathing</span>
          </button>

          {/* AI Companion Trigger */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-blue-500/20 transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Ask AWEN</span>
          </button>

        </div>

      </div>
    </header>
  );
};
