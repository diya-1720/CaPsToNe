import React, { useState, useRef, useEffect } from 'react';
import { AwenSpirit } from './AwenSpirit';
import { aiEngine } from '../services/aiEngine';
import { insightEngine } from '../services/insightEngine';
import { Send, User, Bot, Play, Compass, ShieldCheck, X, ShieldAlert, Activity } from 'lucide-react';

export const TalkScreen = ({ 
  telemetry, 
  evaluation, 
  currentUser, 
  baselineData, 
  onOpenJourney,
  onOpenBaseline
}) => {
  const firstName = currentUser?.name?.split(' ')[0] || '';
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [isBaselineModalOpen, setIsBaselineModalOpen] = useState(false);

  const insight = insightEngine.evaluateInsight(
    telemetry,
    evaluation,
    null,
    baselineData
  );

  const restingHr = baselineData?.restingHr ? Number(baselineData.restingHr) : 64.0;
  const hrStdDev = baselineData?.hrStdDev ? Number(baselineData.hrStdDev) : 4.8;
  const confidenceState = baselineData?.confidence || currentUser?.baseline_confidence || 'Stable baseline';
  const signatureId = baselineData?.signatureId || 'AWEN-SIG-8841';
  const isHardware = telemetry?.isHardware || false;

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'awen',
      text: firstName
        ? `Hey ${firstName}! I'm AWEN, your personal wellness companion. How are you feeling right now?`
        : "Hey! I'm AWEN, your personal wellness companion. How are you feeling right now?",
      time: 'Just now',
      actions: null
    }
  ]);

  const hr = telemetry?.heartRate || 64;
  const activity = telemetry?.activity || "Resting";

  // Context-aware prompt suggestions (safety-filtered)
  const getContextualPrompts = () => {
    if (activity === "Climbing Stairs" || activity === "Stairs" || activity === "Walking") {
      return [
        { label: "Why is my heart rate up?", text: "Why is my heart rate up?" },
        { label: "Is stair climbing expected?", text: "I just climbed stairs, is my heart rate okay?" },
        { label: "How am I doing today?", text: "How am I doing today?" }
      ];
    }
    if (activity === "Gym" || activity === "Running" || activity === "Exercise") {
      return [
        { label: "Post-workout check", text: "I just finished exercising. How is my recovery?" },
        { label: "Why is my heart rate elevated?", text: "Why is my heart rate elevated?" },
        { label: "How am I doing today?", text: "How am I doing today?" }
      ];
    }
    if (hr > 78) {
      return [
        { label: "Why is my heart rate elevated?", text: "Why is my heart rate elevated while resting?" },
        { label: "Ate chocolate today", text: "I ate a lot of chocolate today. Is it okay?" },
        { label: "Exams coming up", text: "I have exams coming up and I'm stressed." }
      ];
    }
    return [
      { label: "How am I doing today?", text: "How am I doing today?" },
      { label: "Why did AWEN notice this?", text: "Why is my heart rate at this level?" },
      { label: "Ate chocolate today", text: "I ate a lot of chocolate today. Is it okay?" },
      { label: "Exams coming up", text: "I have exams coming up." }
    ];
  };

  const currentPrompts = getContextualPrompts();
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e, textOverride = null) => {
    e?.preventDefault();
    const userText = (textOverride || inputMsg).trim();
    if (!userText || isTyping) return;

    const userMsgObj = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!textOverride) setInputMsg('');
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setTimeout(async () => {
      // 1. Evaluate Safety Guardrails (ACUTE_SYMPTOM & MEDICAL_RECOVERY)
      const safetyCheck = aiEngine.evaluateSafetyGuardrails(userText, telemetry);
      let replyText = "";
      let isSafetyTriggered = false;

      if (safetyCheck.triggered) {
        replyText = safetyCheck.reply;
        isSafetyTriggered = true;
      } else {
        try {
          replyText = await aiEngine.generateChatReply(userText, telemetry);
        } catch (error) {
          console.error("AI Error:", error);
          replyText = "I'm having trouble connecting right now, but I'm still here with you. How are you feeling today?";
        }
      }

      // 2. Attach safe action pills (STRICT RULE: Zero exertion pills if safety triggered)
      let actions = null;
      if (!isSafetyTriggered) {
        const lower = userText.toLowerCase();
        if (lower.includes("heart rate") || lower.includes("stress") || lower.includes("tired") || lower.includes("pause") || lower.includes("relax")) {
          actions = [
            { label: "Take 2-min pause", type: "PAUSE" },
            { label: "Check my journey", type: "JOURNEY" }
          ];
        } else if (lower.includes("doing") || lower.includes("baseline") || lower.includes("pattern")) {
          actions = [
            { label: "Check my baseline", type: "BASELINE" },
            { label: "Check my journey", type: "JOURNEY" }
          ];
        }
      }

      const awenMsgObj = {
        id: `awen_${Date.now()}`,
        sender: 'awen',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions,
        isSafety: isSafetyTriggered,
        telemetryContext: {
          hr: Math.round(telemetry?.heartRate || 64),
          activity: telemetry?.activity || "Resting"
        }
      };

      setMessages((prev) => [...prev, awenMsgObj]);
      setIsTyping(false);
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleTextareaInput = (e) => {
    setInputMsg(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const isInitialWelcome = messages.length <= 1;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8 sm:pb-10 flex flex-col space-y-4 animate-fadeIn">
      
      {/* ZONE A: COMPACT HEADER & DYNAMIC BASELINE STRIP */}
      <div className="border-b-2 border-[var(--border-strong)] pb-3 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative hover:scale-105 transition-transform duration-300">
              <AwenSpirit 
                expression="listening" 
                size={52} 
                interactive={true} 
                onClick={() => handleSend(null, "How am I doing today?")} 
              />
            </div>
            <div className="text-left">
              <h1 className="font-heading text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>AWEN</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--accent-green)] text-[var(--text-primary)] font-bold tracking-wide">
                  Personal Companion
                </span>
              </h1>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Context-aware non-clinical dialogue</p>
            </div>
          </div>

          {/* Dynamic Baseline Badge (Clickable for Detail Modal) */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={() => setIsBaselineModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-[var(--accent-green-dark)] bg-[var(--accent-green-bg)] hover:bg-[var(--surface-secondary)] px-3 py-1.5 border border-[var(--border-strong)] font-bold transition-all shadow-[2px_2px_0px_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              title="Click to view baseline details"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Baseline: {restingHr.toFixed(1)} <span className="text-[10px] font-normal">BPM</span></span>
              <span className="text-[var(--text-secondary)] hidden sm:inline">· {confidenceState}</span>
            </button>
            <span className={`text-[10px] font-mono px-2 py-0.5 font-bold tracking-wide border border-[var(--border-strong)] uppercase ${isHardware ? 'bg-[var(--accent-green)] text-[var(--text-primary)]' : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]'}`}>
              {isHardware ? '● ESP32 LIVE' : '○ Demo Stream'}
            </span>
          </div>
        </div>
      </div>

      {/* ZONE B: CONVERSATION AREA (Primary Content Viewport - Natural Height) */}
      <div className="max-h-[calc(100dvh-220px)] sm:max-h-[calc(100dvh-230px)] overflow-y-auto space-y-4 pr-1 scroll-smooth">
        
        {/* COMPACT FIRST-USE / EMPTY CONVERSATION STATE */}
        {isInitialWelcome && (
          <div className="my-4 p-6 sm:p-8 neo-surface text-center space-y-4 animate-fadeIn">
            <div className="flex justify-center hover:scale-105 transition-transform duration-300">
              <AwenSpirit expression="happy" size={110} interactive={true} caption="Tap AWEN" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">Talk to AWEN</h2>
              <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                Tell me how you're feeling, what you've noticed, or what you'd like to understand about your body pattern today. Select a quick prompt below or type your question.
              </p>
            </div>
          </div>
        )}

        {/* MESSAGE STREAM */}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 flex items-center justify-center text-xs shrink-0 ${
              m.sender === 'user'
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
                : 'bg-[var(--accent-green)] border border-[var(--border-strong)] text-[var(--text-primary)]'
            }`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[85%] sm:max-w-[78%] space-y-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`p-3.5 text-sm leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-semibold whitespace-pre-wrap break-words border border-[var(--border-strong)] shadow-[2px_2px_0px_#111]' 
                  : m.isSafety
                  ? 'bg-[var(--accent-danger-bg)] border-2 border-[var(--accent-danger)] text-[var(--text-primary)] font-medium space-y-3'
                  : 'bg-[var(--surface-primary)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium space-y-3 shadow-[2px_2px_0px_#111]'
              }`}>
                {m.isSafety && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-danger)] pb-2 border-b border-[var(--accent-danger)]/20 uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Medical Safety Guidance</span>
                  </div>
                )}

                <p className="whitespace-pre-wrap break-words">{m.text}</p>

                {/* AWEN Context Tag */}
                {m.sender === 'awen' && m.telemetryContext && !m.isSafety && (
                  <div className="pt-2 border-t border-[var(--border-light)] flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-mono font-bold tracking-wide uppercase">
                    <Activity className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
                    <span>Context: {m.telemetryContext.hr} BPM ({m.telemetryContext.activity})</span>
                  </div>
                )}

                {/* Optional Action Pills */}
                {m.sender === 'awen' && m.actions && (
                  <div className="pt-2 border-t border-[var(--border-light)] flex flex-wrap gap-2">
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (act.type === 'JOURNEY') {
                            if (onOpenJourney) onOpenJourney();
                          } else if (act.type === 'BASELINE') {
                            setIsBaselineModalOpen(true);
                          } else {
                            handleSend(null, "I'd like to take a 2-minute pause");
                          }
                        }}
                        className="px-3 py-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[var(--text-primary)] border border-[var(--border-strong)] text-xs font-bold flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_#111] active:shadow-none"
                      >
                        {act.type === 'JOURNEY' ? <Compass className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium block px-1">{m.time}</span>
            </div>
          </div>
        ))}

        {/* POLISHED 3-DOT ANIMATED TYPING INDICATOR */}
        {isTyping && (
          <div className="flex items-start gap-3" aria-live="polite">
            <div className="w-8 h-8 flex items-center justify-center text-xs shrink-0  shadow-sm bg-[var(--surface-level-1)] text-[var(--awen-aqua)] border border-[var(--border-subtle)]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-4  rounded-tl-sm shadow-sm bg-[var(--surface-level-1)] border border-[var(--border-subtle)] flex items-center gap-2">
              <div className="w-2 h-2  bg-[var(--text-muted)] animate-bounce" />
              <div className="w-2 h-2  bg-[var(--text-muted)] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2  bg-[var(--text-muted)] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ZONE C: CONTEXTUAL QUICK ACTION CHIPS */}
      <div className="px-1 pt-2 flex flex-wrap gap-2 shrink-0">
        {currentPrompts.map((p, idx) => (
          <button 
            key={idx}
            onClick={() => handleSend(null, p.text)}
            disabled={isTyping}
            className="neo-btn px-4 py-2 text-xs text-[var(--text-primary)] font-bold disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ZONE D: STICKY CHAT COMPOSER */}
      <form 
        onSubmit={handleSend} 
        className="border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] flex items-end gap-2 shrink-0 relative shadow-[3px_3px_0px_#111] focus-within:shadow-[4px_4px_0px_#111] transition-all p-2"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputMsg}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          placeholder={isTyping ? "AWEN is reflecting..." : "Talk to AWEN... (Enter to send, Shift+Enter for new line)"}
          className="flex-1 px-3 sm:px-4 py-2 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none max-h-32 min-h-[40px] leading-relaxed font-medium"
        />
        
        <button
          type="submit"
          disabled={!inputMsg.trim() || isTyping}
          className="p-2.5 bg-[var(--text-primary)] hover:bg-[var(--border-medium)] disabled:opacity-40 text-[var(--bg-base)] transition-colors shrink-0 mb-0.5 border border-[var(--border-strong)] shadow-[2px_2px_0px_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          title="Send Message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* BASELINE DETAIL MODAL */}
      {isBaselineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 animate-fadeIn">
          <div className="relative w-full max-w-md neo-surface p-6 text-left">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
              <h3 className="font-heading text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-green-dark)]" />
                <span>Your Personal Baseline</span>
              </h3>
              <button onClick={() => setIsBaselineModalOpen(false)} className="p-1.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed mt-4">
              AWEN compares your daily readings against your personal baseline pattern rather than generic medical thresholds.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-4 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-1">
                <span className="section-label block">Typical Resting</span>
                <span className="text-2xl font-heading font-bold text-[var(--text-primary)] block">{restingHr.toFixed(1)} <span className="text-xs font-sans font-normal text-[var(--text-secondary)]">BPM</span></span>
              </div>

              <div className="p-4 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-1">
                <span className="section-label block">Usual Variation</span>
                <span className="text-2xl font-heading font-bold text-[var(--accent-green-dark)] block">±{hrStdDev.toFixed(1)} <span className="text-xs font-sans font-normal text-[var(--text-secondary)]">BPM</span></span>
              </div>

              <div className="p-4 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-1">
                <span className="section-label block">Confidence Tier</span>
                <span className="text-sm font-heading font-bold text-[var(--accent-green-dark)] block truncate">{confidenceState}</span>
              </div>

              <div className="p-4 border border-[var(--border-strong)] bg-[var(--surface-secondary)] space-y-1">
                <span className="section-label block">Signature ID</span>
                <span className="text-sm font-mono font-bold text-[var(--text-primary)] block truncate">{signatureId}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setIsBaselineModalOpen(false)}
                className="neo-btn neo-btn-primary px-6 py-2.5 text-sm font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
