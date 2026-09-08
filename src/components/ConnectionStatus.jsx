import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Phase 1 verification widget: confirms the Supabase client can reach the
 * project. In Phase 1 there are no tables yet, so "reachable" = the auth
 * endpoint responds without a network/credential error.
 */
export default function ConnectionStatus() {
  const [state, setState] = useState(
    isSupabaseConfigured ? 'checking' : 'unconfigured'
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (cancelled) return;
        setState(error ? 'error' : 'connected');
      })
      .catch(() => !cancelled && setState('error'));

    return () => {
      cancelled = true;
    };
  }, []);

  const map = {
    checking: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: 'Checking Supabase connection…',
      cls: 'text-accent-cyan',
    },
    connected: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: 'Supabase connected',
      cls: 'text-accent-green',
    },
    unconfigured: {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: 'Supabase not configured — add keys to .env',
      cls: 'text-warn-amber',
    },
    error: {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: 'Supabase unreachable — check .env values',
      cls: 'text-warn-red',
    },
  };

  const s = map[state];
  return (
    <div className={`inline-flex items-center gap-2 text-sm font-medium ${s.cls}`}>
      {s.icon}
      <span>{s.text}</span>
    </div>
  );
}
