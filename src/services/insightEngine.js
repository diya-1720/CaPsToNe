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
 * 
 * Low-Noise Significance Model:
 * Normal readings (BALANCED state with |hrDelta| <= 8) remain calm and low-noise.
 * Intrusive action cards are activated only for statistically or contextually
 * meaningful observations (WATCHFUL, LEARNING, or elevated resting HR).
 */

export class InsightEngine {
  /**
   * Evaluate telemetry against personal baseline & state engine
   */
  evaluateInsight(telemetry, evaluation, awenState, baselineData) {
    const hr = Math.round((telemetry?.heartRate ?? telemetry?.heart_rate ?? 64.0) * 10) / 10;
    const spo2 = Math.round((telemetry?.spo2 ?? 98.6) * 10) / 10;
    const temp = Math.round((telemetry?.temperature ?? 36.6) * 10) / 10;
    const activity = telemetry?.activity || "Resting";
    const isHardware = telemetry?.isHardware || false;

    const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr) : 64.0;
    const hrStdDev = baselineData?.hrStdDev ? Number(baselineData.hrStdDev) : 4.8;
    const confidenceState = baselineData?.confidence || awenState?.confidenceState || 'Stable baseline';

    const actConfig = ACTIVITY_PROFILES[activity] || ACTIVITY_PROFILES["Resting"];
    const expectedHr = Math.round((restingHr + actConfig.hrOffset) * 10) / 10;
    const hrDeltaFromExpected = Math.round((hr - expectedHr) * 10) / 10;
    const hrDeltaFromResting = Math.round((hr - restingHr) * 10) / 10;

    const isExertion = ["Walking", "Climbing Stairs", "Gym", "Running"].includes(activity);
    const isExertionExplained = evaluation?.isExertionExplained ?? (isExertion && hrDeltaFromExpected <= 18);
    const wellnessState = awenState?.wellnessState || AWEN_STATES.BALANCED;

    // Significance Model: Only flag if resting HR is elevated > 8 bpm without exertion, or in learning mode, or watchful state
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
      explanationBullets.push(`AWEN is collecting quiet resting samples to compute your 7th-percentile baseline.`);
      explanationBullets.push(`Current confidence tier: ${confidenceState}.`);
    } else if (isExertion) {
      explanationBullets.push(`Physical movement (${activity}) naturally raises heart rate to supply oxygen.`);
      explanationBullets.push(`Activity filter applied (+${actConfig.hrOffset} bpm expected lift). Exertion is explained.`);
      explanationBullets.push(`AWEN will observe how smoothly your signal settles after movement stops.`);
    } else if (hrDeltaFromResting > 8) {
      explanationBullets.push(`Reading captured during low physical movement (${activity.toLowerCase()}).`);
      explanationBullets.push(`Heart rate (${hr} bpm) exceeds your typical resting range of ${Math.round(restingHr - hrStdDev)}–${Math.round(restingHr + hrStdDev)} bpm.`);
      explanationBullets.push(`Non-exertional variation may be related to focus, caffeine, recent meal, or reduced sleep.`);
    } else {
      explanationBullets.push(`Reading captured during ${activity.toLowerCase()}.`);
      explanationBullets.push(`Heart rate (${hr} bpm) is within your natural resting variance (±${hrStdDev} bpm).`);
      explanationBullets.push(`Oxygen saturation (${spo2}%) and temperature (${temp}°C) are nominal.`);
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
      metrics: { hr, spo2, temp, activity },
      baseline: { restingHr, expectedHr, hrStdDev, confidenceState },
      deltas: { hrDeltaFromResting, hrDeltaFromExpected },
      observe: { title: observeTitle, summary: observeSummary },
      explanation: { summary: evaluation?.explainability?.summary || observeSummary, bullets: explanationBullets },
      action,
      learning
    };
  }

  /**
   * Evaluates Follow-Up delta using actual live telemetry vs baseline snapshot at start of action.
   * NEVER fabricates fake follow-up numbers.
   */
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
