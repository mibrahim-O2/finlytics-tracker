import { motion } from 'framer-motion';

/**
 * Temporary Phase 1 scaffold for screens that get built in later phases.
 * Keeps the folder structure and routing in place per ARCHITECTURE.md.
 */
export default function PagePlaceholder({ title, phase }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-6"
    >
      <h1 className="text-xl">{title}</h1>
      <p className="mt-2 text-sm text-text-primary/60">
        This screen is built in {phase}.
      </p>
    </motion.section>
  );
}
