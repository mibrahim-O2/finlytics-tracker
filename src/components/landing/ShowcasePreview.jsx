import { useMemo } from 'react';
import { motion } from 'framer-motion';
import GoalRing from '../GoalRing';
import SpendingTrendChart from '../SpendingTrendChart';
import CategoryBreakdownChart from '../CategoryBreakdownChart';
import { formatPKR } from '../../lib/format';

/**
 * Static UI showcase for the landing page — the real dashboard components fed
 * synthetic data. No Supabase, no live state.
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
    const spent = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    return { categories, categoryById, transactions, goal, spent };
  }, []);

  const card = 'glass-card p-5';
  const reveal = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5 },
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <motion.div {...reveal} className={`${card} flex items-center justify-center`}>
        <GoalRing spent={demo.spent} goal={demo.goal} />
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.5, delay: 0.08 }} className={`${card} lg:col-span-2`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary/70">Spending trend</h3>
          <span className="text-xs text-text-primary/40">this month · {formatPKR(demo.spent)}</span>
        </div>
        <SpendingTrendChart transactions={demo.transactions} goal={demo.goal} />
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.5, delay: 0.16 }} className={`${card} lg:col-span-3`}>
        <h3 className="mb-3 text-sm font-medium text-text-primary/70">Category breakdown</h3>
        <CategoryBreakdownChart
          transactions={demo.transactions}
          categories={demo.categories}
          categoryById={demo.categoryById}
        />
      </motion.div>
    </div>
  );
}
