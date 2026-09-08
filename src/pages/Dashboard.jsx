import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../lib/DataContext';
import { useAuth } from '../lib/AuthContext';
import GoalRing from '../components/GoalRing';
import SpendingTrendChart from '../components/SpendingTrendChart';
import CategoryBreakdownChart from '../components/CategoryBreakdownChart';
import RecentTransactions from '../components/RecentTransactions';
import QuickAddTransaction from '../components/QuickAddTransaction';
import { LoadingBlock, ErrorBanner } from '../components/StateBlocks';
import {
  formatPKR,
  getGreeting,
  currentMonthKey,
  formatMonthYear,
  isInMonth,
} from '../lib/format';

export default function Dashboard() {
  const { user } = useAuth();
  const {
    transactions,
    categories,
    categoryById,
    currentGoal,
    loading,
    error,
  } = useData();

  const monthKey = currentMonthKey();

  const { income, expense, net } = useMemo(() => {
    let i = 0;
    let e = 0;
    transactions.forEach((t) => {
      if (!isInMonth(t.date, monthKey)) return;
      if (t.type === 'income') i += t.amount;
      else e += t.amount;
    });
    return { income: i, expense: e, net: i - e };
  }, [transactions, monthKey.month, monthKey.year]);

  // Only greet by name when the email local-part looks like an actual name.
  const localPart = (user?.email || '').split('@')[0];
  const firstName = /^[a-z]+$/i.test(localPart) ? localPart : '';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-text-primary/60">
            Here&apos;s your spending for {formatMonthYear(monthKey)}.
          </p>
        </div>
        <QuickAddTransaction />
      </div>

      <ErrorBanner error={error} />

      {loading ? (
        <LoadingBlock label="Loading your dashboard…" />
      ) : (
        <>
          {/* top row: goal ring + month stats */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-card flex items-center justify-center p-6">
              <GoalRing spent={expense} goal={currentGoal} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: 'Income this month', value: income, cls: 'text-accent-green' },
                { label: 'Expense this month', value: expense, cls: 'text-text-primary' },
                {
                  label: 'Net this month',
                  value: net,
                  cls: net >= 0 ? 'text-accent-green' : 'text-text-primary',
                },
              ].map((s) => (
                <div key={s.label} className="glass-card p-5">
                  <p className="text-xs text-text-primary/50">{s.label}</p>
                  <p className={`mt-2 text-xl font-semibold ${s.cls}`}>
                    {formatPKR(s.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card p-5">
              <h2 className="mb-3 text-sm font-medium text-text-primary/70">
                Spending trend — {formatMonthYear(monthKey)}
              </h2>
              <SpendingTrendChart transactions={transactions} goal={currentGoal} />
            </div>
            <div className="glass-card p-5">
              <h2 className="mb-3 text-sm font-medium text-text-primary/70">
                Category breakdown — {formatMonthYear(monthKey)}
              </h2>
              <CategoryBreakdownChart
                transactions={transactions}
                categories={categories}
                categoryById={categoryById}
              />
            </div>
          </div>

          {/* recent */}
          <div className="glass-card p-5">
            <RecentTransactions
              transactions={transactions}
              categoryById={categoryById}
            />
          </div>
        </>
      )}
    </motion.section>
  );
}
