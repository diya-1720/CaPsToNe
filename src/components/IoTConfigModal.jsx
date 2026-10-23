import React, { useState, useEffect } from 'react';
import { X, Cpu, Radio, RefreshCw, CheckCircle, AlertCircle, Terminal, Play, Usb, Wifi, Trash2 } from 'lucide-react';

export const IoTConfigModal = ({ isOpen, onClose, telemetryStream, telemetry }) => {
  const [baudRate, setBaudRate] = useState("115200");
  const [esp32UrlInput, setEsp32UrlInput] = useState(telemetryStream?.esp32BaseUrl || "http://172.17.106.254");
  const [urlSavedFeedback, setUrlSavedFeedback] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [logLines, setLogLines] = useState([]);

  useEffect(() => {
    if (telemetryStream?.esp32BaseUrl) {
      setEsp32UrlInput(telemetryStream.esp32BaseUrl);
    }
  }, [telemetryStream?.esp32BaseUrl]);

  useEffect(() => {
    if (!isOpen || !telemetryStream) return;
    
    setLogLines([...(telemetryStream.rawLog || [])]);

    const handleLine = (line) => {
      setLogLines(prev => [...prev.slice(-30), line]);
    };

    telemetryStream.onRawLine = handleLine;
    return () => {
      telemetryStream.onRawLine = null;
    };
  }, [isOpen, telemetryStream]);

  if (!isOpen) return null;

  const handleConnectHardware = async () => {
    setConnecting(true);
    setErrorMsg(null);
    try {
      await telemetryStream.connectWebSerial(baudRate);
      setConnecting(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to establish serial connection to ESP32.");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await telemetryStream.disconnectHardware();
    setLogLines([]);
  };

  const handleClearLog = () => {
    if (telemetryStream) {
      telemetryStream.rawLog = [];
    }
    setLogLines([]);
  };

  const handleSaveEsp32Url = (e) => {
    e.preventDefault();
    if (!esp32UrlInput || !telemetryStream) return;
    telemetryStream.setEsp32Url(esp32UrlInput);
    telemetryStream.pollEsp32Telemetry();
    setUrlSavedFeedback(true);
    setTimeout(() => setUrlSavedFeedback(false), 2500);
  };

  const isConnected = Boolean(telemetry?.isHardware);
  const connType = telemetry?.connectionType || telemetryStream?.connectionType;

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
                Hardware suite: MAX30100 PPG, MPU-6050 IMU, LM35 Temp, Active Buzzer & ESP32
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

        {/* Global Connection Status Banner */}
        <div className={`p-4 border-2 shadow-[2px_2px_0px_#111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
          isConnected 
            ? 'bg-[var(--accent-green-bg)] border-[var(--accent-green-dark)] text-[var(--accent-green-dark)]' 
            : 'bg-[var(--surface-secondary)] border-[var(--border-strong)] text-[var(--text-primary)]'
        }`}>
          <div className="flex items-center gap-3">
            <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse text-[var(--accent-green-dark)]' : 'text-[var(--text-primary)]'}`} />
            <div>
              <span className="font-bold block uppercase tracking-wide text-[11px]">
                Status: {isConnected 
                  ? `ESP32: Connected via ${connType === 'serial' ? 'USB Web Serial' : 'Wi-Fi'}` 
                  : 'ESP32: Disconnected'}
              </span>
              <span className="text-[10px] font-medium opacity-80 block">
                {isConnected 
                  ? (connType === 'serial' 
                      ? `Streaming live packets over USB CDC · Linked: ${telemetry?.hardwareConnectedTime || 'Active'}`
                      : `Telemetry active from ${telemetry?.ip || telemetryStream?.esp32BaseUrl}/api/telemetry · Linked: ${telemetry?.hardwareConnectedTime || 'Active'}`)
                  : 'Plug in USB cable or connect via Wi-Fi IP to stream telemetry.'}
              </span>
            </div>
          </div>

          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] bg-[var(--accent-danger-bg)] hover:bg-[var(--accent-danger)] hover:text-white text-[var(--accent-danger)] border-2 border-[var(--accent-danger)] shadow-[2px_2px_0px_var(--accent-danger)] transition-colors whitespace-nowrap"
            >
              Disconnect
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 border-2 border-[var(--accent-danger)] bg-[var(--accent-danger-bg)] text-[var(--accent-danger)] text-xs font-bold uppercase tracking-wide flex items-start gap-2 shadow-[2px_2px_0px_var(--accent-danger)]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span>{errorMsg}</span>
              <span className="block text-[10px] opacity-90 font-normal mt-0.5">
                Note: Web Serial requires Google Chrome or Microsoft Edge. Make sure Arduino IDE Serial Monitor or Plotter is closed.
              </span>
            </div>
          </div>
        )}

        {/* ── METHOD 1: USB Web Serial (Direct Cable Connection) ── */}
        <div className="p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[2px_2px_0px_#111] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Usb className="w-4 h-4 text-[var(--text-primary)]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Method 1: USB Direct Cable (Web Serial)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] font-bold border border-[var(--accent-green-dark)]">
              RECOMMENDED
            </span>
          </div>
          
          <p className="text-[11px] text-[var(--text-secondary)]">
            Plug your ESP32 into your computer via USB. Chrome or Edge will prompt you to select the device COM port.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-secondary)] whitespace-nowrap">
                Baud Rate:
              </label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="px-2.5 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none shadow-[2px_2px_0px_#111]"
              >
                <option value="115200">115200 (Default)</option>
                <option value="9600">9600</option>
                <option value="57600">57600</option>
                <option value="230400">230400</option>
              </select>
            </div>

            <button
              onClick={handleConnectHardware}
              disabled={connecting || (isConnected && connType === 'serial')}
              className={`flex-1 px-4 py-2 font-bold uppercase tracking-wider text-xs border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                isConnected && connType === 'serial'
                  ? 'bg-[var(--accent-green)] text-[var(--text-primary)] cursor-default'
                  : 'bg-[var(--text-primary)] text-white hover:bg-[var(--accent-green-dark)]'
              }`}
            >
              <Usb className="w-3.5 h-3.5" />
              <span>
                {connecting 
                  ? 'Selecting Port...' 
                  : (isConnected && connType === 'serial' ? '✓ USB Serial Streaming' : 'Connect via USB (Select COM Port)')}
              </span>
            </button>
          </div>
        </div>

        {/* ── METHOD 2: ESP32 Wi-Fi Network URL Configurator ── */}
        <div className="p-3.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] space-y-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[var(--text-secondary)]" />
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
              Method 2: ESP32 Wi-Fi Telemetry Endpoint (REST IP):
            </label>
          </div>
          <form onSubmit={handleSaveEsp32Url} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={esp32UrlInput}
              onChange={(e) => setEsp32UrlInput(e.target.value)}
              placeholder="http://172.17.106.254"
              className="flex-1 px-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] text-xs font-mono text-[var(--text-primary)] focus:outline-none shadow-[2px_2px_0px_#111]"
            />
            <button
              type="submit"
              className="px-4 py-2 font-bold uppercase tracking-wider text-[11px] bg-[var(--text-primary)] text-white hover:bg-[var(--accent-green-dark)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] transition-colors whitespace-nowrap"
            >
              {urlSavedFeedback ? '✓ Saved & Polling' : 'Save & Reconnect'}
            </button>
          </form>
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            Direct & backend proxy polling enabled for <strong>/api/telemetry</strong>
          </p>
        </div>

        {/* Live Telemetry Terminal Stream Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Telemetry Packet Stream</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearLog}
                className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
                title="Clear console output"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="w-full h-32 bg-[var(--text-primary)] p-3 border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] font-mono text-[11px] text-[var(--accent-green)] overflow-y-auto space-y-1">
            <p className="text-[var(--text-muted)]">// AWEN Telemetry Monitor (Baud: {baudRate})</p>
            {isConnected ? (
              logLines.length > 0 ? (
                logLines.map((line, idx) => (
                  <p key={idx} className="whitespace-pre-wrap break-all">{line}</p>
                ))
              ) : (
                <>
                  <p className="text-[var(--accent-green)]">
                    {"{"} "status": "streaming", "source": "{connType || 'serial'}", "time_ist": "{telemetry?.timestamp || '--'}", "bpm": {telemetry?.heartRate ?? 'null'}, "spo2": {telemetry?.spo2 ?? 'null'}, "temp": {telemetry?.temperature ?? 'null'} {"}"}
                  </p>
                  <p className="text-[var(--text-muted)]">// Continuous packet stream active...</p>
                </>
              )
            ) : (
              <p className="text-amber-400">// ESP32 offline. Connect via USB Web Serial button above or ensure Wi-Fi endpoint is reachable.</p>
            )}
          </div>
        </div>

        {/* Hardware Sensor Diagnostic Checklist */}
        <div className="p-3.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Connected Hardware Sensor Suite:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)] flex flex-col justify-between">
              <span className="font-bold text-[10px]">MAX30100 PPG</span>
              <span className="text-[var(--accent-green-dark)] font-extrabold text-[10px]">I2C 0x57</span>
            </div>
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)] flex flex-col justify-between">
              <span className="font-bold text-[10px]">MPU-6050 IMU</span>
              <span className="text-[var(--accent-green-dark)] font-extrabold text-[10px]">I2C 0x68</span>
            </div>
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)] flex flex-col justify-between">
              <span className="font-bold text-[10px]">LM35 Temp</span>
              <span className="text-[var(--accent-green-dark)] font-extrabold text-[10px]">GPIO 34</span>
            </div>
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)] flex flex-col justify-between">
              <span className="font-bold text-[10px]">Buzzer Alarm</span>
              <span className="text-[var(--accent-green-dark)] font-extrabold text-[10px]">GPIO 25</span>
            </div>
            <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-primary)] flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="font-bold text-[10px]">ESP32 MCU</span>
              <span className="text-[var(--accent-green-dark)] font-extrabold text-[10px]">
                {isConnected ? 'STREAMING' : 'READY'}
              </span>
            </div>
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
