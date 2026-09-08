import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatPKR, formatDate } from '../lib/format';
import { UNCATEGORIZED } from '../lib/constants';

/** Last few transactions, newest first. */
export default function RecentTransactions({ transactions, categoryById, limit = 5 }) {
  const rows = transactions.slice(0, limit);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-primary/70">Recent transactions</h2>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs text-accent-green hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-primary/40">
          No transactions yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {rows.map((t) => {
            const cat = t.category_id ? categoryById.get(t.category_id) : UNCATEGORIZED;
            return (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-teal/15 text-accent-green">
                    <CategoryIcon name={cat?.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm">
                      {cat?.name ?? 'Uncategorized'}
                    </span>
                    <span className="block truncate text-xs text-text-primary/40">
                      {formatDate(t.date)}
                      {t.note ? ` · ${t.note}` : ''}
                    </span>
                  </span>
                </span>
                <span
                  className={`shrink-0 text-sm font-medium ${
                    t.type === 'income' ? 'text-accent-green' : 'text-text-primary'
                  }`}
                >
                  {t.type === 'income' ? '+' : '−'} {formatPKR(t.amount)}
                </span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
