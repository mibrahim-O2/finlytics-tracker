import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

/**
 * Confirmation modal. `onConfirm` may be async; the button shows a spinner
 * until it resolves, then the dialog closes.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn-amber" />
        <p className="text-sm text-text-primary/80">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={busy}
          className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary disabled:opacity-50"
        >
          Cancel
        </button>
        {/* Destructive action uses a neutral filled style - warn colours are
            reserved for goal-progress indicators only (DESIGN.md). */}
        <button
          onClick={handleConfirm}
          disabled={busy}
          className="btn-pill bg-accent-green text-sm text-bg-base disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
