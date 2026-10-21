import React from 'react';
import { X, Shield, Lock, Database, EyeOff, FileText, CheckCircle2, Cpu, HardDrive } from 'lucide-react';

export const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl neo-surface p-6 sm:p-8 space-y-6 max-h-[90dvh] overflow-y-auto bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[8px_8px_0px_#111]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 border-2 border-[var(--border-strong)] bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] shadow-[2px_2px_0px_#111]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-[var(--text-primary)] uppercase tracking-wide">
                Privacy & Data Sovereignty Note
              </h3>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                AWEN Client-First Architecture &amp; Non-Commercial Pledge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border-2 border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] transition-colors"
            aria-label="Close Privacy Note"
          >
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Executive Guarantee Banner */}
        <div className="p-4 bg-[var(--accent-green-bg)] border-2 border-[var(--accent-green-dark)] shadow-[3px_3px_0px_#111] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-green-dark)]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Core Privacy Pledge</span>
          </div>
          <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
            AWEN was engineered under the principle that your body telemetry is deeply intimate. Your physiological readings, daily reflections, and emotional state logs belong exclusively to you. They are never monetized, never packaged for data brokers, and never shared with commercial advertising or insurance entities.
          </p>
        </div>

        {/* 6 Key Privacy Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Local SQLite Storage */}
          <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Local Database Persistence
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              All raw PPG samples, temperature metrics, and motion readings persist in a local relational SQLite database (<strong>awen.db</strong>). Your data lives on your own computing hardware.
            </p>
          </div>

          {/* 2. Cryptographic Isolation */}
          <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Cryptographic Isolation
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              Passwords are salted and protected via PBKDF2 with HMAC-SHA256 (100,000 iterations). Active API requests require authenticated Bearer session tokens isolated per user account.
            </p>
          </div>

          {/* 3. Zero Trackers */}
          <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Zero Third-Party Trackers
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              No tracking pixels, third-party analytics (Google Analytics, Segment, Meta Pixel), or behavioral profiling beacons are present in the AWEN codebase.
            </p>
          </div>

          {/* 4. Local Hardware Telemetry */}
          <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Direct Hardware Telemetry
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              The ESP32 microcontroller transmits data directly over your private local LAN (port 80) or direct W3C Web Serial USB CDC cable. Telemetry never traverses cloud intermediaries.
            </p>
          </div>

          {/* 5. Non-Diagnostic Safety */}
          <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Non-Diagnostic Framing
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              AWEN is an adaptive companion for personal wellness and emotional recovery. It does not provide medical diagnoses, treatment plans, or health insurance risk classifications.
            </p>
          </div>

          {/* 6. Portability & Purging */}
          <div className="p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent-green-dark)]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Right to Export &amp; Erasure
              </h4>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              You maintain full portability. Export your historical telemetry as clinical PDF or JSON files at any moment, or permanently purge your account records in Settings.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t-2 border-[var(--border-strong)] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">
            AWEN Privacy Architecture · Version 2.1
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold uppercase tracking-wider text-xs bg-[var(--text-primary)] text-white border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_var(--accent-green-dark)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
