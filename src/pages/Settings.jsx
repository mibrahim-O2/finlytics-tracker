import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, MessageCircle, LogOut, Check, Loader2 } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { useAuth } from '../lib/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import { LoadingBlock, ErrorBanner } from '../components/StateBlocks';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        checked ? 'bg-accent-green' : 'bg-accent-teal/30'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg-base transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { notificationSettings, updateNotificationSettings, loading, error } = useData();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [localError, setLocalError] = useState('');

  async function save(patch, key) {
    setSavingKey(key);
    setLocalError('');
    const { error: err } = await updateNotificationSettings(patch);
    setSavingKey(null);
    if (err) {
      setLocalError(err.message || 'Could not save.');
      return;
    }
    setSavedKey(key);
    setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const ns = notificationSettings;
  const savedMark = (key) =>
    savedKey === key ? <Check className="h-4 w-4 text-accent-green" /> : null;
  const spinMark = (key) =>
    savingKey === key ? <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" /> : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-text-primary/60">
          Notification preferences and account.
        </p>
      </div>

      <ErrorBanner error={error} />
      {localError && <ErrorBanner error={{ message: localError }} />}

      {loading || !ns ? (
        <LoadingBlock label="Loading settings…" />
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent-teal" />
              <h2 className="text-sm font-medium text-text-primary/70">Reminders</h2>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium">Daily reminder time</p>
                <p className="text-xs text-text-primary/50">
                  When the morning “log your spending” message is sent.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {spinMark('reminder_time')}
                {savedMark('reminder_time')}
                <input
                  type="time"
                  defaultValue={(ns.reminder_time || '08:00').slice(0, 5)}
                  onBlur={(e) => {
                    const v = e.target.value;
                    if (v && v !== (ns.reminder_time || '').slice(0, 5)) {
                      save({ reminder_time: v }, 'reminder_time');
                    }
                  }}
                  className="rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-accent-teal/15 py-3">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-text-primary/60" />
                <div>
                  <p className="text-sm font-medium">Email reminders &amp; reports</p>
                  <p className="text-xs text-text-primary/50">
                    Daily nudge and monthly/annual statements by email.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {spinMark('email_enabled')}
                {savedMark('email_enabled')}
                <Toggle
                  checked={ns.email_enabled}
                  onChange={(v) => save({ email_enabled: v }, 'email_enabled')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-accent-teal/15 py-3">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 text-text-primary/60" />
                <div>
                  <p className="text-sm font-medium">WhatsApp reminders &amp; reports</p>
                  <p className="text-xs text-text-primary/50">
                    Saved for later — WhatsApp delivery isn&apos;t active yet.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {spinMark('whatsapp_enabled')}
                {savedMark('whatsapp_enabled')}
                <Toggle
                  checked={ns.whatsapp_enabled}
                  onChange={(v) => save({ whatsapp_enabled: v }, 'whatsapp_enabled')}
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-4 text-sm font-medium text-text-primary/70">Account</h2>
            <p className="text-sm">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
            <p className="mt-1 text-xs text-text-primary/50">
              Private single-user app. Public sign-up is disabled.
            </p>
            <div className="mt-4">
              <ConnectionStatus />
            </div>
            <button
              onClick={handleSignOut}
              className="btn-pill mt-5 border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
}
