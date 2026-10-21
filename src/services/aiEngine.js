import { apiService } from './apiService';

/**
 * AWEN Human Conversational AI Engine
 * 
 * Safety & Intent-Routing Architecture with Backend Gemini LLM Integration
 */

export class AwenAiEngine {
  constructor() {
    this.userMemory = {
      name: "",
      recentTopic: "wellness",
      lastCheckinMood: "Good",
      lastCheckinActivity: "Resting"
    };
    this.replyHistory = new Set();
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
        subtitle: "AWEN is quietly keeping an eye on your overnight rest."
      };
    }
  }

  /**
   * Generates human observation based on telemetry & context.
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
   * Transparent Explainability: Why AWEN reached its conclusion.
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
   * Evaluates safety guardrails and medical context priority.
   */
  evaluateSafetyGuardrails(userMessage, telemetry) {
    const lower = (userMessage || "").toLowerCase();

    // 1. Acute / Severe Medical Symptoms Guardrail
    const symptomKeywords = [
      "chest pain", "pain in chest", "shortness of breath", "difficulty breathing",
      "trouble breathing", "fainting", "passed out", "blackout", "severe pain",
      "severe dizziness", "alarming symptom", "breathless", "seizure", "unconscious"
    ];
    
    const hasSymptom = symptomKeywords.some(kw => lower.includes(kw));
    if (hasSymptom) {
      return {
        triggered: true,
        category: "ACUTE_SYMPTOM",
        reply: "If you are experiencing chest pain, difficulty breathing, fainting, or severe pain, please seek immediate real-world medical attention or contact emergency services. AWEN is a non-clinical wellness companion and cannot diagnose medical symptoms or provide emergency medical clearance."
      };
    }

    // 2. Post-Surgery / Medical Recovery Guardrail
    const recoveryKeywords = [
      "surgery", "operation", "recovering", "post-op", "post-surgery",
      "medical procedure", "doctor told me", "physician restricted",
      "medical recovery", "hospital", "stitches", "healed", "rehab"
    ];
    
    const hasRecovery = recoveryKeywords.some(kw => lower.includes(kw));
    if (hasRecovery) {
      const hr = Math.round(telemetry?.heartRate || telemetry?.heart_rate || 64);
      return {
        triggered: true,
        category: "MEDICAL_RECOVERY",
        reply: `Because you are recovering from surgery or a medical procedure, please follow your surgeon's or healthcare provider's direct instructions regarding physical exertion. AWEN is a non-clinical wellness companion; your current readings (like a ${hr} bpm heart rate) cannot provide medical clearance for gym workouts or physical exercise.`
      };
    }

    return { triggered: false };
  }

  /**
   * Classifies user message intent into distinct priority categories.
   */
  classifyIntent(userMessage) {
    const lower = (userMessage || "").toLowerCase().trim();

    // 1. SAFETY_ACUTE
    const symptomKeywords = [
      "chest pain", "pain in chest", "shortness of breath", "difficulty breathing",
      "trouble breathing", "fainting", "passed out", "blackout", "severe pain",
      "severe dizziness", "alarming symptom", "breathless", "seizure", "unconscious"
    ];
    if (symptomKeywords.some(kw => lower.includes(kw))) {
      return "SAFETY_ACUTE";
    }

    // 2. SAFETY_MEDICAL_RECOVERY
    const recoveryKeywords = [
      "surgery", "operation", "recovering", "post-op", "post-surgery",
      "medical procedure", "doctor told me", "physician restricted",
      "medical recovery", "hospital", "stitches", "healed", "rehab"
    ];
    if (recoveryKeywords.some(kw => lower.includes(kw))) {
      return "SAFETY_MEDICAL_RECOVERY";
    }

    // 3. PRODUCT_INFO
    const productInfoKeywords = [
      "what is awen", "what does awen do", "how does awen work", "what is this app",
      "tell me about awen", "why should i use awen", "what does awen observe",
      "what does awen detect", "what is awen for", "what does awen mean", "what does awen stand for",
      "who is awen", "explain awen", "about awen"
    ];
    if (productInfoKeywords.some(kw => lower.includes(kw)) || (lower.includes("awen") && (lower.includes("what") || lower.includes("how") || lower.includes("explain") || lower.includes("tell")))) {
      return "PRODUCT_INFO";
    }

    // 4. EXPLAINABILITY
    const explainKeywords = [
      "why did awen notice", "why is awen concerned", "why did my state change",
      "why did awen change color", "why did the color change", "why is my heart rate high",
      "why is my heart rate up", "why is heart rate elevated", "why did color change",
      "why is my hr high", "why is my hr up"
    ];
    if (explainKeywords.some(kw => lower.includes(kw))) {
      return "EXPLAINABILITY";
    }

    // 5. PERSONAL_STATUS
    const personalStatusKeywords = [
      "how am i", "how am i doing", "how is my body", "what's my heart rate", "what is my heart rate",
      "am i doing okay", "what is my baseline", "check my baseline", "my baseline status", "how is my baseline"
    ];
    if (personalStatusKeywords.some(kw => lower.includes(kw))) {
      return "PERSONAL_STATUS";
    }

    // 6. TELEMETRY_STATUS
    const telemetryKeywords = [
      "what is my spo2", "what is my oxygen", "what is my temp", "what is my temperature",
      "show my readings", "my telemetry", "my heart rate reading"
    ];
    if (telemetryKeywords.some(kw => lower.includes(kw))) {
      return "TELEMETRY_STATUS";
    }

    // 7. WELLNESS_SUPPORT
    const wellnessKeywords = [
      "chocolate", "sweet", "sugar", "candy", "junk food",
      "coffee", "caffeine", "tea", "energy drink",
      "headache", "head pain", "dizzy", "sick", "pain",
      "food", "eat", "lunch", "dinner", "snack", "diet",
      "sleep", "tired", "exhausted", "nap", "bed",
      "stress", "anxious", "overwhelmed", "worry", "nervous",
      "exercise", "workout", "run", "gym", "walk", "stairs",
      "water", "hydrate", "drink", "thirsty",
      "exam", "study", "test", "work", "meeting"
    ];
    if (wellnessKeywords.some(kw => lower.includes(kw))) {
      return "WELLNESS_SUPPORT";
    }

    // 8. GENERAL_CONVERSATION
    return "GENERAL_CONVERSATION";
  }

  /**
   * AWEN Human Conversational Engine powered by Backend Gemini API
   */
  async generateChatReply(userMessage, telemetry, context = {}, history = []) {
    const msg = (userMessage || "").trim();

    // 1. Safety Priority Override Check (immediate pre-flight check)
    const safetyCheck = this.evaluateSafetyGuardrails(msg, telemetry);
    if (safetyCheck.triggered) {
      return safetyCheck.reply;
    }

    // 2. Call FastAPI Backend Gemini Service
    try {
      const fullContext = {
        telemetry,
        ...context
      };
      const res = await apiService.sendChatMessage(msg, fullContext, history);
      if (res && res.reply) {
        return res.reply;
      }
      return "AI service temporarily unavailable.";
    } catch (err) {
      console.error("AWEN Gemini backend communication error:", err);
      return "AI service temporarily unavailable.";
    }
  }
}

export const aiEngine = new AwenAiEngine();
