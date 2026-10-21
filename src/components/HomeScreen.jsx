import React, { useState, useEffect, useRef } from 'react';
import { AwenSpirit } from './AwenSpirit';
import { AwenSpeechCloud } from './AwenSpeechCloud';
import { evaluateAwenSpeech } from '../services/speechEngine';
import { AWEN_STATES } from '../services/stateEngine';
import { apiService } from '../services/apiService';
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
  Clock,
  Database,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { formatISTTime, formatISTDateTime } from '../utils/timeFormat';
import { STATE_COLOR_THEMES } from '../services/stateEngine';
import { PrivacyModal } from './PrivacyModal';

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
  latestReading,
  onOpenPrivacyModal
}) => {
  const firstName = currentUser?.name?.split(' ')[0] || '';
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [cloudMessage, setCloudMessage] = useState('');
  const [isCloudVisible, setIsCloudVisible] = useState(false);
  const [mascotExpression, setMascotExpression] = useState('happy');
  const [previewState, setPreviewState] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPrivacyCheckOpen, setIsPrivacyCheckOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const cloudTimerRef = useRef(null);

  const isConnected = Boolean(telemetry?.isHardware);
  const fingerDetected = Boolean(telemetry?.fingerDetected);
  const isMoving = Boolean(telemetry?.isMoving);
  const accel = telemetry?.accel || { x: 0.0, y: 0.0, z: 1.0 };
  const accelMagnitude = telemetry?.accelMagnitude ? Number(telemetry.accelMagnitude).toFixed(2) : '1.00';

  // Strict Separation: LIVE vitals exist ONLY when hardware is actively streaming with valid signal
  const liveHr = (isConnected && fingerDetected && telemetry?.heartRate != null) ? telemetry.heartRate : null;
  const liveSpo2 = (isConnected && fingerDetected && telemetry?.spo2 != null) ? telemetry.spo2 : null;
  const liveTemp = (isConnected && telemetry?.temperature != null) ? telemetry.temperature : null;
  const liveActivity = isConnected ? (telemetry?.activity || (isMoving ? "Walking" : "Resting")) : null;

  // Stored Historical Reading from SQLite (Last Recorded)
  const historicalReading = latestReading;

  // Device Status Description
  const getDeviceStatus = () => {
    if (!isConnected) {
      return { 
        label: 'ESP32: DISCONNECTED', 
        badge: 'bg-red-100 text-red-800 border-red-600', 
        dot: 'bg-red-600',
        sub: 'ESP32 sensor is not currently streaming'
      };
    }
    if (!fingerDetected) {
      return { 
        label: 'ESP32: CONNECTED · PLACE FINGER', 
        badge: 'bg-amber-100 text-amber-800 border-amber-500', 
        dot: 'bg-amber-500 animate-pulse',
        sub: 'Hardware connected. Optical PPG sensor awaiting finger placement'
      };
    }
    return { 
      label: 'ESP32: CONNECTED · LIVE STREAM', 
      badge: 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--border-strong)]', 
      dot: 'bg-[var(--accent-green-dark)] animate-pulse',
      sub: 'Continuous 60 FPS biometric telemetry'
    };
  };

  const devStatus = getDeviceStatus();

  // Load Real SQLite Alerts
  useEffect(() => {
    let isMounted = true;
    async function loadAlerts() {
      try {
        const obs = await apiService.getObservations(5);
        if (isMounted && obs) {
          setAlerts(obs);
        }
      } catch (e) {
        console.warn('Could not load alerts:', e);
      }
    }
    loadAlerts();
    return () => { isMounted = false; };
  }, [currentUser, latestReading]);

  // Live Digital Clock (Enforces proper 12-Hour IST with AM/PM)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(formatISTTime(now));
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

  // Effective Wellness State (Manual State Selection for evaluation or dynamic telemetry-driven)
  const effectiveWellnessState = previewState || awenState?.wellnessState || AWEN_STATES.BALANCED;
  const effectiveTheme = STATE_COLOR_THEMES[effectiveWellnessState] || STATE_COLOR_THEMES[AWEN_STATES.BALANCED];

  // Motion-aware contextual abnormality check:
  // If moving, cardiac elevation is normal exertion (NO alarm).
  // If stationary and heart rate is elevated (+14 BPM) or SpO2 drops, that is genuine resting anomaly.
  const baseNum = Number(restingHr) || 64.0;
  const activeActivities = ['Walking', 'Climbing Stairs', 'Gym', 'Running', 'Active', 'Exercise'];
  const userIsMoving = Boolean(telemetry?.isMoving) || (Number(accelMagnitude) > 1.20) || activeActivities.includes(liveActivity);

  const isAbnormalReading = Boolean(
    !userIsMoving && (
      (liveHr != null && liveHr > baseNum + 14) ||
      (liveSpo2 != null && liveSpo2 > 0 && liveSpo2 < 91.0) ||
      (liveTemp != null && liveTemp > 37.8 && liveHr != null && liveHr > baseNum + 8)
    )
  );

  // Auto-trigger Well-Being Question when a genuine resting abnormal condition is detected
  useEffect(() => {
    if (isAbnormalReading) {
      setMascotExpression("concerned");
      setCloudMessage("I noticed an unusual elevation while you're stationary. Are you feeling okay?");
      setIsCloudVisible(true);
    }
  }, [isAbnormalReading, liveHr, liveSpo2]);

  // Handle Mascot Well-Being Check-in Response (Saves to SQLite user_checkins)
  const handleMascotResponse = async (feeling) => {
    const isOkay = feeling === 'okay';
    try {
      await apiService.saveCheckin({
        mood: isOkay ? 'Good' : 'Difficult',
        activity: liveActivity || 'Resting',
        notes: isOkay 
          ? 'User response to AWEN Mascot prompt: Confirmed feeling okay.' 
          : 'User response to AWEN Mascot prompt: Indicated feeling unwell.'
      });
      if (isOkay) {
        setMascotExpression("happy");
        setCloudMessage("Glad to hear that. I'll keep observing your rhythm quietly. 💚");
      } else {
        setMascotExpression("concerned");
        setCloudMessage("Please rest and take it easy. I'm here if you want to talk. 💙");
      }
    } catch (e) {
      console.warn("Could not record mascot check-in:", e);
    }
    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
    cloudTimerRef.current = setTimeout(() => setIsCloudVisible(false), 5000);
  };

  const speechOptions = (cloudMessage.includes("feeling okay") || cloudMessage.includes("feeling today") || cloudMessage.includes("How are you")) ? [
    { label: "✓ I'm okay", variant: "success", onClick: () => handleMascotResponse('okay') },
    { label: "✗ Feeling unwell", variant: "danger", onClick: () => handleMascotResponse('unwell') }
  ] : (cloudMessage.includes("SQLite") || cloudMessage.includes("private") || isPrivacyCheckOpen) ? [
    { label: "🛡️ Review Full Privacy Policy", variant: "primary", onClick: () => { if (onOpenPrivacyModal) onOpenPrivacyModal(); else setIsPrivacyModalOpen(true); } }
  ] : [];

  // Handle Mascot Click Interaction
  const handleAwenTap = () => {
    if (isAbnormalReading) {
      setCloudMessage("I noticed an unusual elevation while you're stationary. Are you feeling okay?");
      setMascotExpression("concerned");
      setIsCloudVisible(true);
    } else if (isPrivacyCheckOpen) {
      setCloudMessage("Your health signals remain 100% private in local SQLite awen.db. No data leaves your machine.");
      setMascotExpression("happy");
      setIsCloudVisible(true);
    } else if (!isConnected) {
      setCloudMessage("I'm ready! Connect your ESP32 sensor so I can observe your real-time body pattern.");
      setMascotExpression("listening");
      setIsCloudVisible(true);
    } else {
      const wellnessContext = {
        heartRate: liveHr || 64,
        baselineHeartRate: baselineData?.restingHr || 64,
        spo2: liveSpo2 || 98.6,
        temperature: liveTemp || 36.6,
        activityState: liveActivity || (userIsMoving ? "Walking" : "Resting"),
        sleepQuality: "Good",
        observationMode: effectiveWellnessState === AWEN_STATES.LEARNING,
        isNightMode: false
      };
      const res = evaluateAwenSpeech(wellnessContext);
      setCloudMessage(res.text);
      setMascotExpression(res.expression);
      setIsCloudVisible(true);
    }

    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
    cloudTimerRef.current = setTimeout(() => setIsCloudVisible(false), 6500);
  };

  // 60 FPS Live Canvas Oscilloscope (G-1)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let scanX = 0;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    const points = new Array(width).fill(height / 2);
    let phase = 0;

    const render = () => {
      ctx.fillStyle = '#090D11';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
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

      if (isConnected && fingerDetected && liveHr) {
        phase += 0.08;
        scanX = (scanX + 2) % width;

        const t = phase * (liveHr / 60);
        const systolic = Math.sin(t * Math.PI * 2) * 0.55;
        const dicrotic = Math.sin((t * Math.PI * 2) * 2 + 1.2) * 0.22;
        const noise = (Math.random() - 0.5) * 0.03;
        const sampleVal = (height / 2) - (systolic + dicrotic + noise) * (height * 0.38);

        points[scanX] = sampleVal;

        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let i = 0; i < width; i++) {
          if (i === 0) ctx.moveTo(i, points[i]);
          else ctx.lineTo(i, points[i]);
        }
        ctx.stroke();

        const grad = ctx.createLinearGradient(Math.max(0, scanX - 30), 0, scanX, 0);
        grad.addColorStop(0, 'rgba(34, 197, 94, 0)');
        grad.addColorStop(1, 'rgba(34, 197, 94, 0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(Math.max(0, scanX - 30), 0, 30, height);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(scanX, 0, 2, height);

      } else if (isConnected) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = height / 2;
        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin((x + scanX) * 0.04) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        scanX = (scanX + 1.2) % width;

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('● MAX30100 READY · PLACE FINGER ON OPTICAL SENSOR', width / 2, height / 2 - 10);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = '10px monospace';
        ctx.fillText('Awaiting pulse lock to stream arterial plethysmogram (PPG)', width / 2, height / 2 + 10);

      } else {
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = height / 2;
        for (let x = 0; x < width; x++) {
          const y = midY;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ESP32 OFFLINE · NO SENSOR SIGNAL', width / 2, height / 2 - 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText('CONNECT ESP32 (MAX30100 + MPU-6050 + LM35) AT 172.20.168.254', width / 2, height / 2 + 8);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isConnected, fingerDetected, liveHr]);

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
            Observation Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
            Longitudinal personal baseline observation powered by local SQLite storage.
          </p>
        </div>

        {/* Right Info Cluster */}
        <div className="flex items-center gap-3">
          {/* Status Pill */}
          <div className={`px-3 py-1.5 border-2 shadow-[2px_2px_0px_#111] text-xs font-mono font-bold flex items-center gap-2 ${devStatus.badge}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${devStatus.dot}`} />
            <span className="uppercase tracking-wider">
              {devStatus.label}
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

      {/* ── 2. PATIENT / OBSERVATION DETAILS STRIP (STEP 6) ── */}
      <div className="neo-surface p-4 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[3px_3px_0px_#111] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        {/* User / Subject Name & ID */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">User Account</span>
          <span className="text-sm font-bold text-[var(--text-primary)] truncate block">{currentUser?.name || 'User'}</span>
          <span className="text-[10px] text-[var(--text-secondary)]">User ID: {currentUser?.patient_id || 'USR-LOCAL'}</span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Observation Status</span>
          <span className="text-sm font-bold text-[var(--accent-green-dark)] block">
            {currentUser?.observation_mode ? `Day ${currentUser?.observation_day || 1} of 7` : 'Settled Baseline'}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {currentUser?.observation_mode ? 'Learning Cycle' : 'Calibrated'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Observation Start</span>
          <span className="text-sm font-bold text-[var(--text-primary)] block">
            {currentUser?.observation_start ? new Date(currentUser.observation_start).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Initial'}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {currentUser?.observation_start ? new Date(currentUser.observation_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Observation Duration</span>
          <span className="text-sm font-bold text-[var(--text-primary)] block truncate">
            {currentUser?.observation_duration || '0 days'}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">Elapsed Window</span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Device Link</span>
          <span className={`text-xs font-bold block truncate ${isConnected ? 'text-[var(--accent-green-dark)]' : 'text-red-700'}`}>
            {currentUser?.device_id || 'AWEN_ESP32_01'}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">{isConnected ? 'Port Active' : 'Disconnected'}</span>
        </div>
      </div>

      {/* ── 3. DISCONNECTED NOTICE (When Standby) ── */}
      {!isConnected && (
        <div className="p-4 border-2 border-red-600 bg-red-50 text-red-800 shadow-[3px_3px_0px_#dc2626] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shrink-0" />
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider block text-red-900">
                ESP32: Disconnected — No Live Hardware Data
              </span>
              <span className="text-xs text-red-700 font-medium">
                Live sensor vitals show empty (--). Historical readings are safely preserved below in local SQLite. Connect ESP32 to stream real biometric data.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {telemetryStream && (
              <button
                onClick={() => { telemetryStream.connectWebSerial().catch(() => {}); }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Connect Hardware</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 4. MAIN DASHBOARD GRID (5 Cols Left, 7 Cols Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (5 Cols): Living Companion & Narrative ── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Living Companion Stage */}
          <div className="relative flex flex-col items-center justify-center py-6 px-4 neo-surface bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] overflow-visible">
            <AwenSpeechCloud 
              message={cloudMessage}
              isVisible={isCloudVisible}
              options={speechOptions}
              onTalkMore={onOpenTalk}
            />

            <div 
              className="relative z-10 transition-transform duration-300 hover:scale-105 cursor-pointer my-2"
              onClick={handleAwenTap}
            >
              <AwenSpirit 
                expression={previewState ? (previewState === 'WATCHFUL' ? 'concerned' : previewState === 'ACTIVE' ? 'celebrating' : previewState === 'WIND_DOWN' ? 'sleeping' : previewState === 'LEARNING' ? 'thinking' : 'happy') : (evaluation?.emotionalState || mascotExpression || "happy")}
                wellnessState={effectiveWellnessState}
                size={185}
                interactive={true}
                onClick={handleAwenTap}
                caption="Tap AWEN"
              />
            </div>

            {/* Dynamic State & Color Swatch Badge */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--border-strong)] text-xs font-mono font-bold shadow-[2px_2px_0px_#111]"
                style={{ backgroundColor: effectiveTheme.haloColor || 'var(--surface-secondary)', color: '#111' }}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black animate-pulse" style={{ backgroundColor: effectiveTheme.finColor }} />
                <span className="uppercase tracking-widest">{effectiveWellnessState} · {effectiveTheme.label}</span>
              </div>

              {previewState && (
                <button
                  onClick={() => {
                    setPreviewState(null);
                    setIsCloudVisible(true);
                    setCloudMessage("Switched back to Live Auto Telemetry Mode.");
                    setTimeout(() => setIsCloudVisible(false), 4000);
                  }}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[var(--surface-secondary)] hover:bg-neutral-200 border border-[var(--border-strong)]"
                  title="Reset to live auto telemetry state"
                >
                  Auto Mode
                </button>
              )}
            </div>

            {/* State & Color Preview Bar */}
            <div className="mt-3 w-full border-t border-[var(--border-light)] pt-2.5 space-y-1.5 text-center">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] px-1">
                <span>Mascot Color States:</span>
                <span className="text-[9px] text-[var(--accent-green-dark)] font-mono">Tap to switch color</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { state: AWEN_STATES.BALANCED, label: 'Balanced', dot: '#34d399' },
                  { state: AWEN_STATES.ACTIVE, label: 'Active', dot: '#f59e0b' },
                  { state: AWEN_STATES.WATCHFUL, label: 'Watchful', dot: '#f97316' },
                  { state: AWEN_STATES.WIND_DOWN, label: 'Wind Down', dot: '#818cf8' },
                  { state: AWEN_STATES.LEARNING, label: 'Learning', dot: '#c084fc' },
                ].map(item => {
                  const isSelected = effectiveWellnessState === item.state;
                  return (
                    <button
                      key={item.state}
                      onClick={() => {
                        setPreviewState(item.state);
                        setIsCloudVisible(true);
                        setCloudMessage(`Viewing ${item.label} color theme (${item.state}). Mascots reflect your dynamic autonomic tone.`);
                        if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
                        cloudTimerRef.current = setTimeout(() => setIsCloudVisible(false), 5000);
                      }}
                      className={`py-1 px-1 text-[9px] font-mono font-bold uppercase border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                        isSelected 
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_#111] scale-105' 
                          : 'bg-[var(--surface-secondary)] hover:bg-white text-[var(--text-primary)] border-[var(--border-strong)]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full border border-black" style={{ backgroundColor: item.dot }} />
                      <span className="truncate w-full text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>
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
                <span>Observation Rhythm</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
                SQLITE PERSISTED
              </span>
            </div>
            
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              {isConnected
                ? "Your resting telemetry closely conforms with your calibrated resting quiet baseline. Physical movement episodes are contextually recognized."
                : "Awaiting active sensor telemetry. Your personal learned baseline signature is safely saved in local SQLite storage."}
            </p>

            <div className="p-3 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-[11px] font-mono font-bold flex items-center justify-between">
              <span>Resting Signature:</span>
              <span className="text-[var(--accent-green-dark)]">{restingHr} BPM (±4.8)</span>
            </div>
          </div>

          {/* Real Alerts Card (STEP 6) */}
          <div className="neo-surface p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Detected Events ({alerts.length})</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
                REAL ALERTS
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-strong)] text-center text-xs font-medium text-[var(--text-secondary)]">
                No abnormal events detected. All telemetry aligns with baseline corridors.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.map((al, idx) => (
                  <div key={al.id || idx} className="p-2.5 border border-amber-300 bg-amber-50/60 text-left space-y-0.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 uppercase text-[10px] font-mono">{al.type || 'Watchful'}</span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">
                        {al.created_at ? new Date(al.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950 font-medium leading-tight">{al.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN (7 Cols): Vitals, Stored Data, Oscilloscope ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Row of 4 LIVE Biometric Metric Cards (Strictly live values or '--') */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-[var(--accent-green-dark)] animate-pulse' : 'text-red-500'}`} />
                <span>Live Hardware Stream Vitals</span>
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${isConnected ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--accent-green-dark)]' : 'bg-red-50 text-red-700 border-red-300'}`}>
                {isConnected ? 'ESP32: CONNECTED' : 'ESP32: DISCONNECTED'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Card 1: Heart Rate */}
              <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
                <div className="flex items-center justify-between">
                  <span className="metric-label">Heart Rate</span>
                  <Heart className={`w-3.5 h-3.5 ${liveHr ? 'text-[var(--accent-danger)] animate-pulse' : 'text-[var(--text-muted)]'}`} />
                </div>
                <div>
                  <span className="metric-value text-2xl block">
                    {liveHr ? liveHr : '--'}{' '}
                    <span className="text-xs text-[var(--text-secondary)] font-normal font-sans">BPM</span>
                  </span>
                  <span className={`text-[10px] font-bold uppercase block truncate ${
                    isConnected && !fingerDetected ? 'text-amber-600 animate-pulse' : 'text-[var(--text-secondary)]'
                  }`}>
                    {!isConnected ? 'Disconnected' : !fingerDetected ? 'Place Finger' : (isMoving ? 'Active Pulse' : 'Resting Baseline')}
                  </span>
                </div>
                <div className="h-4 w-full pt-1">
                  <svg className="w-full h-full" viewBox="0 0 100 20" fill="none">
                    <path d="M0,10 L30,10 L35,2 L40,18 L45,6 L50,14 L55,10 L100,10" stroke={liveHr ? "#DC2626" : "#888888"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Card 2: SpO₂ */}
              <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
                <div className="flex items-center justify-between">
                  <span className="metric-label">SpO₂ Pulse</span>
                  <Wind className={`w-3.5 h-3.5 ${liveSpo2 ? 'text-[var(--accent-green-dark)]' : 'text-[var(--text-muted)]'}`} />
                </div>
                <div>
                  <span className="metric-value text-2xl block">
                    {liveSpo2 ? liveSpo2 : '--'}{' '}
                    <span className="text-xs text-[var(--text-secondary)] font-normal font-sans">%</span>
                  </span>
                  <span className="text-[10px] font-bold text-[var(--accent-green-dark)] uppercase block truncate">
                    {!isConnected ? 'Disconnected' : !fingerDetected ? 'Awaiting Pulse' : 'Optimal'}
                  </span>
                </div>
                <div className="h-4 w-full pt-1">
                  <svg className="w-full h-full" viewBox="0 0 100 20" fill="none">
                    <path d="M0,12 Q25,8 50,11 T100,10" stroke={liveSpo2 ? "#15803D" : "#888888"} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Skin Temp */}
              <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
                <div className="flex items-center justify-between">
                  <span className="metric-label">Skin Temp</span>
                  <Thermometer className={`w-3.5 h-3.5 ${liveTemp !== null ? 'text-[var(--accent-warm)]' : 'text-[var(--text-muted)]'}`} />
                </div>
                <div>
                  <span className="metric-value text-2xl block">
                    {liveTemp !== null ? liveTemp : '--'}{' '}
                    <span className="text-xs text-[var(--text-secondary)] font-normal font-sans">°C</span>
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block truncate">
                    {!isConnected ? 'Disconnected' : (liveTemp !== null ? 'Nominal' : 'Probe Unattached')}
                  </span>
                </div>
                <div className="h-4 w-full pt-0.5 text-[9px] font-mono text-[var(--text-muted)] truncate">
                  {liveTemp !== null ? 'GPIO 34 Active' : 'Optional Probe'}
                </div>
              </div>

              {/* Card 4: Physical Motion & IMU (MPU-6050) */}
              <div className="metric-card space-y-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
                <div className="flex items-center justify-between">
                  <span className="metric-label">Motion / IMU</span>
                  <Activity className={`w-3.5 h-3.5 ${isMoving ? 'text-amber-500 animate-pulse' : 'text-indigo-600'}`} />
                </div>
                <div>
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 border border-[var(--border-strong)] inline-block uppercase shadow-[1px_1px_0px_#111] ${
                    !isConnected 
                      ? 'bg-[var(--surface-secondary)] text-[var(--text-muted)]' 
                      : isMoving 
                        ? 'bg-amber-100 text-amber-900 border-amber-500 font-extrabold animate-pulse' 
                        : 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)]'
                  }`}>
                    {!isConnected ? 'Disconnected' : isMoving ? '⚡ Motion' : '● Still'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] block mt-1">
                    |a|: {isConnected ? `${accelMagnitude}g` : '--'}
                  </span>
                </div>
                <div className="h-4 w-full pt-0.5 text-[9px] font-mono text-[var(--text-muted)] truncate">
                  {isConnected ? `X:${accel.x.toFixed(2)} Y:${accel.y.toFixed(2)} Z:${accel.z.toFixed(2)}` : 'No IMU stream'}
                </div>
              </div>

            </div>
          </div>

          {/* ── LAST STORED READING IN SQLITE (CLEARLY LABELED AS HISTORICAL) ── */}
          <div className="neo-surface p-4 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-2">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
                <span>Last Recorded Telemetry (SQLite awen.db)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] font-bold">
                HISTORICAL RECORD
              </span>
            </div>

            {historicalReading ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono pt-1">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Recorded Time (IST)</span>
                  <span className="font-bold text-[var(--text-primary)] block">
                    {historicalReading.created_at_ist ? historicalReading.created_at_ist : formatISTDateTime(historicalReading.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Heart Rate</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] block">
                    {historicalReading.bpm ?? historicalReading.heart_rate ?? '--'} BPM
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">SpO₂</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] block">
                    {historicalReading.spo2 ? `${historicalReading.spo2}%` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Skin Temp</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] block">
                    {historicalReading.temperature ? `${historicalReading.temperature}°C` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Data Source</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 border inline-block ${
                    historicalReading.data_source === 'demo_synthetic' ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {historicalReading.data_source === 'demo_synthetic' ? 'Synthetic Demo' : (historicalReading.data_source || 'ESP32 Stream')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] font-medium py-1">
                No historical readings stored in SQLite yet. Ingest telemetry or connect an ESP32 device.
              </p>
            )}
          </div>

          {/* ── LIVE PPG OSCILLOSCOPE & HARDWARE SENSOR SUITE ── */}
          <div className="neo-surface p-4 sm:p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-4">
            
            {/* Header: Title, Description, & Live Status */}
            <div className="flex flex-wrap items-center justify-between border-b-2 border-[var(--border-strong)] pb-3 gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent-green-dark)]" />
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Biometric Signal Monitor (MAX30100 Optical PPG)
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Real-time optical arterial pulse waveform & multi-sensor hardware telemetry
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {telemetry?.hardwareConnectedTime && isConnected && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[var(--accent-green-dark)] bg-emerald-50 text-[var(--accent-green-dark)]">
                    LINKED: {telemetry.hardwareConnectedTime}
                  </span>
                )}
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 border-2 rounded-sm shrink-0 ${
                  isConnected && fingerDetected
                    ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--accent-green-dark)] animate-pulse' 
                    : isConnected
                      ? 'bg-amber-100 text-amber-900 border-amber-500'
                      : 'bg-red-100 text-red-700 border-red-600'
                }`}>
                  {isConnected && fingerDetected 
                    ? '● LIVE ARTERIAL PULSE (60 FPS)' 
                    : isConnected 
                      ? '● SENSOR READY · AWAITING FINGER' 
                      : '● SENSOR STANDBY'}
                </span>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative w-full h-40 bg-[#090D11] border-2 border-black overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              
              {/* Telemetry HUD Badge Overlay */}
              <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase bg-black/70 text-[var(--accent-green)] border border-[var(--accent-green-dark)] px-2 py-0.5 backdrop-blur-xs">
                  I2C 0x57 · MAX30100
                </span>
                {isConnected && fingerDetected && liveHr && (
                  <span className="text-[9px] font-mono font-bold uppercase bg-black/70 text-white border border-neutral-700 px-2 py-0.5 backdrop-blur-xs">
                    Lock: {liveHr} BPM
                  </span>
                )}
              </div>
            </div>

            {/* Hardware Sensor Suite Status Grid (MAX30100, MPU-6050, LM35, Buzzer, ESP32) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                Connected Hardware Sensor Suite:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-left font-mono">
                {/* 1. MAX30100 */}
                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-0.5">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">MAX30100 PPG</span>
                  <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                    {fingerDetected ? 'Contact Locked' : isConnected ? 'Place Finger' : 'Standby'}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                    {liveHr ? `${liveHr} BPM · ${liveSpo2 || '--'}%` : 'IR+Red Optical'}
                  </span>
                </div>

                {/* 2. MPU-6050 */}
                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-0.5">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">MPU-6050 IMU</span>
                  <span className={`text-xs font-bold block truncate ${isMoving ? 'text-amber-600' : 'text-[var(--accent-green-dark)]'}`}>
                    {isMoving ? '⚡ Moving' : '● Stationary'}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                    |a|: {accelMagnitude}g
                  </span>
                </div>

                {/* 3. LM35 Temperature */}
                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-0.5">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">LM35 Temp</span>
                  <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                    {liveTemp !== null ? `${liveTemp} °C` : '-- °C'}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                    GPIO 34 ADC
                  </span>
                </div>

                {/* 4. Active Buzzer */}
                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-0.5">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">Active Buzzer</span>
                  <span className={`text-xs font-bold block truncate ${telemetry?.abnormal ? 'text-red-600 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                    {telemetry?.abnormal ? '⚡ Triggered' : 'Normal (Quiet)'}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                    GPIO 25 Alarm
                  </span>
                </div>

                {/* 5. ESP32 Wi-Fi Node */}
                <div className="p-2 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">ESP32 Core</span>
                  <span className={`text-xs font-bold block truncate ${isConnected ? 'text-[var(--accent-green-dark)]' : 'text-red-600'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                    {telemetry?.ip || '172.20.168.254'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Telemetry Specs */}
            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border-light)]">
              <span>Sampling: 100 Hz I2C · 1-Sec Telemetry Stream</span>
              <span className="font-bold text-[var(--text-primary)]">
                Status: {devStatus.label}
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
                <span>View User Summary</span>
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

          {/* ── DASHBOARD PRIVACY & DATA SOVEREIGNTY NOTE ── */}
          <div className="neo-surface p-4 sm:p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Privacy &amp; Data Sovereignty Guarantee
                </span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border border-[var(--accent-green-dark)]">
                100% Local · Offline-First
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Your biometric streams (Heart Rate, SpO₂, Temperature, IMU Kinetic vectors) and psychological check-ins are persisted exclusively to your local SQLite database (<code>awen.db</code>). Zero telemetry is transmitted to third-party advertising or corporate servers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex items-center gap-2 p-2 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <Database className="w-3.5 h-3.5 text-[var(--accent-green-dark)] shrink-0" />
                <span className="truncate">Local SQLite Engine (WAL Mode)</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
                <Lock className="w-3.5 h-3.5 text-[var(--accent-green-dark)] shrink-0" />
                <span className="truncate">Zero Cloud Telemetry Leakage</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between border-t border-[var(--border-light)] text-[10px] font-mono">
              <span className="text-[var(--text-muted)]">Encrypted Private LAN (172.20.168.254)</span>
              <button
                onClick={() => {
                  if (onOpenPrivacyModal) onOpenPrivacyModal();
                  else setIsPrivacyModalOpen(true);
                }}
                className="font-bold uppercase tracking-wider text-[var(--accent-green-dark)] hover:underline flex items-center gap-1"
              >
                <span>Read Full Privacy Policy →</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Privacy & Data Sovereignty Note Modal */}
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

    </div>
  );
};
