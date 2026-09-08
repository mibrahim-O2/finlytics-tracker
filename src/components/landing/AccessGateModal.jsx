import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import Modal from '../Modal';

/**
 * Shown when a visitor clicks "Get Started" on the landing page. Communicates
 * that Finlytics is a private single-user app before sending them to /login.
 */
export default function AccessGateModal({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <Modal open={open} onClose={onClose} title="A private, personal app">
      <div className="space-y-4 text-sm text-text-primary/80">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-green" />
          <p>
            Finlytics is a <span className="text-text-primary">single-user</span>{' '}
            application. It holds one person&apos;s financial data — income,
            spending, balances and goals — so public sign-up is intentionally
            disabled.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent-teal" />
          <p>
            The single account is provisioned directly by the owner. If this is
            your instance, continue to the sign-in screen.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="btn-pill border border-accent-teal/30 text-sm text-text-primary/70 hover:text-text-primary"
        >
          Not now
        </button>
        <button
          onClick={() => navigate('/login')}
          className="btn-pill bg-accent-green text-sm text-bg-base"
        >
          Continue to sign in
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Modal>
  );
}
