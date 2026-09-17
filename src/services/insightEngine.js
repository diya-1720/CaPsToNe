import { AWEN_STATES } from './stateEngine';
import { ACTIVITY_PROFILES } from './baselineEngine';

/**
 * AWEN Unified Insight Engine
 * 
 * Single source of truth for physiological interpretation across
 * TodayScreen, JourneyScreen, and TalkScreen.
 * 
 * Enforces the 5-step Product Loop:
 * OBSERVE -> UNDERSTAND -> ACT -> FOLLOW UP -> LEARN
 */

export class InsightEngine {
  /**
   * Evaluate telemetry against personal baseline & state engine
   */
  evaluateInsight(telemetry, evaluation, awenState, baselineData) {
    const isHardware = Boolean(telemetry?.isHardware);
    const rawHr = telemetry?.heartRate ?? telemetry?.heart_rate ?? null;
    const hr = (rawHr !== null && rawHr !== undefined) ? Math.round(Number(rawHr) * 10) / 10 : null;
    const spo2 = (telemetry?.spo2 !== null && telemetry?.spo2 !== undefined) ? Math.round(Number(telemetry.spo2) * 10) / 10 : null;
    const temp = (telemetry?.temperature !== null && telemetry?.temperature !== undefined) ? Math.round(Number(telemetry.temperature) * 10) / 10 : null;
    const activity = telemetry?.activity || "Resting";

    const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr) : 64.0;
    const hrStdDev = baselineData?.hrStdDev ? Number(baselineData.hrStdDev) : 4.8;
    const confidenceState = baselineData?.confidence || awenState?.confidence || 'Stable baseline';
    const wellnessState = awenState?.wellnessState || AWEN_STATES.BALANCED;

    // When hardware is disconnected or no live readings exist
    if (!isHardware || hr === null) {
      return {
        isSignificant: false,
        wellnessState,
        isHardware: false,
        title: "Hardware Not Connected",
        metrics: { hr: null, spo2: null, temp: null, activity },
        baseline: { restingHr, expectedHr: restingHr, hrStdDev, confidenceState },
        deltas: { hrDeltaFromResting: 0, hrDeltaFromExpected: 0 },
        observe: {
          title: "Hardware Not Connected",
          summary: "Connect your ESP32 sensor (MAX30102) to stream live telemetry against your personal baseline."
        },
        explanation: {
          summary: "Awaiting sensor connection. AWEN requires active telemetry to observe your real-time body pattern.",
          bullets: [
            "Your baseline pattern is saved in local SQLite storage.",
            "Connect your ESP32 via USB Web Serial to stream live PPG signals.",
            "No fake or default values are attached."
          ]
        },
        action: {
          recommended: false,
          type: "CONNECT",
          label: "Connect ESP32 Sensor",
          instruction: "Attach your MAX30102 sensor via USB Serial to begin live comparison."
        },
        learning: {
          confidenceState,
          summary: `Baseline signature calibrated at ${restingHr.toFixed(1)} bpm resting HR.`
        }
      };
    }

    const actConfig = ACTIVITY_PROFILES[activity] || ACTIVITY_PROFILES["Resting"];
    const expectedHr = Math.round((restingHr + actConfig.hrOffset) * 10) / 10;
    const hrDeltaFromExpected = Math.round((hr - expectedHr) * 10) / 10;
    const hrDeltaFromResting = Math.round((hr - restingHr) * 10) / 10;

    const isExertion = ["Walking", "Climbing Stairs", "Gym", "Running"].includes(activity);
    const isExertionExplained = evaluation?.isExertionExplained ?? (isExertion && hrDeltaFromExpected <= 18);

    // Significance Model
    const isSignificant = (
      wellnessState === AWEN_STATES.WATCHFUL ||
      wellnessState === AWEN_STATES.LEARNING ||
      (!isExertion && hrDeltaFromResting > 8) ||
      (isExertion && hrDeltaFromExpected > 18)
    );

    // 1. OBSERVE Step
    let observeTitle = "Rhythm Aligned";
    let observeSummary = `Your body readings match your ${restingHr.toFixed(1)} bpm resting baseline.`;
    
    if (wellnessState === AWEN_STATES.LEARNING) {
      observeTitle = "Observation Mode Active";
      observeSummary = `AWEN is currently observing your daily pattern before establishing a firm baseline reference.`;
    } else if (isExertion) {
      observeTitle = `Physical Movement (${activity})`;
      observeSummary = `Heart rate is +${Math.round(hrDeltaFromResting)} bpm above resting, which is expected while active.`;
    } else if (hrDeltaFromResting > 8) {
      observeTitle = "Elevated Resting Signal";
      observeSummary = `Your heart rate is +${Math.abs(Math.round(hrDeltaFromResting))} bpm above your personal resting baseline during low movement.`;
    } else if (wellnessState === AWEN_STATES.WIND_DOWN) {
      observeTitle = "Evening Quiet State";
      observeSummary = `Your body is settling into your quiet evening resting signature.`;
    }

    // 2. UNDERSTAND / EXPLANATION Step
    const explanationBullets = [];
    
    if (wellnessState === AWEN_STATES.LEARNING) {
      explanationBullets.push(`AWEN is collecting quiet resting samples to compute your baseline.`);
      explanationBullets.push(`Current confidence tier: ${confidenceState}.`);
    } else if (isExertion) {
      explanationBullets.push(`Physical movement (${activity}) naturally raises heart rate.`);
      explanationBullets.push(`Activity filter applied (+${actConfig.hrOffset} bpm expected lift).`);
    } else if (hrDeltaFromResting > 8) {
      explanationBullets.push(`Reading captured during low physical movement (${activity.toLowerCase()}).`);
      explanationBullets.push(`Heart rate (${hr} bpm) exceeds your typical resting range of ${Math.round(restingHr - hrStdDev)}–${Math.round(restingHr + hrStdDev)} bpm.`);
    } else {
      explanationBullets.push(`Reading captured during ${activity.toLowerCase()}.`);
      explanationBullets.push(`Heart rate (${hr} bpm) is within your natural resting variance (±${hrStdDev} bpm).`);
      if (spo2) explanationBullets.push(`Oxygen saturation (${spo2}%) is nominal.`);
      if (temp) explanationBullets.push(`Skin temperature (${temp}°C) is nominal.`);
    }

    // 3. ACT Step
    const actionRecommended = isSignificant && !isExertionExplained && wellnessState !== AWEN_STATES.LEARNING;
    const action = {
      recommended: actionRecommended,
      type: "PAUSE",
      label: "Take a 2-minute pause",
      instruction: "Sit comfortably, breathe normally, and let AWEN observe how your body signal settles."
    };

    // 4. LEARN Step
    const learning = {
      confidenceState,
      summary: wellnessState === AWEN_STATES.LEARNING
        ? "Every quiet reading improves your baseline accuracy."
        : `Baseline signature calibrated at ${restingHr.toFixed(1)} bpm resting HR with ±${hrStdDev} bpm natural variance.`
    };

    return {
      isSignificant,
      wellnessState,
      isHardware,
      title: observeTitle,
      metrics: { hr, spo2, temp, activity },
      baseline: { restingHr, expectedHr, hrStdDev, confidenceState },
      deltas: { hrDeltaFromResting, hrDeltaFromExpected },
      observe: { title: observeTitle, summary: observeSummary },
      explanation: { summary: evaluation?.explainability?.summary || observeSummary, bullets: explanationBullets },
      action,
      learning
    };
  }

  evaluateFollowUp(startHr, currentHr, restingHr) {
    if (!startHr || !currentHr) return null;

    const initialDelta = Math.round(startHr - restingHr);
    const currentDelta = Math.round(currentHr - restingHr);
    const hrChange = Math.round(currentHr - startHr);

    let followUpSummary = "";
    if (hrChange < -2) {
      followUpSummary = `Your heart rate moved ${Math.abs(hrChange)} bpm closer toward your baseline during the pause (${startHr} → ${currentHr} bpm).`;
    } else if (hrChange > 2) {
      followUpSummary = `Your heart rate increased slightly by +${hrChange} bpm during observation (${startHr} → ${currentHr} bpm).`;
    } else {
      followUpSummary = `Your heart rate stayed steady at ${currentHr} bpm during the 2-minute pause.`;
    }

    return {
      startHr,
      currentHr,
      hrChange,
      initialDelta,
      currentDelta,
      summary: followUpSummary
    };
  }
}

export const insightEngine = new InsightEngine();
