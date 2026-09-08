import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import { useData } from '../lib/DataContext';
import CategoryIcon from '../components/CategoryIcon';
import TransactionFormModal from '../components/TransactionFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingBlock, ErrorBanner, EmptyState } from '../components/StateBlocks';
import { formatPKR, formatDate } from '../lib/format';
import { UNCATEGORIZED } from '../lib/constants';

const EMPTY_FILTERS = { type: 'all', category: 'all', from: '', to: '' };

export default function Transactions() {
  const {
    transactions,
    categories,
    categoryById,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useData();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const filtersActive = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS),
    [filters]
  );

  function toggleSort(key) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'date' ? 'desc' : 'desc' }
    );
  }

  const visible = useMemo(() => {
    let rows = transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category === 'uncategorized' && t.category_id) return false;
      if (
        filters.category !== 'all' &&
        filters.category !== 'uncategorized' &&
        t.category_id !== filters.category
      )
        return false;
      if (filters.from && t.date < filters.from) return false;
      if (filters.to && t.date > filters.to) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      let cmp;
      if (sort.key === 'amount') cmp = a.amount - b.amount;
      else cmp = a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [transactions, filters, sort]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    visible.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, net: income - expense };
  }, [visible]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(tx) {
    setEditing(tx);
    setFormOpen(true);
  }

  const SortIcon = ({ col }) =>
    sort.key === col ? (
      sort.dir === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5" />
      )
    ) : null;

  const selectCls =
    'rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Transactions</h1>
        <button onClick={openAdd} className="btn-pill bg-accent-green text-sm text-bg-base">
          <Plus className="h-4 w-4" />
          Add transaction
        </button>
      </div>

      <ErrorBanner error={error} />

      {/* totals for current view */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Income', value: totals.income, cls: 'text-accent-green' },
          { label: 'Expense', value: totals.expense, cls: 'text-text-primary' },
          {
            label: 'Net',
            value: totals.net,
            cls: totals.net >= 0 ? 'text-accent-green' : 'text-text-primary',
          },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs text-text-primary/50">
              {s.label} {filtersActive ? '(filtered)' : ''}
            </p>
            <p className={`mt-1 text-lg font-semibold ${s.cls}`}>{formatPKR(s.value)}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-text-primary/50">
          Type
          <select
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value)}
            className={selectCls}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-primary/50">
          Category
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className={selectCls}
          >
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="uncategorized">Uncategorized</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-primary/50">
          From
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilter('from', e.target.value)}
            className={selectCls}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-primary/50">
          To
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilter('to', e.target.value)}
            className={selectCls}
          />
        </label>

        {filtersActive && (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <LoadingBlock label="Loading transactions…" />
      ) : transactions.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No transactions yet">
          Add your first transaction to see it here.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No transactions match these filters" />
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-accent-teal/20 text-left text-xs uppercase text-text-primary/40">
              <tr>
                <th className="px-4 py-3">
                  <button
                    onClick={() => toggleSort('date')}
                    className="inline-flex items-center gap-1 hover:text-text-primary"
                  >
                    Date <SortIcon col="date" />
                  </button>
                </th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleSort('amount')}
                    className="inline-flex items-center gap-1 hover:text-text-primary"
                  >
                    Amount <SortIcon col="amount" />
                  </button>
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => {
                const cat = t.category_id ? categoryById.get(t.category_id) : UNCATEGORIZED;
                return (
                  <motion.tr
                    key={t.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-accent-teal/10 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(t.date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <CategoryIcon name={cat?.icon} className="h-4 w-4 text-accent-green" />
                        {cat?.name ?? 'Uncategorized'}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-text-primary/70">
                      {t.note || '—'}
                    </td>
                    <td className="px-4 py-3 capitalize text-text-primary/70">{t.type}</td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                        t.type === 'income' ? 'text-accent-green' : 'text-text-primary'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '−'} {formatPKR(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          aria-label="Edit transaction"
                          className="rounded-full p-2 text-text-primary/60 hover:text-text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(t)}
                          aria-label="Delete transaction"
                          className="rounded-full p-2 text-text-primary/60 hover:text-text-primary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TransactionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        transaction={editing}
        onSubmit={(payload) =>
          editing ? updateTransaction(editing.id, payload) : addTransaction(payload)
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteTransaction(deleting.id)}
        title="Delete this transaction?"
        confirmLabel="Delete transaction"
        message={
          deleting
            ? `${deleting.type === 'income' ? '+' : '−'} ${formatPKR(deleting.amount)} on ${formatDate(
                deleting.date
              )}. This cannot be undone.`
            : ''
        }
      />
    </motion.section>
  );
}
