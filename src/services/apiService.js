import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  USER: 'awen_user_session',
  READINGS: 'awen_readings_history',
  CHECKINS: 'awen_checkins_history',
  CHAT: 'awen_chat_history'
};


export class ApiService {
  constructor() {
    this.currentUser = this.loadLocalSession();
    this.isBackendAvailable = true;
    this.lastBackendCheckTime = 0;
    this.BACKEND_RETRY_COOLDOWN = 15000;
    this.activeFetchController = null;
  }

  loadLocalSession() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Invalidate legacy hardcoded demo sessions (old "Diya" user)
        if (
          parsed?.id === 'usr_8841' ||
          parsed?.email === 'diya@awen.ai' ||
          parsed?.token === 'jwt_token_demo_8841'
        ) {
          localStorage.removeItem(STORAGE_KEYS.USER);
          return null;
        }
        return parsed;
      }
    } catch (e) {}
    // Return null — unauthenticated users see the Landing Page
    return null;
  }

  saveLocalSession(user) {
    this.currentUser = { ...user };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  /**
   * Restore Session Alias
   */
  async restoreSession() {
    return await this.getActiveSession();
  }

  /**
   * Get Active Authenticated Supabase Session
   */
  async getActiveSession() {
    if (!isSupabaseConfigured) return this.currentUser;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return this.currentUser;

      const profile = await this.fetchUserProfile(session.user.id);
      const userObj = {
        id: session.user.id,
        email: session.user.email,
        name: profile?.name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        observation_mode: profile?.observation_mode ?? true,
        observation_start: profile?.observation_start || new Date().toISOString(),
        baseline_confidence: profile?.baseline_confidence || 'Learning',
        token: session.access_token
      };

      return this.saveLocalSession(userObj);
    } catch (e) {
      return this.currentUser;
    }
  }

  /**
   * Fetch User Profile from Supabase `profiles` table
   */
  async fetchUserProfile(userId) {
    if (!isSupabaseConfigured || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  /**
   * Sign In with Email & Password
   */
  async login(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw new Error(error.message || "That email or password doesn't look right. Try again?");
      
      const user = data.user;
      const profile = await this.fetchUserProfile(user.id);

      const userObj = {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.full_name || user.email.split('@')[0],
        timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        observation_mode: profile?.observation_mode ?? true,
        observation_start: profile?.observation_start || new Date().toISOString(),
        baseline_confidence: profile?.baseline_confidence || 'Learning',
        token: data.session.access_token
      };

      return this.saveLocalSession(userObj);
    }

    // Local Fallback
    const user = {
      ...this.currentUser,
      email: email || this.currentUser.email,
      name: email ? email.split('@')[0] : 'User',
      token: `jwt_${Date.now()}`
    };
    return this.saveLocalSession(user);
  }

  /**
   * Sign Up with Name, Email & Password
   */
  async signup(name, email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });
      if (error) throw new Error(error.message || "Could not create account. Please check your credentials.");

      const user = data.user;
      if (user) {
        // Upsert initial profile record in Supabase
        await supabase.from('profiles').upsert({
          id: user.id,
          name: name || 'User',
          email: user.email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          observation_mode: true,
          baseline_confidence: 'Learning'
        });
      }

      const userObj = {
        id: user?.id || `usr_${Date.now()}`,
        name: name || 'User',
        email: email || 'user@awen.ai',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        observation_mode: true,
        observation_start: new Date().toISOString(),
        baseline_confidence: 'Learning',
        token: data.session?.access_token || `jwt_${Date.now()}`
      };

      return this.saveLocalSession(userObj);
    }

    // Local Fallback
    const userObj = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      name: name || 'User',
      email: email || 'user@awen.ai',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      observation_mode: true,
      observation_start: new Date().toISOString(),
      baseline_confidence: 'Learning',
      token: `jwt_${Date.now()}`
    };
    return this.saveLocalSession(userObj);
  }

  /**
   * Sign In with Google OAuth
   */
  async signInWithGoogle() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw new Error(error.message || "Google sign-in didn't complete. Please try again.");
      return data;
    }
    // Fallback simulation for demo
    const userObj = {
      id: `usr_google_${Date.now().toString().slice(-4)}`,
      name: 'User (Google)',
      email: 'user.google@gmail.com',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      observation_mode: true,
      observation_start: new Date().toISOString(),
      baseline_confidence: 'Learning',
      token: `jwt_google_${Date.now()}`
    };
    return this.saveLocalSession(userObj);
  }

  /**
   * Log Out Session
   */
  async logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.currentUser = null;
  }

  /**
   * Update Observation Mode Status
   */
  async updateObservationMode(enabled) {
    if (!this.currentUser) return;
    const confidence = enabled ? 'Learning' : 'Stable baseline';

    if (isSupabaseConfigured && this.currentUser.id) {
      await supabase.from('profiles').update({
        observation_mode: enabled,
        baseline_confidence: confidence
      }).eq('id', this.currentUser.id);
    }

    const updated = {
      ...this.currentUser,
      observation_mode: enabled,
      baseline_confidence: confidence
    };
    return this.saveLocalSession(updated);
  }

  /**
   * Update Profile Observation Mode Alias
   */
  async updateProfileObservationMode(userId, enabled) {
    if (isSupabaseConfigured && userId && !this.currentUser?.isGuest) {
      try {
        const confidence = enabled ? 'Learning' : 'Stable baseline';
        await supabase.from('profiles').update({
          observation_mode: enabled,
          baseline_confidence: confidence
        }).eq('id', userId);
      } catch (e) {
        console.warn('Error updating profile observation mode:', e);
      }
    }
    return this.updateObservationMode(enabled);
  }

  /**
   * Fetch User Baseline from Supabase `user_baselines`
   */
  /**
   * Fetch User Baseline from Supabase `user_baselines` with fallback computation
   */
  async fetchUserBaseline(userId) {
    if (!isSupabaseConfigured || !userId || this.currentUser?.isGuest) {
      return await this.computeAndSaveBaseline(userId);
    }
    try {
      const { data, error } = await supabase
        .from('user_baselines')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return await this.computeAndSaveBaseline(userId);
      }

      return {
        restingHr: Number(data.resting_hr) || 64.0,
        restingSpo2: Number(data.resting_spo2) || 98.6,
        restingTemp: Number(data.resting_temp) || 36.6,
        hrStdDev: Number(data.hr_variance) || 4.8,
        confidence: data.confidence || 'Learning',
        isDynamic: true,
        updatedAt: data.updated_at
      };
    } catch (e) {
      return await this.computeAndSaveBaseline(userId);
    }
  }

  /**
   * Development Testing Helper: Seed Test Resting Readings & Calculate Dynamic Baseline
   * Inserts valid resting readings (targetHr +/- 2 bpm) to test baseline calculation
   * without polluting production code or waiting 7 days.
   */
  async seedTestReadings(userId = null, targetHr = 58) {
    const readingsToSeed = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const hr = Math.round((targetHr + (Math.random() * 4 - 2)) * 10) / 10;
      readingsToSeed.push({
        heart_rate: hr,
        spo2: 98.4 + (Math.random() * 0.4 - 0.2),
        temperature: 36.6 + (Math.random() * 0.2 - 0.1),
        activity_state: 'Resting',
        data_source: 'test_seed'
      });
    }

    const effectiveUserId = userId || this.currentUser?.id;

    if (isSupabaseConfigured && effectiveUserId && !this.currentUser?.isGuest) {
      try {
        const rows = readingsToSeed.map(r => ({
          user_id: effectiveUserId,
          ...r
        }));
        await supabase.from('physiological_readings').insert(rows);
      } catch (e) {}
    }

    // Also seed local storage history
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.READINGS) || '[]');
      const localRows = readingsToSeed.map((r, idx) => ({
        id: `seed_${Date.now()}_${idx}`,
        user_id: effectiveUserId,
        timestamp: new Date().toISOString(),
        device_id: 'test_seed',
        ...r
      }));
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify([...localRows, ...history].slice(0, 100)));
    } catch (e) {}

    return await this.computeAndSaveBaseline(effectiveUserId);
  }

  /**
   * Compute User Baseline from Supabase `physiological_readings` and save to `user_baselines`
   */
  async computeAndSaveBaseline(userId) {
    let readings = [];

    if (isSupabaseConfigured && userId && !this.currentUser?.isGuest) {
      try {
        const { data, error } = await supabase
          .from('physiological_readings')
          .select('heart_rate, spo2, temperature, activity_state, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(200);

        if (!error && data) {
          readings = data;
        }
      } catch (e) {}
    }

    if (readings.length === 0) {
      try {
        const localHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.READINGS) || '[]');
        readings = localHistory.map(r => ({
          heart_rate: r.heart_rate ?? r.heartRate,
          spo2: r.spo2,
          temperature: r.temperature,
          activity_state: r.activity_state ?? r.activity,
          created_at: r.created_at ?? r.timestamp
        }));
      } catch (e) {}
    }

    if (!readings || readings.length === 0) {
      return null;
    }

    // Filter resting readings ONLY with valid HR (30-220 bpm)
    const restingReadings = readings.filter(r => 
      (!r.activity_state || r.activity_state === 'Resting') &&
      r.heart_rate && Number(r.heart_rate) >= 30 && Number(r.heart_rate) <= 220
    );

    // Require at least 5 resting readings for a dynamic baseline
    if (restingReadings.length < 5) {
      return {
        restingHr: 64.0,
        restingSpo2: 98.6,
        restingTemp: 36.6,
        hrStdDev: 4.8,
        confidence: 'Learning',
        isDynamic: false,
        sampleCount: restingReadings.length
      };
    }

    // Sort resting heart rates in ascending order for 7th-percentile baseline calculation
    const hrValues = restingReadings.map(r => Number(r.heart_rate)).sort((a, b) => a - b);
    
    // Calculate 7th percentile resting HR using linear interpolation
    const pIndex = (hrValues.length - 1) * 0.07;
    const lowerIdx = Math.floor(pIndex);
    const upperIdx = Math.ceil(pIndex);
    const pWeight = pIndex - lowerIdx;
    const rawPercentileHr = hrValues[lowerIdx] + pWeight * (hrValues[upperIdx] - hrValues[lowerIdx]);
    const computedRestingHr = Math.round(rawPercentileHr * 10) / 10;

    const spo2Values = restingReadings
      .map(r => Number(r.spo2))
      .filter(val => val && val >= 80 && val <= 100);
    const computedSpo2 = spo2Values.length > 0
      ? Math.round((spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length) * 10) / 10
      : 98.6;

    const tempValues = restingReadings
      .map(r => Number(r.temperature))
      .filter(val => val && val >= 30 && val <= 45);
    const computedTemp = tempValues.length > 0
      ? Math.round((tempValues.reduce((a, b) => a + b, 0) / tempValues.length) * 10) / 10
      : 36.6;

    const variance = hrValues.reduce((acc, val) => acc + Math.pow(val - computedRestingHr, 2), 0) / hrValues.length;
    const computedStdDev = Math.round(Math.sqrt(variance) * 10) / 10 || 4.8;

    let confidenceState = 'Learning';
    if (restingReadings.length >= 30) {
      confidenceState = 'Stable baseline';
    } else if (restingReadings.length >= 15) {
      confidenceState = 'Developing baseline';
    } else if (restingReadings.length >= 5) {
      confidenceState = 'Early baseline';
    }

    const baselinePayload = {
      user_id: userId || 'local_user',
      resting_hr: computedRestingHr,
      resting_spo2: computedSpo2,
      resting_temp: computedTemp,
      hr_variance: computedStdDev,
      confidence: confidenceState,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && userId && !this.currentUser?.isGuest) {
      try {
        await supabase.from('user_baselines').upsert(baselinePayload, { onConflict: 'user_id' });
        await supabase.from('profiles').update({
          baseline_confidence: confidenceState
        }).eq('id', userId);
      } catch (e) {}
    }

    return {
      restingHr: computedRestingHr,
      restingSpo2: computedSpo2,
      restingTemp: computedTemp,
      hrStdDev: computedStdDev,
      confidence: confidenceState,
      isDynamic: true,
      sampleCount: restingReadings.length,
      updatedAt: baselinePayload.updated_at
    };
  }

  /**
   * Fetch 7-Day Heart Rate History for Journey Screen
   */
  async fetchWeeklyHeartRateHistory(userId = null) {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        date: dateStr,
        label,
        averageHeartRate: null,
        sampleCount: 0
      });
    }

    if (isSupabaseConfigured && userId && !this.currentUser?.isGuest) {
      try {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
          .from('physiological_readings')
          .select('created_at, heart_rate, activity_state')
          .eq('user_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString());

        if (!error && data && data.length > 0) {
          const grouped = {};
          data.forEach(item => {
            const dayKey = new Date(item.created_at).toISOString().split('T')[0];
            if (!grouped[dayKey]) grouped[dayKey] = [];
            if (item.heart_rate) grouped[dayKey].push(Number(item.heart_rate));
          });

          days.forEach(day => {
            if (grouped[day.date] && grouped[day.date].length > 0) {
              const sum = grouped[day.date].reduce((a, b) => a + b, 0);
              day.averageHeartRate = Math.round((sum / grouped[day.date].length) * 10) / 10;
              day.sampleCount = grouped[day.date].length;
            }
          });

          if (days.some(d => d.averageHeartRate !== null)) {
            return days;
          }
        }
      } catch (e) {
        console.warn('Error fetching weekly heart rate history from Supabase:', e);
      }
    }

    try {
      const localReadings = JSON.parse(localStorage.getItem(STORAGE_KEYS.READINGS) || '[]');
      if (localReadings.length > 0) {
        const grouped = {};
        localReadings.forEach(item => {
          const itemDate = item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : null;
          const hr = item.heart_rate || item.heartRate;
          if (itemDate && hr) {
            if (!grouped[itemDate]) grouped[itemDate] = [];
            grouped[itemDate].push(Number(hr));
          }
        });

        days.forEach(day => {
          if (grouped[day.date] && grouped[day.date].length > 0) {
            const sum = grouped[day.date].reduce((a, b) => a + b, 0);
            day.averageHeartRate = Math.round((sum / grouped[day.date].length) * 10) / 10;
            day.sampleCount = grouped[day.date].length;
          }
        });

        if (days.some(d => d.averageHeartRate !== null)) {
          return days;
        }
      }
    } catch (e) {}

    const mockVariances = [-1.2, 0.8, -0.4, 1.5, -0.8, 0.3, 0.0];
    const baseHr = 64.0;
    days.forEach((day, idx) => {
      day.averageHeartRate = Math.round((baseHr + mockVariances[idx]) * 10) / 10;
      day.sampleCount = 14 + idx * 3;
    });

    return days;
  }

  /**
   * Save Daily Check-in to Supabase `user_checkins`
   */
  async saveCheckin(checkinData) {
    const entry = {
      id: `chk_${Date.now()}`,
      user_id: this.currentUser?.id,
      timestamp: new Date().toISOString(),
      ...checkinData
    };

    if (isSupabaseConfigured && this.currentUser?.id) {
      await supabase.from('user_checkins').insert([{
        user_id: this.currentUser.id,
        mood: checkinData.mood || checkinData.label,
        activity_context: checkinData.activity || checkinData.context,
        notes: checkinData.notes || ''
      }]);
    }

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
      history.unshift(entry);
      localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(history.slice(0, 50)));
    } catch (e) {}

    return entry;
  }

  /**
   * Send Telemetry to FastAPI ML Engine or Fallback to Client Baseline Engine
   * Conforms to standardized data contract: device_id, timestamp, heart_rate, spo2, temperature, activity, mood
   */
  async analyzeTelemetry(telemetryData, fallbackBaselineEngine, userBaselineData = null) {
    const activeBaseline = userBaselineData || fallbackBaselineEngine?.baseline || null;

    const payload = {
      device_id: telemetryData.device_id || (telemetryData.isHardware ? 'esp32_max30102' : 'demo_simulator'),
      timestamp: telemetryData.timestamp || new Date().toISOString(),
      heart_rate: telemetryData.heart_rate ?? telemetryData.heartRate ?? 64.0,
      spo2: telemetryData.spo2 ?? 98.6,
      temperature: telemetryData.temperature ?? 36.6,
      activity: telemetryData.activity || 'Resting',
      mood: telemetryData.mood || 'Normal',
      user_baseline: activeBaseline ? {
        resting_hr: Number(activeBaseline.restingHr),
        resting_spo2: Number(activeBaseline.restingSpo2),
        resting_temp: Number(activeBaseline.restingTemp),
        hr_std_dev: Number(activeBaseline.hrStdDev),
        confidence: activeBaseline.confidence || 'Learning'
      } : null
    };

    let evaluation = null;
    const now = Date.now();
    const shouldCheckBackend = this.isBackendAvailable || (now - this.lastBackendCheckTime >= this.BACKEND_RETRY_COOLDOWN);

    if (shouldCheckBackend) {
      try {
        if (this.activeFetchController) {
          this.activeFetchController.abort();
        }
        this.activeFetchController = new AbortController();
        const controller = this.activeFetchController;
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const getApiEndpoint = (path) => {
          const envUrl = import.meta.env?.VITE_API_URL;
          const baseUrl = envUrl && envUrl.trim() !== '' ? envUrl.trim() : 'http://localhost:8000';
          const cleanBase = baseUrl.replace(/\/+$/, '');
          const cleanPath = path.replace(/^\/+/, '');
          return cleanBase.endsWith(cleanPath) ? cleanBase : `${cleanBase}/${cleanPath}`;
        };

        const endpoint = getApiEndpoint('api/analyze');

        const headers = { 'Content-Type': 'application/json' };
        if (this.currentUser?.token) {
          headers['Authorization'] = `Bearer ${this.currentUser.token}`;
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (this.activeFetchController === controller) {
          this.activeFetchController = null;
        }

        if (res.ok) {
          this.isBackendAvailable = true;
          const data = await res.json();
          evaluation = {
            wellnessIndex: data.wellness_index || 'Balanced',
            emotionalState: data.stress_level === 'elevated' ? 'stress' : data.stress_level === 'moderate' ? 'attention' : 'relaxed',
            confidenceScore: data.confidence_score || 95,
            isExertionExplained: data.baseline_comparison?.is_activity_explained || false,
            metrics: {
              hr: payload.heart_rate,
              spo2: payload.spo2,
              temp: payload.temperature,
              activity: payload.activity,
              mood: payload.mood
            },
            baselineComparison: {
              restingHr: data.baseline_comparison?.resting_hr || 64.0,
              expectedHr: data.baseline_comparison?.expected_hr_for_activity || payload.heart_rate,
              hrDelta: data.baseline_comparison?.hr_delta || 0,
              rawRestingDelta: data.baseline_comparison?.hr_delta || 0
            },
            explainability: {
              summary: data.explainability?.summary || 'Physiological signals align smoothly with baseline.',
              factors: data.explainability?.factors?.map(f => ({
                key: f.key || f.label?.toLowerCase()?.replace(/\s+/g, '_') || 'factor',
                title: f.title || f.label || 'Baseline Metric',
                label: f.label || f.title || 'Baseline Metric',
                value: f.value || f.detail || 'Normal',
                detail: f.detail || f.value || 'Normal',
                status: f.status || (f.value?.includes('Normal') || f.value?.includes('Optimal') ? 'normal' : 'elevated'),
                explanation: f.explanation || f.detail || f.value || 'Matches learned baseline.'
              })) || []
            }
          };
        } else {
          this.isBackendAvailable = false;
          this.lastBackendCheckTime = now;
          console.warn(`[AWEN API] FastAPI /api/analyze returned status ${res.status}. Falling back to client BaselineEngine.`);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          this.isBackendAvailable = false;
          this.lastBackendCheckTime = now;
          console.warn('[AWEN API] FastAPI backend unreachable at http://localhost:8000/api/analyze. Active fallback to client BaselineEngine.', e.message);
        }
      }
    }

    if (!evaluation && fallbackBaselineEngine) {
      evaluation = fallbackBaselineEngine.evaluateReadings(
        payload.heart_rate,
        payload.spo2,
        payload.temperature,
        payload.activity,
        payload.mood
      );
    }

    return evaluation;
  }

  /**
   * Save Telemetry Reading to Supabase `physiological_readings`
   */
  async saveReading(readingData) {
    const entry = {
      id: `rdg_${Date.now()}`,
      user_id: this.currentUser?.id,
      timestamp: readingData.timestamp || new Date().toISOString(),
      device_id: readingData.device_id || (readingData.isHardware ? 'esp32_max30102' : 'demo_simulator'),
      data_source: readingData.isHardware ? 'esp32' : 'demo',
      ...readingData
    };

    if (isSupabaseConfigured && this.currentUser?.id && !this.currentUser.isGuest) {
      await supabase.from('physiological_readings').insert([{
        user_id: this.currentUser.id,
        heart_rate: readingData.heart_rate ?? readingData.heartRate,
        spo2: readingData.spo2,
        temperature: readingData.temperature,
        activity_state: readingData.activity,
        data_source: readingData.isHardware ? 'esp32' : 'demo'
      }]);

      if (!readingData.activity || readingData.activity === 'Resting') {
        this.computeAndSaveBaseline(this.currentUser.id).catch(() => {});
      }
    }

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.READINGS) || '[]');
      history.unshift(entry);
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(history.slice(0, 100)));
    } catch (e) {}

    return entry;
  }

  /**
   * Save Conversation to Supabase `awen_conversations`
   */
  async saveConversation(userMsg, awenReply, topic = 'general') {
    if (isSupabaseConfigured && this.currentUser?.id) {
      await supabase.from('awen_conversations').insert([{
        user_id: this.currentUser.id,
        user_message: userMsg,
        awen_response: awenReply,
        topic
      }]);
    }
  }
}

export const apiService = new ApiService();
