import React, { useState, useEffect, useRef } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { TodayScreen } from './components/TodayScreen';
import { JourneyScreen } from './components/JourneyScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { TalkScreen } from './components/TalkScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { YouScreen } from './components/YouScreen';
import { AuthModal } from './components/AuthModal';
import { ObservationModal } from './components/ObservationModal';
import { LandingPage } from './components/LandingPage';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { HealthReportModal } from './components/HealthReportModal';
import { IoTConfigModal } from './components/IoTConfigModal';

import { 
  Home, Sun, Compass, BarChart3, Bot, FileText, Settings, User, 
  ArrowLeft, Search, Bell, Cpu, ShieldCheck, ChevronDown, LogOut, 
  Sparkles, ExternalLink
} from 'lucide-react';

import { BaselineEngine, DEFAULT_BASELINE } from './services/baselineEngine';
import { TelemetryStream } from './services/telemetryStream';
import { stateEngine, AWEN_STATES } from './services/stateEngine';
import { apiService } from './services/apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(apiService.currentUser);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isIoTModalOpen, setIsIoTModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const baselineEngineRef = useRef(new BaselineEngine(DEFAULT_BASELINE));
  const telemetryStreamRef = useRef(null);

  // Initial telemetry: disconnected with null values (truthful hardware initial state)
  const [telemetry, setTelemetry] = useState({
    heartRate: null,
    spo2: null,
    temperature: null,
    hasTemperatureSensor: false,
    accel: { x: 0.0, y: 0.0, z: 1.0 },
    accelMagnitude: 1.0,
    isMoving: false,
    fingerDetected: false,
    activity: "Resting",
    mood: "Normal",
    isHardware: false,
    timestamp: null
  });

  const [latestReading, setLatestReading] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [awenState, setAwenState] = useState(null);
  const [userBaseline, setUserBaseline] = useState(null);

  // Keyboard shortcut listener: Ctrl+K / Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Poll for latest real sensor reading persisted in SQLite
  useEffect(() => {
    if (!currentUser) return;
    let isSubscribed = true;

    async function loadLatest() {
      try {
        const res = await apiService.getLatestReading();
        if (isSubscribed) {
          if (res && res.bpm) {
            setLatestReading(res);
          } else {
            setLatestReading(null);
          }
        }
      } catch (err) {
        // silent catch
      }
    }

    loadLatest();
    const interval = setInterval(loadLatest, 4000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  // Restore Active User Session & Baseline from SQLite Backend / Local Storage
  useEffect(() => {
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
    }

    initAuth();
  }, []);

  // Initialize Telemetry Stream (Web Serial ESP32 hardware connector)
  useEffect(() => {
    let lastPersistTime = 0;

    const stream = new TelemetryStream(
      (reading) => {
        setTelemetry({
          ...reading,
          isHardware: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });

        // Throttled persistence of real hardware readings to SQLite (every 3.5 seconds when valid pulse is verified)
        const now = Date.now();
        if (reading.fingerDetected && reading.heartRate && (now - lastPersistTime > 3500)) {
          lastPersistTime = now;
          apiService.saveReading(reading).catch((e) => console.warn("Auto-persist reading failed:", e));
        }
      },
      (stateObj) => {
        if (stateObj.isHardwareConnected) {
          setTelemetry(prev => ({
            ...prev,
            isHardware: true
          }));
        } else {
          setTelemetry(prev => ({
            ...prev,
            heartRate: null,
            spo2: null,
            temperature: null,
            hasTemperatureSensor: false,
            accel: { x: 0.0, y: 0.0, z: 1.0 },
            accelMagnitude: 1.0,
            isMoving: false,
            fingerDetected: false,
            isHardware: false
          }));
        }
      }
    );

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
      if (baselineEngineRef.current) {
        const evalResult = await apiService.analyzeTelemetry(telemetry, baselineEngineRef.current, userBaseline);
        if (!isMounted) return;

        // Compute AWEN State Engine Object (LEARNING, BALANCED, ACTIVE, WATCHFUL, WIND_DOWN)
        // MPU-6050 physical movement dynamically drives ACTIVE state
        const derivedActivity = telemetry?.isMoving ? "Walking" : (telemetry?.activity || "Resting");
        const computedState = stateEngine.evaluateState({
          observationMode: currentUser?.observation_mode || false,
          daysObserved: currentUser?.observation_day || 5,
          heartRate: telemetry?.heartRate || baselineEngineRef.current.baseline.restingHr,
          baselineHeartRate: baselineEngineRef.current.baseline.restingHr,
          activityState: derivedActivity,
          isNightMode: false
        });

        setAwenState(prevState => {
          if (prevState && prevState.wellnessState === computedState.wellnessState && prevState.auraColor === computedState.auraColor) {
            return prevState;
          }
          return computedState;
        });

        if (evalResult) {
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
    setActiveTab('home');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  const handleOpenTalk = () => {
    setPreviousTab(activeTab === 'talk' ? 'home' : activeTab);
    setActiveTab('talk');
  };

  const handleBackFromTalk = () => {
    setActiveTab(previousTab || 'home');
  };

  // If user is unauthenticated, render the Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage 
          onGetStarted={() => setIsAuthOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onTryDemo={() => setIsAuthOpen(true)}
          onStartDemo={() => setIsAuthOpen(true)}
        />

        <AuthModal 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Navigation Items Definition (7 Editorial Buttons)
  const NAV_ITEMS = [
    { id: 'home', num: '01', label: 'Home', icon: Home, isAction: false },
    { id: 'today', num: '02', label: 'Today', icon: Sun, isAction: false },
    { id: 'journey', num: '03', label: 'Journey', icon: Compass, isAction: false },
    { id: 'insights', num: '04', label: 'Insights', icon: BarChart3, isAction: false },
    { id: 'talk', num: '05', label: 'AI Companion', icon: Bot, isAction: false },
    { id: 'reports', num: '06', label: 'Reports', icon: FileText, isAction: true, onClick: () => setIsReportModalOpen(true) },
    { id: 'settings', num: '07', label: 'Settings', icon: Settings, isAction: false },
  ];

  // Screen Title for Breadcrumb Header
  const getScreenTitle = () => {
    switch (activeTab) {
      case 'home': return '01 / Executive Overview';
      case 'today': return '02 / Daily Chronology & Recovery';
      case 'journey': return '03 / 7-Day Baseline Evolution';
      case 'insights': return '04 / Comparative Analytics & Dispersion';
      case 'talk': return '05 / AI Wellness Companion';
      case 'settings': return '07 / System Preferences & Hardware';
      case 'you': return 'Profile / Personal Baseline Corridor';
      default: return 'AWEN Dashboard';
    }
  };

  const confidenceState = currentUser?.baseline_confidence || baselineEngineRef.current?.baseline?.confidence || 'Stable baseline';

  return (
    <div 
      className="min-h-[100dvh] w-full flex font-sans relative antialiased"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      
      {/* ── DESKTOP LEFT SIDEBAR NAVIGATION (w-56 lg:w-60, hidden md:flex) ── */}
      <aside className="hidden md:flex flex-col justify-between w-56 lg:w-60 shrink-0 border-r-2 border-[var(--border-strong)] bg-[var(--surface-primary)] h-screen sticky top-0 z-30 select-none">
        
        {/* Zone 1: Brand Nexus */}
        <div className="p-4 lg:p-5 border-b-2 border-[var(--border-strong)] space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-lg text-[var(--accent-green-dark)] font-mono animate-pulse">✦</span>
            <span className="font-heading text-xl font-bold tracking-wider uppercase text-[var(--text-primary)]">
              AWEN
            </span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] font-bold">
            Physiological Baseline
          </p>
        </div>

        {/* Zone 2: Navigation Stack (7 Editorial Buttons) */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto" aria-label="Desktop Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction && item.onClick) {
                    item.onClick();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold transition-all border-2 ${
                  isActive
                    ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]'
                    : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`text-[10px] font-mono opacity-60 ${isActive ? 'text-[var(--accent-green)]' : ''}`}>
                    {item.num}
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent-green)]' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: System Status & Philosophy Block */}
        <div className="p-4 border-t-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-2.5">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
              Confidence Tier
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-green-dark)] shrink-0" />
              <span className="truncate">{confidenceState}</span>
            </div>
          </div>

          <button
            onClick={() => setIsIoTModalOpen(true)}
            className={`w-full text-left p-2 border border-2 text-[10px] font-mono font-bold flex items-center gap-2 transition-all ${
              telemetry.isHardware
                ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--accent-green-dark)]'
                : 'bg-red-50 text-red-700 border-red-600 shadow-[1px_1px_0px_#dc2626] hover:bg-red-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${telemetry.isHardware ? 'bg-[var(--accent-green-dark)] animate-pulse' : 'bg-red-600'}`} />
            <span className="truncate">{telemetry.isHardware ? 'ESP32 Linked' : 'Hardware Disconnected'}</span>
          </button>

          <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed italic border-t border-[var(--border-light)] pt-1.5">
            "Compares against your personal normal, not generic medical thresholds."
          </p>
        </div>

      </aside>

      {/* ── MAIN VIEWPORT (Header + Content) ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* ── TOP GLOBAL HEADER ROW ── */}
        <header className="sticky top-0 z-40 w-full bg-[var(--bg-base)] border-b-2 border-[var(--border-strong)] pt-safe">
          <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            
            {/* Left: Mobile Brand Pill & Screen Title */}
            <div className="flex items-center gap-3 min-w-0">
              {activeTab === 'talk' ? (
                <button
                  onClick={handleBackFromTalk}
                  className="neo-btn px-2.5 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              ) : (
                <div className="md:hidden flex items-center gap-2 px-2.5 py-1 bg-[var(--text-primary)] text-[var(--bg-base)] border-2 border-[var(--border-strong)] rounded-sm shadow-[2px_2px_0px_#111]">
                  <span className="text-xs font-mono text-[var(--accent-green)]">✦</span>
                  <span className="font-heading font-bold text-xs tracking-widest uppercase">AWEN</span>
                </div>
              )}

              {/* Breadcrumb Screen Title */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {getScreenTitle()}
                </span>
              </div>
            </div>

            {/* Center: Command Palette Capsule Button (Ctrl + K) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-all text-xs font-medium text-[var(--text-secondary)] max-w-xs sm:max-w-sm w-full mx-2"
              title="Search features or jump to tab (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-[var(--text-primary)] shrink-0" />
              <span className="truncate hidden sm:inline">Search features, vitals...</span>
              <span className="truncate sm:hidden">Search...</span>
              <kbd className="ml-auto px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-[var(--surface-secondary)] border border-[var(--border-strong)] shadow-[1px_1px_0px_#111] shrink-0">
                Ctrl K
              </kbd>
            </button>

            {/* Right: Hardware Status Pill, Notification Bell, User Profile Menu */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Hardware Status Pill (prominent red when disconnected) */}
              <button
                onClick={() => setIsIoTModalOpen(true)}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 border-2 rounded-sm shrink-0 hidden lg:inline-flex items-center gap-1.5 uppercase tracking-wider transition-all ${
                  telemetry.isHardware
                    ? 'bg-[var(--accent-green)] text-[var(--text-primary)] border-[var(--border-strong)]'
                    : 'bg-red-50 text-red-700 border-red-600 shadow-[1px_1px_0px_#dc2626] hover:bg-red-100'
                }`}
                title="Click to pair ESP32 hardware via Web Serial"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${telemetry.isHardware ? 'bg-black' : 'bg-red-600 animate-pulse'}`} />
                <span>{telemetry.isHardware ? 'ESP32 Live' : 'Hardware Not Connected'}</span>
              </button>

              {/* Notification Bell Dropdown Container */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(prev => !prev)}
                  className="p-2 neo-surface hover:bg-[var(--surface-secondary)] border border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-all relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-[var(--text-primary)]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--accent-green)] border border-[var(--border-strong)] rounded-full" />
                </button>

                <NotificationCenter 
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    setIsNotificationOpen(false);
                  }}
                />
              </div>

              {/* User Profile Dropdown Container */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                  className="neo-btn px-2.5 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] flex items-center justify-center font-bold text-[10px]">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate font-bold">
                    {currentUser?.name?.split(' ')[0] || 'Profile'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-11 z-50 w-52 neo-surface border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] animate-fadeIn text-left divide-y divide-[var(--border-light)] text-xs">
                    <div className="p-3 space-y-0.5 bg-[var(--surface-secondary)]">
                      <span className="font-bold text-[var(--text-primary)] block truncate">
                        {currentUser?.name || 'Local User'}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-secondary)] block truncate">
                        {currentUser?.email || 'guest@awen.local'}
                      </span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => { setActiveTab('you'); setIsProfileDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left font-semibold hover:bg-[var(--surface-secondary)] flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile & Baseline</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('settings'); setIsProfileDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left font-semibold hover:bg-[var(--surface-secondary)] flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>System Preferences</span>
                      </button>
                      <button
                        onClick={() => { setIsReportModalOpen(true); setIsProfileDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left font-semibold hover:bg-[var(--surface-secondary)] flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Clinical Health Report</span>
                      </button>
                      <button
                        onClick={() => { setIsIoTModalOpen(true); setIsProfileDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left font-semibold hover:bg-[var(--surface-secondary)] flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Pair ESP32 Hardware</span>
                      </button>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-left font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </header>

        {/* ── SCREEN ROUTING VIEWPORT ── */}
        <main className="flex-1 w-full flex flex-col min-h-0 pb-28 md:pb-8">
          
          {/* TAB 01: HOME (Executive Overview) */}
          {activeTab === 'home' && (
            <HomeScreen
              telemetry={telemetry}
              latestReading={latestReading}
              evaluation={evaluation}
              awenState={awenState}
              baselineData={baselineEngineRef.current?.baseline}
              currentUser={currentUser}
              telemetryStream={telemetryStreamRef.current}
              onOpenTalk={handleOpenTalk}
              onOpenHardware={() => setIsIoTModalOpen(true)}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectActivity={handleSelectActivity}
              onSelectMood={handleSelectMood}
            />
          )}

          {/* TAB 02: TODAY (Chronology & Recovery) */}
          {activeTab === 'today' && (
            <TodayScreen 
              telemetry={telemetry}
              evaluation={evaluation}
              awenState={awenState}
              onSelectActivity={handleSelectActivity}
              onSelectMood={handleSelectMood}
              onOpenTalk={handleOpenTalk}
              onOpenInsights={() => setActiveTab('insights')}
              isNightMode={false}
              currentUser={currentUser}
              baselineData={baselineEngineRef.current?.baseline}
              telemetryStream={telemetryStreamRef.current}
            />
          )}

          {/* TAB 03: JOURNEY (7-Day Baseline Evolution) */}
          {activeTab === 'journey' && (
            <JourneyScreen 
              baselineData={baselineEngineRef.current?.baseline}
              evaluation={evaluation}
              currentUser={currentUser}
            />
          )}

          {/* TAB 04: INSIGHTS (Comparative Analytics & Dispersion) */}
          {activeTab === 'insights' && (
            <InsightsScreen
              baselineData={baselineEngineRef.current?.baseline}
              evaluation={evaluation}
              currentUser={currentUser}
              telemetry={telemetry}
            />
          )}

          {/* TAB 05: TALK (AI Companion) */}
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

          {/* TAB 07: SETTINGS & PREFERENCES */}
          {activeTab === 'settings' && (
            <SettingsScreen
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
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenIoTModal={() => setIsIoTModalOpen(true)}
            />
          )}

          {/* TAB: YOU (Baseline Profile Detail) */}
          {activeTab === 'you' && (
            <YouScreen 
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenAuth={() => setIsAuthOpen(true)}
              onToggleObservation={handleToggleObservation}
              onProfileUpdated={(updated) => {
                setCurrentUser(updated);
                apiService.saveLocalSession(updated);
              }}
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

      </div>

      {/* ── MOBILE BOTTOM NAVIGATION (md:hidden) ── */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* ── GLOBAL MODALS ── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenHardware={() => setIsIoTModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      <HealthReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        baselineData={baselineEngineRef.current?.baseline}
        telemetry={telemetry}
      />

      <IoTConfigModal
        isOpen={isIoTModalOpen}
        onClose={() => setIsIoTModalOpen(false)}
        telemetryStream={telemetryStreamRef.current}
        telemetry={telemetry}
      />

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
