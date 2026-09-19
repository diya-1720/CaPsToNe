import React, { useState } from 'react';
import { 
  Settings, User, Sliders, Cpu, Database, Info, ShieldCheck, 
  Moon, Sun, Gauge, FileText, Download, CheckCircle2, AlertTriangle, 
  RotateCcw, Sparkles, LogOut, Terminal, RefreshCw, Activity, Lock
} from 'lucide-react';
import { TelemetryStream } from '../services/telemetryStream';
import { apiService } from '../services/apiService';

export const SettingsScreen = ({
  currentUser,
  onLogout,
  onOpenAuth,
  onToggleObservation,
  baselineData,
  telemetryStream,
  telemetry,
  onUpdateUserBaseline,
  onOpenReportModal,
  onOpenIoTModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [tempUnit, setTempUnit] = useState('celsius');
  const [anim60Fps, setAnim60Fps] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  const restingHrVal = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';
  const confidenceState = currentUser?.baseline_confidence || baselineData?.confidence || 'Stable baseline';
  const isLearning = currentUser?.observation_mode || false;
  const isHardware = telemetry?.isHardware || false;

  const handleRunSelfTest = () => {
    const results = TelemetryStream.runParserSelfTest();
    setTestResults(results);
  };

  const handleSeed = async (bpm) => {
    try {
      const updated = await apiService.seedTestReadings(currentUser?.id, bpm);
      if (updated && onUpdateUserBaseline) {
        onUpdateUserBaseline(updated);
      }
      setSeedSuccessMsg(`Successfully calibrated baseline to ${bpm} BPM profile.`);
      setTimeout(() => setSeedSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJson = () => {
    const dataToExport = {
      user: currentUser,
      baseline: baselineData,
      telemetry: telemetry,
      exportDate: new Date().toISOString(),
      source: 'AWEN Local SQLite'
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awen_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-16 text-left space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="border-b-2 border-[var(--border-strong)] pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Settings className="w-7 h-7 text-[var(--text-primary)]" />
            <span>Settings & System Preferences</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
            Configure display units, hardware serial ports, baseline calibration, and clinical data export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
            AWEN v2.4.0 (Local SQLite)
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-light)] pb-2">
        {[
          { id: 'general', label: 'General & Display', icon: Sliders },
          { id: 'baseline', label: 'Baseline & Observation', icon: ShieldCheck },
          { id: 'hardware', label: 'ESP32 & Web Serial', icon: Cpu },
          { id: 'data', label: 'Data & Reports', icon: Database },
          { id: 'about', label: 'About & Privacy', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold border transition-all ${
                isActive 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]' 
                  : 'bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] border-[var(--border-strong)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: GENERAL & DISPLAY */}
      {activeSubTab === 'general' && (
        <div className="space-y-6">
          <div className="neo-card space-y-6">
            <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <Sliders className="w-5 h-5 text-[var(--accent-green-dark)]" />
              <span>Display Units & Aesthetics</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Temperature Unit */}
              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-3">
                <label className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] block">
                  Temperature Display Unit
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTempUnit('celsius')}
                    className={`flex-1 py-2 text-xs font-bold border ${tempUnit === 'celsius' ? 'bg-[var(--accent-green)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]' : 'bg-[var(--surface-primary)] border-[var(--border-strong)]'}`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    onClick={() => setTempUnit('fahrenheit')}
                    className={`flex-1 py-2 text-xs font-bold border ${tempUnit === 'fahrenheit' ? 'bg-[var(--accent-green)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]' : 'bg-[var(--surface-primary)] border-[var(--border-strong)]'}`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">Standard clinical physiological skin telemetry reading unit.</p>
              </div>

              {/* 60 FPS Micro-Animations */}
              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-3">
                <label className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] block">
                  60 FPS Vector Animations
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnim60Fps(true)}
                    className={`flex-1 py-2 text-xs font-bold border ${anim60Fps ? 'bg-[var(--accent-green)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]' : 'bg-[var(--surface-primary)] border-[var(--border-strong)]'}`}
                  >
                    Enabled (60 FPS)
                  </button>
                  <button
                    onClick={() => setAnim60Fps(false)}
                    className={`flex-1 py-2 text-xs font-bold border ${!anim60Fps ? 'bg-[var(--accent-green)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]' : 'bg-[var(--surface-primary)] border-[var(--border-strong)]'}`}
                  >
                    Reduced Motion
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">Controls Mascot mochi breathing, blinking, and pulse aura renders.</p>
              </div>
            </div>

            {/* Design Language Banner */}
            <div className="p-4 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
              <span className="text-xs font-mono font-bold text-[var(--accent-green-dark)] uppercase">Design Theme Architecture</span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                AWEN utilizes an authentic <strong>Neo-Brutalist High-Contrast</strong> theme (warm off-white <code className="bg-[var(--surface-secondary)] px-1 py-0.5 text-[var(--text-primary)]">#F4F4EF</code>, solid 2px ink borders, 60 FPS Canvas Oscilloscope, and zero clutter) to emphasize physiological clarity over distraction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BASELINE & OBSERVATION */}
      {activeSubTab === 'baseline' && (
        <div className="space-y-6">
          <div className="neo-card space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3">
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--accent-green-dark)]" />
                <span>Personal Baseline Signature</span>
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border border-[var(--border-strong)]">
                {confidenceState}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] block">Resting HR</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)]">{restingHrVal} <span className="text-xs font-normal">BPM</span></span>
              </div>
              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] block">Usual Variance</span>
                <span className="text-xl font-heading font-bold text-[var(--accent-green-dark)]">±{baselineData?.hrStdDev || '4.8'} <span className="text-xs font-normal">BPM</span></span>
              </div>
              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] block">Quiet Samples</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)]">{baselineData?.samples || 28}</span>
              </div>
              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] block">Observation Mode</span>
                <span className="text-xl font-heading font-bold text-[var(--text-primary)]">{isLearning ? 'Active' : 'Settled'}</span>
              </div>
            </div>

            {/* Toggle Observation Mode */}
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-strong)] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Observation Mode</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  When Observation Mode is active, AWEN holds broad non-diagnostic baseline confidence while accumulating quiet resting patterns before generating deep observations.
                </p>
              </div>
              <button
                onClick={() => onToggleObservation(!isLearning)}
                className={`neo-btn px-4 py-2 text-xs font-bold ${isLearning ? 'neo-btn-primary' : 'bg-[var(--surface-primary)]'}`}
              >
                {isLearning ? 'Stop Observation Mode' : 'Restart Observation Mode'}
              </button>
            </div>

            {/* DEV/TEST ONLY Baseline Calibration */}
            <div className="p-4 bg-[var(--surface-secondary)] border-2 border-dashed border-amber-600/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-600" />
                  <span>[DEV/TEST ONLY] Baseline Calibration Tool</span>
                </h3>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-400 px-2 py-0.5">
                  DEBUG UTILITY
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Developer testing only. Calibrate personal baseline parameters directly into SQLite without waiting 7 days of observation. Not medical data.
              </p>

              {seedSuccessMsg && (
                <div className="p-2.5 bg-[var(--accent-green-bg)] border border-[var(--accent-green)] text-[var(--accent-green-dark)] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{seedSuccessMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => handleSeed(58)}
                  className="neo-btn px-4 py-2 text-xs font-bold bg-[var(--surface-primary)] hover:bg-[var(--surface-tertiary)]"
                >
                  Set Test Baseline: 58 BPM
                </button>
                <button
                  onClick={() => handleSeed(68)}
                  className="neo-btn px-4 py-2 text-xs font-bold bg-[var(--surface-primary)] hover:bg-[var(--surface-tertiary)]"
                >
                  Set Test Baseline: 68 BPM
                </button>
                <button
                  onClick={() => handleSeed(78)}
                  className="neo-btn px-4 py-2 text-xs font-bold bg-[var(--surface-primary)] hover:bg-[var(--surface-tertiary)]"
                >
                  Set Test Baseline: 78 BPM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HARDWARE & ESP32 */}
      {activeSubTab === 'hardware' && (
        <div className="space-y-6">
          <div className="neo-card space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-3">
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[var(--accent-green-dark)]" />
                <span>ESP32 Physical Hardware & Web Serial</span>
              </h2>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 border ${isHardware ? 'bg-[var(--accent-green)] text-[var(--text-primary)] border-[var(--border-strong)]' : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] border-[var(--border-strong)]'}`}>
                {isHardware ? '● ESP32 LINKED' : '○ DISCONNECTED'}
              </span>
            </div>

            {/* Hardware Specification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">Microcontroller</span>
                <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5">ESP32-WROOM-32</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Dual-Core Tensilica LX6</span>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">PPG Sensor</span>
                <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5">MAX30102 Optical</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Red + IR LED photodiode</span>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">IMU Accelerometer</span>
                <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5">MPU-6050 6-Axis</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Movement context filter</span>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">Baud Rate</span>
                <span className="text-sm font-bold text-[var(--accent-green-dark)] font-mono block mt-0.5">115,200 bps</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Standard USB CDC Serial</span>
              </div>
            </div>

            {/* Connection Actions */}
            <div className="p-5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Web Serial Direct USB Bridge</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Connect an ESP32 microcontroller over USB directly to this browser tab. Zero local bridge apps required.
                  </p>
                </div>
                <button
                  onClick={onOpenIoTModal}
                  className="neo-btn neo-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Open Hardware Pairing Console</span>
                </button>
              </div>
            </div>

            {/* Parser Self-Test */}
            <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[var(--accent-green-dark)]" />
                  <span>Firmware Data Contract Verification</span>
                </h3>
                <button
                  onClick={handleRunSelfTest}
                  className="neo-btn px-3 py-1.5 text-xs font-bold bg-[var(--surface-primary)]"
                >
                  Run 6-Case Parser Test
                </button>
              </div>

              {testResults ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {testResults.map((tr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--surface-primary)] border border-[var(--border-strong)] text-xs">
                      <span className="font-mono text-[11px] text-[var(--text-primary)]">{tr.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold border ${tr.passed ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--accent-green)]' : 'bg-[var(--accent-danger-bg)] text-[var(--accent-danger)] border-[var(--accent-danger)]'}`}>
                        {tr.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-secondary)] italic">
                  Run the parser test to verify out-of-bounds BPM rejections, malformed JSON detection, and accelerometer vector sanity.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DATA & REPORTS */}
      {activeSubTab === 'data' && (
        <div className="space-y-6">
          <div className="neo-card space-y-6">
            <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <Database className="w-5 h-5 text-[var(--accent-green-dark)]" />
              <span>Clinical Data Export & Storage</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PDF Report Trigger */}
              <div className="p-5 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-3">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
                  <FileText className="w-5 h-5 text-[var(--accent-green-dark)]" />
                  <span>Clinical Health Report (PDF)</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Generate a printable clinical report summarizing your personal baseline signature, heart rate distribution, and observation log.
                </p>
                <button
                  onClick={onOpenReportModal}
                  className="neo-btn neo-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Printable Report</span>
                </button>
              </div>

              {/* JSON Data Export */}
              <div className="p-5 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-3">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-sm">
                  <Download className="w-5 h-5 text-[var(--accent-green-dark)]" />
                  <span>Raw Data Export (JSON)</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Export your full SQLite physiological telemetry readings, user baselines, and timestamped journal entries to a structured JSON file.
                </p>
                <button
                  onClick={handleExportJson}
                  className="neo-btn w-full py-2.5 text-xs font-bold bg-[var(--surface-primary)] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download SQLite Export (.json)</span>
                </button>
              </div>
            </div>

            {/* Storage Architecture */}
            <div className="p-4 bg-[var(--surface-primary)] border border-[var(--border-strong)] space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-secondary)]">Local Database Architecture</span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Database file: <code className="bg-[var(--surface-secondary)] px-1.5 py-0.5 font-mono text-[var(--text-primary)] font-bold">backend/awen.db</code> (SQLite 3). 
                Zero third-party cloud data transmission. Your personal telemetry remains exclusively on your local machine.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ABOUT & PRIVACY */}
      {activeSubTab === 'about' && (
        <div className="space-y-6">
          <div className="neo-card space-y-6">
            <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-light)] pb-3">
              <Info className="w-5 h-5 text-[var(--accent-green-dark)]" />
              <span>About AWEN & Non-Diagnostic Philosophy</span>
            </h2>

            <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              <div className="p-4 bg-[var(--accent-green-bg)] border border-[var(--accent-green)] text-[var(--text-primary)] space-y-2">
                <h3 className="font-bold text-sm text-[var(--accent-green-dark)]">The Personal Baseline Thesis</h3>
                <p>
                  Traditional consumer health wearables compare your vitals to population averages (e.g. "resting heart rate should be between 60 and 100").
                  AWEN learns <strong>your personal baseline</strong> across quiet resting windows. An elevated heart rate of 82 BPM may be completely normal for one individual, while signaling fatigue for another.
                </p>
              </div>

              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-2">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Non-Diagnostic Safety Guarantee</h3>
                <p>
                  AWEN is an adaptive wellness companion and emotional navigator. It does not provide medical diagnoses, clinical treatments, or disease classifications. Whenever acute physiological symptoms or distress are mentioned, AWEN immediately triggers medical safety guardrails recommending professional healthcare evaluation.
                </p>
              </div>

              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-2">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Zero Telemetry Trackers</h3>
                <p>
                  No third-party analytics (Google Analytics, Mixpanel, Segment) or external tracking pixels are embedded. Your physiological telemetry is processed on local endpoints.
                </p>
              </div>
            </div>

            {/* Account Action */}
            <div className="pt-4 border-t border-[var(--border-light)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                Logged in as: <strong>{currentUser?.email || 'guest@awen.local'}</strong>
              </span>
              {currentUser && (
                <button
                  onClick={onLogout}
                  className="neo-btn px-4 py-2 text-xs font-bold flex items-center gap-2 text-[var(--accent-danger)]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of AWEN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
