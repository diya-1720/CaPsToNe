/**
 * AWEN Time-Aware Personality Engine
 * 
 * Contextual Selection Cascade:
 * timeContext -> healthContext -> activityContext -> conversationContext -> recentMessageContext
 * 
 * Time Windows:
 * 1. EARLY_MORNING (5:00 - 8:00)
 * 2. MORNING (8:00 - 11:30)
 * 3. LUNCH_WINDOW (11:30 - 14:30)
 * 4. AFTERNOON (14:30 - 17:30)
 * 5. EVENING (17:30 - 21:00)
 * 6. NIGHT (21:00 - 00:00)
 * 7. LATE_NIGHT (00:00 - 5:00)
 */

export const TIME_WINDOWS = {
  EARLY_MORNING: "EARLY_MORNING",
  MORNING: "MORNING",
  LUNCH_WINDOW: "LUNCH_WINDOW",
  AFTERNOON: "AFTERNOON",
  EVENING: "EVENING",
  NIGHT: "NIGHT",
  LATE_NIGHT: "LATE_NIGHT"
};

export const TIME_MESSAGES = {
  [TIME_WINDOWS.EARLY_MORNING]: [
    { text: "Good morning ☀️ Did you sleep well?", expression: "happy" },
    { text: "Morninggg! You're up early today.", expression: "happy" },
    { text: "Good morning. How are you feeling today?", expression: "happy" },
    { text: "New day, new start. How's your energy feeling?", expression: "happy" },
    { text: "Morning 🌱 Let's see how your body is doing today.", expression: "happy" }
  ],
  [TIME_WINDOWS.MORNING]: [
    { text: "How's your morning going?", expression: "happy" },
    { text: "Have you had breakfast yet?", expression: "thinking" },
    { text: "Don't let a busy morning make you forget some water.", expression: "happy" },
    { text: "How are you feeling after getting started today?", expression: "happy" },
    { text: "Ready to take on the day?", expression: "happy" }
  ],
  [TIME_WINDOWS.LUNCH_WINDOW]: [
    { text: "Have you had your lunch yet? 👀", expression: "thinking" },
    { text: "It's around lunchtime. Please don't survive on snacks today. 😭", expression: "thinking" },
    { text: "Study break! Have something proper to eat before getting back to it.", expression: "happy" },
    { text: "How's your energy holding up? Maybe it's time for a lunch break.", expression: "thinking" },
    { text: "Before you get back to your day — have you eaten?", expression: "happy" }
  ],
  [TIME_WINDOWS.AFTERNOON]: [
    { text: "Afternoon check-in 🌿 How are you feeling?", expression: "happy" },
    { text: "How's your energy holding up?", expression: "thinking" },
    { text: "You've been going for a while. Maybe a tiny break?", expression: "thinking" },
    { text: "Still going strong?", expression: "happy" },
    { text: "Take a second to unclench your shoulders. 😭", expression: "concerned" }
  ],
  [TIME_WINDOWS.EVENING]: [
    { text: "Long day?", expression: "concerned" },
    { text: "How did today treat you?", expression: "happy" },
    { text: "You've made it through most of the day. How are you feeling?", expression: "happy" },
    { text: "Before you get busy again, take a moment for yourself.", expression: "happy" },
    { text: "Evening check-in 🌇 How's your body feeling?", expression: "happy" }
  ],
  [TIME_WINDOWS.NIGHT]: [
    { text: "It's getting late. Are you still studying?", expression: "thinking" },
    { text: "Night check 🌙 How are you feeling?", expression: "sleeping" },
    { text: "You've done enough for today. Give yourself some quiet time.", expression: "sleeping" },
    { text: "Looks like your day is winding down.", expression: "sleeping" },
    { text: "Your body may be ready to slow down now.", expression: "sleeping" }
  ],
  [TIME_WINDOWS.LATE_NIGHT]: [
    { text: "Still awake? 👀", expression: "thinking" },
    { text: "If you can, give your brain some rest.", expression: "concerned" },
    { text: "Okay sleepyhead, maybe it's time to call it a day. 🌙", expression: "sleeping" },
    { text: "It's really late. Be kind to tomorrow's version of you.", expression: "sleeping" },
    { text: "One last check before you call it a night?", expression: "sleeping" }
  ]
};

// Cooldown & Repetition Tracking
const messageHistory = [];

/**
 * Returns current flexible Time Window based on local hour
 */
export function getTimeWindow(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 8) return TIME_WINDOWS.EARLY_MORNING;
  if (hour >= 8 && hour < 11.5) return TIME_WINDOWS.MORNING;
  if (hour >= 11.5 && hour < 14.5) return TIME_WINDOWS.LUNCH_WINDOW;
  if (hour >= 14.5 && hour < 17.5) return TIME_WINDOWS.AFTERNOON;
  if (hour >= 17.5 && hour < 21) return TIME_WINDOWS.EVENING;
  if (hour >= 21 || hour < 0) return TIME_WINDOWS.NIGHT;
  return TIME_WINDOWS.LATE_NIGHT;
}

/**
 * Main evaluation engine consuming full wellnessContext
 */
export function evaluateAwenSpeech(wellnessContext) {
  const {
    heartRate = 64,
    baselineHeartRate = 64,
    activityState = "Resting",
    observationMode = false,
    isNightMode = false,
    hasEatenLunch = false,
    recentTopic = null
  } = wellnessContext || {};

  const hour = new Date().getHours();
  const timeWin = getTimeWindow(hour);
  const hrDelta = heartRate - baselineHeartRate;

  let selected = null;

  // Priority 1: Observation Mode (Do NOT make strong stress conclusions)
  if (observationMode) {
    selected = {
      text: "I'm still learning your usual pattern. Give me a little more time and I'll understand what's normal for you. 🌱",
      expression: "thinking"
    };
  }
  // Priority 2: Climbing Stairs Activity Filter
  else if (activityState === "Climbing Stairs" || activityState === "Stairs") {
    selected = {
      text: "Your heart rate is up, but you're climbing stairs, so that makes sense. I'll keep watching! 🚶‍♂️",
      expression: "happy"
    };
  }
  // Priority 3: Heavy Physical Exercise / Gym / Running
  else if (["Gym", "Running", "Exercise", "Workout"].includes(activityState)) {
    selected = {
      text: "Your heart rate is higher because you're active. That's expected. I'll check how quickly you settle afterward. 🏃",
      expression: "celebrating"
    };
  }
  // Priority 4: Walking Activity Filter
  else if (activityState === "Walking") {
    selected = {
      text: "Your heart rate is slightly elevated while walking. That's normal movement. I'll keep tracking your rhythm. 🚶",
      expression: "happy"
    };
  }
  // Priority 5: Elevated HR while Resting (Non-Exertional Variance)
  else if (activityState === "Resting" && hrDelta > 8) {
    selected = {
      text: "Your heart rate is a little higher than your usual resting pattern. Let's keep an eye on it calmly. 💙",
      expression: "concerned"
    };
  }
  // Priority 6: Normal Resting Pattern
  else if (activityState === "Resting" && Math.abs(hrDelta) <= 8) {
    selected = {
      text: "You're looking pretty steady right now. Nothing unusual. 😊",
      expression: "happy"
    };
  }
  // Priority 7: Memory / Exam Context
  else if (recentTopic === "exam preparation" || recentTopic === "studying") {
    if (timeWin === TIME_WINDOWS.MORNING || timeWin === TIME_WINDOWS.AFTERNOON) {
      selected = {
        text: "Exam prep already? Don't forget to give your brain a proper break.",
        expression: "thinking"
      };
    } else if (timeWin === TIME_WINDOWS.NIGHT || timeWin === TIME_WINDOWS.LATE_NIGHT) {
      selected = {
        text: "Still studying for those exams? Don't forget that sleep is part of preparation too. 🌙",
        expression: "sleeping"
      };
    }
  }

  // Fallback: Pick appropriate message from current Time Window
  if (!selected) {
    const candidates = TIME_MESSAGES[timeWin] || TIME_MESSAGES[TIME_WINDOWS.AFTERNOON];
    
    // Filter out messages shown in recent 5 interactions
    const freshCandidates = candidates.filter(c => !messageHistory.includes(c.text));
    const pool = freshCandidates.length > 0 ? freshCandidates : candidates;

    selected = pool[Math.floor(Math.random() * pool.length)];
  }

  // Push to history
  messageHistory.unshift(selected.text);
  if (messageHistory.length > 10) messageHistory.pop();

  return selected;
}

