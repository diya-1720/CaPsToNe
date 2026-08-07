/**
 * AWEN Centralized State Engine
 * 
 * Determines AWEN's current contextual state, baseline confidence level,
 * and emotional color reactivity theme.
 * 
 * States:
 * - LEARNING: Observation Mode active. Color: Lavender / Soft Cyan
 * - BALANCED: Normal resting baseline. Color: Soft Cyan / Emerald
 * - ACTIVE: Physical movement / Exercise. Color: Warm Golden Yellow
 * - WATCHFUL: Elevated HR while resting. Color: Soft Amber
 * - WIND_DOWN: Evening / Night rest mode. Color: Deep Violet / Blue
 */

export const AWEN_STATES = {
  LEARNING: "LEARNING",
  BALANCED: "BALANCED",
  ACTIVE: "ACTIVE",
  WATCHFUL: "WATCHFUL",
  WIND_DOWN: "WIND_DOWN"
};

export const CONFIDENCE_LEVELS = {
  LEARNING: "Learning",
  EARLY: "Early baseline",
  DEVELOPING: "Developing baseline",
  STABLE: "Stable baseline"
};

export const STATE_COLOR_THEMES = {
  [AWEN_STATES.LEARNING]: {
    bodyGrad: ['#f3e8ff', '#e9d5ff', '#c084fc'],
    haloColor: 'rgba(192, 132, 252, 0.5)',
    auraColor: 'rgba(192, 132, 252, 0.2)',
    finColor: '#c084fc',
    label: 'Learning Your Pattern'
  },
  [AWEN_STATES.BALANCED]: {
    bodyGrad: ['#ecfeff', '#cff4fc', '#34d399'],
    haloColor: 'rgba(52, 211, 153, 0.45)',
    auraColor: 'rgba(52, 211, 153, 0.18)',
    finColor: '#34d399',
    label: 'Balanced Rhythm'
  },
  [AWEN_STATES.ACTIVE]: {
    bodyGrad: ['#fef3c7', '#fde68a', '#f59e0b'],
    haloColor: 'rgba(245, 158, 11, 0.5)',
    auraColor: 'rgba(245, 158, 11, 0.22)',
    finColor: '#fbbf24',
    label: 'Active Movement'
  },
  [AWEN_STATES.WATCHFUL]: {
    bodyGrad: ['#ffedd5', '#fed7aa', '#f97316'],
    haloColor: 'rgba(249, 115, 22, 0.5)',
    auraColor: 'rgba(249, 115, 22, 0.22)',
    finColor: '#f97316',
    label: 'Noticing Elevation'
  },
  [AWEN_STATES.WIND_DOWN]: {
    bodyGrad: ['#e0e7ff', '#c7d2fe', '#818cf8'],
    haloColor: 'rgba(129, 140, 248, 0.5)',
    auraColor: 'rgba(129, 140, 248, 0.2)',
    finColor: '#818cf8',
    label: 'Rest & Wind Down'
  }
};

export class AwenStateEngine {
  /**
   * Computes the current AWEN State Object from user context
   */
  evaluateState({
    observationMode = false,
    daysObserved = 5,
    heartRate = 64,
    baselineHeartRate = 64,
    activityState = "Resting",
    isNightMode = false
  }) {
    const hour = new Date().getHours();
    const isLate = isNightMode || hour >= 22 || hour < 6;
    const hrDelta = heartRate - baselineHeartRate;
    const isMoving = ["Walking", "Climbing Stairs", "Gym", "Running", "Exercise"].includes(activityState);

    // Determine Baseline Confidence State
    let confidence = CONFIDENCE_LEVELS.STABLE;
    if (observationMode || daysObserved < 2) {
      confidence = CONFIDENCE_LEVELS.LEARNING;
    } else if (daysObserved < 4) {
      confidence = CONFIDENCE_LEVELS.EARLY;
    } else if (daysObserved < 6) {
      confidence = CONFIDENCE_LEVELS.DEVELOPING;
    } else {
      confidence = CONFIDENCE_LEVELS.STABLE;
    }

    // Determine Contextual Wellness State
    let wellnessState = AWEN_STATES.BALANCED;

    if (observationMode) {
      wellnessState = AWEN_STATES.LEARNING;
    } else if (isLate) {
      wellnessState = AWEN_STATES.WIND_DOWN;
    } else if (isMoving) {
      wellnessState = AWEN_STATES.ACTIVE;
    } else if (hrDelta > 10) {
      wellnessState = AWEN_STATES.WATCHFUL;
    } else {
      wellnessState = AWEN_STATES.BALANCED;
    }

    const colorTheme = STATE_COLOR_THEMES[wellnessState] || STATE_COLOR_THEMES[AWEN_STATES.BALANCED];

    return {
      mode: observationMode ? "observation" : "normal",
      wellnessState,
      confidence,
      activityContext: activityState,
      hrDelta: Math.round(hrDelta),
      timeOfDay: hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 22 ? "Evening" : "Night",
      colorTheme
    };
  }
}

export const stateEngine = new AwenStateEngine();
