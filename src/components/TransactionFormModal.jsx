import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { useData } from '../lib/DataContext';
import { todayISO } from '../lib/format';

const EMPTY = { type: 'expense', amount: '', category_id: '', date: todayISO(), note: '' };

/**
 * Add / edit a transaction. `transaction` null = add mode.
 * `onSubmit(payload)` returns { error } | { data }.
 */
export default function TransactionFormModal({ open, onClose, onSubmit, transaction }) {
  const { categories } = useData();
  const editing = Boolean(transaction);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setBusy(false);
    setForm(
      transaction
        ? {
            type: transaction.type,
            amount: String(transaction.amount),
            category_id: transaction.category_id ?? '',
            date: transaction.date,
            note: transaction.note ?? '',
          }
        : { ...EMPTY, date: todayISO() }
    );
  }, [open, transaction]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    if (!form.date) {
      setError('Pick a date.');
      return;
    }
    setBusy(true);
    const { error: err } = await onSubmit({
      type: form.type,
      amount,
      category_id: form.category_id || null,
      date: form.date,
      note: form.note.trim() || null,
    });
    setBusy(false);
    if (err) {
      setError(err.message || 'Could not save the transaction.');
      return;
    }
    onClose();
  }

  const field =
    'w-full rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green';

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit transaction' : 'Add transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* type toggle */}
        <div className="grid grid-cols-2 gap-2">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('type', t)}
              className={`btn-pill text-sm capitalize ${
                form.type === t
                  ? 'bg-accent-green text-bg-base'
                  : 'border border-accent-teal/30 text-text-primary/70'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="tx-amount" className="mb-1 block text-sm font-medium text-text-primary/70">
            Amount (Rs.)
          </label>
          <input
            id="tx-amount"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            autoFocus
            className={field}
          />
        </div>

        <div>
          <label htmlFor="tx-category" className="mb-1 block text-sm font-medium text-text-primary/70">
            Category
          </label>
          <select
            id="tx-category"
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
            className={field}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-date" className="mb-1 block text-sm font-medium text-text-primary/70">
            Date
          </label>
          <input
            id="tx-date"
            type="date"
            value={form.date}
            max={todayISO()}
            onChange={(e) => set('date', e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="tx-note" className="mb-1 block text-sm font-medium text-text-primary/70">
            Note <span className="text-text-primary/40">(optional)</span>
          </label>
          <input
            id="tx-note"
            value={form.note}
            maxLength={280}
            onChange={(e) => set('note', e.target.value)}
            className={field}
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm text-warn-red">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn-pill bg-accent-green text-sm text-bg-base disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
