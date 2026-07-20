import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A missing/misconfigured env var should degrade auth gracefully, not take
// down the whole app (the core simulation features don't depend on auth).
function createSafeClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel project settings. Auth features are disabled until this is fixed.');
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        signUp: async () => ({ error: { message: 'Sign-up is temporarily unavailable.' } }),
        signInWithPassword: async () => ({ error: { message: 'Sign-in is temporarily unavailable.' } }),
        signOut: async () => ({}),
      },
    };
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        signUp: async () => ({ error: { message: 'Sign-up is temporarily unavailable.' } }),
        signInWithPassword: async () => ({ error: { message: 'Sign-in is temporarily unavailable.' } }),
        signOut: async () => ({}),
      },
    };
  }
}

export const supabase = createSafeClient();
