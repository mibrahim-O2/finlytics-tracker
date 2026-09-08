import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Loader2, AlertTriangle, Check } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { LoadingBlock, ErrorBanner, EmptyState } from '../components/StateBlocks';
import {
  formatPKR,
  formatMonthYear,
  currentMonthKey,
  goalZone,
  ZONE_COLOR,
} from '../lib/format';

export default function Goals() {
  const { goals, transactions, currentGoal, loading, error, upsertGoal } = useData();
  const monthKey = currentMonthKey();

  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMin(currentGoal ? String(currentGoal.min_amount) : '');
    setMax(currentGoal ? String(currentGoal.max_amount) : '');
  }, [currentGoal]);

  const spentByMonth = useMemo(() => {
    const m = new Map();
    transactions.forEach((t) => {
      if (t.type !== 'expense') return;
      const [y, mo] = t.date.split('-').map(Number);
      const key = `${y}-${mo}`;
      m.set(key, (m.get(key) ?? 0) + t.amount);
    });
    return m;
  }, [transactions]);

  const thisMonthSpend = spentByMonth.get(`${monthKey.year}-${monthKey.month}`) ?? 0;
  const { zone, pct } = goalZone(thisMonthSpend, currentGoal);

  const history = useMemo(
    () =>
      [...goals]
        .filter((g) => !(g.month === monthKey.month && g.year === monthKey.year))
        .sort((a, b) => b.year - a.year || b.month - a.month),
    [goals, monthKey.month, monthKey.year]
  );

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');
    setSaved(false);
    const minN = Number(min);
    const maxN = Number(max);
    if (!Number.isFinite(minN) || !Number.isFinite(maxN) || minN < 0 || maxN < 0) {
      setFormError('Enter valid amounts (0 or more).');
      return;
    }
    if (maxN < minN) {
      setFormError('Maximum must be greater than or equal to minimum.');
      return;
    }
    setBusy(true);
    const { error: err } = await upsertGoal({
      month: monthKey.month,
      year: monthKey.year,
      min_amount: minN,
      max_amount: maxN,
    });
    setBusy(false);
    if (err) {
      setFormError(err.message || 'Could not save the goal.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const field =
    'w-full rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl">Goals</h1>
        <p className="mt-1 text-sm text-text-primary/60">
          Set a monthly spending range. Changes save immediately and update the
          dashboard.
        </p>
      </div>

      <ErrorBanner error={error} />

      {loading ? (
        <LoadingBlock label="Loading goals…" />
      ) : (
        <div className="space-y-8">
          {/* current month */}
          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-accent-teal" />
              <h2 className="text-sm font-medium text-text-primary/70">
                {formatMonthYear(monthKey)}
              </h2>
            </div>

            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label htmlFor="goal-min" className="mb-1 block text-xs text-text-primary/50">
                  Minimum (Rs.)
                </label>
                <input
                  id="goal-min"
                  type="number"
                  min="0"
                  step="100"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  placeholder="5000"
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="goal-max" className="mb-1 block text-xs text-text-primary/50">
                  Maximum (Rs.)
                </label>
                <input
                  id="goal-max"
                  type="number"
                  min="0"
                  step="100"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  placeholder="10000"
                  className={field}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="btn-pill bg-accent-green text-sm text-bg-base disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : null}
                {saved ? 'Saved' : 'Save goal'}
              </button>
            </form>

            {formError && (
              <p className="mt-3 flex items-center gap-2 text-sm text-warn-red">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {formError}
              </p>
            )}

            {currentGoal && (
              <div className="mt-5 border-t border-accent-teal/15 pt-4 text-sm">
                <p className="text-text-primary/70">
                  Spent so far: <span className="font-medium">{formatPKR(thisMonthSpend)}</span>{' '}
                  <span className="text-text-primary/40">
                    of {formatPKR(currentGoal.min_amount)} – {formatPKR(currentGoal.max_amount)}
                  </span>
                </p>
                <p className="mt-1" style={{ color: ZONE_COLOR[zone] }}>
                  {Math.round(pct)}% of the maximum used
                  {zone === 'amber' && ' — approaching the limit'}
                  {zone === 'red' && ' — over budget'}
                </p>
              </div>
            )}
          </div>

          {/* history */}
          <div>
            <h2 className="mb-3 text-sm font-medium text-text-primary/70">Past months</h2>
            {history.length === 0 ? (
              <EmptyState icon={Target} title="No past goals yet">
                Goals you set in previous months will be listed here with actual
                spend.
              </EmptyState>
            ) : (
              <div className="glass-card overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="border-b border-accent-teal/20 text-left text-xs uppercase text-text-primary/40">
                    <tr>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Goal range</th>
                      <th className="px-4 py-3 text-right">Actual spend</th>
                      <th className="px-4 py-3">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((g) => {
                      const spend = spentByMonth.get(`${g.year}-${g.month}`) ?? 0;
                      const z = goalZone(spend, g).zone;
                      const label =
                        z === 'red'
                          ? 'Over maximum'
                          : spend < g.min_amount
                            ? 'Below minimum'
                            : 'Within range';
                      return (
                        <tr key={g.id} className="border-b border-accent-teal/10 last:border-0">
                          <td className="whitespace-nowrap px-4 py-3">
                            {formatMonthYear({ month: g.month, year: g.year })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-text-primary/70">
                            {formatPKR(g.min_amount)} – {formatPKR(g.max_amount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {formatPKR(spend)}
                          </td>
                          <td className="px-4 py-3" style={{ color: ZONE_COLOR[z] }}>
                            {label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
