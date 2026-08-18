import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Shield, Activity, Brain, Heart,
  ChevronDown, Zap, Eye, Lock, Sparkles, Star, CheckCircle2,
  Cpu, Play, Compass, ShieldCheck, HelpCircle, RefreshCw, Sliders
} from 'lucide-react';
import { AwenSpirit } from './AwenSpirit';
import { AWEN_STATES } from '../services/stateEngine';

/* ─── Feature Card Component ────────────────────────────────────────────────── */
function FeatureCard({ num, icon: Icon, color, title, desc, delay = 0 }) {
  return (
    <div
      className="neo-surface p-6 border-2 border-[var(--border-strong)] text-left flex flex-col gap-4 group bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111] transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 border-2 border-[var(--border-strong)] flex items-center justify-center bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] shadow-[2px_2px_0px_#111]`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-mono text-xs font-bold text-[var(--text-secondary)]">{num}</span>
      </div>
      <div>
        <h3 className="text-lg font-bold uppercase tracking-wide text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Step Card Component ───────────────────────────────────────────────────── */
function StepCard({ num, title, desc, delay = 0 }) {
  return (
    <div
      className="flex gap-4 items-start text-left bg-[var(--surface-secondary)] p-5 border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111]"
    >
      <div className="flex-shrink-0 w-8 h-8 border-2 border-[var(--border-strong)] bg-[var(--accent-green-dark)] text-white flex items-center justify-center font-bold text-sm shadow-[2px_2px_0px_#111]">
        {num}
      </div>
      <div>
        <h4 className="font-bold uppercase tracking-wide text-[var(--text-primary)] mb-1">{title}</h4>
        <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{desc}</p>
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
    { name: 'Balanced', wellnessState: AWEN_STATES.BALANCED, expression: 'happy', desc: 'Resting baseline match (64 bpm)' },
    { name: 'Active', wellnessState: AWEN_STATES.ACTIVE, expression: 'celebrating', desc: 'Movement exertion context (92 bpm)' },
    { name: 'Watchful', wellnessState: AWEN_STATES.WATCHFUL, expression: 'concerned', desc: 'Elevated rate while sitting (76 bpm)' },
    { name: 'Wind Down', wellnessState: AWEN_STATES.WIND_DOWN, expression: 'sleeping', desc: 'Quiet evening rest hours' },
    { name: 'Learning', wellnessState: AWEN_STATES.LEARNING, expression: 'thinking', desc: 'Observation mode active' }
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden font-sans neo-grid-bg relative">
      
      {/* ── STICKY HEADER ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-200 border-b-2 border-[var(--border-strong)] ${
          scrollY > 30 ? 'bg-[var(--surface-primary)] shadow-[0_4px_0px_#111]' : 'bg-[var(--surface-primary)]'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--border-strong)] bg-[var(--accent-green-dark)] shadow-[2px_2px_0px_#111] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[var(--bg-base)] border border-[var(--border-strong)] animate-pulse" />
            </div>
            <span className="font-heading font-black text-xl tracking-widest uppercase text-[var(--text-primary)]">AWEN</span>
            <span className="hidden sm:inline px-2 py-0.5 bg-[var(--accent-green-bg)] border-2 border-[var(--border-strong)] text-[var(--accent-green-dark)] text-[10px] font-bold tracking-widest uppercase shadow-[1px_1px_0px_#111]">
              Adaptive Wellness
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDemo}
              className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            >
              Explore Demo
            </button>
            <button
              onClick={handleAuth}
              className="px-5 py-2 bg-[var(--text-primary)] text-white text-xs font-bold uppercase tracking-widest border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_var(--accent-green-dark)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 group"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-32 pb-20 px-4 min-h-[90vh] flex flex-col items-center justify-center">
        <div className="max-w-5xl mx-auto space-y-12 w-full">
          
          {/* Hero Content */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-green-bg)] border-2 border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-bold tracking-widest uppercase shadow-[2px_2px_0px_#111]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
              <span>Personalized to your unique body signature.</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tighter uppercase">
              <span className="text-[var(--text-primary)]">AWEN learns what normal </span>
              <span className="text-[var(--text-primary)] bg-[var(--accent-green-dark)] text-white px-2 mt-2 inline-block -rotate-1 border-4 border-[var(--border-strong)] shadow-[6px_6px_0px_#111]">
                feels like for you.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl font-medium text-[var(--text-secondary)] leading-relaxed">
              Instead of comparing you with generic population averages, AWEN learns your personal resting patterns and helps you understand when something feels different.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleAuth}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--text-primary)] text-white font-black uppercase tracking-widest text-base border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_var(--accent-green-dark)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDemo}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] text-[var(--text-primary)] font-bold uppercase tracking-widest text-base shadow-[4px_4px_0px_#111] hover:bg-[var(--surface-secondary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Explore Demo Stream
              </button>
            </div>
          </div>

          {/* Product Preview Stage */}
          <div className="pt-8">
            <div className="neo-surface p-6 sm:p-8 border-2 border-[var(--border-strong)] shadow-[8px_8px_0px_#111] bg-[var(--surface-primary)] relative">
              
              {/* Card Header & Demo Toggle */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 relative z-10 border-b-2 border-[var(--border-strong)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-[var(--border-strong)] bg-[var(--accent-green-dark)] shadow-[2px_2px_0px_#111] animate-pulse" />
                  <span className="font-bold uppercase tracking-wider text-[var(--text-primary)]">AWEN Observation Engine</span>
                  <span className="px-2 py-0.5 border-2 border-[var(--border-strong)] bg-[var(--text-primary)] text-white text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_#111]">Live Preview</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 bg-[var(--surface-secondary)] p-2 border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111]">
                  {DEMO_STATES.map((st, idx) => (
                    <button
                      key={st.name}
                      onClick={() => setDemoStateIndex(idx)}
                      className={`px-3 py-1.5 border-2 border-[var(--border-strong)] text-[10px] font-bold uppercase tracking-wider transition-all ${
                        demoStateIndex === idx
                          ? 'bg-[var(--text-primary)] text-white shadow-[2px_2px_0px_var(--accent-green-dark)] translate-x-[1px] translate-y-[1px]'
                          : 'bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] shadow-[2px_2px_0px_#111]'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Column Demo Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                {/* Column 1: Awen Companion */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] shadow-[4px_4px_0px_#111]">
                  <AwenSpirit 
                    expression={activeDemoState.expression}
                    wellnessState={activeDemoState.wellnessState}
                    size={180}
                    interactive={true}
                    caption="Interactive Companion"
                  />
                  <div className="mt-6 text-center space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] bg-[var(--accent-green-bg)] inline-block px-2 py-1 border border-[var(--border-strong)]">{activeDemoState.name} State</div>
                    <div className="text-[11px] font-medium text-[var(--text-secondary)]">{activeDemoState.desc}</div>
                  </div>
                </div>

                {/* Column 2: Data Interpretation */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Heart Rate Ribbon */}
                  <div className="flex items-center gap-3 p-4 bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111]">
                    <div className="p-2 border-2 border-[var(--border-strong)] bg-[var(--accent-green-dark)] text-white shadow-[2px_2px_0px_#111]">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Personal Baseline</div>
                      <div className="text-lg font-black text-[var(--text-primary)]">64.0 bpm</div>
                    </div>
                    <div className="w-1 h-10 bg-[var(--border-strong)]" />
                    <div className="flex-1 text-right">
                      <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Current Reading</div>
                      <div className="text-lg font-black text-[var(--accent-danger)]">72.0 bpm</div>
                    </div>
                  </div>

                  {/* AWEN Explains Box */}
                  <div className="p-5 bg-[var(--accent-green-bg)] border-2 border-[var(--border-strong)] space-y-3 relative overflow-hidden shadow-[4px_4px_0px_#111]">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-16 h-16 text-[var(--text-primary)]" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] relative z-10">
                      <Activity className="w-4 h-4 text-[var(--accent-green-dark)]" />
                      <span>AWEN Noticed</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed relative z-10">
                      "Your heart rate is 72 bpm while sitting at your desk. This is slightly higher than your usual 64 bpm resting baseline, but aligns with focused work effort."
                    </p>
                  </div>

                  {/* Why / Next Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-b-2 border-[var(--border-strong)] pb-1 block">Why AWEN Noticed</span>
                      <ul className="text-xs font-medium text-[var(--text-primary)] space-y-1.5 pt-1">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-[var(--accent-green-dark)] border border-[var(--border-strong)]" />
                          +8 bpm above baseline
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-[var(--text-primary)] border border-[var(--border-strong)]" />
                          Low activity (Sitting)
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] space-y-2">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-b-2 border-[var(--border-strong)] pb-1 block">What Now?</span>
                      <div className="pt-2">
                        <button onClick={handleDemo} className="px-3 py-1.5 bg-[var(--text-primary)] text-white text-[10px] font-bold uppercase tracking-wider border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_var(--accent-green-dark)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1 group">
                          Take a 2-min pause
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button onClick={scrollToFeatures} className="p-3 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[3px_3px_0px_#111] hover:bg-[var(--surface-secondary)] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#111] transition-all">
              <ChevronDown className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STATS BAR                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 border-y-4 border-[var(--border-strong)] bg-[var(--surface-secondary)]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center divide-x-2 divide-[var(--border-strong)]">
          {[
            { val: '3–7', label: 'Days to learn baseline' },
            { val: '5', label: 'Contextual states' },
            { val: '0', label: 'Population averages' },
            { val: '100%', label: 'Personalized to you' }
          ].map(({ val, label }) => (
            <div key={label} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] drop-shadow-[2px_2px_0px_var(--accent-green-dark)]">
                {val}
              </div>
              <div className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest max-w-[120px] mx-auto leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: WHAT MAKES AWEN DIFFERENT                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} className="relative z-10 py-24 px-4 bg-[var(--bg-base)]">
        <div className="max-w-6xl mx-auto space-y-16 text-center">
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface-primary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] text-[var(--text-primary)] text-xs font-bold tracking-widest uppercase">
              <Star className="w-3.5 h-3.5 text-[var(--accent-green-dark)]" />
              <span>What Makes AWEN Different</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
              Built around <span className="bg-[var(--accent-green-dark)] text-white px-2 mt-1 inline-block rotate-1 border-4 border-[var(--border-strong)] shadow-[4px_4px_0px_#111]">your</span> normal.
            </h2>
            <p className="text-lg font-medium text-[var(--text-secondary)] leading-relaxed">
              Traditional health tools compare everyone to generic population thresholds. AWEN observes your personal physiological baseline and explains meaningful changes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              num="01"
              icon={Brain}
              title="Your Personal Baseline"
              desc="AWEN learns your own physiological pattern over 3–7 days instead of relying on generic population averages."
            />
            <FeatureCard
              num="02"
              icon={Heart}
              title="Context-Aware Companion"
              desc="Combines your personal baseline, physical activity context, and daily check-ins to make observations relevant."
            />
            <FeatureCard
              num="03"
              icon={Zap}
              title="Observe → Explain → Act"
              desc="AWEN doesn't stop at noticing a change. It explains why it noticed and gives you a calm, practical next step."
            />
            <FeatureCard
              num="04"
              icon={Shield}
              title="Privacy-First Architecture"
              desc="Your wellness data stays isolated to your account and is protected by robust row-level security policies."
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: THE CORE AWEN LOOP                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 border-y-4 border-[var(--border-strong)] bg-[var(--surface-primary)]">
        <div className="max-w-6xl mx-auto space-y-16 text-center">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              AWEN doesn't stop at noticing.
            </h2>
            <p className="text-[var(--accent-green-dark)] text-lg sm:text-xl font-bold uppercase tracking-wide">
              It turns observations into understandable next steps.
            </p>
          </div>

          {/* 5-Step Connected Product Loop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-left relative">
            
            <div className="hidden lg:block absolute top-12 left-10 w-[calc(100%-5rem)] h-1 bg-[var(--border-strong)] z-0" />

            {[
              { num: '01', label: 'OBSERVE', icon: Activity, text: 'Physiological signals (HR, SpO₂, Temp) + activity context.' },
              { num: '02', label: 'LEARN', icon: Brain, text: 'Build your personal quiet resting baseline pattern signature.' },
              { num: '03', label: 'NOTICE', icon: Zap, text: 'Detect meaningful deviation from your own normal rhythm.' },
              { num: '04', label: 'EXPLAIN', icon: HelpCircle, text: 'Transparent reasoning showing why AWEN observed the change.' },
              { num: '05', label: 'ACT', icon: CheckCircle2, text: 'Offer a calm, practical wellness next step (e.g. 2-min pause).' },
            ].map((step, idx) => (
              <div key={step.num} className="relative z-10 bg-[var(--bg-base)] border-2 border-[var(--border-strong)] p-6 shadow-[4px_4px_0px_#111] flex flex-col gap-4">
                <div className={`w-12 h-12 border-2 border-[var(--border-strong)] bg-[var(--text-primary)] text-white shadow-[2px_2px_0px_var(--accent-green-dark)] flex items-center justify-center mx-auto lg:mx-0`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-[var(--text-secondary)] mb-1 uppercase tracking-widest">{step.num}</div>
                  <h4 className="font-bold uppercase tracking-wide text-[var(--text-primary)] mb-2 border-b-2 border-[var(--border-strong)] pb-1">{step.label}</h4>
                  <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 10: FINAL CTA                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-4 text-center border-t-2 border-[var(--border-strong)] bg-[var(--accent-green-bg)]">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="w-20 h-20 mx-auto border-4 border-[var(--border-strong)] bg-[var(--text-primary)] text-white shadow-[6px_6px_0px_var(--accent-green-dark)] flex items-center justify-center">
            <Eye className="w-10 h-10" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
            Let AWEN learn your normal.
          </h2>

          <p className="text-lg font-medium text-[var(--text-primary)] max-w-xl mx-auto leading-relaxed border-2 border-[var(--border-strong)] p-4 bg-white shadow-[4px_4px_0px_#111]">
            Start with demo mode to see it in action, or connect your account and begin building your personal baseline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={handleAuth}
              className="w-full sm:w-auto px-10 py-4 bg-[var(--text-primary)] text-white font-black uppercase tracking-widest text-lg border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_var(--accent-green-dark)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              Continue with Google
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleDemo}
              className="w-full sm:w-auto px-10 py-4 bg-[var(--surface-primary)] text-[var(--text-primary)] font-bold uppercase tracking-widest text-lg border-2 border-[var(--border-strong)] shadow-[4px_4px_0px_#111] hover:bg-[var(--surface-secondary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Explore Demo UI
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-[var(--border-strong)] py-8 px-4 bg-[var(--text-primary)] text-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-white bg-[var(--accent-green-dark)]" />
            <span className="font-heading font-black text-sm uppercase tracking-widest">AWEN</span>
            <span className="opacity-50 text-xs">|</span>
            <span className="opacity-80 text-[10px] font-bold uppercase tracking-wider">Adaptive Wellness &amp; Emotional Navigation</span>
          </div>

          <div className="text-[10px] opacity-80 font-bold uppercase tracking-wider">
            Privacy-first architecture · Non-clinical wellness companion
          </div>
        </div>
      </footer>

    </div>
  );
};
