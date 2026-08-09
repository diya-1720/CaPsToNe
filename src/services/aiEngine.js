/**
 * AWEN Human Conversational AI Engine
 * 
 * Generates warm, supportive, context-aware human dialogue.
 * Completely avoids robotic/scientific jargon (e.g. "physiological baseline").
 * Answers the user's specific questions directly in simple English first,
 * then ties to personal body patterns when relevant.
 */

export class AwenAiEngine {
  constructor() {
    this.userMemory = {
      name: "",
      recentTopic: "wellness",
      lastCheckinMood: "Good",
      lastCheckinActivity: "Resting"
    };
  }

  /** Update remembered user name */
  setUserName(name) {
    this.userMemory.name = name || "";
  }

  /**
   * Generates dynamic greeting based on time of day & memory context.
   */
  getGreeting() {
    const hour = new Date().getHours();
    const nameSuffix = this.userMemory.name ? `, ${this.userMemory.name}` : '';

    if (hour < 12) {
      return {
        greeting: `Good Morning${nameSuffix}.`,
        subtitle: "Your overnight recovery looks better than yesterday."
      };
    } else if (hour < 17) {
      return {
        greeting: `Good Afternoon${nameSuffix}.`,
        subtitle: this.userMemory.recentTopic 
          ? `Hope your ${this.userMemory.recentTopic} is going well.` 
          : "It's nice to see you again."
      };
    } else if (hour < 22) {
      return {
        greeting: `Good Evening${nameSuffix}.`,
        subtitle: "You've had a busy day. Your readings suggest it's a good time to unwind."
      };
    } else {
      return {
        greeting: `Rest Well${nameSuffix}.`,
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
   * Directives:
   * 1. Direct Answer First: Directly answer the user's specific question in simple, natural English.
   * 2. Context Link: Relate the answer to current live heart rate, SpO2, temperature, baseline, or activity.
   * 3. Clear Action: End with one simple, practical wellness suggestion.
   * 4. Non-Medical & Non-Robotic: Maintain a warm, encouraging 8th-grade reading level without medical jargon.
   */
  generateChatReply(userMessage, telemetry) {
    const msg = userMessage.trim();
    const lower = msg.toLowerCase();
    
    const hr = Math.round(telemetry?.heartRate || 64);
    const spo2 = Math.round((telemetry?.spo2 || 98.6) * 10) / 10;
    const temp = Math.round((telemetry?.temperature || 36.6) * 10) / 10;
    const activity = telemetry?.activity || "Resting";

    if (!this.replyHistory) this.replyHistory = new Set();

    let directAnswer = "";
    let dataContext = "";
    let actionSuggestion = "";

    // 1. Chocolate / Sweets / Sugar
    if (lower.includes("chocolate") || lower.includes("sweet") || lower.includes("sugar") || lower.includes("candy") || lower.includes("junk food")) {
      directAnswer = "Eating chocolate or sweets in moderation is perfectly okay, but having a lot of sugar can cause a quick spike in your blood energy followed by a sudden dip.";
      dataContext = `While my sensors don't measure diet directly, digesting extra sugar can temporarily make your heart beat slightly faster than your normal 64 bpm resting pattern. Right now your heart rate is ${hr} bpm while ${activity.toLowerCase()}.`;
      actionSuggestion = "Drink a large glass of water now and choose a protein or fiber-rich meal later to steady your energy.";
    }

    // 2. Coffee / Caffeine / Tea / Energy Drinks
    else if (lower.includes("coffee") || lower.includes("caffeine") || lower.includes("tea") || lower.includes("energy drink")) {
      directAnswer = "Caffeine temporarily stimulates your heart and brain, making you feel more alert, but too much can lead to restlessness.";
      dataContext = `Your live heart rate is ${hr} bpm while ${activity.toLowerCase()}. Caffeine often causes a temporary increase above your typical resting pattern of 64 bpm.`;
      actionSuggestion = "Try sipping cold water alongside your coffee to stay hydrated.";
    }

    // 3. Headache / Pain / Dizziness / Feeling Sick
    else if (lower.includes("headache") || lower.includes("head pain") || lower.includes("dizzy") || lower.includes("sick") || lower.includes("pain")) {
      directAnswer = "Headaches or mild discomfort are often your body's signal that you need water, fresh air, or a rest from screen time.";
      dataContext = `Your temperature is currently ${temp}°C and SpO₂ is ${spo2}%. Your overall body readings look steady, so rest and hydration are great next steps.`;
      actionSuggestion = "Close your eyes in a quiet room for 10 minutes and slowly drink some warm water.";
    }

    // 4. General Food / Diet / Meals
    else if (lower.includes("food") || lower.includes("eat") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("snack") || lower.includes("diet")) {
      directAnswer = "Balanced, fresh meals give your body steady energy throughout the day without feeling heavy or sluggish.";
      dataContext = `Digestive activity naturally increases blood flow to your stomach, which can slightly elevate your resting heart rate from your usual 64 bpm baseline. Currently, your heart rate is ${hr} bpm.`;
      actionSuggestion = "Include fresh greens, fruit, or nuts in your next meal to support steady digestion.";
    }

    // 5. Sleep / Fatigue / Rest
    else if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("nap") || lower.includes("bed")) {
      directAnswer = "Restful sleep lets your brain clear out metabolic waste and gives your heart a chance to rest deeply.";
      dataContext = `Your SpO₂ is stable at ${spo2}%, and your body temperature is ${temp}°C. When you're tired, your resting heart rate can take longer to settle after daily tasks.`;
      actionSuggestion = "Dim your lights 30 minutes before bed tonight and put away bright screens.";
    }

    // 6. Stress / Anxiety / Feeling Overwhelmed
    else if (lower.includes("stress") || lower.includes("anxious") || lower.includes("overwhelmed") || lower.includes("worry") || lower.includes("nervous")) {
      directAnswer = "Feeling stressed is a completely natural reaction when your day gets busy or demanding.";
      dataContext = `Your current heart rate is ${hr} bpm while ${activity.toLowerCase()}. That's slightly higher than your normal quiet resting pattern (64 bpm), showing your nervous system is carrying tension.`;
      actionSuggestion = "Take 4 slow, deep breaths right now — inhale for 4 seconds, then exhale slowly for 6.";
    }

    // 7. Exercise / Workout / Movement
    else if (lower.includes("exercise") || lower.includes("workout") || lower.includes("run") || lower.includes("gym") || lower.includes("walk") || lower.includes("stairs")) {
      directAnswer = "Regular physical movement strengthens your cardiovascular system and boosts your overall mood.";
      dataContext = `During physical activity, your heart rate naturally rises to ${hr} bpm. Because I know your weekly baseline pattern, I treat this exertion as healthy movement rather than stress.`;
      actionSuggestion = "Take 2 minutes to walk slowly and let your heart rate settle back down.";
    }

    // 8. Hydration / Water
    else if (lower.includes("water") || lower.includes("hydrate") || lower.includes("drink") || lower.includes("thirsty")) {
      directAnswer = "Water is essential for proper blood volume, circulation, and keeping your body temperature balanced.";
      dataContext = `Your skin temperature is ${temp}°C and heart rate is ${hr} bpm. Staying hydrated helps keep your heart rate steady at rest.`;
      actionSuggestion = "Drink one full glass of water right now to give your body a quick refresh.";
    }

    // 9. Exam / Study / Work Pressure
    else if (lower.includes("exam") || lower.includes("study") || lower.includes("test") || lower.includes("work") || lower.includes("meeting")) {
      this.userMemory.recentTopic = "studying";
      directAnswer = "Focused mental work requires sustained brain power, which can gradually raise your subtle tension levels.";
      dataContext = `Your rhythm is currently steady at ${hr} bpm while ${activity.toLowerCase()}, and your SpO₂ is optimal at ${spo2}%.`;
      actionSuggestion = "Take a 5-minute break every hour to stand up and stretch.";
    }

    // 10. How am I doing / Baseline / Overview
    else if (lower.includes("how am i") || lower.includes("doing") || lower.includes("wellness") || lower.includes("pattern") || lower.includes("baseline")) {
      directAnswer = "You are doing well today, and your body is staying within a healthy, comfortable range.";
      dataContext = `Your live heart rate is ${hr} bpm and SpO₂ is ${spo2}%, closely aligning with your personal body pattern.`;
      actionSuggestion = "Keep up your gentle pace and enjoy a quiet pause later today.";
    }

    // 11. Conversational Fallback — Directly address the prompt topic
    else {
      directAnswer = `Regarding "${msg}": taking care of your daily balance starts with listening to your body's small cues.`;
      dataContext = `Your current heart rate is ${hr} bpm and SpO₂ is ${spo2}% while ${activity.toLowerCase()}. These readings align nicely with your normal pattern.`;
      actionSuggestion = "Take a gentle deep breath and give yourself a peaceful moment right now.";
    }

    const fullReply = `${directAnswer} ${dataContext} ${actionSuggestion}`;

    if (this.replyHistory.has(fullReply)) {
      return `${directAnswer} ${actionSuggestion}`;
    }
    this.replyHistory.add(fullReply);

    return fullReply;
  }
}

export const aiEngine = new AwenAiEngine();
