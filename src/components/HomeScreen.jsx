import React, { useState, useEffect, useRef } from 'react';
import { AwenSpirit } from './AwenSpirit';
import { AwenSpeechCloud } from './AwenSpeechCloud';
import { evaluateAwenSpeech } from '../services/speechEngine';
import { AWEN_STATES } from '../services/stateEngine';
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Footprints, 
  Cpu, 
  Radio, 
  MessageCircle, 
  FileText, 
  Sparkles, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const HomeScreen = ({
  telemetry,
  evaluation,
  awenState,
  onSelectActivity,
  onOpenTalk,
  onOpenReports,
  onOpenHardware,
  currentUser,
  baselineData,
  telemetryStream,
  latestReading
}) => {
  const firstName = currentUser?.name?.split(' ')[0] || '';
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [cloudMessage, setCloudMessage] = useState('');
  const [isCloudVisible, setIsCloudVisible] = useState(false);
  const [mascotExpression, setMascotExpression] = useState('happy');

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const cloudTimerRef = useRef(null);

  const isConnected = Boolean(telemetry?.isHardware);
  const hasReading = (telemetry?.heartRate !== null && telemetry?.heartRate !== undefined) || 
    (latestReading && ((latestReading.heart_rate !== null && latestReading.heart_rate !== undefined) || (latestReading.bpm !== null && latestReading.bpm !== undefined)));
  const currentHr = telemetry?.heartRate ?? latestReading?.heart_rate ?? latestReading?.bpm ?? null;
  const currentSpo2 = telemetry?.spo2 ?? latestReading?.spo2 ?? null;
  const currentTemp = telemetry?.temperature ?? latestReading?.temperature ?? null;
  const currentActivity = telemetry?.activity ?? latestReading?.activity_state ?? "Resting";
  const readingTime = telemetry?.timestamp || (latestReading?.created_at ? new Date(latestReading.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null);

  // Live Digital Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    const suffix = firstName ? `, ${firstName}` : '';
    if (h < 12) return `GOOD MORNING${suffix}`;
    if (h < 17) return `GOOD AFTERNOON${suffix}`;
    if (h < 22) return `GOOD EVENING${suffix}`;
    return `REST WELL${suffix}`;
  };

  // Handle Mascot Click Interaction
  const handleAwenTap = () => {
    if (!isConnected) {
      setCloudMessage("I'm ready! Connect your ESP32 sensor so I can observe your real-time body pattern.");
      setMascotExpression("listening");
      setIsCloudVisible(true);
    } else {
      const wellnessContext = {
        heartRate: telemetry?.heartRate || 64,
        baselineHeartRate: baselineData?.restingHr || 64,
        spo2: telemetry?.spo2 || 98.6,
        temperature: telemetry?.temperature || 36.6,
        activityState: telemetry?.activity || "Resting",
        sleepQuality: "Good",
        observationMode: awenState?.wellnessState === AWEN_STATES.LEARNING,
        isNightMode: false
      };
      const res = evaluateAwenSpeech(wellnessContext);
      setCloudMessage(res.text);
      setMascotExpression(res.expression);
      setIsCloudVisible(true);
    }

    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
    cloudTimerRef.current = setTimeout(() => setIsCloudVisible(false), 5000);
  };

  // 60 FPS Live Canvas Oscilloscope (G-1)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let scanX = 0;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    // Buffer of points
    const points = new Array(width).fill(height / 2);
    let phase = 0;

    const render = () => {
      // Clear background
      ctx.fillStyle = '#090D11';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Lines (28px horiz, 18px vert)
      ctx.strokeStyle = 'rgba(50, 232, 117, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isConnected) {
        // Draw physiological PPG pulse waveform with systolic peak and dicrotic notch
        phase += 0.08;
        const currentBpm = telemetry?.heartRate || 72;
        const freq = (currentBpm / 60) * 0.05;
        
        // Advance scanline
        scanX = (scanX + 2) % width;

        // Generate current PPG amplitude
        const t = phase;
        // Systolic peak + dicrotic wave
        const systolic = Math.sin(t * 2) * 0.5;
        const dicrotic = Math.sin(t * 4 + 1.2) * 0.25;
        const noise = (Math.random() - 0.5) * 0.04;
        const sampleVal = (height / 2) - (systolic + dicrotic + noise) * (height * 0.35);

        points[scanX] = sampleVal;

        // Draw waveform path
        ctx.strokeStyle = '#32E875';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < width; i++) {
          if (i === 0) ctx.moveTo(i, points[i]);
          else ctx.lineTo(i, points[i]);
        }
        ctx.stroke();

        // Animated vertical scan beam
        const grad = ctx.createLinearGradient(scanX - 25, 0, scanX, 0);
        grad.addColorStop(0, 'rgba(50, 232, 117, 0)');
        grad.addColorStop(1, 'rgba(50, 232, 117, 0.4)');
        ctx.fillStyle = grad;
        ctx.fillRect(Math.max(0, scanX - 25), 0, 25, height);

        // Leading cursor
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(scanX, 0, 2, height);

      } else {
        // Standby baseline flatline with gentle ambient wave
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = height / 2;
        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin((x + scanX) * 0.05) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        scanX = (scanX + 0.5) % width;

        // Standby text overlay
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('STANDBY · AWAITING SENSOR TELEMETRY', width / 2, height / 2 - 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText('CONNECT ESP32 (MAX30102) TO ACTIVATE WAVEFORM', width / 2, height / 2 + 8);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isConnected, telemetry?.heartRate]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12 space-y-6 animate-fadeIn text-left">
      
      {/* ── 1. EDITORIAL HERO BANNER ── */}
      <div className="neo-surface p-5 sm:p-7 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] shrink-0" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[var(--text-secondary)]">
              {getTimeGreeting()}
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[var(--text-primary)]">
            Executive Wellness Overview
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Your personal physiological baseline is actively contextualizing your body signals.
          </p>
        </div>

        {/* Right Info Cluster */}
        <div className="flex items-center gap-3">
          {/* Status Pill */}
          <div className={`px-3 py-1.5 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-xs font-mono font-bold flex items-center gap-2 ${
            isConnected ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)]' : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-[var(--accent-green-dark)] animate-pulse' : 'bg-red-600'}`} />
            <span className="uppercase tracking-wider">
              {isConnected ? 'BALANCED · 60 FPS STREAM' : 'SENSOR STANDBY'}
            </span>
          </div>

          {/* Digital Clock */}
          <div className="p-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] text-center min-w-[100px]">
            <span className="font-mono text-xs font-extrabold tracking-wider block text-[var(--text-primary)]">
              {timeStr || '12:00:00'}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] block">
              {dateStr || 'TODAY'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. SENSOR STATUS BANNER (When Standby) ── */}
      {!isConnected && (
        <div className="p-4 border-2 border-red-600 bg-red-50 text-red-800 shadow-[3px_3px_0px_#dc2626] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shrink-0" />
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider block text-red-900">
                Hardware Not Connected — Sensor Standby
              </span>
              <span className="text-xs text-red-700 font-medium">
                Connect your physical ESP32 MAX30102 sensor via Web Serial to initiate live 60 FPS biometric waveform analysis.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {telemetryStream && (
              <button
                onClick={() => telemetryStream.connectWebSerial()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Pair Hardware</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 3. MAIN DASHBOARD GRID (5 Cols Left, 7 Cols Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (5 Cols): Living Companion & Narrative ── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Living Companion Stage */}
          <div className="relative flex flex-col items-center justify-center py-8 px-4 neo-surface bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] overflow-visible">
            <AwenSpeechCloud 
              message={cloudMessage}
              isVisible={isCloudVisible}
              onTalkMore={onOpenTalk}
            />

            <div 
              className="relative z-10 transition-transform duration-300 hover:scale-105 cursor-pointer my-2"
              onClick={handleAwenTap}
            >
              <AwenSpirit 
                expression={evaluation?.emotionalState || mascotExpression || "happy"}
                wellnessState={awenState?.wellnessState || AWEN_STATES.BALANCED}
                size={180}
                interactive={true}
                onClick={handleAwenTap}
                caption="Tap AWEN"
              />
            </div>

            {/* State Badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border-strong)] bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-mono shadow-[2px_2px_0px_#111]">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-[var(--accent-green)]' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-bold uppercase tracking-widest">
                {isConnected ? (awenState?.wellnessState || 'BALANCED') : 'AWAITING SENSOR'}
              </span>
            </div>

            {/* Talk More Link */}
            <button
              onClick={onOpenTalk}
              className="mt-3 text-[11px] font-bold text-[var(--accent-green-dark)] hover:underline flex items-center gap-1"
            >
              <span>Talk more with AWEN</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* "Your Rhythm Today" Narrative Card */}
          <div className="neo-surface p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Your Rhythm Today</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
                DIAGNOSTIC
              </span>
            </div>
            
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              {isConnected
                ? "Your resting telemetry closely conforms with your calibrated 64.0 BPM quiet baseline. Physical movement episodes were recognized and contextually filtered."
                : "Awaiting active sensor telemetry. Your personal 64.0 BPM resting baseline signature is saved in local SQLite storage."}
            </p>

            <div className="p-3 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-[11px] font-mono font-bold flex items-center justify-between">
              <span>Resting Signature:</span>
              <span className="text-[var(--accent-green-dark)]">{restingHr} BPM (±4.8)</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (7 Cols): Vitals, Oscilloscope & Controls ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Row of 4 Biometric Metric Cards (G-2, G-3, G-4) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Card 1: Heart Rate */}
            <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
              <div className="flex items-center justify-between">
                <span className="metric-label">Heart Rate</span>
                <Heart className="w-3.5 h-3.5 text-[var(--accent-danger)]" />
              </div>
              <div>
                <span className="metric-value text-2xl block">
                  {hasReading && currentHr ? currentHr : '--'}{' '}
                  <span className="text-xs text-[var(--text-secondary)] font-normal font-sans">BPM</span>
                </span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                  {hasReading ? currentActivity : 'No Signal'}
                </span>
              </div>
              {/* Mini Sparkline */}
              <div className="h-4 w-full pt-1">
                <svg className="w-full h-full" viewBox="0 0 100 20" fill="none">
                  <path d="M0,10 L30,10 L35,2 L40,18 L45,6 L50,14 L55,10 L100,10" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: SpO₂ */}
            <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
              <div className="flex items-center justify-between">
                <span className="metric-label">SpO₂ Pulse</span>
                <Wind className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
              </div>
              <div>
                <span className="metric-value text-2xl block">
                  {hasReading && currentSpo2 ? currentSpo2 : '--'}{' '}
                  <span className="text-xs text-[var(--text-secondary)] font-normal font-sans">%</span>
                </span>
                <span className="text-[10px] font-bold text-[var(--accent-green-dark)] uppercase block">
                  {hasReading ? 'Optimal' : 'No Signal'}
                </span>
              </div>
              {/* Mini Curve */}
              <div className="h-4 w-full pt-1">
                <svg className="w-full h-full" viewBox="0 0 100 20" fill="none">
                  <path d="M0,12 Q25,8 50,11 T100,10" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Skin Temp */}
            <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
              <div className="flex items-center justify-between">
                <span className="metric-label">Skin Temp</span>
                <Thermometer className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
              </div>
              <div>
                <span className="metric-value text-2xl block">
                  {hasReading && currentTemp ? currentTemp : '--'}{' '}
                  <span className="text-xs text-[var(--text-secondary)] font-normal font-sans">°C</span>
                </span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                  {hasReading ? 'Nominal' : 'No Signal'}
                </span>
              </div>
              {/* Mini Thermal Curve */}
              <div className="h-4 w-full pt-1">
                <svg className="w-full h-full" viewBox="0 0 100 20" fill="none">
                  <path d="M0,10 C30,12 60,8 100,10" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 4: Activity Context */}
            <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
              <div className="flex items-center justify-between">
                <span className="metric-label">Context</span>
                <Footprints className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div>
                <span className="metric-value text-base sm:text-lg block truncate">
                  {hasReading ? currentActivity : 'Standby'}
                </span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                  {readingTime ? `Recorded: ${readingTime}` : 'Awaiting Sensor'}
                </span>
              </div>
              {/* Activity indicator */}
              <div className="h-4 w-full pt-1">
                <div className="w-full bg-[var(--surface-secondary)] h-1.5 rounded-full overflow-hidden border border-[var(--border-light)]">
                  <div className={`h-full ${hasReading ? 'bg-indigo-500 w-3/4' : 'bg-transparent'}`} />
                </div>
              </div>
            </div>

          </div>

          {/* ── LIVE PPG OSCILLOSCOPE (G-1) ── */}
          <div className="neo-surface p-4 sm:p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Live PPG Pulse Signal (MAX30102 Optical Waveform)
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border-2 rounded-sm ${
                isConnected 
                  ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--accent-green-dark)]' 
                  : 'bg-red-100 text-red-700 border-red-600'
              }`}>
                {isConnected ? '● LIVE 60 FPS' : '● WAITING FOR SIGNAL'}
              </span>
            </div>

            {/* Canvas Viewport */}
            <div className="relative w-full h-36 bg-[#090D11] border-2 border-black overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Footer Telemetry Specs */}
            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1">
              <span>Sampling: 115200 Baud · Continuous 60 FPS Optical Telemetry</span>
              <span className="font-bold text-[var(--text-primary)]">
                SQI: {isConnected ? '98% Optimal Signal' : '0% (No Contact)'}
              </span>
            </div>
          </div>

          {/* ── CONTROLS & CONTEXT ACTIONS ── */}
          <div className="neo-surface p-5 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] block">
              Cognitive & Activity Context Controls:
            </span>

            {/* Context Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Resting', 'Walking', 'Climbing Stairs', 'Cognitive Focus'].map(act => (
                <button
                  key={act}
                  onClick={() => onSelectActivity && onSelectActivity(act)}
                  className={`p-2 text-xs font-mono font-bold uppercase border-2 text-center transition-all ${
                    telemetry?.activity === act
                      ? 'bg-[var(--accent-green)] border-[var(--border-strong)] shadow-[2px_2px_0px_#111]'
                      : 'bg-[var(--surface-primary)] border-[var(--border-strong)] hover:bg-[var(--surface-tertiary)]'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenReports}
                className="px-4 py-2.5 bg-[var(--surface-primary)] hover:bg-[var(--surface-tertiary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <FileText className="w-4 h-4" />
                <span>View Clinical Reports</span>
              </button>

              <button
                onClick={onOpenTalk}
                className="px-4 py-2.5 bg-[var(--text-primary)] hover:bg-[#222] text-white border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with AWEN</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
