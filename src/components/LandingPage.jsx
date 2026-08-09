import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Shield, Activity, Brain, Heart,
  ChevronDown, Zap, Eye, Lock, Sparkles, Star, CheckCircle2
} from 'lucide-react';

/* ─── Tiny hook: fade-in on scroll ─────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Feature Card ──────────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, color, title, desc, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
      }}
      className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Step Card ─────────────────────────────────────────────────────────────── */
function StepCard({ num, title, desc, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`
      }}
      className="flex gap-5 items-start"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-heading font-bold text-cyan-400 text-sm">
        {num}
      </div>
      <div>
        <h4 className="font-heading font-semibold text-white text-base mb-1">{title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Main LandingPage ──────────────────────────────────────────────────────── */
export const LandingPage = ({ onGetStarted, onTryDemo }) => {
  const [scrollY, setScrollY] = useState(0);
  const featuresRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#080d18] text-white overflow-x-hidden">

      {/* ── Ambient Background Orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', transform: `translateY(${scrollY * -0.1}px)` }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Sticky Navbar ── */}
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrollY > 40 ? 'bg-[#080d18]/90 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-white font-heading font-black text-xs tracking-tight">AW</span>
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-tight">AWEN</span>
            <span className="hidden sm:inline text-[11px] text-slate-500 font-mono border border-white/10 px-2 py-0.5 rounded-full">
              Adaptive Wellness
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onTryDemo}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
            >
              Try Demo
            </button>
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 text-xs font-medium transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[92vh] flex flex-col items-center justify-center px-4 pt-10 pb-20 text-center">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-medium mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized. Not population-average.</span>
        </div>

        {/* Animated AWEN Orb */}
        <div className="relative mb-10">
          {/* Outer glow ring */}
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full relative mx-auto">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #06b6d4, #8b5cf6, #34d399, #06b6d4)',
                animation: 'spin 8s linear infinite',
                opacity: 0.4
              }}
            />
            <div className="absolute inset-[3px] rounded-full bg-[#080d18]" />
            {/* Inner core */}
            <div
              className="absolute inset-[12px] rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 40% 35%, #1e3a5f 0%, #0d1527 100%)',
                boxShadow: '0 0 40px rgba(6,182,212,0.25), inset 0 0 30px rgba(6,182,212,0.08)'
              }}
            >
              {/* Face / mascot hint */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-300" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-300" style={{ animation: 'pulse 2s ease-in-out infinite 0.2s' }} />
                </div>
                <div className="w-6 h-1 rounded-full bg-cyan-400/50 mt-1" />
              </div>
            </div>
            {/* Floating dots */}
            <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-cyan-400/70" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
            <div className="absolute bottom-4 left-2 w-1.5 h-1.5 rounded-full bg-indigo-400/70" style={{ animation: 'pulse 2.5s ease-in-out infinite 1s' }} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] max-w-3xl mb-5">
          <span className="text-white">Your wellness,</span>
          <br />
          <span
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            understood by you.
          </span>
        </h1>

        {/* Subtext */}
        <p className="max-w-xl text-slate-400 text-base sm:text-lg leading-relaxed mb-8">
          AWEN doesn't compare you to generic population thresholds.
          She learns <span className="text-white font-medium">your unique physiological baseline</span> over 3–7 days
          and gives you calm, personalized wellness insights.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-cyan-500/40"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}
          >
            <span>Get Started — it's free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={scrollToFeatures}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            <span>See how it works</span>
          </button>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {['✦ No medical jargon', '✦ 100% private', '✦ Zero false alarms', '✦ ESP32 IoT Ready'].map(t => (
            <span key={t} className="text-[11px] text-slate-500 px-3 py-1 rounded-full border border-white/8 bg-white/3">
              {t}
            </span>
          ))}
        </div>

        {/* Scroll arrow */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ animation: 'bounce 2s ease-in-out infinite' }}>
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STATS BAR                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-10 border-y border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { val: '3–7', label: 'Days to learn your baseline' },
            { val: '5', label: 'Wellness states tracked' },
            { val: '0', label: 'Generic population comparisons' },
            { val: '∞', label: 'Personalized to just you' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="font-heading text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                {val}
              </div>
              <div className="text-xs text-slate-500 leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs mb-4">
              <Star className="w-3 h-3" /> What makes AWEN different
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              Built around <em className="not-italic" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>your</em> normal
            </h2>
            <p className="text-slate-400 mt-3 text-sm max-w-xl mx-auto">
              Traditional wellness apps compare you against averages. AWEN learns what's normal for you, then tells you when something feels off.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={Brain}
              color="bg-cyan-500/10 text-cyan-400"
              title="Your Personal Baseline"
              desc="AWEN observes your heart rate, SpO₂, and temperature patterns over 3–7 days to build a baseline that's uniquely yours."
              delay={0}
            />
            <FeatureCard
              icon={Heart}
              color="bg-rose-500/10 text-rose-400"
              title="Emotional Intelligence"
              desc="Context-aware insights that know the difference between workout stress and emotional stress — no false alarms."
              delay={100}
            />
            <FeatureCard
              icon={Zap}
              color="bg-amber-500/10 text-amber-400"
              title="5-State Wellness Engine"
              desc="Learning → Balanced → Active → Watchful → Wind Down. AWEN always knows where you are in your day."
              delay={200}
            />
            <FeatureCard
              icon={Shield}
              color="bg-emerald-500/10 text-emerald-400"
              title="Complete Privacy"
              desc="Your data lives in your own Supabase instance. Row-Level Security ensures nobody — not even developers — can see your records."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4" style={{ background: 'rgba(6,182,212,0.03)' }}>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: steps */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs mb-6">
              <Activity className="w-3 h-3" /> How AWEN works
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-10">
              Wellness clarity in<br />3 simple steps
            </h2>
            <div className="flex flex-col gap-8">
              <StepCard
                num="01"
                title="Sign in & connect"
                desc="Sign in with Google in seconds. Optionally connect your ESP32 MAX30102 sensor for real physiological data, or run in demo mode."
                delay={0}
              />
              <StepCard
                num="02"
                title="AWEN learns your normal"
                desc="For 3–7 days, AWEN quietly observes your heart rate patterns, SpO₂ levels, and temperature to build your personal baseline."
                delay={120}
              />
              <StepCard
                num="03"
                title="Get calm, personal insights"
                desc="Once your baseline is established, AWEN tells you when something feels genuinely different — using your own data, not population averages."
                delay={240}
              />
            </div>
          </div>

          {/* Right: visual card */}
          <div className="hidden lg:block">
            <div className="glass-card rounded-3xl p-8 border border-cyan-500/10 shadow-2xl shadow-cyan-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
              {/* Simulated wellness card */}
              <div className="text-xs text-slate-500 font-mono mb-4">AWEN • Today's overview</div>
              <div className="space-y-4">
                {[
                  { label: 'Heart Rate', val: '68 bpm', note: 'Your normal', color: 'text-emerald-400', bar: 'bg-emerald-500' },
                  { label: 'SpO₂', val: '98.4%', note: 'Slightly elevated', color: 'text-cyan-400', bar: 'bg-cyan-500' },
                  { label: 'Temperature', val: '36.6°C', note: 'Baseline', color: 'text-indigo-400', bar: 'bg-indigo-500' },
                ].map(({ label, val, note, color, bar }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className={`text-xs font-medium ${color}`}>{val}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div className={`h-1.5 rounded-full ${bar} opacity-60`} style={{ width: label === 'Heart Rate' ? '65%' : label === 'SpO₂' ? '90%' : '70%' }} />
                    </div>
                    <div className="text-[10px] text-slate-600">{note}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                <p className="text-[11px] text-cyan-300/80 italic">
                  "Your readings are within your usual pattern. You're doing great today."
                </p>
                <p className="text-[10px] text-slate-600 mt-1">— AWEN, 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHILOSOPHY QUOTE                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-14 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 65%)' }} />
            <div className="relative">
              <div className="text-4xl text-indigo-400/30 font-heading mb-4">"</div>
              <blockquote className="font-heading text-xl sm:text-2xl font-medium text-white leading-snug mb-6">
                AWEN doesn't compare you to the population.<br />
                <span className="text-indigo-300">She compares you to yourself.</span>
              </blockquote>
              <p className="text-sm text-slate-500">
                The only health baseline that matters is <em>your</em> baseline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TRUST / CHECKLIST                                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-4" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            Everything you'd want from a wellness companion
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
            {[
              'No generic "you\'re stressed" diagnoses',
              'Calm, non-alarmist language only',
              'Personalized observations from day 1',
              '7-window time-aware personality engine',
              'Real-time IoT sensor integration (ESP32)',
              'Open-source & fully transparent AI',
              'Your data stays in your own Supabase project',
              'Works offline in demo mode, no data required',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-4 text-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.06) 0%, transparent 65%)' }} />
        <div className="relative max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-cyan-500/20"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)' }}>
            <Eye className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Start your personalized<br />wellness journey today
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
            Sign in with Google in 5 seconds. AWEN begins learning your patterns immediately — no setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.03]"
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
              onClick={onTryDemo}
              className="px-6 py-4 rounded-2xl text-sm font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              Explore Demo Mode
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-heading font-black text-[9px]">AW</span>
            </div>
            <span className="font-heading text-sm font-semibold text-white">AWEN</span>
            <span className="text-slate-600 text-xs">Adaptive Wellness & Emotional Navigation</span>
          </div>
          <div className="text-xs text-slate-600">
            Built with care · Your data, your control · Privacy-first
          </div>
        </div>
      </footer>

      {/* Spin keyframe for the orb ring */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
      `}</style>
    </div>
  );
};
