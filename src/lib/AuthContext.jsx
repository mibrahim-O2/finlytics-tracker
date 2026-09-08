import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const AuthContext = createContext(null);

/**
 * Holds the Supabase auth session for the whole app.
 * Single-user product: there is no sign-up path here by design — the one
 * account is created manually in the Supabase dashboard (see supabase/README.md).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // "loading" until we know whether a session exists, so ProtectedRoute
  // doesn't bounce the user to /login on a hard refresh.
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured. Add keys to .env.' } };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signOut,
    }),
    [session, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
