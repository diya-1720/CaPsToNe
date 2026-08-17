import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { BottomNav } from './components/BottomNav';
import { TodayScreen } from './components/TodayScreen';
import { JourneyScreen } from './components/JourneyScreen';
import { TalkScreen } from './components/TalkScreen';
import { YouScreen } from './components/YouScreen';
import { AuthModal } from './components/AuthModal';
import { ObservationModal } from './components/ObservationModal';
import { LandingPage } from './components/LandingPage';

import { Moon, User, MessageCircle, ArrowLeft } from 'lucide-react';

import { BaselineEngine, DEFAULT_BASELINE } from './services/baselineEngine';
import { TelemetryStream } from './services/telemetryStream';
import { stateEngine, AWEN_STATES } from './services/stateEngine';
import { apiService } from './services/apiService';
import { aiEngine } from './services/aiEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [previousTab, setPreviousTab] = useState('today');
  const [isNightMode, setIsNightMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(apiService.currentUser);

  const handleOpenTalk = () => {
    setPreviousTab(activeTab === 'talk' ? 'today' : activeTab);
    setActiveTab('talk');
  };

  const handleBackFromTalk = () => {
    setActiveTab(previousTab || 'today');
  };
  
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
  const [userBaseline, setUserBaseline] = useState(null);

  // Restore Active Supabase Auth Session + Listen for Google OAuth Redirect
  useEffect(() => {
    let subscription = null;

    async function initAuth() {
      const user = await apiService.restoreSession();
      if (user) {
        setCurrentUser(user);
      }
      const fetchedBaseline = await apiService.fetchUserBaseline(user?.id);
      if (fetchedBaseline) {
        setUserBaseline(fetchedBaseline);
        if (baselineEngineRef.current) {
          baselineEngineRef.current.setBaseline(fetchedBaseline);
        }
      }

      if (isSupabaseConfigured()) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const userObj = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              token: session.access_token,
              baseline_confidence: 'Stable baseline',
              observation_mode: false
            };
            apiService.saveLocalSession(userObj);
            setCurrentUser(userObj);
            const b = await apiService.fetchUserBaseline(userObj.id);
            if (b) {
              setUserBaseline(b);
              if (baselineEngineRef.current) {
                baselineEngineRef.current.setBaseline(b);
              }
            }
          }
        });
        subscription = data.subscription;
      }
    }

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Initialize Telemetry Stream (Demo mode or Web Serial ESP32 hardware)
  useEffect(() => {
    const stream = new TelemetryStream((reading) => {
      setTelemetry({
        ...reading,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    });

    telemetryStreamRef.current = stream;
    stream.start();

    return () => {
      stream.stop();
    };
  }, []);

  // Check if first-time user needs Observation Mode modal onboarding
  useEffect(() => {
    if (currentUser && !currentUser.isGuest) {
      const obsSeen = localStorage.getItem(`awen_obs_modal_${currentUser.id}`);
      if (!obsSeen && currentUser.observation_mode) {
        setIsObsModalOpen(true);
      }
    }
  }, [currentUser]);

  // Compute baseline evaluation & Centralized AWEN State Engine via Unified Pipeline
  useEffect(() => {
    let isMounted = true;
    async function runAnalysis() {
      if (baselineEngineRef.current && telemetry) {
        const evalResult = await apiService.analyzeTelemetry(telemetry, baselineEngineRef.current, userBaseline);
        if (!isMounted) return;

        // Compute AWEN State Engine Object (LEARNING, BALANCED, ACTIVE, WATCHFUL, WIND_DOWN)
        const computedState = stateEngine.evaluateState({
          observationMode: currentUser?.observation_mode || false,
          daysObserved: currentUser?.observation_day || 5,
          heartRate: telemetry.heartRate || telemetry.heart_rate || 64.0,
          baselineHeartRate: baselineEngineRef.current.baseline.restingHr,
          activityState: telemetry.activity,
          isNightMode: isNightMode
        });

        setAwenState(prevState => {
          if (prevState && prevState.wellnessState === computedState.wellnessState && prevState.auraColor === computedState.auraColor) {
            return prevState;
          }
          return computedState;
        });

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

        setEvaluation(prevEval => {
          if (
            prevEval &&
            prevEval.emotionalState === evalResult.emotionalState &&
            prevEval.anomalyScore === evalResult.anomalyScore &&
            prevEval.status === evalResult.status
          ) {
            return prevEval;
          }
          return evalResult;
        });
      }
    }

    runAnalysis();
    return () => { isMounted = false; };
  }, [telemetry, isNightMode, currentUser, userBaseline]);

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

  const handleToggleObservation = async (enable) => {
    if (currentUser) {
      const updated = { ...currentUser, observation_mode: enable, observation_day: enable ? 1 : 5 };
      setCurrentUser(updated);
      apiService.saveLocalSession(updated);
      if (!currentUser.isGuest) {
        await apiService.updateProfileObservationMode(currentUser.id, enable);
      }
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
    setActiveTab('today');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  // If user is unauthenticated, render the high-conversion Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage 
          onGetStarted={() => setIsAuthOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onTryDemo={() => {
            const guestUser = {
              id: 'guest_demo',
              name: 'Guest Explorer',
              email: 'guest@awen.health',
              isGuest: true,
              observation_mode: false,
              observation_day: 5
            };
            apiService.saveLocalSession(guestUser);
            setCurrentUser(guestUser);
          }}
          onStartDemo={() => {
            const guestUser = {
              id: 'guest_demo',
              name: 'Guest Explorer',
              email: 'guest@awen.health',
              isGuest: true,
              observation_mode: false,
              observation_day: 5
            };
            apiService.saveLocalSession(guestUser);
            setCurrentUser(guestUser);
          }}
        />

        <AuthModal 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div 
      data-theme={isNightMode ? 'dark' : 'light'}
      className={`min-h-[100dvh] w-full transition-colors duration-700 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden ${isNightMode ? 'dark' : ''}`}
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      
      {/* Night Mode Starlight Ambient Glow Overlay */}
      {isNightMode && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-12 left-10 w-1 h-1 bg-white rounded-full animate-ping opacity-60" />
          <div className="absolute top-36 right-16 w-1 h-1 bg-teal-300 rounded-full animate-pulse opacity-70" />
          <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping opacity-50 [animation-delay:1s]" />
        </div>
      )}

      {/* Top Corner Header Bar */}
      <header className="sticky top-0 z-40 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 pt-safe flex items-center justify-between pointer-events-auto backdrop-blur-md bg-[var(--glass-bg)] border-b border-[var(--border-color)] transition-colors duration-300">
        
        {/* Left Header: Brand Logo Pill & Talk Assistant Launcher OR Back Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {activeTab === 'talk' ? (
            <button
              onClick={handleBackFromTalk}
              className="flex items-center gap-1.5 glass-pill px-3 py-1.5 rounded-full text-xs font-medium text-cyan-300 hover:text-white border border-cyan-500/30 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {previousTab.charAt(0).toUpperCase() + previousTab.slice(1)}</span>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-1.5 sm:gap-2 glass-pill px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold text-slate-200 shadow-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="font-heading font-bold tracking-wider text-xs sm:text-sm">AWEN</span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">| Wellness Companion</span>
              </div>

              {/* Compact Top-Left Assistant Launcher */}
              <button
                onClick={handleOpenTalk}
                className="flex items-center gap-1.5 glass-pill px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400/50 shadow-sm transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Talk to AWEN</span>
              </button>
            </>
          )}

          <span className={`text-[9px] sm:text-[10px] font-mono px-2 sm:px-2.5 py-0.5 rounded-full border shrink-0 ${telemetry.isHardware ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
            {telemetry.isHardware ? 'ESP32 Live' : 'Demo Stream'}
          </span>
        </div>

        {/* Top Right Corner Controls: Auth Profile & Moon Symbol Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => currentUser ? setActiveTab('you') : setIsAuthOpen(true)}
            className="flex items-center gap-1.5 glass-pill px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium text-slate-200 hover:text-white transition-colors"
          >
            <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentUser?.name || 'Sign In'}</span>
          </button>

          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`p-2 sm:p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
              isNightMode 
                ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300 shadow-indigo-500/20 scale-105' 
                : 'glass-pill text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title={isNightMode ? "Switch to Ambient Mode" : "Activate Deep Night Mode"}
            aria-label="Night Mode Toggle"
          >
            <Moon className={`w-4 h-4 sm:w-5 sm:h-5 ${isNightMode ? 'fill-indigo-300 text-indigo-200 animate-pulse' : 'text-slate-300 hover:text-cyan-300'}`} />
          </button>
        </div>

      </header>

      {/* Mobile Screen Router */}
      <main className="flex-1 w-full relative z-10 flex flex-col min-h-0">
        {activeTab === 'today' && (
          <TodayScreen 
            telemetry={telemetry}
            evaluation={evaluation}
            awenState={awenState}
            onSelectActivity={handleSelectActivity}
            onSelectMood={handleSelectMood}
            onOpenTalk={handleOpenTalk}
            onOpenInsights={() => setActiveTab('journey')}
            isNightMode={isNightMode}
            currentUser={currentUser}
            baselineData={baselineEngineRef.current?.baseline}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyScreen 
            baselineData={baselineEngineRef.current?.baseline}
            evaluation={evaluation}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'talk' && (
          <TalkScreen 
            telemetry={telemetry}
            evaluation={evaluation}
            currentUser={currentUser}
            baselineData={baselineEngineRef.current?.baseline}
            onOpenJourney={() => setActiveTab('journey')}
            onOpenBaseline={() => setActiveTab('you')}
            onBack={handleBackFromTalk}
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
            onUpdateUserBaseline={(newB) => {
              setUserBaseline(newB);
              if (baselineEngineRef.current) {
                baselineEngineRef.current.setBaseline(newB);
              }
            }}
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
        onClose={() => {
          setIsObsModalOpen(false);
          if (currentUser) {
            localStorage.setItem(`awen_obs_modal_${currentUser.id}`, 'true');
          }
        }}
        onConfirmObservation={() => {
          handleToggleObservation(true);
          setIsObsModalOpen(false);
          if (currentUser) {
            localStorage.setItem(`awen_obs_modal_${currentUser.id}`, 'true');
          }
        }}
      />
    </div>
  );
}
