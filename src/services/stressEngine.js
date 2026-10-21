/**
 * AWEN Real Stress Detection & Pattern Engine (Client-Side)
 * 
 * Compares current physiological readings against personal baseline
 * while accounting for physical activity and subjective check-ins.
 * 
 * Rules:
 * 1. Do NOT treat SpO2 alone as a stress indicator.
 * 2. Do NOT classify exercise-related heart-rate elevation as stress.
 * 3. Increase stress indicator if heart rate is elevated while still/resting.
 * 4. Use temperature deviation as an additional supporting signal when valid.
 * 5. Combine multiple signals rather than relying on one sensor.
 * 6. Use subjective check-in as supporting context, not as the only detector.
 * 
 * States:
 * - LOW (0-39): Current readings close to baseline or elevation explained by physical activity.
 * - ELEVATED (40-69): Physiological readings deviating from baseline during low activity.
 * - POSSIBLE STRESS (70-100): Multiple indicators deviate during low physical movement.
 */

export const calculateStressIndicator = ({
  heartRate,
  temperature = null,
  accelMagnitude = 1.0,
  activity = 'Resting',
  isMoving = false,
  baseline = null,
  checkin = null
}) => {
  const hr = heartRate != null ? Number(heartRate) : null;
  if (hr === null || isNaN(hr) || hr <= 0) {
    return {
      status: 'STANDBY',
      score: null,
      explanation: 'No active heart rate reading available. Connect your ESP32 or record telemetry to evaluate stress pattern.',
      contributingSignals: [],
      isExertionFiltered: false,
      baselineComparison: null
    };
  }

  const rhr = baseline?.restingHr != null ? Number(baseline.restingHr) : 64.0;
  const rtemp = baseline?.restingTemp != null ? Number(baseline.restingTemp) : 36.6;
  const hrStdDev = baseline?.hrStdDev != null ? Number(baseline.hrStdDev) : 4.8;

  const temp = (temperature != null && !isNaN(Number(temperature))) ? Number(temperature) : null;
  const accelMag = (accelMagnitude != null && !isNaN(Number(accelMagnitude))) ? Number(accelMagnitude) : 1.0;
  const hrDelta = hr - rhr;

  // 1. Motion & Physical Activity Filter
  // MPU accelerometer motion (>1.20g, moving flag, or exertional activity state)
  const activeActivities = ['Walking', 'Climbing Stairs', 'Gym', 'Running', 'Active'];
  const isActive = (accelMag > 1.20) || Boolean(isMoving) || activeActivities.includes(activity);
  const isExertionExplained = isActive && (hrDelta > 0);

  const contributingSignals = [];
  const baseScore = 18.0;
  let score = baseScore;
  let state = 'LOW';
  let explanation = 'Current readings are close to your personal baseline.';

  if (isExertionExplained) {
    // Physical activity explains cardiac elevation -> reduce/avoid stress flag
    contributingSignals.push(`Elevated heart rate (+${hrDelta.toFixed(1)} BPM) explained by physical activity (${activity})`);
    contributingSignals.push(`Physical exertion filter active (MPU motion: ${accelMag.toFixed(2)}g)`);
    score = Math.min(35.0, baseScore + Math.max(0, hrDelta) * 0.12);
    state = 'LOW';
    explanation = 'Cardiovascular response is fully consistent with your current physical activity.';
  } else {
    // Inactive / Resting state: compare against personal baseline
    if (hrDelta <= 3.0) {
      contributingSignals.push(`Resting heart rate aligns with personal baseline (${rhr.toFixed(1)} BPM)`);
      score += Math.max(-4.0, hrDelta * 1.5);
    } else if (hrDelta <= 8.0) {
      contributingSignals.push(`Elevated resting heart rate (+${hrDelta.toFixed(1)} BPM above baseline)`);
      contributingSignals.push('No significant physical activity');
      score += 22.0 + (hrDelta - 3.0) * 3.4;
    } else if (hrDelta <= 16.0) {
      contributingSignals.push(`Elevated resting heart rate (+${hrDelta.toFixed(1)} BPM above baseline)`);
      contributingSignals.push('No significant physical activity');
      score += 39.0 + (hrDelta - 8.0) * 2.6;
    } else {
      contributingSignals.push(`Significantly elevated resting heart rate (+${hrDelta.toFixed(1)} BPM above baseline)`);
      contributingSignals.push('No significant physical activity');
      score += 59.0 + Math.min(20.0, (hrDelta - 16.0) * 1.2);
    }

    // 2. Skin Temperature Deviation (Supporting Signal)
    if (temp !== null && temp >= 30.0 && temp <= 43.0) {
      const tempDelta = temp - rtemp;
      if (Math.abs(tempDelta) >= 0.5) {
        const tempPts = Math.min(15.0, Math.abs(tempDelta) * 7.5);
        score += tempPts;
        const sign = tempDelta > 0 ? '+' : '';
        contributingSignals.push(`Temperature deviation (${sign}${tempDelta.toFixed(1)}°C from baseline)`);
      }
    }

    // 3. Subjective Check-in Context (Supporting Context - only applied if physiology shows deviation)
    if (hrDelta > 3.0 && checkin) {
      const moodStr = (checkin.mood || checkin.label || '').toLowerCase();
      if (['difficult', 'poor', 'stressed', 'anxious', 'unwell'].includes(moodStr)) {
        score += 8.0;
        contributingSignals.push('Subjective check-in reports physical fatigue / stress');
      }
      if (checkin.notes) {
        const lowerNotes = checkin.notes.toLowerCase();
        if (['poor sleep', 'insomnia', 'tired', 'headache', 'overworked', 'stressed', 'fatigue'].some(w => lowerNotes.includes(w))) {
          score += 6.0;
          contributingSignals.push('Check-in notes indicate sleep disruption or stress');
        }
      }
    }

    const finalCalculated = Math.min(100, Math.max(0, Math.round(score)));
    if (finalCalculated >= 70) {
      state = 'POSSIBLE STRESS';
      explanation = 'Multiple physiological readings are above the established baseline during low activity.';
    } else if (finalCalculated >= 40) {
      state = 'ELEVATED';
      explanation = 'Heart rate is above your baseline while activity is low.';
    } else {
      state = 'LOW';
      explanation = 'Current readings are close to your personal baseline.';
    }
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    status: state,
    score: finalScore,
    explanation,
    contributingSignals,
    isExertionFiltered: isExertionExplained,
    baselineComparison: {
      restingHr: Number(rhr.toFixed(1)),
      currentHr: Number(hr.toFixed(1)),
      hrDelta: Number(hrDelta.toFixed(1)),
      restingTemp: Number(rtemp.toFixed(1)),
      currentTemp: temp !== null ? Number(temp.toFixed(1)) : null,
      accelMagnitude: Number(accelMag.toFixed(2))
    }
  };
};
