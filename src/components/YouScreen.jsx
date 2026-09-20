import React, { useState } from 'react';
import { 
  ShieldCheck, Mail, Sparkles, Cpu, ChevronRight, X, User, Lock, 
  LogOut, Globe, Radio, AlertCircle, CheckCircle2, Edit3, Phone, 
  Hash, Save, Loader2 
} from 'lucide-react';
import { apiService } from '../services/apiService';

export const YouScreen = ({ 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onToggleObservation, 
  baselineData, 
  telemetryStream, 
  telemetry,
  onUpdateUserBaseline,
  onProfileUpdated
}) => {
  const [isIoTModalOpen, setIsIoTModalOpen] = useState(false);
  const [isConfirmStopOpen, setIsConfirmStopOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAge, setEditAge] = useState(currentUser?.age || '');
  const [editGender, setEditGender] = useState(currentUser?.gender || 'Prefer not to say');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editDeviceId, setEditDeviceId] = useState(currentUser?.device_id || 'AWEN_ESP32_01');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState(null);

  const isLearning = currentUser?.observation_mode || false;
  const confidenceState = currentUser?.baseline_confidence || baselineData?.confidence || (isLearning ? 'Learning' : 'Stable baseline');
  const obsDay = currentUser?.observation_day || (confidenceState === 'Stable baseline' ? 5 : confidenceState === 'Developing baseline' ? 3 : confidenceState === 'Early baseline' ? 2 : 1);
  const restingHrVal = baselineData?.restingHr ? Number(baselineData.restingHr).toFixed(1) : '64.0';
  const hrStdDevVal = baselineData?.hrStdDev ? Number(baselineData.hrStdDev).toFixed(1) : '4.8';

  const handleOpenEdit = () => {
    setEditName(currentUser?.name || '');
    setEditAge(currentUser?.age || '');
    setEditGender(currentUser?.gender || 'Prefer not to say');
    setEditPhone(currentUser?.phone || '');
    setEditDeviceId(currentUser?.device_id || 'AWEN_ESP32_01');
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      const updated = await apiService.updateProfile({
        name: editName.trim(),
        age: editAge ? Number(editAge) : null,
        gender: editGender,
        phone: editPhone.trim(),
        device_id: editDeviceId.trim()
      });

      setSaveSuccessMsg("Profile saved to SQLite database successfully!");
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setSaveSuccessMsg(null);
      }, 1200);
    } catch (err) {
      setSaveErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 4 Confidence Tiers
  const CONFIDENCE_TIERS = [
    { name: 'Learning', minSamples: 0, desc: 'Initial quiet sample collection' },
    { name: 'Early baseline', minSamples: 5, desc: 'Early resting signature active' },
    { name: 'Developing baseline', minSamples: 15, desc: 'Increasing personal accuracy' },
    { name: 'Stable baseline', minSamples: 30, desc: 'High-precision personal signature' }
  ];

  const currentTierIdx = CONFIDENCE_TIERS.findIndex(t => t.name.toLowerCase() === confidenceState.toLowerCase());

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 lg:pb-12 space-y-6 animate-fadeIn">
      
      {/* ── 1. WHO YOU ARE (Profile Header with SQLite Data) ── */}
      <div className="neo-surface p-5 sm:p-7 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] text-left">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--text-primary)] text-[var(--bg-base)] border-2 border-[var(--border-strong)] shadow-[3px_3px_0px_#111] flex items-center justify-center font-heading font-bold text-2xl shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">
                  {currentUser?.name || 'User'}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[var(--border-strong)] bg-[var(--surface-secondary)] text-[var(--text-primary)]">
                  {currentUser?.patient_id || 'USR-LOCAL'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                {currentUser?.email || 'user@awen.local'}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)] text-xs font-mono font-bold border border-[var(--border-strong)]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Tier: {confidenceState}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenEdit}
              className="px-3 py-2 neo-surface hover:bg-[var(--surface-secondary)] border-2 border-[var(--border-strong)] shadow-[2px_2px_0px_#111] flex items-center gap-1.5 text-xs font-bold transition-all"
              title="Edit User Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {currentUser ? (
              <button
                onClick={onLogout}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-600 shadow-[2px_2px_0px_#dc2626] transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="neo-btn neo-btn-primary px-4 py-2 text-xs font-bold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Patient Vitals Record Bar */}
        <div className="mt-5 pt-4 border-t-2 border-[var(--border-strong)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] block">Age</span>
            <span className="font-bold text-sm text-[var(--text-primary)]">
              {currentUser?.age ? `${currentUser.age} yrs` : 'Not specified'}
            </span>
          </div>
          <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] block">Gender</span>
            <span className="font-bold text-sm text-[var(--text-primary)]">
              {currentUser?.gender || 'Not specified'}
            </span>
          </div>
          <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] block">Phone</span>
            <span className="font-bold text-sm text-[var(--text-primary)] truncate block">
              {currentUser?.phone || 'Not specified'}
            </span>
          </div>
          <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)]">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] block">Device ID</span>
            <span className="font-mono font-bold text-xs text-[var(--accent-green-dark)] truncate block">
              {currentUser?.device_id || 'AWEN_ESP32_01'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. WHAT AWEN KNOWS (Personal Baseline Summary) ── */}
      <div className="neo-surface p-6 sm:p-7 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] space-y-4 text-left">
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
            <span>Learned Body Baseline (SQLite Single Source of Truth)</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono">
            {currentUser?.patient_id ? `USER REF: ${currentUser.patient_id}` : "CALIBRATING"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block uppercase">Resting HR</span>
            <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">{restingHrVal} bpm</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Personal Signature</span>
          </div>

          <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block uppercase">Usual Variance</span>
            <span className="text-xl font-heading font-bold text-[var(--accent-green-dark)] block">±{hrStdDevVal} bpm</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Expected Corridor</span>
          </div>

          <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block uppercase">Observation Day</span>
            <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">{obsDay} / 7</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Observation Cycle</span>
          </div>

          <div className="p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-strong)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono block uppercase">Status</span>
            <span className="text-xl font-heading font-bold text-[var(--text-primary)] block">
              {isLearning ? 'Learning' : 'Settled'}
            </span>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold">Baseline State</span>
          </div>
        </div>
      </div>

      {/* ── 3. BASELINE CONFIDENCE PROGRESS CARD ── */}
      <div className="neo-surface p-6 sm:p-7 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] space-y-4 text-left">
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-[var(--accent-green-dark)]" />
            <span>Baseline Confidence Tier</span>
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 border border-[var(--border-strong)] bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)]">
            {confidenceState}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
          {isLearning 
            ? "AWEN is observing your quiet resting windows to calibrate your true personal baseline without false alarms." 
            : "AWEN is evaluating incoming physiological telemetry against your calibrated personal baseline signature."}
        </p>

        {/* 4 Confidence Tiers Stepper */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-4 gap-2 text-center">
            {CONFIDENCE_TIERS.map((tier, idx) => {
              const isCurrent = idx === (currentTierIdx >= 0 ? currentTierIdx : 0);
              const isPassed = idx <= (currentTierIdx >= 0 ? currentTierIdx : 0);

              return (
                <div key={tier.name} className="space-y-1">
                  <div className={`h-2 border border-[var(--border-strong)] transition-all ${isCurrent ? 'bg-[var(--accent-green)] shadow-[1px_1px_0px_#111]' : isPassed ? 'bg-[var(--accent-green-bg)]' : 'bg-[var(--surface-secondary)]'}`} />
                  <span className={`text-[10px] font-mono font-bold block truncate ${isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                    {tier.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onToggleObservation(!isLearning)}
            className="w-full py-2.5 neo-btn text-xs font-bold"
          >
            {isLearning ? 'Conclude Observation Mode' : 'Restart Observation Mode'}
          </button>
        </div>
      </div>

      {/* ── 4. HARDWARE ASSOCIATION DETAILS ── */}
      <div className="neo-surface p-6 sm:p-7 border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[4px_4px_0px_#111] space-y-3 text-left">
        <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
          <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accent-green-dark)]" />
            <span>Associated ESP32 Device & Data Stream</span>
          </span>
          <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 border border-[var(--border-strong)] ${telemetry?.isHardware ? 'bg-[var(--accent-green-bg)] text-[var(--accent-green-dark)]' : 'bg-red-50 text-red-700'}`}>
            {telemetry?.isHardware ? 'HARDWARE ACTIVE' : 'AWAITING HARDWARE'}
          </span>
        </div>

        <div className="text-xs text-[var(--text-secondary)] space-y-1 font-medium">
          <p>Associated Device: <strong className="font-mono text-[var(--text-primary)]">{currentUser?.device_id || 'AWEN_ESP32_01'}</strong></p>
          <p>Timezone: <strong className="text-[var(--text-primary)]">{currentUser?.timezone || 'Asia/Kolkata'}</strong></p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Telemetry posted to <code className="bg-[var(--surface-secondary)] px-1 py-0.5 border border-[var(--border-strong)]">POST /api/readings</code> with this device ID is stored directly under your account.
          </p>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn backdrop-blur-sm">
          <div className="relative w-full max-w-md neo-surface p-6 sm:p-8 space-y-5 text-left border-2 border-[var(--border-strong)] bg-[var(--surface-primary)] shadow-[6px_6px_0px_#111]">
            <div className="flex items-center justify-between border-b-2 border-[var(--border-strong)] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[var(--accent-green-dark)]" />
                <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] uppercase">
                  Edit User Profile
                </h3>
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveErrorMsg && (
              <div className="p-3 bg-red-50 border-2 border-red-600 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveErrorMsg}</span>
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3 bg-[var(--accent-green-bg)] border-2 border-[var(--accent-green)] text-[var(--accent-green-dark)] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-mono font-bold uppercase text-[var(--text-secondary)]">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono font-bold uppercase text-[var(--text-secondary)]">Age</label>
                  <input 
                    type="number"
                    min="1"
                    max="125"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono font-bold uppercase text-[var(--text-secondary)]">Gender</label>
                  <select 
                    value={editGender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] font-medium"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono font-bold uppercase text-[var(--text-secondary)]">Phone Number</label>
                <input 
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono font-bold uppercase text-[var(--text-secondary)]">Hardware Device ID</label>
                <input 
                  type="text"
                  value={editDeviceId}
                  onChange={(e) => setEditDeviceId(e.target.value)}
                  placeholder="AWEN_ESP32_01"
                  className="w-full px-3 py-2 border-2 border-[var(--border-strong)] bg-[var(--surface-secondary)] font-mono font-bold text-[var(--accent-green-dark)]"
                />
                <p className="text-[10px] text-[var(--text-muted)]">Must match the device_id transmitted by your ESP32.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 border-2 border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="neo-btn neo-btn-primary px-5 py-2 font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save to SQLite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
