import React, { useState } from 'react';
import { X, Cpu, Radio, RefreshCw, CheckCircle, AlertCircle, Terminal, Play } from 'lucide-react';

export const IoTConfigModal = ({ isOpen, onClose, telemetryStream, telemetry }) => {
  const [baudRate, setBaudRate] = useState("115200");
  const [errorMsg, setErrorMsg] = useState(null);
  const [connecting, setConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnectHardware = async () => {
    setConnecting(true);
    setErrorMsg(null);
    try {
      await telemetryStream.connectWebSerial();
      setConnecting(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to establish serial connection to ESP32.");
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    telemetryStream.disconnectHardware();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
      <div className="relative w-full max-w-xl neo-surface p-6 sm:p-8 space-y-6 max-h-[90dvh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111]">
              <Cpu className="w-5 h-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
                ESP32 IoT Sensor Configuration
              </h3>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                Connect physical MAX30102 PPG sensor hardware or control telemetry stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Connection Status Banner */}
        <div className={`p-4 border-2 shadow-[2px_2px_0px_#111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
          telemetry?.isHardware 
            ? 'bg-[var(--accent-green-bg)] border-[var(--accent-green-dark)] text-[var(--accent-green-dark)]' 
            : 'bg-[var(--surface-secondary)] border-[var(--border-strong)] text-[var(--text-primary)]'
        }`}>
          <div className="flex items-center gap-3">
            <Radio className={`w-5 h-5 ${telemetry?.isHardware ? 'animate-pulse text-[var(--accent-green-dark)]' : 'text-[var(--text-primary)]'}`} />
            <div>
              <span className="font-bold block uppercase tracking-wide text-[11px]">
                Status: {telemetry?.isHardware ? 'ESP32 Hardware Connected' : 'Simulated Sensor Telemetry Active'}
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {telemetry?.isHardware ? 'Live PPG serial stream at 115200 baud' : 'Simulating MAX30102 PPG optical telemetry'}
              </span>
            </div>
          </div>

          {telemetry?.isHardware ? (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] bg-[var(--accent-danger-bg)] hover:bg-[var(--accent-danger)] hover:text-white text-[var(--accent-danger)] border-2 border-[var(--accent-danger)] shadow-[2px_2px_0px_var(--accent-danger)] transition-colors whitespace-nowrap"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectHardware}
              disabled={connecting}
              className="px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] bg-[var(--text-primary)] text-white hover:bg-[var(--accent-green-dark)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {connecting ? 'Pairing...' : 'Connect Hardware'}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 border-2 border-[var(--accent-danger)] bg-[var(--accent-danger-bg)] text-[var(--accent-danger)] text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-[2px_2px_0px_var(--accent-danger)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Baud Rate & Serial Terminal Stream Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Serial Data Stream</span>
            </span>
            <span className="font-mono font-bold text-[var(--text-secondary)]">Baud Rate: 115200</span>
          </div>

          <div className="w-full h-28 bg-[var(--text-primary)] p-3 border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] font-mono text-[11px] text-[var(--accent-green)] overflow-y-auto space-y-1">
            <p className="text-[var(--text-muted)]">// AWEN ESP32 Telemetry Monitor</p>
            <p>{"{"} "ir": 54200, "bpm": {telemetry?.heartRate || 65}, "spo2": {telemetry?.spo2 || 98.6}, "temp": {telemetry?.temperature || 36.6} {"}"}</p>
            <p>{"{"} "status": "baseline_normal", "activity": "{telemetry?.activity || 'Resting'}" {"}"}</p>
          </div>
        </div>

        {/* Simulated Telemetry Controls */}
        <div className="space-y-3 border-t-2 border-[var(--border-strong)] pt-4">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-primary)]">Simulate Physical Telemetry Scenarios:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'normal', label: 'Resting (65 bpm)' },
              { id: 'stairs', label: 'Stairs (+34 bpm)' },
              { id: 'caffeine', label: 'Caffeine Spike' },
              { id: 'exercise', label: 'Running Workout' },
            ].map(scenario => (
              <button
                key={scenario.id}
                onClick={() => telemetryStream.setScenario(scenario.id)}
                className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t-2 border-[var(--border-strong)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-bold uppercase tracking-wide text-xs bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
