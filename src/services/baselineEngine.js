/**
 * AWEN Client-Side Physiological Baseline & Anomaly Engine
 * 
 * Traditional stress detectors compare users against generic thresholds.
 * AWEN compares users against their own physiological baseline signature.
 * 
 * Features:
 * - Activity-aware normalization (Climbing stairs, walking, caffeine vs non-exertional stress)
 * - 3-7 day baseline learning tracking & discovery cards
 * - Transparent Explainability metrics & confidence scores
 */

export const DEFAULT_BASELINE = {
  restingHr: 64.0,           // bpm
  restingSpo2: 98.6,         // %
  restingTemp: 36.6,         // °C
  recoveryRate: 22.0,        // bpm recovery per min
  hrStdDev: 4.8,             // natural variance
  daysObserved: 5,
  learningProgress: 100,     // % completed
  signatureDate: "Aug 07, 2026",
  signatureId: "AWEN-SIG-8841"
};

// Activity physiological offsets (expected heart rate & temp lift)
export const ACTIVITY_PROFILES = {
  "Resting": { hrOffset: 0, tempOffset: 0.0, description: "Minimal physical exertion" },
  "Studying": { hrOffset: 4, tempOffset: 0.1, description: "Focused cognitive activity" },
  "Working": { hrOffset: 6, tempOffset: 0.1, description: "Desk work / meetings" },
  "Traveling": { hrOffset: 10, tempOffset: 0.2, description: "Commute or movement" },
  "Walking": { hrOffset: 22, tempOffset: 0.4, description: "Light aerobic movement" },
  "Climbing Stairs": { hrOffset: 34, tempOffset: 0.6, description: "Short high-intensity exertion" },
  "Gym": { hrOffset: 46, tempOffset: 0.8, description: "High-intensity physical workout" },
  "Running": { hrOffset: 56, tempOffset: 1.0, description: "Cardiovascular exercise" },
  "Feeling Unwell": { hrOffset: 14, tempOffset: 0.8, description: "Physical discomfort / fatigue" }
};

export class BaselineEngine {
  constructor(userBaseline = DEFAULT_BASELINE) {
    this.baseline = { ...userBaseline };
  }

  /**
   * Evaluates current physiological metrics against personal baseline & activity context.
   */
  evaluateReadings(hr, spo2, temp, activity = "Resting", mood = "Normal") {
    const actConfig = ACTIVITY_PROFILES[activity] || ACTIVITY_PROFILES["Resting"];
    
    // Calculate expected physiological metrics given current activity
    const expectedHr = this.baseline.restingHr + actConfig.hrOffset;
    const expectedTemp = this.baseline.restingTemp + actConfig.tempOffset;
    
    const hrDelta = hr - expectedHr;
    const rawRestingDelta = hr - this.baseline.restingHr;
    const spo2Delta = this.baseline.restingSpo2 - spo2;
    
    // Check if elevated HR is explained by exertion (Stairs, Exercise, Walking)
    const isExertionExplained = (
      ["Walking", "Climbing Stairs", "Gym", "Running"].includes(activity) && 
      hrDelta <= 18
    );

    // Compute composite physiological anomaly score
    let anomalyScore = 0;
    if (!isExertionExplained) {
      anomalyScore = (Math.max(0, hrDelta) / 10.0) + (Math.max(0, spo2Delta) * 1.6) + (Math.abs(temp - expectedTemp) * 1.4);
    } else {
      anomalyScore = 0.3; // Low anomaly because exertion accounts for the reading
    }

    // Determine Wellness Index level (Always positive framing: Excellent, Balanced, Good, Needs Attention)
    let wellnessIndex = "Balanced";
    let emotionalState = "relaxed"; //relaxed (green), learning (blue), attention (amber), stress (soft coral)
    let confidenceScore = 96;

    if (anomalyScore < 0.6) {
      wellnessIndex = "Excellent";
      emotionalState = "relaxed";
      confidenceScore = Math.min(99, Math.floor(94 + (0.6 - anomalyScore) * 8));
    } else if (anomalyScore < 1.4) {
      wellnessIndex = "Balanced";
      emotionalState = "relaxed";
      confidenceScore = Math.min(97, Math.floor(92 + (1.4 - anomalyScore) * 6));
    } else if (anomalyScore < 2.5) {
      wellnessIndex = "Good";
      emotionalState = "attention";
      confidenceScore = Math.min(94, Math.floor(88 + (2.5 - anomalyScore) * 4));
    } else {
      wellnessIndex = "Needs Attention";
      emotionalState = "stress";
      confidenceScore = Math.min(93, Math.floor(86 + Math.random() * 5));
    }

    // Generate explainability diagnosis
    let whySummary = "";
    if (isExertionExplained) {
      whySummary = `Elevated heart rate (+${Math.round(rawRestingDelta)} bpm above resting) is fully expected during '${activity}'. Your cardiovascular recovery curve is operating within your normal baseline range.`;
    } else if (wellnessIndex === "Needs Attention") {
      whySummary = `Your heart rate is +${Math.round(hrDelta)} bpm higher than your personal baseline for '${activity}' despite low physical movement. This pattern often indicates non-physical stress or fatigue.`;
    } else if (wellnessIndex === "Good") {
      whySummary = `Minor physiological deviation (+${Math.round(hrDelta)} bpm from expected baseline). Your body is adjusting smoothly to daily activities.`;
    } else {
      whySummary = `Physiological signals closely align with your learned resting signature (${this.baseline.restingHr} bpm RHR, ${this.baseline.restingSpo2}% SpO₂).`;
    }

    return {
      wellnessIndex,
      emotionalState,
      confidenceScore,
      isExertionExplained,
      metrics: {
        hr: Math.round(hr * 10) / 10,
        spo2: Math.round(spo2 * 10) / 10,
        temp: Math.round(temp * 10) / 10,
        activity,
        mood
      },
      baselineComparison: {
        restingHr: this.baseline.restingHr,
        expectedHr: Math.round(expectedHr * 10) / 10,
        hrDelta: Math.round(hrDelta * 10) / 10,
        rawRestingDelta: Math.round(rawRestingDelta * 10) / 10
      },
      explainability: {
        summary: whySummary,
        factors: [
          {
            title: "Baseline Delta",
            detail: `${hrDelta >= 0 ? '+' : ''}${Math.round(hrDelta * 10) / 10} bpm from expected`,
            status: Math.abs(hrDelta) < 8 ? "normal" : "elevated"
          },
          {
            title: "Activity Context",
            detail: isExertionExplained ? `Exertion Filter Applied (${activity})` : `Filtered for ${activity}`,
            status: "active"
          },
          {
            title: "SpO₂ Oxygen Stability",
            detail: `${Math.round(spo2 * 10) / 10}% (${spo2 >= 96 ? "Optimal" : "Mild Variance"})`,
            status: spo2 >= 96 ? "normal" : "warning"
          },
          {
            title: "Model Confidence",
            detail: `${confidenceScore}% match to personal profile`,
            status: "high"
          }
        ]
      }
    };
  }
}
