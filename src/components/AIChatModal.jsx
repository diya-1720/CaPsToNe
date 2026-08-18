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
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-[#111111]/80 animate-fadeIn">
      <div className="relative w-full max-w-md h-[90vh] neo-surface flex flex-col overflow-hidden">
        
        {/* Chat Drawer Header */}
        <div className="p-4 border-b-2 border-[var(--border-strong)] flex items-center justify-between bg-[var(--surface-primary)]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AwenEntity state={evaluation?.emotionalState || "relaxed"} size={50} interactive={false} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-[var(--text-primary)] flex items-center gap-1.5">
                AWEN Companion
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse shadow-[0_0_8px_var(--accent-green-dark)]" />
                <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">Active</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Non-Diagnostic Medical Disclaimer Banner */}
        <div className="px-4 py-2 bg-[var(--surface-secondary)] border-b border-[var(--border-strong)] text-[10px] text-[var(--text-secondary)] flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-orange)] shrink-0" />
          <span>AWEN provides physiological wellness observations, not medical diagnoses.</span>
        </div>

        {/* Message Stream Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-base)]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[85%] ${
                msg.sender === 'user' 
                  ? 'bg-[var(--accent-green-bg)] text-[var(--text-primary)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111]' 
                  : 'bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] text-[var(--text-primary)] shadow-[3px_3px_0px_#111]'
              } p-4 text-sm leading-relaxed`}
              >
                <div className="flex items-center gap-2 mb-2 opacity-80 border-b border-[var(--border-light)] pb-2">
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[var(--accent-green-dark)]" />}
                  <span className="text-xs font-bold uppercase tracking-wider">{msg.sender === 'user' ? 'You' : 'AWEN'}</span>
                </div>
                <p className="font-medium">{msg.text}</p>
                <div className="text-[10px] mt-2 opacity-60 font-mono font-bold text-right">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] p-3 shadow-[2px_2px_0px_#111] flex gap-1">
                <span className="w-2 h-2 bg-[var(--text-muted)] border border-[var(--border-strong)] animate-bounce" />
                <span className="w-2 h-2 bg-[var(--text-muted)] border border-[var(--border-strong)] animate-bounce delay-75" />
                <span className="w-2 h-2 bg-[var(--text-muted)] border border-[var(--border-strong)] animate-bounce delay-150" />
              </div>
            </div>
          )}
        {/* Input Area */}
        <div className="p-4 border-t-2 border-[var(--border-strong)] bg-[var(--surface-primary)]">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask about your baseline or stress response..."
              className="w-full neo-input pr-12 text-sm"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="absolute right-1 top-1 bottom-1 px-3 bg-[var(--text-primary)] text-[var(--bg-base)] border border-[var(--border-strong)] hover:bg-[var(--accent-green-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_#111]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
