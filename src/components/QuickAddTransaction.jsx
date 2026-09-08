import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useData } from '../lib/DataContext';
import TransactionFormModal from './TransactionFormModal';

/** Self-contained quick-add button + modal for the dashboard. */
export default function QuickAddTransaction({ className = '', label = 'Quick add' }) {
  const { addTransaction } = useData();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`btn-pill bg-accent-green text-sm text-bg-base ${className}`}
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>
      <TransactionFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => addTransaction(payload)}
      />
    </>
  );
}
