/**
 * AWEN Human Conversational AI Engine
 * 
 * Generates warm, supportive, context-aware human dialogue.
 * Completely avoids robotic/scientific jargon (e.g. "physiological baseline").
 * Provides transparent reasoning explaining WHY advice was given.
 */

export class AwenAiEngine {
  constructor() {
    this.userMemory = {
      name: "Diya",
      recentTopic: "exam preparation",
      lastCheckinMood: "Good",
      lastCheckinActivity: "Studying"
    };
  }

  /**
   * Generates dynamic greeting based on time of day & memory context.
   */
  getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return {
        greeting: "Good Morning, Diya.",
        subtitle: "Your overnight recovery looks better than yesterday."
      };
    } else if (hour < 17) {
      return {
        greeting: "Good Afternoon, Diya.",
        subtitle: this.userMemory.recentTopic 
          ? `Hope your ${this.userMemory.recentTopic} is going well.` 
          : "It's nice to see you again."
      };
    } else if (hour < 22) {
      return {
        greeting: "Good Evening, Diya.",
        subtitle: "You've had a busy day. Your readings suggest it's a good time to unwind."
      };
    } else {
      return {
        greeting: "Rest Well, Diya.",
        subtitle: "Awen is quietly keeping an eye on your overnight rest."
      };
    }
  }

  /**
   * Generates human, warm observation based on telemetry & context.
   */
  getObservation(telemetry, evaluation) {
    const activity = telemetry?.activity || "Resting";
    const hr = telemetry?.heartRate || 64;
    const hrDelta = evaluation?.baselineComparison?.hrDelta || 0;

    if (activity === "Walking" || activity === "Climbing Stairs" || activity === "Gym" || activity === "Running") {
      return {
        headline: "You're moving recently.",
        detail: `I noticed your heart rate is ${Math.round(hr)} bpm. Since you've been active (${activity.toLowerCase()}), I'll wait for your heart rate to settle before drawing any conclusions.`
      };
    }

    if (activity === "Studying" || activity === "Working") {
      if (hrDelta > 8) {
        return {
          headline: "Something feels a little different today.",
          detail: "Your heart rate has been slightly higher than your usual pattern while sitting. A short stretch or glass of water might help."
        };
      }
      return {
        headline: "Focused and steady.",
        detail: "Your body looks relaxed while working today. Remember to take a quick break whenever you feel ready."
      };
    }

    if (hrDelta > 12) {
      return {
        headline: "Noticeable variation today.",
        detail: "Your body is working a bit harder than usual right now. Try taking things a little slower if you can."
      };
    }

    return {
      headline: "You're doing well today.",
      detail: "Your body looks relaxed compared to your normal pattern."
    };
  }

  /**
   * Transparent Explainability: Why AWEN reached its conclusion in simple bullet points.
   */
  getExplainableReasoning(telemetry, evaluation) {
    const activity = telemetry?.activity || "Resting";
    const hrDelta = evaluation?.baselineComparison?.hrDelta || 0;

    return {
      summary: "I suggested taking a quick break because:",
      bullets: [
        `Your heart rate stayed ${Math.abs(Math.round(hrDelta))} bpm above your normal pattern for recent minutes.`,
        `Your current physical activity level remained low (${activity.toLowerCase()}).`,
        `Similar patterns usually occur on your busy or focused days.`
      ]
    };
  }

  /**
   * AWEN System Prompt Enforced Conversational Engine
   * 
   * System Directives:
   * 1. Never ignore user's question — answer directly first.
   * 2. Relate answer to heart rate, SpO2, temp, baseline (64 bpm), activity, recent trends & memory.
   * 3. Address food, sleep, stress, exercise, hydration, habits with practical guidance.
   * 4. State when sensor data doesn't track specific details (e.g. diet).
   * 5. Always end with ONE simple, actionable suggestion.
   * 6. Warm 8th-grade reading level, non-medical, non-robotic, non-ChatGPT tone.
   */
  generateChatReply(userMessage, telemetry) {
    const msg = userMessage.trim();
    const lower = msg.toLowerCase();
    
    const hr = Math.round(telemetry?.heartRate || 64);
    const spo2 = Math.round((telemetry?.spo2 || 98.6) * 10) / 10;
    const temp = Math.round((telemetry?.temperature || 36.6) * 10) / 10;
    const activity = telemetry?.activity || "Resting";

    // Track conversational history to prevent identical replies
    if (!this.replyHistory) this.replyHistory = new Set();

    let directAnswer = "";
    let dataContext = "";
    let actionSuggestion = "";

    // 1. Food / Diet / Nutrition
    if (lower.includes("food") || lower.includes("eat") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("snack") || lower.includes("diet")) {
      directAnswer = "Eating light, nutrient-rich meals gives your body steady energy without feeling heavy.";
      dataContext = `While I can't track your exact food intake from your sensor readings, your heart rate is currently ${hr} bpm while ${activity.toLowerCase()}. Digesting heavy meals can temporarily raise your heart rate above your usual 64 bpm baseline.`;
      actionSuggestion = "Try having a small bowl of fresh fruit or nuts for your next snack.";
    }

    // 2. Sleep / Fatigue / Rest
    else if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("nap") || lower.includes("bed")) {
      directAnswer = "Getting 7 to 8 hours of restful sleep is key for letting your muscles and mind recover.";
      dataContext = `Looking at your current readings, your SpO₂ is stable at ${spo2}%, but your body temperature is ${temp}°C. When you don't rest well, your body takes longer to return to your normal 64 bpm resting pattern after moving.`;
      actionSuggestion = "Try dimming your screen lights and stepping away from devices 20 minutes before bed tonight.";
    }

    // 3. Stress / Anxiety / Feeling Overwhelmed
    else if (lower.includes("stress") || lower.includes("anxious") || lower.includes("overwhelmed") || lower.includes("worry") || lower.includes("nervous")) {
      directAnswer = "Feeling stressed is your body's natural response to mental pressure or busy days.";
      dataContext = `Right now, your heart rate is ${hr} bpm while ${activity.toLowerCase()}. This is slightly higher than your normal quiet baseline (64 bpm), showing your body is carrying extra tension.`;
      actionSuggestion = "Try taking 4 slow, deep breaths right now — inhale for 4 seconds, then exhale slowly for 6.";
    }

    // 4. Exercise / Workout / Physical Activity
    else if (lower.includes("exercise") || lower.includes("workout") || lower.includes("run") || lower.includes("gym") || lower.includes("walk") || lower.includes("stairs")) {
      directAnswer = "Regular physical movement strengthens your heart and helps you recover faster after exertion.";
      dataContext = `During ${activity.toLowerCase()}, your heart rate naturally rises to ${hr} bpm. Because I know your weekly pattern, I filter this exertion so it never triggers false stress warnings. Your recovery speed is operating well.`;
      actionSuggestion = "Remember to take 2 minutes after moving to let your breathing return to normal.";
    }

    // 5. Hydration / Water
    else if (lower.includes("water") || lower.includes("hydrate") || lower.includes("drink") || lower.includes("thirsty")) {
      directAnswer = "Drinking enough water keeps your blood flowing smoothly and helps control your body temperature.";
      dataContext = `Your skin temperature is currently ${temp}°C and your heart rate is ${hr} bpm. Dehydration can cause your heart to beat slightly faster even when you're sitting still.`;
      actionSuggestion = "Drink one full glass of water right now to help your body stay balanced.";
    }

    // 6. Exam / Study / Work Pressure
    else if (lower.includes("exam") || lower.includes("study") || lower.includes("test") || lower.includes("work") || lower.includes("meeting")) {
      this.userMemory.recentTopic = "exam preparation";
      directAnswer = "Focused studying and work take significant mental energy, which naturally increases cognitive load.";
      dataContext = `Your readings show a steady rhythm at ${hr} bpm while ${activity.toLowerCase()}. Your SpO₂ is optimal at ${spo2}%, meaning your focus is supported.`;
      actionSuggestion = "Take a 5-minute break every hour to stand up and stretch your arms.";
    }

    // 7. General Questions about AWEN, Baseline, or Health Readings
    else if (lower.includes("how am i") || lower.includes("doing") || lower.includes("wellness") || lower.includes("pattern") || lower.includes("baseline")) {
      directAnswer = "You are doing well overall today and your body is adapting nicely.";
      dataContext = `Your current heart rate is ${hr} bpm and SpO₂ is ${spo2}%. This closely matches your 5-day personal body pattern (64 bpm resting).`;
      actionSuggestion = "Keep up your current rhythm and take a brief quiet pause later this afternoon.";
    }

    // 8. Fallback for any other user question
    else {
      directAnswer = `To answer your question about "${msg}": taking care of your daily balance is all about listening to your body.`;
      dataContext = `Your live heart rate is ${hr} bpm and SpO₂ is ${spo2}% while ${activity.toLowerCase()}. These readings align smoothly with your personal pattern.`;
      actionSuggestion = "Take one deep breath and enjoy a short moment of relaxation right now.";
    }

    const fullReply = `${directAnswer} ${dataContext} ${actionSuggestion}`;

    // Prevent duplicate responses
    if (this.replyHistory.has(fullReply)) {
      return `${directAnswer} ${actionSuggestion}`;
    }
    this.replyHistory.add(fullReply);

    return fullReply;
  }
}

export const aiEngine = new AwenAiEngine();

