import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True only when both Supabase env vars are present. The UI uses this to show a
 * clear "not configured yet" state instead of throwing during Phase 1 setup.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Not fatal in Phase 1 - values get added to .env before Phase 2 (Auth).
  console.warn(
    '[Finlytics] Supabase env vars missing. Copy .env.example to .env and fill ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
