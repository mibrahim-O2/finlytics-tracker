import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import IconPicker from './IconPicker';
import { DEFAULT_ICON } from '../lib/constants';

/**
 * Add / edit a category. `category` null = add mode.
 * `onSubmit({ name, icon })` returns { error } | { data }.
 */
export default function CategoryFormModal({ open, onClose, onSubmit, category }) {
  const editing = Boolean(category);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '');
      setIcon(category?.icon ?? DEFAULT_ICON);
      setError('');
      setBusy(false);
    }
  }, [open, category]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required.');
      return;
    }
    setBusy(true);
    const { error: err } = await onSubmit({ name: trimmed, icon });
    setBusy(false);
    if (err) {
      setError(
        err.code === '23505'
          ? 'A category with that name already exists.'
          : err.message || 'Could not save the category.'
      );
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit category' : 'Add category'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cat-name" className="mb-1 block text-sm font-medium text-text-primary/70">
            Name
          </label>
          <input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
            className="w-full rounded-lg border border-accent-teal/30 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent-green"
          />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-text-primary/70">Icon</span>
          <IconPicker value={icon} onChange={setIcon} />
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
            {editing ? 'Save changes' : 'Add category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
