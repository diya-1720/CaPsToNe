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
   * Save Telemetry Reading to Supabase `physiological_readings`
   */
  async saveReading(readingData) {
    const entry = {
      id: `rdg_${Date.now()}`,
      user_id: this.currentUser?.id,
      timestamp: new Date().toISOString(),
      data_source: readingData.isHardware ? 'esp32' : 'demo',
      ...readingData
    };

    if (isSupabaseConfigured && this.currentUser?.id) {
      await supabase.from('physiological_readings').insert([{
        user_id: this.currentUser.id,
        heart_rate: readingData.heartRate,
        spo2: readingData.spo2,
        temperature: readingData.temperature,
        activity_state: readingData.activity,
        data_source: readingData.isHardware ? 'esp32' : 'demo'
      }]);
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
