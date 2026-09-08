import { useMemo } from 'react';
import { motion } from 'framer-motion';
import GoalRing from '../GoalRing';
import SpendingTrendChart from '../SpendingTrendChart';
import CategoryBreakdownChart from '../CategoryBreakdownChart';
import { formatPKR, formatMonthYear, currentMonthKey } from '../../lib/format';

/**
 * Static UI showcase for the landing page — the real dashboard components fed
 * synthetic data, wrapped in an app-window frame. No Supabase, no live state.
 */
export default function ShowcasePreview() {
  const demo = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const iso = (d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const maxDay = Math.max(1, Math.min(now.getDate(), 24));
    const on = (frac) => iso(Math.max(1, Math.round(frac * maxDay)));

    const categories = [
      { id: 'd1', name: 'Hoteling', icon: 'UtensilsCrossed', type: 'expense' },
      { id: 'd2', name: 'Shopping', icon: 'ShoppingBag', type: 'expense' },
      { id: 'd3', name: 'Travel', icon: 'Plane', type: 'expense' },
      { id: 'd4', name: 'Bills & Utilities', icon: 'ReceiptText', type: 'expense' },
      { id: 'd5', name: 'Friends & Social', icon: 'HeartHandshake', type: 'expense' },
    ];
    const categoryById = new Map(categories.map((c) => [c.id, c]));

    const transactions = [
      { id: 't1', date: on(0.1), type: 'expense', amount: 2600, category_id: 'd4' },
      { id: 't2', date: on(0.2), type: 'expense', amount: 4200, category_id: 'd2' },
      { id: 't3', date: on(0.35), type: 'expense', amount: 1800, category_id: 'd1' },
      { id: 't4', date: on(0.5), type: 'expense', amount: 5200, category_id: 'd3' },
      { id: 't5', date: on(0.6), type: 'expense', amount: 1500, category_id: 'd5' },
      { id: 't6', date: on(0.75), type: 'expense', amount: 2400, category_id: 'd1' },
      { id: 't7', date: on(0.9), type: 'expense', amount: 3100, category_id: 'd2' },
      { id: 't8', date: on(0.45), type: 'income', amount: 60000, category_id: null },
    ];

    const goal = { min_amount: 15000, max_amount: 28000 };
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    return { categories, categoryById, transactions, goal, expense, income, net: income - expense };
  }, []);

  const stats = [
    { label: 'Income', value: demo.income, cls: 'text-accent-green' },
    { label: 'Expense', value: demo.expense, cls: 'text-text-primary' },
    { label: 'Net', value: demo.net, cls: 'text-accent-green' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 48, rotateX: 7 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200 }}
      className="glass-card overflow-hidden p-0 shadow-2xl shadow-accent-cyan/5"
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-accent-teal/15 bg-white/[0.03] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-warn-red/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn-amber/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-green/60" />
        <span className="ml-3 rounded-md bg-white/5 px-3 py-1 text-xs text-text-primary/40">
          finlytics — dashboard
        </span>
        <span className="ml-auto hidden text-xs text-text-primary/30 sm:block">
          {formatMonthYear(currentMonthKey())}
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass-card flex items-center justify-center p-5">
            <GoalRing spent={demo.expense} goal={demo.goal} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {stats.map((s) => (
              <div key={s.label} className="glass-card p-5">
                <p className="text-xs text-text-primary/50">{s.label} this month</p>
                <p className={`mt-2 text-xl font-semibold ${s.cls}`}>{formatPKR(s.value)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card p-5">
            <h3 className="mb-3 text-sm font-medium text-text-primary/70">Spending trend</h3>
            <SpendingTrendChart transactions={demo.transactions} goal={demo.goal} />
          </div>
          <div className="glass-card p-5">
            <h3 className="mb-3 text-sm font-medium text-text-primary/70">Category breakdown</h3>
            <CategoryBreakdownChart
              transactions={demo.transactions}
              categories={demo.categories}
              categoryById={demo.categoryById}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
