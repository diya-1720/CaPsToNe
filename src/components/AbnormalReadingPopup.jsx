import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, Heart, Wind, Thermometer, Volume2, VolumeX, 
  X, MessageCircle, ArrowRight, CheckCircle2, ShieldCheck, Zap 
} from 'lucide-react';
import { formatISTTime } from '../utils/timeFormat';
import { apiService } from '../services/apiService';

/**
 * AbnormalReadingPopup
 * Context-aware wellness notification popup triggered when telemetry readings
 * indicate genuine resting stress or anomalies while stationary.
 * 
 * Rules:
 * 1. Physical motion + elevated heart rate = EXERTION / EXERCISE (No alarm beep or panic).
 * 2. Stationary (no motion) + elevated heart rate = RESTING STRESS (Prompts "Are you feeling okay?").
 * 3. Elevated skin temperature + elevated heart rate while resting compounds the anomaly.
 * 4. Chime sounds AT MOST ONCE with a strict 3-minute cooldown.
 * 5. Persistent mute audio toggle prevents unwanted audio repetition.
 */
export const AbnormalReadingPopup = ({
  telemetry,
  baselineData,
  onOpenTalk,
  onNavigate
}) => {
  const [activeAlert, setActiveAlert] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('awen_popup_muted') === 'true';
    } catch {
      return false;
    }
  });

  const dismissedTimerRef = useRef(null);
  const lastAlertKeyRef = useRef(null);
  const lastChimeTimeRef = useRef(0);
  const autoCloseTimerRef = useRef(null);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('awen_popup_muted', String(next));
      } catch {}
      return next;
    });
  };

  // Play a single gentle non-alarmist dual-tone chime (E5 -> A5)
  const playAlertChime = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.40);
      osc.start();
      osc.stop(ctx.currentTime + 0.40);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (isDismissed) return;

    let alertData = null;
    const baseHr = Number(baselineData?.restingHr) || 64.0;
    const hr = telemetry?.heartRate;
    const spo2 = telemetry?.spo2;
    const temp = telemetry?.temperature;
    const fingerDetected = Boolean(telemetry?.fingerDetected);
    const accelMag = Number(telemetry?.accelMagnitude) || 1.0;
    
    // Check if user is actively in motion
    const activeActivities = ['Walking', 'Climbing Stairs', 'Gym', 'Running', 'Active', 'Exercise'];
    const isMoving = Boolean(telemetry?.isMoving) || (accelMag > 1.20) || activeActivities.includes(telemetry?.activity);

    // Only evaluate heart rate when valid finger contact exists on the optical sensor
    if (fingerDetected && hr != null && hr > 0) {
      const delta = hr - baseHr;

      // 1. MOTION-AWARE CONTEXTUAL LOGIC:
      // If user is IN MOTION and heart rate is elevated, this is EXERTION/EXERCISE -> NO ALARM!
      if (isMoving && delta > 0) {
        alertData = null;
      }
      // If user is STATIONARY (NO MOTION) and heart rate is noticeably elevated (resting stress)
      else if (!isMoving && delta >= 12.0) {
        const hasElevatedTemp = (temp != null && temp > 37.5);

        if (hasElevatedTemp) {
          alertData = {
            key: 'resting_stress_thermal',
            title: 'Resting Elevation & Thermal Trend',
            badge: 'RESTING STRESS · ELEVATED TEMP',
            icon: Thermometer,
            metricLabel: 'Resting Pulse & Temp',
            metricValue: `${Math.round(hr)} BPM · ${temp}°C`,
            comparison: `+${delta.toFixed(1)} BPM vs ${baseHr} BPM baseline while stationary`,
            severity: 'warning',
            message: `Your heart rate and skin temperature are measuring above your quiet baseline while stationary. Are you feeling okay? Take a moment to rest and hydrate.`
          };
        } else {
          alertData = {
            key: 'resting_cardiac_elevation',
            title: 'Resting Pulse Elevation Notice',
            badge: 'RESTING ELEVATION DETECTED',
            icon: Heart,
            metricLabel: 'Resting Heart Rate',
            metricValue: `${Math.round(hr)} BPM`,
            comparison: `+${delta.toFixed(1)} BPM vs typical ${baseHr} BPM baseline while stationary`,
            severity: 'warning',
            message: `We noticed your heart rate is elevated while you are stationary. If you feel hurried or tense, take a slow 2-minute pause. Are you feeling okay?`
          };
        }
      } 
      // Unusually low pulse check
      else if (hr < 42.0) {
        alertData = {
          key: 'low_pulse_reading',
          title: 'Unusually Low Pulse Reading',
          badge: 'LOW PULSE',
          icon: Heart,
          metricLabel: 'Pulse Rate',
          metricValue: `${Math.round(hr)} BPM`,
          comparison: 'Below typical resting corridor',
          severity: 'warning',
          message: 'Your pulse reading is measuring below 42 BPM. Ensure the optical sensor is resting comfortably against your fingertip without excessive pressure.'
        };
      }
    }

    // 2. Low Blood Oxygen Saturation Check (when finger is detected)
    if (!alertData && fingerDetected && spo2 != null && spo2 > 0 && spo2 < 91.0) {
      alertData = {
        key: 'low_spo2_saturation',
        title: 'Low Oxygen Saturation Notice',
        badge: 'SpO₂ LOW',
        icon: Wind,
        metricLabel: 'Blood Oxygen',
        metricValue: `${Math.round(spo2)} %`,
        comparison: 'Healthy resting corridor: 95% – 100%',
        severity: 'danger',
        message: `Your SpO₂ reading is measuring at ${Math.round(spo2)}%. Check sensor placement on your fingertip and take several calm, deep breaths.`
      };
    }

    if (alertData) {
      alertData.detectedAt = formatISTTime(new Date());

      // Play audio chime AT MOST ONCE per alert condition, with a 3-minute cooldown
      const nowMs = Date.now();
      if (!isMuted && lastAlertKeyRef.current !== alertData.key && (nowMs - lastChimeTimeRef.current > 180000)) {
        lastAlertKeyRef.current = alertData.key;
        lastChimeTimeRef.current = nowMs;
        playAlertChime();
      } else {
        lastAlertKeyRef.current = alertData.key;
      }

      setActiveAlert(alertData);

      // Auto-dismiss after 20 seconds of inactivity
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, 20000);
    } else {
      setActiveAlert(null);
    }
  }, [
    telemetry?.heartRate, 
    telemetry?.spo2, 
    telemetry?.temperature, 
    telemetry?.fingerDetected, 
    telemetry?.isMoving,
    telemetry?.accelMagnitude,
    telemetry?.activity,
    baselineData?.restingHr,
    isDismissed,
    isMuted
  ]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setActiveAlert(null);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    // Snooze for 3 minutes before prompting again
    if (dismissedTimerRef.current) clearTimeout(dismissedTimerRef.current);
    dismissedTimerRef.current = setTimeout(() => {
      setIsDismissed(false);
      lastAlertKeyRef.current = null;
    }, 180000);
  };

  const handleConfirmFeeling = async (feeling) => {
    const isOkay = feeling === 'okay';
    try {
      await apiService.saveCheckin({
        mood: isOkay ? 'Good' : 'Difficult',
        activity: telemetry?.isMoving ? 'Moving' : 'Resting',
        notes: isOkay 
          ? 'User response to Resting Elevation prompt: Confirmed feeling okay.'
          : 'User response to Resting Elevation prompt: Reported feeling unwell or tense.'
      });
    } catch (e) {
      console.warn("Could not record checkin from notification popup:", e);
    }

    handleDismiss();

    if (!isOkay && onOpenTalk) {
      onOpenTalk();
    }
  };

  if (!activeAlert) return null;

  const isDanger = activeAlert.severity === 'danger';
  const IconComp = activeAlert.icon || AlertTriangle;

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full animate-fadeIn text-left select-none">
      <div className={`p-4 sm:p-5 border-2 shadow-[4px_4px_0px_#111] space-y-3 ${
        isDanger
          ? 'bg-red-50 border-red-600 text-red-950 shadow-[4px_4px_0px_#dc2626]'
          : 'bg-amber-50 border-amber-600 text-amber-950 shadow-[4px_4px_0px_#d97706]'
      }`}>
        
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-current/20 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1.5 border-2 rounded-sm shrink-0 ${
              isDanger 
                ? 'bg-red-600 text-white border-black' 
                : 'bg-amber-500 text-black border-black'
            }`}>
              <IconComp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border inline-block mb-0.5 ${
                  isDanger ? 'bg-red-200 border-red-700 text-red-900' : 'bg-amber-200 border-amber-700 text-amber-900'
                }`}>
                  {activeAlert.badge}
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">
                  {activeAlert.detectedAt}
                </span>
              </div>
              <h4 className="font-heading font-bold text-sm tracking-tight truncate text-[var(--text-primary)]">
                {activeAlert.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Audio Mute/Unmute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-1 border border-current transition-colors text-[10px] font-mono font-bold flex items-center gap-1 ${
                isMuted ? 'bg-neutral-200 text-neutral-700' : 'bg-white hover:bg-neutral-100'
              }`}
              title={isMuted ? "Sound muted (click to enable chime)" : "Sound enabled (click to mute chime)"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
            </button>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="p-1 border border-current hover:bg-black/10 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Highlighting Strip */}
        <div className="p-2.5 border border-current/30 bg-white/70 space-y-1 font-mono">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">
              {activeAlert.metricLabel}:
            </span>
            <span className="text-base font-extrabold text-[var(--text-primary)]">
              {activeAlert.metricValue}
            </span>
          </div>
          {activeAlert.comparison && (
            <p className="text-[10px] font-medium text-[var(--text-secondary)] border-t border-current/15 pt-1">
              {activeAlert.comparison}
            </p>
          )}
        </div>

        {/* Supportive Observation Message */}
        <p className="text-xs leading-relaxed font-medium text-[var(--text-secondary)]">
          {activeAlert.message}
        </p>

        {/* Action Controls & Well-Being Response */}
        <div className="pt-2 border-t border-current/20 space-y-2">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>Are you feeling okay?</span>
            <span className="text-[9px] opacity-75">Saves to private SQLite log</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleConfirmFeeling('okay')}
              className="flex-1 py-1.5 px-3 bg-[var(--accent-green-bg)] hover:bg-[var(--accent-green)] border-2 border-[var(--border-strong)] text-[var(--accent-green-dark)] hover:text-black text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#111] flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ I'm Okay</span>
            </button>

            <button
              onClick={() => handleConfirmFeeling('unwell')}
              className="flex-1 py-1.5 px-3 bg-red-100 hover:bg-red-200 border-2 border-red-700 text-red-900 text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#111] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>✗ Feeling Unwell</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <button
              onClick={() => {
                handleDismiss();
                if (onOpenTalk) onOpenTalk();
              }}
              className="font-bold uppercase tracking-wider text-[var(--text-primary)] hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
              <span>Talk with AWEN →</span>
            </button>

            <button
              onClick={handleDismiss}
              className="font-mono text-[10px] text-[var(--text-muted)] hover:underline"
            >
              Snooze 3m
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
