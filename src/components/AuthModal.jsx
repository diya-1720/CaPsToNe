import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Hash, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/apiService';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (isSignUp && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      let userObj;
      if (isSignUp) {
        userObj = await apiService.signup(name, email, password, age ? Number(age) : null, gender, phone);
      } else {
        userObj = await apiService.login(email, password);
      }

      onAuthSuccess(userObj);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn backdrop-blur-sm">
      <div className="relative w-full max-w-md neo-surface p-6 sm:p-8 space-y-5 text-left max-h-[90dvh] overflow-y-auto border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[6px_6px_0px_#111]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--accent-green)]">✦</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                Localhost SQLite Authentication
              </span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mt-0.5">
              {isSignUp ? 'User Registration' : 'User Sign In'}
            </h2>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] shadow-[2px_2px_0px_#111] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 border-2 border-[var(--accent-danger)] bg-[var(--accent-danger-bg)] text-[var(--accent-danger)] text-xs flex items-start gap-2.5 font-bold shadow-[2px_2px_0px_var(--accent-danger)] animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Diya Sharma"
                    className="w-full pl-9 pr-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:bg-[var(--surface-primary)] transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Age
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
                    <input
                      type="number"
                      min="1"
                      max="125"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="28"
                      className="w-full pl-9 pr-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:bg-[var(--surface-primary)] transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] focus:outline-none focus:bg-[var(--surface-primary)] font-medium"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:bg-[var(--surface-primary)] transition-all font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@awen.local"
                className="w-full pl-9 pr-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:bg-[var(--surface-primary)] transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Password * {isSignUp && <span className="text-[10px] font-normal lowercase">(min. 6 chars)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:bg-[var(--surface-primary)] transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 neo-btn neo-btn-primary flex items-center justify-center gap-2 mt-4 font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#111]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create User Account' : 'Authenticate & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center pt-3 border-t border-[var(--border-light)]">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-xs font-bold text-[var(--accent-green-dark)] hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in here' : "Need an account? Register here"}
          </button>
        </div>

        {/* Security / Privacy guarantee */}
        <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)] flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-green-dark)] shrink-0" />
          <span>Passwords hashed via PBKDF2-HMAC-SHA256. Persistent in local SQLite.</span>
        </div>

      </div>
    </div>
  );
};
