import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Mail, Loader2, Check, AlertTriangle } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { LoadingBlock, ErrorBanner } from '../components/StateBlocks';
import { buildMonthlyReport, buildAnnualReport } from '../lib/reports';
import { invokeFunction } from '../lib/functionsClient';
import { formatPKR, currentMonthKey } from '../lib/format';

function Bars({ rows }) {
  if (rows.length === 0) {
    return <p className="py-3 text-sm text-text-primary/40">Nothing recorded.</p>;
  }
  const maxAmount = Math.max(...rows.map((r) => r.amount));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.name}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-primary/80">{r.name}</span>
            <span className="text-text-primary/60">
              {formatPKR(r.amount)} · {r.pct}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-accent-teal/15">
            <div
              className="h-1.5 rounded-full bg-accent-green"
              style={{ width: `${maxAmount ? (r.amount / maxAmount) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SummaryCards({ totals }) {
  const cards = [
    { label: 'Income', value: totals.income, cls: 'text-accent-green' },
    { label: 'Expense', value: totals.expense, cls: 'text-text-primary' },
    {
      label: 'Net',
      value: totals.net,
      cls: totals.net >= 0 ? 'text-accent-green' : 'text-text-primary',
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="glass-card p-4">
          <p className="text-xs text-text-primary/50">{c.label}</p>
          <p className={`mt-1 text-lg font-semibold ${c.cls}`}>{formatPKR(c.value)}</p>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const { transactions, categoryById, goals, loading, error } = useData();
  const now = currentMonthKey();

  const [tab, setTab] = useState('monthly');
  const [monthStr, setMonthStr] = useState(
    `${now.year}-${String(now.month).padStart(2, '0')}`
  );
  const [year, setYear] = useState(now.year);

  const [sendState, setSendState] = useState({ status: 'idle', message: '' });

  const years = useMemo(() => {
    const set = new Set([now.year]);
    transactions.forEach((t) => set.add(Number(t.date.slice(0, 4))));
    goals.forEach((g) => set.add(g.year));
    return [...set].sort((a, b) => b - a);
  }, [transactions, goals, now.year]);

  const [selYear, selMonth] = monthStr.split('-').map(Number);

  const monthlyReport = useMemo(() => {
    const goal = goals.find((g) => g.year === selYear && g.month === selMonth) ?? null;
    return buildMonthlyReport({
      year: selYear,
      month: selMonth,
      transactions,
      categoryById,
      goal,
    });
  }, [selYear, selMonth, transactions, categoryById, goals]);

  const annualReport = useMemo(
    () => buildAnnualReport({ year, transactions, categoryById }),
    [year, transactions, categoryById]
  );

  async function emailReport() {
    setSendState({ status: 'sending', message: '' });
    const body =
      tab === 'monthly'
        ? { type: 'monthly', year: selYear, month: selMonth }
        : { type: 'annual', year };
    const { data, error: err } = await invokeFunction('send-report', body);
    if (err) {
      setSendState({
        status: 'error',
        message:
          'Could not send. Make sure the send-report Edge Function is deployed and RESEND_API_KEY is set (see supabase/DEPLOY.md).',
      });
      return;
    }
    setSendState({
      status: 'sent',
      message: data?.message || 'Report emailed. Check your inbox.',
    });
  }

  const report = tab === 'monthly' ? monthlyReport : annualReport;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl">Reports</h1>
        <p className="mt-1 text-sm text-text-primary/60">
          The same figures that are emailed automatically at month-end and year-end.
        </p>
      </div>

      <ErrorBanner error={error} />

      {loading ? (
        <LoadingBlock label="Loading reports…" />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1">
              {['monthly', 'annual'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setSendState({ status: 'idle', message: '' });
                  }}
                  className={`btn-pill text-sm capitalize ${
                    tab === t
                      ? 'bg-accent-green text-bg-base'
                      : 'border border-accent-teal/30 text-text-primary/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'monthly' ? (
              <input
                type="month"
                value={monthStr}
                max={`${now.year}-${String(now.month).padStart(2, '0')}`}
                onChange={(e) => setMonthStr(e.target.value)}
                className="rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green"
              />
            ) : (
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={emailReport}
              disabled={sendState.status === 'sending'}
              className="btn-pill border border-accent-teal/30 text-sm text-text-primary/80 hover:text-text-primary disabled:opacity-60"
            >
              {sendState.status === 'sending' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sendState.status === 'sent' ? (
                <Check className="h-4 w-4 text-accent-green" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Email me this report
            </button>
          </div>

          {sendState.message && (
            <p
              className={`flex items-center gap-2 text-sm ${
                sendState.status === 'error' ? 'text-warn-red' : 'text-accent-green'
              }`}
            >
              {sendState.status === 'error' ? (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              ) : (
                <Check className="h-4 w-4 shrink-0" />
              )}
              {sendState.message}
            </p>
          )}

          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-accent-teal" />
              <h2 className="text-sm font-medium text-text-primary/70">
                {tab === 'monthly'
                  ? `Statement — ${report.period.label}`
                  : `Annual summary — ${report.period.label}`}
              </h2>
            </div>

            <SummaryCards totals={report.totals} />

            <p className="mt-3 text-xs text-text-primary/40">
              {report.totals.transactionCount} transaction
              {report.totals.transactionCount === 1 ? '' : 's'}
              {tab === 'annual' && ` across ${report.totals.monthsWithData} month(s) with data`}
            </p>

            {tab === 'monthly' && report.goal && (
              <p className="mt-2 text-sm text-text-primary/70">
                Goal range {formatPKR(report.goal.min)} – {formatPKR(report.goal.max)} ·{' '}
                {report.goalStatus.pct}% of maximum used
              </p>
            )}

            {tab === 'annual' && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="border-b border-accent-teal/20 text-left text-xs uppercase text-text-primary/40">
                    <tr>
                      <th className="px-3 py-2">Month</th>
                      <th className="px-3 py-2 text-right">Income</th>
                      <th className="px-3 py-2 text-right">Expense</th>
                      <th className="px-3 py-2 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byMonth.map((m) => (
                      <tr
                        key={m.month}
                        className="border-b border-accent-teal/10 last:border-0"
                      >
                        <td className="px-3 py-2">{m.label}</td>
                        <td className="px-3 py-2 text-right text-text-primary/70">
                          {formatPKR(m.income)}
                        </td>
                        <td className="px-3 py-2 text-right text-text-primary/70">
                          {formatPKR(m.expense)}
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${
                            m.net >= 0 ? 'text-accent-green' : 'text-text-primary'
                          }`}
                        >
                          {formatPKR(m.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs uppercase text-text-primary/40">
                  Expense by category
                </h3>
                <Bars rows={report.expenseByCategory} />
              </div>
              <div>
                <h3 className="mb-2 text-xs uppercase text-text-primary/40">
                  Income by category
                </h3>
                <Bars rows={report.incomeByCategory} />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
