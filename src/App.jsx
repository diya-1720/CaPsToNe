import React, { useState, useEffect, useRef } from 'react';
import { BottomNav } from './components/BottomNav';
import { TodayScreen } from './components/TodayScreen';
import { JourneyScreen } from './components/JourneyScreen';
import { TalkScreen } from './components/TalkScreen';
import { YouScreen } from './components/YouScreen';
import { AuthModal } from './components/AuthModal';
import { ObservationModal } from './components/ObservationModal';

import { Moon, User } from 'lucide-react';

import { BaselineEngine, DEFAULT_BASELINE } from './services/baselineEngine';
import { TelemetryStream } from './services/telemetryStream';
import { stateEngine, AWEN_STATES } from './services/stateEngine';
import { apiService } from './services/apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [isNightMode, setIsNightMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(apiService.currentUser);
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);

  const baselineEngineRef = useRef(new BaselineEngine(DEFAULT_BASELINE));
  const telemetryStreamRef = useRef(null);

  const [telemetry, setTelemetry] = useState({
    heartRate: 64.0,
    spo2: 98.6,
    temperature: 36.6,
    activity: "Resting",
    mood: "Normal",
    isHardware: false,
    timestamp: "12:00:00 PM"
  });

  const [evaluation, setEvaluation] = useState(null);
  const [awenState, setAwenState] = useState(null);

  // Restore Active Supabase Auth Session
  useEffect(() => {
    async function initAuth() {
      const sessionUser = await apiService.getActiveSession();
      if (sessionUser) {
        setCurrentUser(sessionUser);
      }
    }
    initAuth();
  }, []);

  // Initialize Telemetry Stream & Load User Session
  useEffect(() => {
    telemetryStreamRef.current = new TelemetryStream((data) => {
      setTelemetry((prev) => ({
        ...prev,
        ...data
      }));
    });

    telemetryStreamRef.current.start();

    // Show Observation Onboarding if user is in learning mode
    if (currentUser && currentUser.observation_mode && !sessionStorage.getItem('obs_seen')) {
      setIsObsModalOpen(true);
      sessionStorage.setItem('obs_seen', 'true');
    }

    return () => {
      if (telemetryStreamRef.current) {
        telemetryStreamRef.current.stop();
      }
    };
  }, [currentUser]);

  // Compute baseline evaluation & Centralized AWEN State Engine
  useEffect(() => {
    if (baselineEngineRef.current && telemetry) {
      const evalResult = baselineEngineRef.current.evaluateReadings(
        telemetry.heartRate,
        telemetry.spo2,
        telemetry.temperature,
        telemetry.activity,
        telemetry.mood
      );

      // Compute AWEN State Engine Object (LEARNING, BALANCED, ACTIVE, WATCHFUL, WIND_DOWN)
      const computedState = stateEngine.evaluateState({
        observationMode: currentUser?.observation_mode || false,
        daysObserved: currentUser?.observation_day || 5,
        heartRate: telemetry.heartRate,
        baselineHeartRate: baselineEngineRef.current.baseline.restingHr,
        activityState: telemetry.activity,
        isNightMode: isNightMode
      });

      setAwenState(computedState);

      // Map State Engine state to mascot expression
      if (computedState.wellnessState === AWEN_STATES.LEARNING) {
        evalResult.emotionalState = "thinking";
      } else if (computedState.wellnessState === AWEN_STATES.WIND_DOWN) {
        evalResult.emotionalState = "sleeping";
      } else if (computedState.wellnessState === AWEN_STATES.ACTIVE) {
        evalResult.emotionalState = "celebrating";
      } else if (computedState.wellnessState === AWEN_STATES.WATCHFUL) {
        evalResult.emotionalState = "concerned";
      } else {
        evalResult.emotionalState = "happy";
      }

      setEvaluation(evalResult);
    }
  }, [telemetry, isNightMode, currentUser]);

  const handleSelectActivity = (activity) => {
    if (telemetryStreamRef.current) {
      telemetryStreamRef.current.setActivity(activity);
    }
  };

  const handleSelectMood = (mood) => {
    if (telemetryStreamRef.current) {
      telemetryStreamRef.current.setMood(mood);
    }
  };

  const handleAuthSuccess = (userObj) => {
    setCurrentUser(userObj);
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
  };

  const handleToggleObservation = async (enabled) => {
    const updated = await apiService.updateObservationMode(enabled);
    setCurrentUser(updated);
  };

  return (
    <div className={`min-h-[100dvh] w-full transition-colors duration-700 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden ${
      isNightMode 
        ? 'bg-[#040711] text-slate-100' 
        : 'bg-[#080d18] text-slate-100'
    }`}>
      
      {/* Night Mode Starlight Ambient Glow Overlay */}
      {isNightMode && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute top-12 left-10 w-1 h-1 bg-white rounded-full animate-ping opacity-60" />
          <div className="absolute top-36 right-16 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-70" />
          <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-ping opacity-50 [animation-delay:1s]" />
        </div>
      )}

      {/* Top Corner Header Bar */}
      <header className="sticky top-0 z-40 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between pointer-events-auto">
        
        {/* Brand Logo Pill & Demo Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-heading font-bold tracking-wider text-sm">AWEN</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">| Wellness Companion</span>
          </div>

          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${telemetry.isHardware ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
            {telemetry.isHardware ? 'ESP32 Live' : 'Demo Stream'}
          </span>
        </div>

        {/* Top Right Corner Controls: Auth Profile & Moon Symbol Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => currentUser ? setActiveTab('you') : setIsAuthOpen(true)}
            className="flex items-center gap-1.5 glass-pill px-3 py-1.5 rounded-full text-xs font-medium text-slate-200 hover:text-white transition-colors"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentUser?.name || 'Sign In'}</span>
          </button>

          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
              isNightMode 
                ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300 shadow-indigo-500/20 scale-105' 
                : 'glass-pill text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title={isNightMode ? "Switch to Ambient Mode" : "Activate Deep Night Mode"}
            aria-label="Night Mode Toggle"
          >
            <Moon className={`w-5 h-5 ${isNightMode ? 'fill-indigo-300 text-indigo-200 animate-pulse' : 'text-slate-300 hover:text-cyan-300'}`} />
          </button>
        </div>

      </header>

      {/* Mobile Screen Router */}
      <main className="flex-1 w-full relative z-10">
        {activeTab === 'today' && (
          <TodayScreen 
            telemetry={telemetry}
            evaluation={evaluation}
            awenState={awenState}
            onSelectActivity={handleSelectActivity}
            onSelectMood={handleSelectMood}
            onOpenTalk={() => setActiveTab('talk')}
            onOpenInsights={() => setActiveTab('journey')}
            isNightMode={isNightMode}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyScreen 
            baselineData={baselineEngineRef.current?.baseline}
            evaluation={evaluation}
          />
        )}

        {activeTab === 'talk' && (
          <TalkScreen 
            telemetry={telemetry}
            evaluation={evaluation}
          />
        )}

        {activeTab === 'you' && (
          <YouScreen 
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenAuth={() => setIsAuthOpen(true)}
            onToggleObservation={handleToggleObservation}
            baselineData={baselineEngineRef.current?.baseline}
            telemetryStream={telemetryStreamRef.current}
            telemetry={telemetry}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Auth & Observation Onboarding Modals */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ObservationModal 
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        onStartObservation={() => handleToggleObservation(true)}
        onSkipObservation={() => handleToggleObservation(false)}
      />

    </div>
  );
}
