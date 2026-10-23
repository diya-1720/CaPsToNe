import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Sliders, Cpu, Database, Info, ShieldCheck, 
  Moon, Sun, Gauge, FileText, Download, CheckCircle2, AlertTriangle, 
  RotateCcw, Sparkles, LogOut, Terminal, RefreshCw, Activity, Lock,
  Shield, Zap, Wifi
} from 'lucide-react';
import { TelemetryStream } from '../services/telemetryStream';
import { apiService } from '../services/apiService';
import { PrivacyModal } from './PrivacyModal';

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
  onOpenIoTModal,
  initialSubTab = 'general'
}) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [tempUnit, setTempUnit] = useState('celsius');
  const [anim60Fps, setAnim60Fps] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">Microcontroller</span>
                <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5">ESP32 Core</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Wi-Fi & Dual-Core MCU</span>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">PPG Sensor</span>
                <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5">MAX30100 Optical</span>
                <span className="text-[10px] text-[var(--text-secondary)]">I2C 0x57 · Pulse & SpO₂</span>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">IMU Accelerometer</span>
                <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5">MPU-6050 6-Axis</span>
                <span className="text-[10px] text-[var(--text-secondary)]">I2C 0x68 · Movement filter</span>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">Temperature</span>
                <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5">LM35 Analog</span>
                <span className="text-[10px] text-[var(--text-secondary)]">GPIO 34 ADC Precision</span>
              </div>

              <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block uppercase">Buzzer Alert</span>
                <span className="text-sm font-bold text-[var(--accent-green-dark)] font-mono block mt-0.5">Active Buzzer</span>
                <span className="text-[10px] text-[var(--text-secondary)]">GPIO 25 Anomaly Alarm</span>
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
            
            {/* 1. FIRST: HARDWARE SENSING ARCHITECTURE */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[var(--border-strong)] pb-3 gap-2">
                <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[var(--accent-green-dark)]" />
                  <span>Hardware Sensing Architecture &amp; IoT Suite</span>
                </h2>
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-2 border-[var(--accent-green-dark)] shadow-[2px_2px_0px_#111] w-fit">
                  Physical Biomedical Sensing Tier
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                AWEN interfaces with an integrated physical biomedical sensing unit powered by the <strong>ESP32-WROOM-32</strong> microcontroller. Real physiological vitals are acquired at hardware level and streamed continuously across dual local channels (Wi-Fi REST and direct USB CDC serial).
              </p>

              {/* Hardware Suite 6-Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                
                {/* 1. ESP32 Controller */}
                <div className="p-3.5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[var(--accent-green-dark)]" />
                      ESP32-WROOM-32
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[var(--surface-primary)] border border-[var(--border-strong)] px-1 py-0.5">240 MHz</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Dual-core Tensilica Xtensa LX6 SoC managing 400 kHz fast I2C bus acquisition, LM35 ADC reads, and dual Wi-Fi/Serial communication.
                  </p>
                </div>

                {/* 2. MAX30100/MAX30102 PPG */}
                <div className="p-3.5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-red-500" />
                      MAX30100 / MAX30102
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[var(--surface-primary)] border border-[var(--border-strong)] px-1 py-0.5">I2C 0x57</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Optical pulse oximeter with red and IR LEDs. Detects pulsatile arterial blood flow to calculate real-time Heart Rate (BPM) and SpO₂.
                  </p>
                </div>

                {/* 3. MPU-6050 IMU */}
                <div className="p-3.5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      MPU-6050 6-DOF IMU
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[var(--surface-primary)] border border-[var(--border-strong)] px-1 py-0.5">I2C 0x68</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Triple-axis accelerometer &amp; gyroscope. Evaluates 3D acceleration vector magnitude to distinguish physical activity from resting stress.
                  </p>
                </div>

                {/* 4. LM35 Temperature */}
                <div className="p-3.5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-blue-500" />
                      LM35 Precision Temp
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[var(--surface-primary)] border border-[var(--border-strong)] px-1 py-0.5">ADC GPIO 34</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Analog centigrade temperature sensor calibrated linearly at 10.0 mV/°C. Monitors peripheral skin thermal trends continuously.
                  </p>
                </div>

                {/* 5. SSD1306 OLED */}
                <div className="p-3.5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      0.96" SSD1306 OLED
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[var(--surface-primary)] border border-[var(--border-strong)] px-1 py-0.5">I2C 0x3C</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    128×64 matrix display operating on 400 kHz fast I2C bus. Provides on-device vital readouts, IP status, and heartbeat indicator.
                  </p>
                </div>

                {/* 6. Active Piezo Buzzer */}
                <div className="p-3.5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-purple-500" />
                      Active Piezo Buzzer
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-[var(--surface-primary)] border border-[var(--border-strong)] px-1 py-0.5">GPIO 25</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Acoustic alert transducer providing subtle localized audio feedback during anomalous resting events.
                  </p>
                </div>

              </div>

              {/* Ingestion Channels Banner */}
              <div className="p-3 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-[2px_2px_0px_#111]">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[var(--accent-green-dark)] shrink-0" />
                  <span className="text-[11px] font-medium text-[var(--text-primary)]">
                    Dual Ingestion: <strong>Wi-Fi REST</strong> (http://172.17.106.254/api/telemetry) &amp; <strong>W3C Web Serial USB CDC</strong> (115,200 baud).
                  </span>
                </div>
                <button
                  onClick={onOpenIoTModal}
                  className="px-3 py-1 font-bold uppercase tracking-wider text-[10px] bg-[var(--text-primary)] text-white border-2 border-[var(--border-strong)] hover:bg-[var(--accent-green-dark)] shadow-[2px_2px_0px_#111] transition-all whitespace-nowrap"
                >
                  Configure Hardware
                </button>
              </div>
            </div>

            {/* 2. SECOND: PRIVACY & DATA SOVEREIGNTY NOTE */}
            <div className="pt-4 border-t-2 border-[var(--border-strong)] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
                <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--accent-green-dark)]" />
                  <span>Privacy &amp; Data Sovereignty Note</span>
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                  Local-First Guarantee
                </span>
              </div>

              <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                
                {/* Core Sovereignty Card */}
                <div className="p-4 bg-[var(--accent-green-bg)] border-2 border-[var(--accent-green-dark)] text-[var(--text-primary)] space-y-2.5 shadow-[3px_3px_0px_#111]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-dark)]" />
                    <h3 className="font-bold text-sm text-[var(--accent-green-dark)] uppercase tracking-wide">
                      Client-First Data Sovereignty Pledge
                    </h3>
                  </div>
                  <p>
                    AWEN is intentionally engineered as a private, local-first platform. Your physiological readings, daily reflections, and emotional state logs belong exclusively to you.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 bg-[var(--surface-primary)] border border-[var(--border-strong)]">
                      <strong>• No Data Brokering:</strong> Biometrics are never sold, licensed, or shared with advertisers or insurance firms.
                    </div>
                    <div className="p-2 bg-[var(--surface-primary)] border border-[var(--border-strong)]">
                      <strong>• Local SQLite Database:</strong> Data is persisted in your local relational SQLite database (<strong>awen.db</strong>).
                    </div>
                    <div className="p-2 bg-[var(--surface-primary)] border border-[var(--border-strong)]">
                      <strong>• Zero Trackers:</strong> No third-party analytics pixels (Google Analytics, Segment, Meta) are embedded.
                    </div>
                    <div className="p-2 bg-[var(--surface-primary)] border border-[var(--border-strong)]">
                      <strong>• Private Network Streaming:</strong> Telemetry streams over your local LAN or direct USB cable without external relays.
                    </div>
                  </div>
                </div>

                {/* Non-Diagnostic Safety */}
                <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] space-y-2 shadow-[2px_2px_0px_#111]">
                  <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[var(--accent-green-dark)]" />
                    <span>Non-Diagnostic Safety &amp; Medical Boundaries</span>
                  </h3>
                  <p>
                    AWEN is an adaptive companion for personal wellness and emotional recovery. It does not provide medical diagnoses, treatment plans, or clinical disease classifications. Whenever acute physiological anomalies or distress are registered, AWEN automatically activates calm safety guardrails recommending professional healthcare consultation.
                  </p>
                </div>

                {/* Personal Baseline Thesis */}
                <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] space-y-2 shadow-[2px_2px_0px_#111]">
                  <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--accent-green-dark)]" />
                    <span>The Personal Baseline Thesis</span>
                  </h3>
                  <p>
                    Traditional health platforms compare all users to generic medical population thresholds (e.g. <i>"resting heart rate must be between 60 and 100"</i>). AWEN instead learns <strong>your personal baseline</strong> across quiet resting windows, identifying when today deviates from <em>your normal</em> rather than a population average.
                  </p>
                </div>

                {/* Open Modal Trigger Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-[var(--accent-green-dark)]" />
                    <span>Open Full Privacy &amp; Data Sovereignty Note (Modal)</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Account Action */}
            <div className="pt-4 border-t-2 border-[var(--border-strong)] flex items-center justify-between">
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

      {/* Privacy & Data Sovereignty Note Modal */}
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

    </div>
  );
};
