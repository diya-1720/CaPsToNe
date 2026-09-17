const STORAGE_KEYS = {
  USER: 'awen_user_session',
  READINGS: 'awen_readings_history',
  CHECKINS: 'awen_checkins_history',
  CHAT: 'awen_chat_history'
};

const getApiBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:8000';
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
    return null;
  }

  saveLocalSession(user) {
    this.currentUser = user ? { ...user } : null;
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    return this.currentUser;
  }

  async restoreSession() {
    return await this.getActiveSession();
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.currentUser?.token) {
      headers['Authorization'] = `Bearer ${this.currentUser.token}`;
    }
    return headers;
  }

  /**
   * Get Active Session from SQLite Backend with Local Fallback
   */
  async getActiveSession() {
    if (!this.currentUser?.token) return this.currentUser;

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const userObj = {
          ...this.currentUser,
          ...data,
          token: this.currentUser.token
        };
        return this.saveLocalSession(userObj);
      }
    } catch (e) {
      // Backend offline — use local cached session
    }
    return this.currentUser;
  }

  /**
   * Sign In with Email & Password via SQLite Backend
   */
  async login(email, password) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid email or password.");
      }

      const data = await res.json();
      const userObj = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        timezone: data.user.timezone || 'Asia/Kolkata',
        observation_mode: Boolean(data.user.observation_mode),
        baseline_confidence: data.user.baseline_confidence || 'Learning',
        token: data.token
      };

      return this.saveLocalSession(userObj);
    } catch (err) {
      // If backend unreachable, permit local development login
      if (err.message && err.message.includes("Failed to fetch")) {
        const userObj = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email,
          timezone: 'Asia/Kolkata',
          observation_mode: true,
          baseline_confidence: 'Learning',
          token: `local_${Date.now()}`
        };
        return this.saveLocalSession(userObj);
      }
      throw err;
    }
  }

  /**
   * Sign Up with Name, Email & Password via SQLite Backend
   */
  async signup(name, email, password) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not create account.");
      }

      const data = await res.json();
      const userObj = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        timezone: data.user.timezone || 'Asia/Kolkata',
        observation_mode: Boolean(data.user.observation_mode),
        baseline_confidence: data.user.baseline_confidence || 'Learning',
        token: data.token
      };

      return this.saveLocalSession(userObj);
    } catch (err) {
      if (err.message && err.message.includes("Failed to fetch")) {
        const userObj = {
          id: `usr_${Date.now()}`,
          name: name || 'User',
          email,
          timezone: 'Asia/Kolkata',
          observation_mode: true,
          baseline_confidence: 'Learning',
          token: `local_${Date.now()}`
        };
        return this.saveLocalSession(userObj);
      }
      throw err;
    }
  }

  /**
   * Sign In with Google OAuth (Simulated Local Fallback)
   */
  async signInWithGoogle() {
    const userObj = {
      id: `usr_google_${Date.now().toString().slice(-4)}`,
      name: 'Google Explorer',
      email: 'user.google@gmail.com',
      timezone: 'Asia/Kolkata',
      observation_mode: true,
      baseline_confidence: 'Learning',
      token: `jwt_google_${Date.now()}`
    };
    return this.saveLocalSession(userObj);
  }

  /**
   * Log Out Session
   */
  async logout() {
    this.saveLocalSession(null);
  }

  /**
   * Update Observation Mode Status
   */
  async updateObservationMode(enabled) {
    if (!this.currentUser) return;
    const confidence = enabled ? 'Learning' : 'Stable baseline';

    try {
      await fetch(`${getApiBaseUrl()}/api/user/observation-mode`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ enabled })
      });
    } catch (e) {}

    const updated = {
      ...this.currentUser,
      observation_mode: enabled,
      baseline_confidence: confidence
    };
    return this.saveLocalSession(updated);
  }

  async updateProfileObservationMode(userId, enabled) {
    return this.updateObservationMode(enabled);
  }

  /**
   * Fetch User Baseline from SQLite Backend
   */
  async fetchUserBaseline(userId) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/user/baseline`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return {
          restingHr: Number(data.restingHr) || 64.0,
          restingSpo2: Number(data.restingSpo2) || 98.6,
          restingTemp: Number(data.restingTemp) || 36.6,
          hrStdDev: Number(data.hrStdDev) || 4.8,
          confidence: data.confidence || 'Learning',
          isDynamic: Boolean(data.isDynamic),
          updatedAt: data.updatedAt
        };
      }
    } catch (e) {}

    return await this.computeAndSaveBaseline(userId);
  }

  /**
   * Save / Compute User Baseline
   */
  async computeAndSaveBaseline(userId) {
    const defaultBaseline = {
      restingHr: 64.0,
      restingSpo2: 98.6,
      restingTemp: 36.6,
      hrStdDev: 4.8,
      confidence: 'Learning',
      isDynamic: false,
      sampleCount: 0
    };

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.READINGS) || '[]');
      const resting = history.filter(r => (!r.activity || r.activity === 'Resting') && r.heart_rate);
      if (resting.length >= 5) {
        const hrValues = resting.map(r => Number(r.heart_rate)).sort((a, b) => a - b);
        const pIndex = (hrValues.length - 1) * 0.07;
        const low = Math.floor(pIndex);
        const high = Math.ceil(pIndex);
        const weight = pIndex - low;
        const calcHr = Math.round((hrValues[low] + weight * (hrValues[high] - hrValues[low])) * 10) / 10;
        const confidence = resting.length >= 30 ? 'Stable baseline' : resting.length >= 15 ? 'Developing baseline' : 'Early baseline';

        const computed = {
          restingHr: calcHr,
          restingSpo2: 98.6,
          restingTemp: 36.6,
          hrStdDev: 4.8,
          confidence,
          isDynamic: true,
          sampleCount: resting.length
        };

        // Sync with backend if possible
        fetch(`${getApiBaseUrl()}/api/user/baseline`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            resting_hr: computed.restingHr,
            resting_spo2: computed.restingSpo2,
            resting_temp: computed.restingTemp,
            hr_variance: computed.hrStdDev,
            confidence: computed.confidence
          })
        }).catch(() => {});

        return computed;
      }
    } catch (e) {}

    return defaultBaseline;
  }

  /**
   * Seed Test Resting Readings for Baseline testing
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

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.READINGS) || '[]');
      const localRows = readingsToSeed.map((r, idx) => ({
        id: `seed_${Date.now()}_${idx}`,
        user_id: userId || this.currentUser?.id,
        timestamp: new Date().toISOString(),
        device_id: 'test_seed',
        ...r
      }));
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify([...localRows, ...history].slice(0, 100)));
    } catch (e) {}

    return await this.computeAndSaveBaseline(userId || this.currentUser?.id);
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

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/history/weekly`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const map = {};
          rows.forEach(r => { map[r.date] = r; });
          days.forEach(d => {
            if (map[d.date]) {
              d.averageHeartRate = map[d.date].averageHeartRate;
              d.sampleCount = map[d.date].sampleCount;
            }
          });
          if (days.some(d => d.averageHeartRate !== null)) {
            return days;
          }
        }
      }
    } catch (e) {}

    // Fallback if no readings yet
    const mockVariances = [-1.2, 0.8, -0.4, 1.5, -0.8, 0.3, 0.0];
    const baseHr = 64.0;
    days.forEach((day, idx) => {
      day.averageHeartRate = Math.round((baseHr + mockVariances[idx]) * 10) / 10;
      day.sampleCount = 14 + idx * 3;
    });

    return days;
  }

  /**
   * Save Daily Check-in to SQLite Backend
   */
  async saveCheckin(checkinData) {
    const entry = {
      id: `chk_${Date.now()}`,
      user_id: this.currentUser?.id,
      timestamp: new Date().toISOString(),
      ...checkinData
    };

    try {
      await fetch(`${getApiBaseUrl()}/api/user/checkins`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          mood: checkinData.mood || checkinData.label || 'Good',
          activity: checkinData.activity || checkinData.context || 'Resting',
          notes: checkinData.notes || ''
        })
      });
    } catch (e) {}

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
      history.unshift(entry);
      localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(history.slice(0, 50)));
    } catch (e) {}

    return entry;
  }

  /**
   * Send Telemetry to FastAPI ML Engine
   */
  async analyzeTelemetry(telemetryData, fallbackBaselineEngine, userBaselineData = null) {
    const activeBaseline = userBaselineData || fallbackBaselineEngine?.baseline || null;

    const payload = {
      device_id: telemetryData.device_id || (telemetryData.isHardware ? 'esp32_max30102' : 'disconnected'),
      timestamp: telemetryData.timestamp || new Date().toISOString(),
      heart_rate: telemetryData.heartRate ?? telemetryData.heart_rate ?? null,
      spo2: telemetryData.spo2 ?? null,
      temperature: telemetryData.temperature ?? null,
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

    // If hardware is not connected and no HR reading is present, return safe awaiting state
    if (payload.heart_rate === null || payload.heart_rate === undefined) {
      return {
        wellnessIndex: 'Awaiting Signal',
        emotionalState: 'happy',
        confidenceScore: 0,
        isHardwareConnected: false,
        metrics: { hr: null, spo2: null, temp: null, activity: 'Resting' },
        baselineComparison: {
          restingHr: activeBaseline?.restingHr || 64.0,
          expectedHr: activeBaseline?.restingHr || 64.0,
          hrDelta: 0
        },
        explainability: {
          summary: 'Hardware not connected. Connect your ESP32 sensor to begin live physiological comparison.',
          factors: []
        }
      };
    }

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/analyze`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          wellnessIndex: data.wellness_index || 'Balanced',
          emotionalState: data.stress_level === 'elevated' ? 'stress' : data.stress_level === 'moderate' ? 'attention' : 'relaxed',
          confidenceScore: data.confidence_score || 95,
          isExertionExplained: data.baseline_comparison?.is_activity_explained || false,
          isHardwareConnected: true,
          metrics: {
            hr: payload.heart_rate,
            spo2: payload.spo2,
            temp: payload.temperature,
            activity: payload.activity
          },
          baselineComparison: {
            restingHr: data.baseline_comparison?.resting_hr || 64.0,
            expectedHr: data.baseline_comparison?.expected_hr_for_activity || payload.heart_rate,
            hrDelta: data.baseline_comparison?.hr_delta || 0
          },
          explainability: {
            summary: data.explainability?.summary || 'Physiological signals align smoothly with baseline.',
            factors: data.explainability?.factors || []
          }
        };
      }
    } catch (e) {}

    if (fallbackBaselineEngine) {
      return fallbackBaselineEngine.evaluateReadings(
        payload.heart_rate,
        payload.spo2 || 98.6,
        payload.temperature || 36.6,
        payload.activity,
        payload.mood
      );
    }

    return null;
  }

  /**
   * Save Telemetry Reading to SQLite Backend
   */
  async saveReading(readingData) {
    if (!readingData.heartRate && !readingData.heart_rate) return;

    const entry = {
      id: `rdg_${Date.now()}`,
      user_id: this.currentUser?.id,
      timestamp: readingData.timestamp || new Date().toISOString(),
      device_id: readingData.isHardware ? 'esp32_max30102' : 'manual',
      data_source: readingData.isHardware ? 'esp32' : 'manual',
      ...readingData
    };

    try {
      await fetch(`${getApiBaseUrl()}/api/user/readings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          heart_rate: readingData.heartRate ?? readingData.heart_rate,
          spo2: readingData.spo2 ?? 98.6,
          temperature: readingData.temperature ?? 36.6,
          activity: readingData.activity || 'Resting',
          data_source: readingData.isHardware ? 'esp32' : 'manual'
        })
      });
    } catch (e) {}

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.READINGS) || '[]');
      history.unshift(entry);
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(history.slice(0, 100)));
    } catch (e) {}

    return entry;
  }

  /**
   * Save Conversation to SQLite Backend
   */
  async saveConversation(userMsg, awenReply, topic = 'general') {
    try {
      await fetch(`${getApiBaseUrl()}/api/conversations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message: userMsg,
          response: awenReply,
          topic
        })
      });
    } catch (e) {}
  }
}

export const apiService = new ApiService();
