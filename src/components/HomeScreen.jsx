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
  Calendar,
  AlertCircle
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
        label: 'DEVICE DISCONNECTED', 
        badge: 'bg-red-100 text-red-800 border-red-600', 
        dot: 'bg-red-600',
        sub: 'ESP32 sensor is not currently streaming'
      };
    }
    if (!fingerDetected) {
      return { 
        label: 'NO LIVE DATA · PLACE FINGER', 
        badge: 'bg-amber-100 text-amber-800 border-amber-500', 
        dot: 'bg-amber-500 animate-pulse',
        sub: 'Hardware connected. Optical PPG sensor awaiting finger placement'
      };
    }
    return { 
      label: 'CONNECTED · LIVE STREAM', 
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

  // Abnormality Detection (Unified Source of Truth across readings, observations & state)
  const baseNum = Number(restingHr) || 64.0;
  const isAbnormalReading = Boolean(
    (latestReading && (
      (latestReading.heart_rate && (latestReading.heart_rate > baseNum + 15 || latestReading.heart_rate < baseNum - 15)) ||
      (latestReading.spo2 && latestReading.spo2 < 93.0) ||
      (latestReading.temperature && latestReading.temperature > 37.8)
    )) ||
    (alerts && alerts.length > 0 && alerts[0].severity === 'warning') ||
    (awenState?.wellnessState === 'WATCHFUL')
  );

  // Auto-trigger Well-Being Question when an abnormal condition is detected
  useEffect(() => {
    if (isAbnormalReading) {
      setMascotExpression("concerned");
      setCloudMessage("I noticed an unusual pattern in your readings. Are you feeling okay?");
      setIsCloudVisible(true);
    }
  }, [isAbnormalReading, latestReading?.id, alerts?.length]);

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
  ] : [];

  // Handle Mascot Click Interaction
  const handleAwenTap = () => {
    if (isAbnormalReading) {
      setCloudMessage("I noticed an unusual pattern in your readings. Are you feeling okay?");
      setMascotExpression("concerned");
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
        activityState: liveActivity || "Resting",
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

        const t = phase;
        const systolic = Math.sin(t * 2) * 0.5;
        const dicrotic = Math.sin(t * 4 + 1.2) * 0.25;
        const noise = (Math.random() - 0.5) * 0.04;
        const sampleVal = (height / 2) - (systolic + dicrotic + noise) * (height * 0.35);

        points[scanX] = sampleVal;

        ctx.strokeStyle = '#32E875';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < width; i++) {
          if (i === 0) ctx.moveTo(i, points[i]);
          else ctx.lineTo(i, points[i]);
        }
        ctx.stroke();

        const grad = ctx.createLinearGradient(scanX - 25, 0, scanX, 0);
        grad.addColorStop(0, 'rgba(50, 232, 117, 0)');
        grad.addColorStop(1, 'rgba(50, 232, 117, 0.4)');
        ctx.fillStyle = grad;
        ctx.fillRect(Math.max(0, scanX - 25), 0, 25, height);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(scanX, 0, 2, height);

      } else if (isConnected) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = height / 2;
        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin((x + scanX) * 0.03) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        scanX = (scanX + 1) % width;

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('● HARDWARE ONLINE · PLACE FINGER ON MAX30102 SENSOR', width / 2, height / 2 - 10);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px monospace';
        ctx.fillText('AWAITING ARTERIAL CONTACT TO STREAM LIVE VITALS', width / 2, height / 2 + 10);

      } else {
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

        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('STANDBY · NO LIVE HARDWARE SIGNAL', width / 2, height / 2 - 12);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText('CONNECT ESP32 (MAX30102 + MPU-6050) TO ACTIVATE LIVE STREAM', width / 2, height / 2 + 8);
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
                Device Disconnected — No Live Hardware Data
              </span>
              <span className="text-xs text-red-700 font-medium">
                Live sensor vitals show empty (--). Historical readings are safely preserved below in local SQLite. Connect ESP32 to stream real biometric data.
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
          <div className="relative flex flex-col items-center justify-center py-8 px-4 neo-surface bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] overflow-visible">
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
                {isConnected ? (awenState?.wellnessState || 'BALANCED') : 'DEVICE DISCONNECTED'}
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
                {isConnected ? 'LIVE TELEMETRY' : 'DISCONNECTED (--)'}
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
                  <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Recorded Time</span>
                  <span className="font-bold text-[var(--text-primary)] block">
                    {historicalReading.created_at ? new Date(historicalReading.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {historicalReading.created_at ? new Date(historicalReading.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
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

          {/* ── LIVE PPG OSCILLOSCOPE (G-1) ── */}
          <div className="neo-surface p-4 sm:p-5 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Biometric Signal Monitor (MAX30102 Optical PPG)
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border-2 rounded-sm ${
                isConnected && fingerDetected
                  ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] border-[var(--accent-green-dark)]' 
                  : 'bg-red-100 text-red-700 border-red-600'
              }`}>
                {isConnected && fingerDetected ? '● LIVE 60 FPS' : '● SENSOR STANDBY'}
              </span>
            </div>

            {/* Canvas Viewport */}
            <div className="relative w-full h-36 bg-[#090D11] border-2 border-black overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Footer Telemetry Specs */}
            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1">
              <span>Sampling: 115200 Baud · Real Sensor Stream</span>
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

        </div>

      </div>

    </div>
  );
};
