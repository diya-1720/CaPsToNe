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

    setTimeout(() => {
      // 1. Evaluate Safety Guardrails (ACUTE_SYMPTOM & MEDICAL_RECOVERY)
      const safetyCheck = aiEngine.evaluateSafetyGuardrails(userText, telemetry);
      let replyText = "";
      let isSafetyTriggered = false;

      if (safetyCheck.triggered) {
        replyText = safetyCheck.reply;
        isSafetyTriggered = true;
      } else {
        replyText = aiEngine.generateChatReply(userText, telemetry);
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
    }, 850);
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
      <div className="border-b border-white/10 pb-2.5 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <AwenSpirit 
              expression="listening" 
              size={52} 
              interactive={true} 
              onClick={() => handleSend(null, "How am I doing today?")} 
            />
            <div className="text-left">
              <h1 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>AWEN</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Personal Companion
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-light">Context-aware non-clinical dialogue</p>
            </div>
          </div>

          {/* Dynamic Baseline Badge (Clickable for Detail Modal) */}
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => setIsBaselineModalOpen(true)}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded-full border border-cyan-500/20 font-medium transition-colors"
              title="Click to view baseline details"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Baseline: {restingHr.toFixed(1)} bpm</span>
              <span className="text-slate-400 hidden sm:inline">· {confidenceState}</span>
            </button>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${isHardware ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'}`}>
              {isHardware ? 'ESP32 Live' : 'Demo Stream'}
            </span>
          </div>
        </div>
      </div>

      {/* ZONE B: CONVERSATION AREA (Primary Content Viewport - Natural Height) */}
      <div className="max-h-[calc(100dvh-220px)] sm:max-h-[calc(100dvh-230px)] overflow-y-auto space-y-4 pr-1 scroll-smooth">
        
        {/* COMPACT FIRST-USE / EMPTY CONVERSATION STATE */}
        {isInitialWelcome && (
          <div className="my-2 p-5 sm:p-6 rounded-3xl glass-card border border-white/10 text-center space-y-3 animate-fadeIn">
            <div className="flex justify-center">
              <AwenSpirit expression="happy" size={110} interactive={true} caption="Tap AWEN" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="font-heading text-lg font-bold text-white">Talk to AWEN</h2>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                Tell me how you're feeling, what you've noticed, or what you'd like to understand about your body pattern today. Select a quick prompt below or type your question.
              </p>
            </div>
          </div>
        )}

        {/* MESSAGE STREAM */}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 sm:gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
              m.sender === 'user' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'bg-slate-800 text-cyan-400 border border-white/10'
            }`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </div>

            <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-cyan-600 text-white rounded-tr-none whitespace-pre-wrap break-words shadow-md' 
                  : m.isSafety
                  ? 'bg-indigo-950/80 border border-indigo-500/40 text-indigo-100 rounded-tl-none font-light space-y-2'
                  : 'glass-card border border-white/10 text-slate-200 rounded-tl-none font-light space-y-2'
              }`}>
                {m.isSafety && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 pb-1 border-b border-indigo-500/30">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Medical Safety Guidance</span>
                  </div>
                )}

                <p className="whitespace-pre-wrap break-words">{m.text}</p>

                {/* AWEN Context Tag */}
                {m.sender === 'awen' && m.telemetryContext && !m.isSafety && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>Context: {m.telemetryContext.hr} bpm ({m.telemetryContext.activity})</span>
                  </div>
                )}

                {/* Optional Action Pills */}
                {m.sender === 'awen' && m.actions && (
                  <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (act.type === 'JOURNEY' && onOpenJourney) onOpenJourney();
                          else if (act.type === 'BASELINE') setIsBaselineModalOpen(true);
                          else handleSend(null, "I'd like to take a 2-minute pause");
                        }}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-[10px] font-medium flex items-center gap-1 transition-colors active:scale-95"
                      >
                        {act.type === 'JOURNEY' ? <Compass className="w-3 h-3 text-cyan-300" /> : <Play className="w-3 h-3 text-cyan-300 fill-cyan-300" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block px-1">{m.time}</span>
            </div>
          </div>
        ))}

        {/* POLISHED 3-DOT ANIMATED TYPING INDICATOR */}
        {isTyping && (
          <div className="flex items-start gap-2.5 sm:gap-3" aria-live="polite">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-cyan-400 border border-white/10 flex items-center justify-center text-xs shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 text-slate-300 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ZONE C: CONTEXTUAL QUICK ACTION CHIPS (Flexible Wrapping, Directly Above Composer) */}
      <div className="px-1 pt-1 flex flex-wrap gap-2 text-xs shrink-0">
        {currentPrompts.map((p, idx) => (
          <button 
            key={idx}
            onClick={() => handleSend(null, p.text)}
            disabled={isTyping}
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 border border-white/10 active:scale-95 transition-transform font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ZONE D: STICKY CHAT COMPOSER (Natural Document Flow) */}
      <form 
        onSubmit={handleSend} 
        className="p-1.5 sm:p-2 glass-card rounded-2xl border border-white/10 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/40 transition-all flex items-end gap-2 shrink-0 relative"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputMsg}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          placeholder={isTyping ? "AWEN is reflecting..." : "Talk to AWEN... (Enter to send, Shift+Enter for new line)"}
          className="flex-1 px-3 sm:px-4 py-2 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 min-h-[38px] leading-relaxed"
        />
        
        <button
          type="submit"
          disabled={!inputMsg.trim() || isTyping}
          className="p-2 sm:p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-all shadow-md shadow-cyan-600/30 active:scale-95 shrink-0 mb-0.5"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* BASELINE DETAIL MODAL */}
      {isBaselineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4 shadow-2xl text-left bg-[#0d1527]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Your Personal Baseline</span>
              </h3>
              <button onClick={() => setIsBaselineModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              AWEN compares your daily readings against your personal baseline pattern rather than generic medical thresholds.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Typical Resting Pattern</span>
                <span className="text-base font-heading font-bold text-white block">{restingHr.toFixed(1)} bpm</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Typical Resting Variation</span>
                <span className="text-base font-heading font-bold text-emerald-400 block">±{hrStdDev.toFixed(1)} bpm</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Confidence Tier</span>
                <span className="text-base font-heading font-bold text-cyan-300 block truncate">{confidenceState}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Signature ID</span>
                <span className="text-xs font-mono font-semibold text-slate-300 block truncate">{signatureId}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsBaselineModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white shadow-md shadow-cyan-600/30 hover:bg-cyan-500 transition-colors"
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
