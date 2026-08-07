import React, { useState } from 'react';
import { AwenSpirit } from './AwenSpirit';
import { aiEngine } from '../services/aiEngine';
import { Send, Sparkles, User, Bot } from 'lucide-react';

export const TalkScreen = ({ telemetry, evaluation }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'awen',
      text: "Hello Diya. I'm AWEN. I'm holding space for your wellness today. What's on your mind?",
      time: 'Just now'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = aiEngine.generateChatReply(userText, telemetry);

      setMessages((prev) => [
        ...prev, 
        { sender: 'awen', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-28 h-[calc(100dvh-120px)] flex flex-col justify-between space-y-4 animate-fadeIn">
      
      {/* Header with Mini Living Spirit */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <AwenSpirit expression="listening" size={55} interactive={false} />
          <div className="text-left">
            <h1 className="font-heading text-lg sm:text-xl font-bold text-white flex items-center gap-1.5">
              <span>Talk to Awen</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h1>
            <p className="text-xs text-slate-400">Calm Digital Companion</p>
          </div>
        </div>

        <span className="text-xs text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/20">
          Supportive
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
              m.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-cyan-400 border border-white/10'
            }`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[75%] space-y-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-cyan-600 text-white rounded-tr-none' 
                  : 'glass-card border border-white/10 text-slate-200 rounded-tl-none font-light'
              }`}>
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 block px-1">{m.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-10">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            <span>Awen is reflecting...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-1 py-1 flex gap-2 overflow-x-auto text-xs">
        <button 
          onClick={() => setInputMsg("I have exams coming up")}
          className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 whitespace-nowrap"
        >
          I have exams coming up
        </button>
        <button 
          onClick={() => setInputMsg("Why is my heart rate elevated?")}
          className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 whitespace-nowrap"
        >
          Why is my heart rate elevated?
        </button>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-2 sm:p-2.5 glass-card rounded-2xl border border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Talk to Awen..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="p-2.5 sm:p-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-md shadow-cyan-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
