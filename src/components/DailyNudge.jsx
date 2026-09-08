import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, BellRing, Clock, X } from 'lucide-react';
import { useData } from '../lib/DataContext';
import QuickAddTransaction from './QuickAddTransaction';
import { todayISO, getGreeting } from '../lib/format';
import { getDailyMessage } from '../lib/motivation';

/**
 * In-app daily logging prompt (SPEC §6): a friendly greeting + motivational
 * line, a "log today" call to action when nothing has been recorded today, and
 * a "remind me later" snooze that stores a time in notification_settings so the
 * email reminder (Phase 7) can honour it too.
 */
export default function DailyNudge() {
  const { transactions, notificationSettings, updateNotificationSettings } = useData();

  const [now, setNow] = useState(() => new Date());
  const [picking, setPicking] = useState(false);
  const [pickTime, setPickTime] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const loggedToday = useMemo(
    () => transactions.some((t) => t.date === todayISO()),
    [transactions]
  );

  const snoozeUntil = notificationSettings?.snooze_until
    ? new Date(notificationSettings.snooze_until)
    : null;
  const snoozed = snoozeUntil && now < snoozeUntil && !loggedToday;

  const message = getDailyMessage(now);

  function defaultSnooze() {
    const d = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  async function saveSnooze() {
    const [h, m] = pickTime.split(':').map(Number);
    if (Number.isNaN(h)) return;
    const when = new Date(now);
    when.setHours(h, m ?? 0, 0, 0);
    if (when <= now) when.setDate(when.getDate() + 1); // treat a past time as tomorrow
    setBusy(true);
    await updateNotificationSettings({ snooze_until: when.toISOString() });
    setBusy(false);
    setPicking(false);
  }

  async function clearSnooze() {
    await updateNotificationSettings({ snooze_until: null });
  }

  const wrap =
    'glass-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between';

  if (loggedToday) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={wrap}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-green" />
          <div>
            <p className="font-medium">{getGreeting(now)} — today&apos;s spending is logged.</p>
            <p className="text-sm text-text-primary/60">{message}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (snoozed) {
    const label = snoozeUntil.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={wrap}>
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
          <div>
            <p className="font-medium">Reminder set for {label}.</p>
            <p className="text-sm text-text-primary/60">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QuickAddTransaction label="Log now" />
          <button
            onClick={clearSnooze}
            className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={wrap}>
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-cyan" />
        <div>
          <p className="font-medium">
            {getGreeting(now)} — nothing logged yet today.
          </p>
          <p className="text-sm text-text-primary/60">{message}</p>
        </div>
      </div>

      {picking ? (
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={pickTime || defaultSnooze()}
            onChange={(e) => setPickTime(e.target.value)}
            className="rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green"
          />
          <button
            onClick={saveSnooze}
            disabled={busy}
            className="btn-pill bg-accent-green text-sm text-bg-base disabled:opacity-60"
          >
            Save
          </button>
          <button
            onClick={() => setPicking(false)}
            className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <QuickAddTransaction label="Log now" />
          <button
            onClick={() => {
              setPickTime(defaultSnooze());
              setPicking(true);
            }}
            className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary"
          >
            <BellRing className="h-4 w-4" />
            Remind me later
          </button>
        </div>
      )}
    </motion.div>
  );
}
