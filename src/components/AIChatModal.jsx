import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ShieldAlert, Heart, RefreshCw } from 'lucide-react';
import { AwenEntity } from './AwenEntity';

export const AIChatModal = ({ isOpen, onClose, evaluation, telemetry }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'awen',
      text: "Hello. I'm AWEN. I'm keeping track of your physiological baseline. How can I guide your wellness today?",
      time: 'Just now'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      const lower = userText.toLowerCase();

      if (lower.includes("stress") || lower.includes("anxious") || lower.includes("tired")) {
        replyText = "Your physiological readings currently suggest patterns commonly associated with elevated non-exertional stress (+6 bpm above expected resting baseline). Would you like to try a short 2-minute bio-feedback breathing exercise to restore balance?";
      } else if (lower.includes("why") || lower.includes("baseline") || lower.includes("stair")) {
        replyText = `Because I've learned your unique resting baseline (${evaluation?.baselineComparison?.restingHr || 64} bpm), routine exertion like climbing stairs or walking doesn't trigger false stress warnings. I filter physical context first.`;
      } else if (lower.includes("heart rate") || lower.includes("spo2") || lower.includes("reading")) {
        replyText = `Your current heart rate is ${telemetry?.heartRate || 65} bpm and SpO₂ saturation is ${telemetry?.spo2 || 98.6}%. Both metrics remain stable relative to your 5-day baseline signature.`;
      } else {
        replyText = "I'm here to support your physiological wellness. I notice your recovery curve is operating normally today. Remember to stay hydrated and take brief periodic screen breaks.";
      }

      setMessages((prev) => [
        ...prev, 
        { sender: 'awen', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md h-[90vh] glass-panel rounded-3xl border border-blue-500/30 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Chat Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AwenEntity state={evaluation?.emotionalState || "relaxed"} size={50} interactive={false} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-1.5">
                <span>AWEN Companion</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </h3>
              <p className="text-[11px] text-slate-400">Context-Aware Physiological Guidance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-Diagnostic Medical Disclaimer Banner */}
        <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-500/20 text-[10px] text-blue-300 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>AWEN provides physiological wellness observations, not medical diagnoses.</span>
        </div>

        {/* Message Stream Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-white/10'
              }`}>
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[80%] space-y-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'glass-card border border-white/10 text-slate-200 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-500 block px-1">{m.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-9">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
              <span>AWEN is analyzing your baseline...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-900/60 border-t border-white/5 flex gap-1.5 overflow-x-auto text-[11px]">
          <button 
            onClick={() => { setInputMsg("Why is my heart rate elevated?"); }}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/10"
          >
            Why is my HR elevated?
          </button>
          <button 
            onClick={() => { setInputMsg("What is my current baseline?"); }}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/10"
          >
            What is my baseline?
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-slate-900/90 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask AWEN about your physiological metrics..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
