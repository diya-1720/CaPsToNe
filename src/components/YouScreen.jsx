import React, { useState } from 'react';
import { ShieldCheck, Mail, Sparkles, Cpu, ChevronRight, X, User, Lock, LogOut, Globe, Radio, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TelemetryStream } from '../services/telemetryStream';
import { apiService } from '../services/apiService';

export const YouScreen = ({ 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onToggleObservation, 
  baselineData, 
  telemetryStream, 
  telemetry,
  onUpdateUserBaseline
}) => {
  const [isIoTModalOpen, setIsIoTModalOpen] = useState(false);
  const [isConfirmStopOpen, setIsConfirmStopOpen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [hwStatus, setHwStatus] = useState(telemetryStream?.hardwareState || 'DISCONNECTED');
  const [hwError, setHwError] = useState(telemetryStream?.lastHardwareError || null);

  const handleConnectSerial = async () => {
    try {
      setHwError(null);
      setHwStatus('CONNECTING');
      await telemetryStream?.connectWebSerial();
      setHwStatus('CONNECTED');
    } catch (e) {
      setHwStatus('ERROR');
      setHwError(e.message || 'Web Serial connection failed.');
    }
  };

  const handleDisconnectSerial = () => {
    telemetryStream?.disconnectHardware();
    setHwStatus('DISCONNECTED');
    setHwError(null);
  };

  const handleRunSelfTest = () => {
    const results = TelemetryStream.runParserSelfTest();
    setTestResults(results);
  };

  const isLearning = currentUser?.observation_mode || false;
  const confidenceState = currentUser?.baseline_confidence || baselineData?.confidence || (isLearning ? 'Learning' : 'Stable baseline');
  const obsDay = currentUser?.observation_day || (confidenceState === 'Stable baseline' ? 5 : confidenceState === 'Developing baseline' ? 3 : confidenceState === 'Early baseline' ? 2 : 1);
  const restingHrVal = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';
  const hrStdDevVal = baselineData?.hrStdDev ? Number(baselineData.hrStdDev).toFixed(1) : '4.8';

  // 4 Confidence Tiers
  const CONFIDENCE_TIERS = [
    { name: 'Learning', minSamples: 0, desc: 'Initial quiet sample collection' },
    { name: 'Early baseline', minSamples: 5, desc: 'Early resting signature active' },
    { name: 'Developing baseline', minSamples: 15, desc: 'Increasing personal accuracy' },
    { name: 'Stable baseline', minSamples: 30, desc: 'High-precision personal signature' }
  ];

  const currentTierIdx = CONFIDENCE_TIERS.findIndex(t => t.name.toLowerCase() === confidenceState.toLowerCase());

  const DISCOVERIES = [
    {
      minDay: 1,
      day: "Day 1",
      title: "Resting Heart Rate",
      quote: baselineData?.restingHr 
        ? `I've discovered your average resting heart rate is ${restingHrVal} bpm.`
        : "AWEN is observing your quiet periods to learn your true resting heart rate.",
      detail: "Observed during quiet resting states throughout your daily routine."
    },
    {
      minDay: 2,
      day: "Day 2",
      title: "Cognitive Effort Offset",
      quote: "Recognizing your natural heart rate variance during focused cognitive work.",
      detail: "Recognized as focus effort, preventing non-exertional false stress warnings."
    },
    {
      minDay: 3,
      day: "Day 3",
      title: "Movement Recovery Curve",
      quote: `Cardiovascular recovery speed tracked relative to your ${restingHrVal} bpm baseline.`,
      detail: "Your body settles smoothly back to your normal resting level."
    },
    {
      minDay: 4,
      day: "Day 4",
      title: "Staircase Exertion Filter",
      quote: "Stair climbing causes expected physical lift, returning to baseline in 90 seconds.",
      detail: "Activity context filter applied so stairs never trigger false stress alerts."
    }
  ];

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 lg:pb-12 space-y-6 animate-fadeIn">
      
      {/* 1. WHO YOU ARE (Profile Header) */}
      <div className="flex flex-wrap items-center justify-between neo-surface p-5 sm:p-6  border border-2 border-[var(--border-strong)] text-left gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16  bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] p-[1.5px] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111] shrink-0">
            <div className="w-full h-full bg-[#080d18] rounded-[14px] flex items-center justify-center text-[var(--text-primary)] font-heading font-bold text-xl sm:text-2xl">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>

          <div className="space-y-0.5 min-w-0">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">
              {currentUser?.name || 'Guest User'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-bold font-light truncate">
              {currentUser?.email || 'guest@awen.app'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5  bg-emerald-500/10 text-[var(--accent-green-dark)] text-xs font-medium border border-2 border-[var(--border-strong)]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Tier: {confidenceState}</span>
            </div>
          </div>
        </div>

        {/* Auth Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <button
              onClick={onLogout}
              className="p-2.5 sm:px-4 sm:py-2.5  neo-surface hover:bg-rose-500/20 text-[var(--text-secondary)] font-bold hover:text-rose-300 border border-2 border-[var(--border-strong)] transition-colors flex items-center gap-2 text-xs font-semibold active:scale-95"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5  bg-cyan-600 hover:bg-cyan-500 text-[var(--text-primary)] text-xs font-semibold shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]"
            >
              Sign In / Up
            </button>
          )}
        </div>
      </div>

      {/* 2. WHAT AWEN KNOWS (Personal Baseline Summary) */}
      <div className="neo-surface p-6 sm:p-7  border border-2 border-[var(--border-strong)] space-y-4 text-left shadow-[4px_4px_0px_#111]">
        <div className="flex items-center justify-between border-b border-2 border-[var(--border-strong)] pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--text-primary)]" />
            <span>What AWEN Knows About You</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono">
            {baselineData?.signatureId || "AWEN-SIG-8841"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5  bg-[var(--surface-secondary)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block">Resting HR</span>
            <span className="text-lg font-heading font-bold text-[var(--text-primary)] block">{restingHrVal} bpm</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Quiet Signature</span>
          </div>

          <div className="p-3.5  bg-[var(--surface-secondary)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block">Usual Variance</span>
            <span className="text-lg font-heading font-bold text-[var(--accent-green-dark)] block">±{hrStdDevVal} bpm</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Expected Spread</span>
          </div>

          <div className="p-3.5  bg-[var(--surface-secondary)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block">Observation Days</span>
            <span className="text-lg font-heading font-bold text-[var(--text-primary)] block">{obsDay} / 7 Days</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Baseline History</span>
          </div>

          <div className="p-3.5  bg-[var(--surface-secondary)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block">Stair Filter</span>
            <span className="text-lg font-heading font-bold text-amber-300 block">+34.0 bpm</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Exertion Offset</span>
          </div>
        </div>
      </div>

      {/* 3. HOW AWEN IS LEARNING (Confidence Progress Card) */}
      <div className="neo-surface p-6 sm:p-7  border border-purple-500/30 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-2 border-[var(--border-strong)] pb-3">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Baseline Learning Status</span>
          </span>
          <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-0.5  border ${isLearning ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-emerald-500/20 text-[var(--accent-green-dark)] border-2 border-[var(--border-strong)]'}`}>
            {confidenceState}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-bold font-light leading-relaxed">
          {isLearning 
            ? "AWEN is currently observing your daily resting pattern. As more quiet resting readings accumulate, your baseline confidence tier will automatically improve." 
            : "AWEN is actively comparing your live telemetry against your learned 5-day baseline signature."}
        </p>

        {/* 4 Confidence Tiers Stepper */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-4 gap-2 text-center">
            {CONFIDENCE_TIERS.map((tier, idx) => {
              const isCurrent = idx === (currentTierIdx >= 0 ? currentTierIdx : 3);
              const isPassed = idx <= (currentTierIdx >= 0 ? currentTierIdx : 3);

              return (
                <div key={tier.name} className="space-y-1">
                  <div className={`h-2  transition-all ${isCurrent ? 'bg-cyan-400 shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]' : isPassed ? 'bg-emerald-400' : 'bg-[var(--surface-primary)]'}`} />
                  <span className={`text-[10px] font-mono block truncate ${isCurrent ? 'text-[var(--text-primary)] font-bold' : isPassed ? 'text-[var(--text-secondary)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                    {tier.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          {isLearning ? (
            <button
              onClick={() => setIsConfirmStopOpen(true)}
              className="w-full py-2.5  bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-colors"
            >
              Exit Observation Mode
            </button>
          ) : (
            <button
              onClick={() => onToggleObservation(true)}
              className="w-full py-2.5  bg-purple-600 hover:bg-purple-500 text-[var(--text-primary)] text-xs font-semibold shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111] transition-all"
            >
              Restart Observation Mode
            </button>
          )}
        </div>
      </div>

      {/* 4. YOUR HARDWARE (Connection State Card) */}
      <div className="neo-surface p-6 sm:p-7  border border-2 border-[var(--border-strong)] space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-2 border-[var(--border-strong)] pb-3">
          <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--text-primary)]" />
            <span>Telemetry Hardware & Controls</span>
          </span>
          <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-0.5  border ${telemetry?.isHardware ? 'bg-emerald-500/20 border-2 border-[var(--border-strong)] text-[var(--accent-green-dark)]' : 'bg-cyan-500/20 border-2 border-[var(--border-strong)] text-[var(--text-primary)]'}`}>
            {telemetry?.isHardware ? 'ESP32 Hardware' : 'Demo Stream'}
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] font-bold font-light">
          Saved Timezone: <strong className="text-[var(--text-primary)] font-bold">{currentUser?.timezone || 'Asia/Kolkata'}</strong>
        </p>

        <button
          onClick={() => setIsIoTModalOpen(true)}
          className="w-full py-2.5  bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] border border-2 border-[var(--border-strong)] text-xs sm:text-sm font-medium text-[var(--text-primary)] font-bold flex items-center justify-between transition-colors px-4"
        >
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--text-primary)]" />
            <span>ESP32 Pairing & Telemetry Controls</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] font-bold" />
        </button>
      </div>

      {/* 5. ACCOUNT / PRIVACY STORY */}
      <div className="neo-surface p-6 sm:p-7  border border-2 border-[var(--border-strong)] space-y-3 text-left">
        <div className="flex items-center justify-between border-b border-2 border-[var(--border-strong)] pb-3">
          <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Mail className="w-4 h-4 text-pink-400" />
            <span>Monthly Letter from AWEN</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-bold">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-bold leading-relaxed font-light italic bg-[var(--surface-primary)] p-4  border border-2 border-[var(--border-strong)]">
          {`"Dear ${currentUser?.name?.split(' ')[0] || 'Friend'}, your body baseline is established around ${restingHrVal} bpm resting heart rate (${confidenceState}). Remember that brief quiet pauses during your daily routine help maintain your natural physiological rhythm."`}
        </p>
      </div>

          {/* Discovery Journey */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--text-primary)]" />
                <span>Discovery Journey</span>
              </h2>
              <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-bold">Baseline Progress</span>
            </div>

            <div className="space-y-3">
              {DISCOVERIES.map((disc, idx) => {
                const isUnlocked = obsDay >= disc.minDay;
                return (
                  <div key={idx} className={`neo-surface p-4 sm:p-5  border transition-all ${isUnlocked ? 'border-2 border-[var(--border-strong)]' : 'border-2 border-[var(--border-strong)] opacity-60'}`}>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <span className={`font-semibold uppercase tracking-wider ${isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{disc.day}</span>
                      <span className="text-[var(--text-secondary)] font-bold">{disc.title}</span>
                    </div>
                    {isUnlocked ? (
                      <>
                        <p className="text-xs sm:text-sm italic text-[var(--text-primary)] font-bold bg-[var(--surface-primary)] p-3  border border-2 border-[var(--border-strong)] font-light mt-1.5">
                          "{disc.quote}"
                        </p>
                        <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-bold leading-normal pt-1 font-light">
                          {disc.detail}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-[var(--text-secondary)] font-bold italic bg-[var(--surface-primary)] p-3  border border-2 border-[var(--border-strong)] font-light mt-1.5">
                        🔒 Unlocks on Observation Day {disc.minDay} — Keep device active during daily routine to unlock.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

      {/* Confirmation Modal to Stop Observation Mode */}
      {isConfirmStopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80  animate-fadeIn">
          <div className="relative w-full max-w-md neo-surface p-6  border border-purple-500/30 space-y-4 shadow-[6px_6px_0px_#111] text-left bg-[#0d1527]">
            <div className="flex items-center gap-2.5 text-purple-300 border-b border-2 border-[var(--border-strong)] pb-3">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <h3 className="font-heading text-base font-bold text-[var(--text-primary)]">Stop Observation Mode?</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-bold leading-relaxed font-light">
              Are you sure? AWEN will begin using your learned baseline signature for personalized observations.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmStopOpen(false)}
                className="px-4 py-2  bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] text-xs font-medium text-[var(--text-secondary)] font-bold border border-2 border-[var(--border-strong)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onToggleObservation(false);
                  setIsConfirmStopOpen(false);
                }}
                className="px-4 py-2  bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-[var(--text-primary)] shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111]"
              >
                Stop Learning
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* IoT Pairing & Hardware Controls Modal */}
      {isIoTModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
          <div className="relative w-full max-w-md neo-surface p-6 sm:p-8 shadow-[6px_6px_0px_#111] text-left max-h-[90dvh] overflow-y-auto border-2 border-[var(--border-strong)] bg-[var(--surface-primary)]">
            <div className="flex items-center justify-between border-b border-2 border-[var(--border-strong)] pb-3">
              <h3 className="font-heading text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--text-primary)]" />
                <span>ESP32 Hardware & Serial Controls</span>
              </h3>
              <button onClick={() => setIsIoTModalOpen(false)} className="p-1 text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hardware Web Serial Connection Section */}
            <div className="p-4  bg-[var(--surface-primary)] border border-2 border-[var(--border-strong)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-primary)] font-bold">Physical Hardware Connection</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5  border ${
                  telemetryStream?.isHardwareConnected 
                    ? 'bg-emerald-500/20 text-[var(--accent-green-dark)] border-2 border-[var(--border-strong)]'
                    : hwStatus === 'CONNECTING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : hwStatus === 'ERROR'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-slate-700/40 text-[var(--text-secondary)] font-bold border-2 border-[var(--border-strong)]'
                }`}>
                  {telemetryStream?.isHardwareConnected ? 'Connected (ESP32)' : hwStatus === 'CONNECTING' ? 'Connecting...' : hwStatus === 'ERROR' ? 'Error' : 'Disconnected'}
                </span>
              </div>

              <p className="text-[11px] text-[var(--text-secondary)] font-bold leading-relaxed font-light">
                Connect physical ESP32 (MAX30102 PPG + MPU6050 IMU) over USB Serial at 115200 baud. Supported in Google Chrome & Microsoft Edge.
              </p>

              {hwError && (
                <div className="p-3  bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{hwError}</span>
                </div>
              )}

              {telemetryStream?.isHardwareConnected ? (
                <button
                  onClick={handleDisconnectSerial}
                  className="w-full py-2  bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-semibold transition-colors"
                >
                  Disconnect ESP32 Serial Port
                </button>
              ) : (
                <button
                  onClick={handleConnectSerial}
                  className="w-full py-2.5  bg-cyan-600 hover:bg-cyan-500 text-[var(--text-primary)] text-xs font-semibold shadow-[2px_2px_0px_#111] shadow-[2px_2px_0px_#111] transition-all flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Connect ESP32 via Web Serial</span>
                </button>
              )}
            </div>

            {/* Serial Parser Self-Test Suite Section */}
            <div className="p-4  bg-[var(--surface-primary)] border border-2 border-[var(--border-strong)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-primary)] font-bold">Data Contract & Parser Test Suite</span>
                <button
                  onClick={handleRunSelfTest}
                  className="px-2.5 py-1  bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold transition-colors"
                >
                  Run Parser Self-Test
                </button>
              </div>

              {testResults ? (
                <div className="space-y-1.5 pt-1">
                  {testResults.map((tr, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] p-2  bg-slate-950/40 border border-2 border-[var(--border-strong)]">
                      <span className="text-[var(--text-secondary)] font-bold font-light">{tr.name}</span>
                      <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${tr.passed ? 'bg-emerald-500/20 text-[var(--accent-green-dark)]' : 'bg-rose-500/20 text-rose-300'}`}>
                        {tr.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-secondary)] font-bold italic font-light">
                  Click 'Run Parser Self-Test' to validate 6 packet parsing test cases (out-of-bounds BPM, malformed JSON, finger contact loss, accelerometer vector).
                </p>
              )}
            </div>

            {/* Simulator Controls */}
            <div className="space-y-2 text-xs pt-1">
              <label className="font-semibold text-[var(--text-secondary)] font-bold">Simulate Physical Activity Scenario:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { telemetryStream?.setScenario('normal'); setIsIoTModalOpen(false); }}
                  className="p-2.5  bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold border border-2 border-[var(--border-strong)] text-left"
                >
                  Resting (64 bpm)
                </button>
                <button
                  onClick={() => { telemetryStream?.setScenario('stairs'); setIsIoTModalOpen(false); }}
                  className="p-2.5  bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-left"
                >
                  Stairs (+34 bpm)
                </button>
                <button
                  onClick={() => { telemetryStream?.setScenario('caffeine'); setIsIoTModalOpen(false); }}
                  className="p-2.5  bg-cyan-500/10 hover:bg-cyan-500/20 text-[var(--text-primary)] border border-2 border-[var(--border-strong)] text-left"
                >
                  Caffeine Work
                </button>
                <button
                  onClick={() => { telemetryStream?.setScenario('exercise'); setIsIoTModalOpen(false); }}
                  className="p-2.5  bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-left"
                >
                  Running
                </button>
              </div>
            </div>

            {/* Dev Baseline Testing Controls */}
            <div className="space-y-2 text-xs pt-2 border-t border-2 border-[var(--border-strong)]">
              <label className="font-semibold text-purple-300 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Test Baseline Engine Calculation:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    const b = await apiService.seedTestReadings(currentUser?.id, 58);
                    if (b && onUpdateUserBaseline) onUpdateUserBaseline(b);
                  }}
                  className="p-2  bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 text-left text-[11px]"
                >
                  Seed 58 bpm Profile
                </button>
                <button
                  onClick={async () => {
                    const b = await apiService.seedTestReadings(currentUser?.id, 76);
                    if (b && onUpdateUserBaseline) onUpdateUserBaseline(b);
                  }}
                  className="p-2  bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-2 border-[var(--border-strong)] text-left text-[11px]"
                >
                  Seed 76 bpm Profile
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-2 border-[var(--border-strong)] flex justify-end">
              <button
                onClick={() => setIsIoTModalOpen(false)}
                className="px-4 py-2  bg-[var(--surface-primary)] text-xs font-medium text-[var(--text-primary)] hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
