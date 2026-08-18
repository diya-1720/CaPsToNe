import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AWEN Human Conversational AI Engine
 * 
 * Intent-Routing Architecture:
 * Priority Hierarchy:
 *  1. SAFETY_ACUTE (Chest Pain, Shortness of Breath, Fainting, Severe Dizziness)
 *  2. SAFETY_MEDICAL_RECOVERY (Post-surgery, Operation, Doctor restricted)
 *  3. PRODUCT_INFO ("What is AWEN?", "What does AWEN do?", "What does AWEN mean?")
 *  4. EXPLAINABILITY ("Why did AWEN notice this?", "Why did AWEN change color?")
 *  5. PERSONAL_STATUS ("How am I doing?", "What is my baseline?")
 *  6. TELEMETRY_STATUS ("What is my heart rate?", "What is my SpO2?")
 *  7. WELLNESS_SUPPORT (Chocolate, caffeine, fatigue, stress, exercise, hydration, exams)
 *  8. GENERAL_CONVERSATION ("Hi", "Hey AWEN", casual chatter)
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
    // Load API key from environment variables for future LLM integration
    this.apiKey = import.meta.env.VITE_CHATBOT_API_KEY || null;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.chatSession = null;
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
   * AWEN System Prompt Enforced Conversational Engine with Intent-Routing
   */
  async generateChatReply(userMessage, telemetry) {
    const msg = (userMessage || "").trim();
    const lower = msg.toLowerCase();
    
    // 1. Safety Priority Override Check
    const safetyCheck = this.evaluateSafetyGuardrails(msg, telemetry);
    if (safetyCheck.triggered) {
      return safetyCheck.reply;
    }

    const hr = Math.round(telemetry?.heartRate || telemetry?.heart_rate || 64);
    const spo2 = Math.round((telemetry?.spo2 || 98.6) * 10) / 10;
    const temp = Math.round((telemetry?.temperature || 36.6) * 10) / 10;
    const activity = telemetry?.activity || "Resting";

    // Call Gemini API if available
    if (this.genAI) {
      try {
        if (!this.chatSession) {
          const model = this.genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
          this.chatSession = model.startChat({ history: [] });
        }
        
        const systemContext = `[System Context: You are AWEN, a non-clinical wellness companion. Be empathetic, concise (1-3 sentences). DO NOT give medical advice. Frame variations as 'comparing against personal baseline'. Current Telemetry - HR: ${hr} bpm, SpO2: ${spo2}%, Temp: ${temp}C, Activity: ${activity}. Use only if relevant.]\n\nUser: `;
        
        const prompt = systemContext + msg;
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timed out (API is taking too long)")), 60000)
        );
        
        const result = await Promise.race([
          this.chatSession.sendMessage(prompt),
          timeoutPromise
        ]);
        
        return result.response.text().trim();
      } catch (error) {
        console.error("Gemini API Error:", error);
        return `I encountered an error connecting to the AI service: ${error.message}. Please check your API key and connection.`;
      }
    }

    // 2. Classify Conversational Intent
    const intent = this.classifyIntent(msg);

    // --- INTENT ROUTING LOGIC ---

    // 3. PRODUCT_INFO INTENT (NO TELEMETRY INJECTION!)
    if (intent === "PRODUCT_INFO") {
      if (lower.includes("mean") || lower.includes("stand for") || lower.includes("name")) {
        return "AWEN stands for Adaptive Wellness & Emotional Navigation. It is designed to help you understand your body's personal rhythm and patterns over time.";
      }
      if (lower.includes("do") || lower.includes("work") || lower.includes("observe") || lower.includes("detect")) {
        return "AWEN observes signals such as heart rate, movement, and available telemetry, learns your personal baseline over time, and turns changes from your usual pattern into understandable insights and practical next steps.\n\nAWEN is designed for non-clinical wellness support. It does not diagnose medical conditions or provide medical clearance.";
      }
      return "AWEN is your personal wellness companion. It observes signals such as heart rate, movement, and available telemetry, learns your personal baseline over time, and turns changes from your usual pattern into understandable insights and practical next steps.\n\nAWEN is designed for non-clinical wellness support. It does not diagnose medical conditions or provide medical clearance.";
    }

    // 4. EXPLAINABILITY INTENT
    if (intent === "EXPLAINABILITY") {
      if (lower.includes("color") || lower.includes("theme")) {
        return "AWEN's mascot aura and visual theme change to reflect your current wellness state. An emerald green glow indicates a balanced resting baseline, golden yellow reflects active physical movement, and amber shows an elevated resting rate compared to your personal baseline.";
      }
      if (lower.includes("heart rate") || lower.includes("hr") || lower.includes("elevated") || lower.includes("high") || lower.includes("up")) {
        if (["Walking", "Climbing Stairs", "Gym", "Running", "Exercise"].includes(activity)) {
          return `Your heart rate is currently higher (${hr} bpm) because you are ${activity.toLowerCase()}. Physical movement naturally requires your heart to pump faster to supply oxygen to your muscles.`;
        }
        return `Your heart rate is currently ${hr} bpm while ${activity.toLowerCase()}. Since you're resting, a slight increase can happen from caffeine, mental focus, or daily tension compared to your personal baseline.`;
      }
      return `AWEN observes your live signals alongside your personal resting baseline (${hr} bpm current rate) to identify meaningful variations. When a change occurs, AWEN explains why it noticed it and suggests a simple, practical next step.`;
    }

    // 5. PERSONAL_STATUS INTENT
    if (intent === "PERSONAL_STATUS") {
      if (lower.includes("baseline")) {
        return `Your personal baseline is your body's unique quiet resting pattern, learned over time rather than compared against generic medical thresholds. Currently, your baseline is centered around ${hr} bpm with a Stable baseline confidence tier.`;
      }
      return `Right now your heart rate is ${hr} bpm while ${activity.toLowerCase()}, which aligns smoothly with your personal resting baseline. Your body is holding a steady, comfortable rhythm.`;
    }

    // 6. TELEMETRY_STATUS INTENT
    if (intent === "TELEMETRY_STATUS") {
      return `Your current live readings are: Heart Rate: ${hr} bpm, SpO₂: ${spo2}%, Skin Temperature: ${temp}°C, Activity: ${activity}.`;
    }

    // 7. WELLNESS_SUPPORT INTENT (Specific Wellness Topics)
    if (intent === "WELLNESS_SUPPORT") {
      if (lower.includes("chocolate") || lower.includes("sweet") || lower.includes("sugar") || lower.includes("candy") || lower.includes("junk food")) {
        return `Having chocolate or sweets once isn't something to worry about! Chocolate has sugar and caffeine, which can cause a temporary energy boost. Right now, your heart rate is ${hr} bpm while ${activity.toLowerCase()}. Sip a glass of water to support smooth digestion!`;
      }
      if (lower.includes("coffee") || lower.includes("caffeine") || lower.includes("tea") || lower.includes("energy drink")) {
        return `Caffeine gives your brain and heart a temporary boost, making you feel more alert. Your heart rate is currently ${hr} bpm while ${activity.toLowerCase()}. Sip a cold glass of water alongside your drink to stay hydrated.`;
      }
      if (lower.includes("headache") || lower.includes("head pain") || lower.includes("dizzy") || lower.includes("sick") || lower.includes("pain")) {
        return `Headaches or mild tiredness are often your body's subtle way of asking for water, fresh air, or a break from screens. Your skin temperature is ${temp}°C and SpO₂ is ${spo2}%. Take a 10-minute break away from screens!`;
      }
      if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("nap") || lower.includes("bed")) {
        return `Good sleep gives your brain and heart a chance to rest and recover deeply after a full day. Your SpO₂ is stable at ${spo2}%. Dim your lights 30 minutes before bed and put your phone away to help your body unwind.`;
      }
      if (lower.includes("stress") || lower.includes("anxious") || lower.includes("overwhelmed") || lower.includes("worry") || lower.includes("nervous")) {
        return `Feeling stressed is a natural reaction when your day gets busy. Your heart rate is currently ${hr} bpm while ${activity.toLowerCase()}. Take 4 slow, deep breaths right now — inhale for 4 seconds, then exhale slowly for 6.`;
      }
      if (lower.includes("exercise") || lower.includes("workout") || lower.includes("run") || lower.includes("gym") || lower.includes("walk") || lower.includes("stairs")) {
        return `Physical movement is great for your heart! When you exercise or climb stairs, your heart rate naturally rises. Your reading is ${hr} bpm while ${activity.toLowerCase()}, which is healthy exertion. Take 2 minutes to walk slowly and let your heart rate settle.`;
      }
      if (lower.includes("water") || lower.includes("hydrate") || lower.includes("drink") || lower.includes("thirsty")) {
        return `Water keeps your blood circulation smooth and helps your body regulate temperature naturally. Your heart rate is ${hr} bpm. Drink one full glass of water right now to give yourself a quick refresh.`;
      }
      if (lower.includes("exam") || lower.includes("study") || lower.includes("test") || lower.includes("work") || lower.includes("meeting")) {
        this.userMemory.recentTopic = "studying";
        return `Studying and exams require mental focus, which can build up physical tension over the day. Your body readings are holding steady at ${hr} bpm while ${activity.toLowerCase()}. Take a 5-minute break every hour to stretch your legs.`;
      }
    }

    // 8. GENERAL_CONVERSATION INTENT (Greetings & Chatter - NO FORCED TELEMETRY!)
    if (lower.includes("hi") || lower.includes("hey") || lower.includes("hello") || lower.includes("good morning") || lower.includes("good afternoon") || lower.includes("good evening")) {
      const name = this.userMemory.name ? `, ${this.userMemory.name}` : '';
      return `Hey there${name}! How can I help you today? You can ask me how your body pattern is doing, how your baseline works, or what AWEN does.`;
    }

    if (lower.includes("thank") || lower.includes("thanks")) {
      return "You're very welcome! I'm always here if you want to check in or ask anything about your body pattern.";
    }

    if (lower.includes("bored") || lower.includes("interesting")) {
      return "Did you know that your resting heart rate varies naturally throughout the day based on your circadian rhythm? AWEN learns these daily patterns so you can understand your body's natural quiet hours!";
    }

    // Natural Conversational Fallback (NO forced telemetry or fake breathing suggestions!)
    return `I'm here with you! Tell me how you're feeling today, or ask me anything about your personal baseline, your body pattern, or how AWEN works.`;
  }
}

export const aiEngine = new AwenAiEngine();
