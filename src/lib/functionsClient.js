import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Invoke a Supabase Edge Function. The user's JWT is attached automatically by
 * supabase-js, so the function can verify the caller is the signed-in user.
 */
export async function invokeFunction(name, body) {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Supabase is not configured.' } };
  }
  const { data, error } = await supabase.functions.invoke(name, { body });
  return { data, error };
}
