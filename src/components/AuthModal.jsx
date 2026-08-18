import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      let userObj;
      if (isSignUp) {
        userObj = await apiService.signup(name, email, password);
      } else {
        userObj = await apiService.login(email, password);
      }

      onAuthSuccess(userObj);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "That email or password doesn't look right. Try again?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const userObj = await apiService.signInWithGoogle();
      if (userObj) {
        onAuthSuccess(userObj);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || "Google sign-in didn't complete. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
      <div className="relative w-full max-w-md neo-surface p-6 sm:p-8 space-y-5 text-left max-h-[90dvh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
              Welcome to AWEN
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
              Your personal wellness companion
            </p>
          </div>

          <button onClick={onClose} className="p-1.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Friendly Error Banner */}
        {errorMsg && (
          <div className="p-3 border-2 border-[var(--accent-danger)] bg-[var(--accent-danger-bg)] text-[var(--accent-danger)] text-sm flex items-start gap-3 font-semibold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-white text-gray-900 font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
              <span className="text-gray-900">Redirecting...</span>
            </>
          ) : (
            <>
              {/* Official Google Vector Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-[var(--text-muted)] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-[var(--surface-level-2)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--awen-aqua)] focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[3px_3px_0px_#111] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[3px_3px_0px_#111] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 neo-btn neo-btn-primary flex items-center justify-center gap-2 mt-4 font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--bg-base)]" />
            ) : (
              <>
                <span className="font-semibold">{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center pt-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-sm text-[var(--awen-aqua)] hover:text-[var(--text-primary)] font-medium transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create account"}
          </button>
        </div>

      </div>
    </div>
  );
};
