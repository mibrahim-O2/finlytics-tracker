import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tags, TrendingDown, TrendingUp } from 'lucide-react';
import { useData } from '../lib/DataContext';
import CategoryIcon from '../components/CategoryIcon';
import CategoryFormModal from '../components/CategoryFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingBlock, ErrorBanner, EmptyState } from '../components/StateBlocks';

export default function Categories() {
  const {
    expenseCategories,
    incomeCategories,
    transactions,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useData();

  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState('expense');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const countByCategory = useMemo(() => {
    const m = new Map();
    transactions.forEach((t) => {
      if (t.category_id) m.set(t.category_id, (m.get(t.category_id) ?? 0) + 1);
    });
    return m;
  }, [transactions]);

  function openAdd(type) {
    setEditing(null);
    setFormType(type);
    setFormOpen(true);
  }
  function openEdit(cat) {
    setEditing(cat);
    setFormType(cat.type ?? 'expense');
    setFormOpen(true);
  }

  const Section = ({ title, icon: Icon, type, list }) => (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium text-text-primary/70">
          <Icon className="h-4 w-4 text-accent-teal" />
          {title}
          <span className="text-text-primary/40">({list.length})</span>
        </h2>
        <button
          onClick={() => openAdd(type)}
          className="btn-pill border border-accent-teal/30 text-xs text-text-primary/80 hover:text-text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add {type}
        </button>
      </div>

      {list.length === 0 ? (
        <p className="glass-card px-4 py-6 text-center text-sm text-text-primary/50">
          No {type} categories yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((cat) => {
            const count = countByCategory.get(cat.id) ?? 0;
            return (
              <motion.li
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-teal/15 text-accent-green">
                    <CategoryIcon name={cat.icon} />
                  </span>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-text-primary/50">
                      {count} transaction{count === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    aria-label={`Edit ${cat.name}`}
                    className="rounded-full p-2 text-text-primary/60 hover:text-text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(cat)}
                    aria-label={`Delete ${cat.name}`}
                    className="rounded-full p-2 text-text-primary/60 hover:text-text-primary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl">Categories</h1>
        <p className="mt-1 text-sm text-text-primary/60">
          Income and expense categories are kept separate. Deleting one keeps its
          transactions — they just become “Uncategorized”.
        </p>
      </div>

      <ErrorBanner error={error} />

      {loading ? (
        <LoadingBlock label="Loading categories…" />
      ) : expenseCategories.length === 0 && incomeCategories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories yet">
          Add your first category to start organising transactions.
        </EmptyState>
      ) : (
        <div className="space-y-8">
          <Section
            title="Expense categories"
            icon={TrendingDown}
            type="expense"
            list={expenseCategories}
          />
          <Section
            title="Income categories"
            icon={TrendingUp}
            type="income"
            list={incomeCategories}
          />
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
        defaultType={formType}
        onSubmit={(payload) =>
          editing ? updateCategory(editing.id, payload) : addCategory(payload)
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteCategory(deleting.id)}
        title={`Delete “${deleting?.name}”?`}
        confirmLabel="Delete category"
        message={
          (countByCategory.get(deleting?.id) ?? 0) > 0
            ? `${countByCategory.get(deleting.id)} transaction(s) use this category. They will be kept and shown as “Uncategorized”. This cannot be undone.`
            : 'This category has no transactions. This cannot be undone.'
        }
      />
    </motion.section>
  );
}
