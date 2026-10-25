import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage Persistence Keys for Demo / Offline Mode
const STORAGE_KEYS = {
  USER: 'learnloop_user',
  GOALS: 'learnloop_goals',
  ACTIVE_GOAL_ID: 'learnloop_active_goal_id',
  DIAGNOSTICS: 'learnloop_diagnostics',
  PRACTICE_SESSIONS: 'learnloop_practice_sessions',
  CODING_SUBMISSIONS: 'learnloop_coding_submissions',
  STUDY_PODS: 'learnloop_study_pods',
  PRIVACY: 'learnloop_privacy_settings',
};

export const localStore = {
  get<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEYS[key]);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn(`Error reading local storage for ${key}:`, e);
      return defaultValue;
    }
  },

  set<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to local storage for ${key}:`, e);
    }
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
