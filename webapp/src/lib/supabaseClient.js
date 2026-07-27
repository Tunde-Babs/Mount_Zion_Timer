import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cloud sync, accounts, and cross-device presenter sync are optional — the app
// is fully usable in local-only mode when no Supabase project has been configured
// yet. Every call site should check `isSupabaseConfigured` before relying on it.
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR-PROJECT'));

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;
