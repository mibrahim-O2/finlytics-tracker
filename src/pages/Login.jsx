import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const { session, loading, isConfigured, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  if (!loading && session) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message || 'Sign in failed. Check your email and password.');
    }
    // On success, onAuthStateChange updates the session and this component
    // redirects via the <Navigate> above.
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card w-full max-w-sm p-8"
      >
        <div className="mb-6 text-center">
          <span className="text-xl font-semibold tracking-tight">
            Fin<span className="text-accent-green">lytics</span>
          </span>
          <p className="mt-1 text-sm text-text-primary/60">Sign in to continue</p>
        </div>

        {!isConfigured && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-warn-amber/40 bg-warn-amber/10 p-3 text-sm text-warn-amber">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Supabase isn&apos;t configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>, then restart the
              dev server.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-primary/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-primary/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green"
            />
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-warn-red">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-pill w-full bg-accent-green text-bg-base disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-primary/40">
          Private single-user app. Public sign-up is disabled.
        </p>
      </motion.div>
    </div>
  );
}
