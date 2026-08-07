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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">
                ESP32 IoT Sensor Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Connect physical MAX30102 PPG sensor hardware or control telemetry stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Status Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
          telemetry?.isHardware 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
        }`}>
          <div className="flex items-center gap-3">
            <Radio className={`w-5 h-5 ${telemetry?.isHardware ? 'animate-pulse text-emerald-400' : 'text-blue-400'}`} />
            <div>
              <span className="font-semibold block">
                Status: {telemetry?.isHardware ? 'ESP32 Hardware Connected' : 'Simulated Sensor Telemetry Active'}
              </span>
              <span className="text-[11px] opacity-80">
                {telemetry?.isHardware ? 'Live PPG serial stream at 115200 baud' : 'Simulating MAX30102 PPG optical telemetry'}
              </span>
            </div>
          </div>

          {telemetry?.isHardware ? (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-medium transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectHardware}
              disabled={connecting}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/30 transition-all"
            >
              {connecting ? 'Pairing...' : 'Connect Hardware'}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Baud Rate & Serial Terminal Stream Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Serial Data Stream</span>
            </span>
            <span className="text-slate-400 font-mono">Baud Rate: 115200</span>
          </div>

          <div className="w-full h-28 bg-slate-950 p-3 rounded-2xl border border-white/10 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1">
            <p className="text-slate-500">// AWEN ESP32 Telemetry Monitor</p>
            <p>{"{"} "ir": 54200, "bpm": {telemetry?.heartRate || 65}, "spo2": {telemetry?.spo2 || 98.6}, "temp": {telemetry?.temperature || 36.6} {"}"}</p>
            <p>{"{"} "status": "baseline_normal", "activity": "{telemetry?.activity || 'Resting'}" {"}"}</p>
          </div>
        </div>

        {/* Simulated Telemetry Controls */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <label className="text-xs font-semibold text-slate-300">Simulate Physical Telemetry Scenarios:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => telemetryStream.setScenario('normal')}
              className="px-3 py-2 rounded-xl glass-card hover:bg-white/10 text-xs text-slate-200 border border-white/5 transition-colors"
            >
              Resting (65 bpm)
            </button>
            <button
              onClick={() => telemetryStream.setScenario('stairs')}
              className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 border border-amber-500/20 transition-colors"
            >
              Stairs (+34 bpm)
            </button>
            <button
              onClick={() => telemetryStream.setScenario('caffeine')}
              className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-xs text-blue-300 border border-blue-500/20 transition-colors"
            >
              Caffeine Spike
            </button>
            <button
              onClick={() => telemetryStream.setScenario('exercise')}
              className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs text-purple-300 border border-purple-500/20 transition-colors"
            >
              Running Workout
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
