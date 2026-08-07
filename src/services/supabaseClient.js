import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up accidentally pasted quotes or whitespace
const supabaseUrl = rawUrl.replace(/['"]/g, '').trim();
const supabaseAnonKey = rawKey.replace(/['"]/g, '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('demo.supabase.co')
);

let clientInstance = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn("Supabase initialization fallback active:", err);
  }
}

// Fallback object preventing production crashes if env variables are pending configuration
export const supabase = clientInstance || {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error("Supabase URL or Key is not configured yet.") }),
    signUp: async () => ({ data: null, error: new Error("Supabase URL or Key is not configured yet.") }),
    signInWithOAuth: async () => ({ data: null, error: new Error("Supabase URL or Key is not configured yet.") }),
    signOut: async () => {}
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({ eq: async () => ({ data: null, error: null }) }),
    upsert: async () => ({ data: null, error: null })
  })
};
