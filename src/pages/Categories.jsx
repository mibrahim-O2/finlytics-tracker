import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { useData } from '../lib/DataContext';
import CategoryIcon from '../components/CategoryIcon';
import CategoryFormModal from '../components/CategoryFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { LoadingBlock, ErrorBanner, EmptyState } from '../components/StateBlocks';

export default function Categories() {
  const {
    categories,
    transactions,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const countByCategory = useMemo(() => {
    const m = new Map();
    transactions.forEach((t) => {
      if (t.category_id) m.set(t.category_id, (m.get(t.category_id) ?? 0) + 1);
    });
    return m;
  }, [transactions]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(cat) {
    setEditing(cat);
    setFormOpen(true);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Categories</h1>
          <p className="mt-1 text-sm text-text-primary/60">
            Add, rename, or remove categories. Deleting one keeps its
            transactions — they just become “Uncategorized”.
          </p>
        </div>
        <button onClick={openAdd} className="btn-pill bg-accent-green text-sm text-bg-base">
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </div>

      <ErrorBanner error={error} />

      {loading ? (
        <LoadingBlock label="Loading categories…" />
      ) : categories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories yet">
          Add your first category to start organising transactions.
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
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
                    {countByCategory.get(cat.id) ?? 0} transaction
                    {(countByCategory.get(cat.id) ?? 0) === 1 ? '' : 's'}
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
          ))}
        </ul>
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
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
