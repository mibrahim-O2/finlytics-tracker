import { motion } from 'framer-motion';
import ConnectionStatus from '../components/ConnectionStatus';

export default function Dashboard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl">Welcome to Finlytics</h1>
        <p className="mt-1 text-sm text-text-primary/60">
          Project scaffold is live. Dashboard visuals are built in Phase 5.
        </p>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-3 text-sm font-medium text-text-primary/70">
          Phase 1 — system check
        </h2>
        <ConnectionStatus />
      </div>
    </motion.section>
  );
}
