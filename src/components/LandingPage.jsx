import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Shield, Activity, Brain, Heart,
  ChevronDown, Zap, Eye, Lock, Sparkles, Star, CheckCircle2,
  Cpu, Play, Compass, ShieldCheck, HelpCircle, RefreshCw, Sliders
} from 'lucide-react';
import { AwenSpirit } from './AwenSpirit';
import { AWEN_STATES } from '../services/stateEngine';

/* ─── Tiny hook: fade-in on scroll ─────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Feature Card Component ────────────────────────────────────────────────── */
function FeatureCard({ num, icon: Icon, color, title, desc, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`
      }}
      className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 text-left flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-md`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="font-mono text-xs text-slate-500 font-bold">{num}</span>
        </div>
        <h3 className="font-heading text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Step Card Component ───────────────────────────────────────────────────── */
function StepCard({ num, title, desc, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`
      }}
      className="flex gap-4 sm:gap-5 items-start text-left glass-card p-5 sm:p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-heading font-bold text-cyan-300 text-sm shadow-inner">
        {num}
      </div>
      <div className="space-y-1">
        <h4 className="font-heading font-bold text-white text-base">{title}</h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Main LandingPage Component ─────────────────────────────────────────────── */
export const LandingPage = ({ 
  onGetStarted, 
  onOpenAuth, 
  onTryDemo, 
  onStartDemo 
}) => {
  const handleAuth = onGetStarted || onOpenAuth;
  const handleDemo = onTryDemo || onStartDemo;

  const [scrollY, setScrollY] = useState(0);
  const [demoStateIndex, setDemoStateIndex] = useState(0);
  const featuresRef = useRef(null);

  const DEMO_STATES = [
    { name: 'Balanced', wellnessState: AWEN_STATES.BALANCED, expression: 'happy', badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', desc: 'Resting baseline match (64 bpm)' },
    { name: 'Active', wellnessState: AWEN_STATES.ACTIVE, expression: 'celebrating', badgeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-300', desc: 'Movement exertion context (92 bpm)' },
    { name: 'Watchful', wellnessState: AWEN_STATES.WATCHFUL, expression: 'concerned', badgeColor: 'bg-orange-500/10 border-orange-500/30 text-orange-300', desc: 'Elevated rate while sitting (76 bpm)' },
    { name: 'Wind Down', wellnessState: AWEN_STATES.WIND_DOWN, expression: 'sleeping', badgeColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300', desc: 'Quiet evening rest hours' },
    { name: 'Learning', wellnessState: AWEN_STATES.LEARNING, expression: 'thinking', badgeColor: 'bg-purple-500/10 border-purple-500/30 text-purple-300', desc: 'Observation mode active' }
  ];

  const activeDemoState = DEMO_STATES[demoStateIndex];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-white">

      {/* Ambient Radial Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', transform: `translateY(${scrollY * 0.12}px)` }}
        />
        <div
          className="absolute top-1/3 -right-60 w-[550px] h-[550px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', transform: `translateY(${scrollY * -0.08}px)` }}
        />
        <div
          className="absolute bottom-10 left-1/4 w-[450px] h-[450px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
        />
      </div>

      {/* Sticky Header Navigation */}
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrollY > 30 ? 'bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--border-color)] shadow-xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <span className="text-white font-heading font-black text-xs tracking-wider">AW</span>
            </div>
            <span className="font-heading font-bold text-lg text-[var(--text-primary)] tracking-wider">AWEN</span>
            <span className="hidden sm:inline text-[10px] text-[var(--text-secondary)] font-mono border border-[var(--border-color)] px-2.5 py-0.5 rounded-full bg-white/5">
              Adaptive Wellness
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDemo}
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
            >
              <span>Explore Demo</span>
            </button>
            <button
              onClick={handleAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO & PRODUCT PREVIEW STAGE                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-10 pb-16 px-4 text-center">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Hero Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized to your unique body signature.</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-white tracking-tight">
              AWEN learns what normal <br />
              <span style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                feels like for you.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-light">
              Instead of comparing you with generic population averages, AWEN learns your personal resting patterns and helps you understand when something feels different.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={handleAuth}
              className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={handleDemo}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-medium text-slate-200 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Explore Demo</span>
            </button>
          </div>

          {/* REALISTIC DIFFERENTIATED PRODUCT PREVIEW STAGE */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-left relative overflow-hidden">
              
              {/* Card Header & Live Demo Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-heading text-sm sm:text-base font-bold text-white">AWEN Observation Engine</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Illustrative Demo Preview
                  </span>
                </div>
                
                {/* Interactive Mascot State Selectors */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono mr-1 hidden sm:inline">State Theme:</span>
                  {DEMO_STATES.map((st, idx) => (
                    <button
                      key={st.name}
                      onClick={() => setDemoStateIndex(idx)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                        demoStateIndex === idx
                          ? `${st.badgeColor} border shadow-sm`
                          : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Product Preview Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Column 1: Living AWEN Spirit Visual Stage */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/50 rounded-2xl border border-white/5 relative">
                  <AwenSpirit 
                    expression={activeDemoState.expression}
                    wellnessState={activeDemoState.wellnessState}
                    size={170}
                    interactive={true}
                    caption="Interactive Companion"
                  />
                  <div className="mt-3 text-center space-y-0.5">
                    <div className="text-xs font-semibold text-white">{activeDemoState.name} State</div>
                    <div className="text-[11px] text-slate-400 font-light">{activeDemoState.desc}</div>
                  </div>
                </div>

                {/* Column 2: Personal Baseline vs Current Observation */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Baseline Numbers Strip */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-left space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-mono">Personal Baseline</div>
                      <div className="font-heading text-base sm:text-lg font-bold text-cyan-300">64.0 bpm</div>
                      <div className="text-[9px] text-slate-500">Resting Signature</div>
                    </div>
                    
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-left space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-mono">Usual Range</div>
                      <div className="font-heading text-base sm:text-lg font-bold text-emerald-300">60–68 bpm</div>
                      <div className="text-[9px] text-slate-500">±4.8 bpm Variance</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-left space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-mono">Current Signal</div>
                      <div className="font-heading text-base sm:text-lg font-bold text-amber-300">72.0 bpm</div>
                      <div className="text-[9px] text-amber-400/80">+8 bpm Elevation</div>
                    </div>
                  </div>

                  {/* AWEN Observation Card */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>AWEN Noticed</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                      "Your heart rate is 72 bpm while sitting at your desk. This is slightly higher than your usual 64 bpm resting baseline, but aligns with focused work effort."
                    </p>
                  </div>

                  {/* Why AWEN Noticed & What Now */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <span className="font-semibold text-slate-300 block">Why AWEN Noticed</span>
                      <ul className="text-[11px] text-slate-400 space-y-0.5 font-light">
                        <li>• +8 bpm above quiet resting baseline</li>
                        <li>• Low physical activity context (Sitting)</li>
                        <li>• Pattern observed over recent 5 min</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <span className="font-semibold text-slate-300 block">What Now?</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button onClick={handleDemo} className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 text-[10px] font-medium hover:bg-cyan-500/30 transition-colors">
                          Take a 2-min pause →
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STATS BAR                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-10 border-y border-white/10 bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: '3–7', label: 'Days to learn your baseline' },
            { val: '5', label: 'Contextual wellness states' },
            { val: '0', label: 'Population average comparisons' },
            { val: '100%', label: 'Personalized to your signature' }
          ].map(({ val, label }) => (
            <div key={label} className="space-y-1">
              <div className="font-heading text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                {val}
              </div>
              <div className="text-xs text-slate-400 font-light leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: WHAT MAKES AWEN DIFFERENT (4 PILLARS)                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Star className="w-3.5 h-3.5 text-indigo-400" />
              <span>What Makes AWEN Different</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Built around <em className="not-italic text-cyan-300">your</em> normal
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-light">
              Traditional health tools compare everyone to generic population thresholds. AWEN observes your personal physiological baseline and explains meaningful changes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              num="01"
              icon={Brain}
              color="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              title="Your Personal Baseline"
              desc="AWEN learns your own physiological pattern over 3–7 days instead of relying on generic population averages."
              delay={0}
            />
            <FeatureCard
              num="02"
              icon={Heart}
              color="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              title="Context-Aware Companion"
              desc="Combines your personal baseline, physical activity context, and daily check-ins to make observations relevant."
              delay={100}
            />
            <FeatureCard
              num="03"
              icon={Zap}
              color="bg-amber-500/10 text-amber-400 border border-amber-500/20"
              title="Observe → Explain → Act"
              desc="AWEN doesn't stop at noticing a change. It explains why it noticed and gives you a calm, practical next step."
              delay={200}
            />
            <FeatureCard
              num="04"
              icon={Shield}
              color="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              title="Privacy-First Architecture"
              desc="Your wellness data stays isolated to your account and is protected by database row-level security policies."
              delay={300}
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: THE CORE AWEN LOOP (VISUAL FLOW)                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 bg-slate-950/60 border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              AWEN doesn't stop at noticing.
            </h2>
            <p className="text-cyan-300 text-sm sm:text-base font-medium">
              It turns observations into understandable next steps.
            </p>
          </div>

          {/* 5-Step Connected Product Loop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-left">
            
            <div className="glass-card p-5 rounded-3xl border border-white/10 relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-mono text-xs font-bold">01</div>
              <h4 className="font-heading font-bold text-white text-sm">OBSERVE</h4>
              <p className="text-xs text-slate-300 font-light leading-relaxed">Physiological signals (HR, SpO₂, Temp) + activity context.</p>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-white/10 relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono text-xs font-bold">02</div>
              <h4 className="font-heading font-bold text-white text-sm">LEARN</h4>
              <p className="text-xs text-slate-300 font-light leading-relaxed">Build your personal quiet resting baseline pattern signature.</p>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-white/10 relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center font-mono text-xs font-bold">03</div>
              <h4 className="font-heading font-bold text-white text-sm">NOTICE</h4>
              <p className="text-xs text-slate-300 font-light leading-relaxed">Detect meaningful deviation from your own normal rhythm.</p>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-white/10 relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-mono text-xs font-bold">04</div>
              <h4 className="font-heading font-bold text-white text-sm">EXPLAIN</h4>
              <p className="text-xs text-slate-300 font-light leading-relaxed">Transparent reasoning showing why AWEN observed the change.</p>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-cyan-500/30 bg-cyan-950/20 relative space-y-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 flex items-center justify-center font-mono text-xs font-bold">05</div>
              <h4 className="font-heading font-bold text-white text-sm">ACT</h4>
              <p className="text-xs text-cyan-200/90 font-light leading-relaxed">Offer a calm, practical wellness next step (e.g. 2-min pause).</p>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: HOW AWEN WORKS (4 STEPS)                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>How AWEN Works</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Clarity in 4 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <StepCard
              num="01"
              title="Connect"
              desc="Explore immediately in Demo Stream mode or connect your supported ESP32 MAX30102 sensor via Web Serial API."
              delay={0}
            />
            <StepCard
              num="02"
              title="Learn Your Normal"
              desc="AWEN observes your quiet resting patterns over 3–7 days to build a personal baseline unique to your body."
              delay={100}
            />
            <StepCard
              num="03"
              title="Understand Your Day"
              desc="AWEN compares current readings against YOUR baseline and physical activity context instead of fixed medical cutoffs."
              delay={200}
            />
            <StepCard
              num="04"
              title="Know What To Do Next"
              desc="AWEN explains meaningful observations in plain language and provides a calm wellness-oriented next action."
              delay={300}
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 & 7: HARDWARE-TO-SOFTWARE PIPELINE STORY                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 bg-slate-950/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto space-y-10 text-center">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>Physical Hardware + Software Architecture</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              From physical sensors to intelligent observations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-light">
              AWEN integrates directly with micro-controllers via Web Serial API or runs seamlessly in Demo Stream mode.
            </p>
          </div>

          {/* Pipeline Visual Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                <Cpu className="w-4 h-4" />
                <span>ESP32 + MAX30102</span>
              </div>
              <p className="text-xs text-slate-300 font-light">PPG pulse wave sensor & accelerometer telemetry.</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold">
                <Activity className="w-4 h-4" />
                <span>Telemetry Signals</span>
              </div>
              <p className="text-xs text-slate-300 font-light">Heart rate, SpO₂, skin temp & activity state stream.</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                <Brain className="w-4 h-4" />
                <span>Baseline Engine</span>
              </div>
              <p className="text-xs text-slate-300 font-light">Evaluates readings against personal quiet signature.</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 text-cyan-200 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AWEN Companion</span>
              </div>
              <p className="text-xs text-slate-300 font-light">Explains variations and offers a calm next step.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 9: PERSONALIZATION STORY (GENERIC VS AWEN)                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Your baseline is not everyone else's baseline.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Generic Apps */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border border-rose-500/20 bg-rose-950/10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-mono font-semibold">
                Generic Health Apps
              </div>
              <blockquote className="font-heading text-lg font-bold text-white leading-snug">
                "Your heart rate is 82 bpm. You are outside the population average."
              </blockquote>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Uses rigid population cutoffs that cause unnecessary anxiety and false alarms.
              </p>
            </div>

            {/* AWEN Approach */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono font-semibold">
                AWEN Personal Baseline
              </div>
              <blockquote className="font-heading text-lg font-bold text-white leading-snug">
                "Your heart rate is 72 bpm while sitting, which is +8 bpm above YOUR personal 64.0 bpm resting pattern."
              </blockquote>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Compares you to your own learned quiet signature with activity context filtering.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 10: FINAL CTA                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-cyan-500/20 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400">
            <Eye className="w-8 h-8 text-white" />
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Let AWEN learn your normal.
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
            Start with demo mode or connect your account and begin building your personal baseline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={handleAuth}
              className="group flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.9"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.8"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" opacity="0.7"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" opacity="0.9"/>
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleDemo}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl text-sm font-medium text-slate-200 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all active:scale-95"
            >
              Explore Demo
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-500 to-emerald-400 flex items-center justify-center">
              <span className="text-white font-heading font-black text-[9px]">AW</span>
            </div>
            <span className="font-heading text-sm font-bold text-white">AWEN</span>
            <span className="text-slate-500 text-xs font-light">Adaptive Wellness & Emotional Navigation</span>
          </div>

          <div className="text-xs text-slate-500 font-light">
            Privacy-first architecture · Non-clinical wellness companion
          </div>
        </div>
      </footer>

    </div>
  );
};
