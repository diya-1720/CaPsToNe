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

import { User, MessageCircle, ArrowLeft } from 'lucide-react';

import { BaselineEngine, DEFAULT_BASELINE } from './services/baselineEngine';
import { TelemetryStream } from './services/telemetryStream';
import { stateEngine, AWEN_STATES } from './services/stateEngine';
import { apiService } from './services/apiService';
import { aiEngine } from './services/aiEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [previousTab, setPreviousTab] = useState('today');
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

      if (isSupabaseConfigured) {
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
          isNightMode: false
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
  }, [telemetry, currentUser, userBaseline]);

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
      className="min-h-[100dvh] w-full flex flex-col font-sans relative"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-base)] border-b-2 border-[var(--border-strong)] pt-safe">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

          {/* Left: Brand or Back */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {activeTab === 'talk' ? (
              <button
                onClick={handleBackFromTalk}
                className="neo-btn px-3 py-2 text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to {previousTab.charAt(0).toUpperCase() + previousTab.slice(1)}</span>
                <span className="sm:hidden">Back</span>
              </button>
            ) : (
              <>
                {/* AWEN Brand Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-base)] border-2 border-[var(--border-strong)] rounded-sm shadow-[2px_2px_0px_#111]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] shrink-0" />
                  <span className="font-heading font-bold text-sm tracking-widest uppercase">AWEN</span>
                </div>

                {/* Talk Launcher */}
                <button
                  onClick={handleOpenTalk}
                  className="neo-btn px-3 py-2 text-xs flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Talk to AWEN</span>
                  <span className="sm:hidden">Talk</span>
                </button>
              </>
            )}

            {/* Hardware Badge */}
            <span className={`text-[10px] font-mono font-bold px-2 py-1 border border-[var(--border-strong)] rounded-sm shrink-0 hidden lg:inline-block uppercase tracking-wider ${
              telemetry.isHardware
                ? 'bg-[var(--accent-green)] text-[var(--text-primary)]'
                : 'bg-[var(--surface-secondary)] text-[var(--text-muted)]'
            }`}>
              {telemetry.isHardware ? '● ESP32 Live' : '○ Demo Stream'}
            </span>
          </div>

          {/* Center: Desktop Navigation (snaps to bottom on mobile) */}
          <BottomNav 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Right: Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => currentUser ? setActiveTab('you') : setIsAuthOpen(true)}
              className="neo-btn px-3 py-2 text-xs flex items-center gap-1.5"
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline max-w-[120px] truncate font-semibold">
                {currentUser?.name || 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full flex flex-col min-h-0 pb-28 md:pb-0">
        {activeTab === 'today' && (
          <TodayScreen 
            telemetry={telemetry}
            evaluation={evaluation}
            awenState={awenState}
            onSelectActivity={handleSelectActivity}
            onSelectMood={handleSelectMood}
            onOpenTalk={handleOpenTalk}
            onOpenInsights={() => setActiveTab('journey')}
            isNightMode={false}
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

      {/* ── MODALS ── */}
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
        onStartObservation={() => {
          handleToggleObservation(true);
          setIsObsModalOpen(false);
          if (currentUser) {
            localStorage.setItem(`awen_obs_modal_${currentUser.id}`, 'true');
          }
        }}
        onSkipObservation={() => {
          handleToggleObservation(false);
          setIsObsModalOpen(false);
          if (currentUser) {
            localStorage.setItem(`awen_obs_modal_${currentUser.id}`, 'true');
          }
        }}
      />
    </div>
  );
}
