import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/** Scroll-into-view reveal used across the landing page for a consistent feel. */
export default function Reveal({ children, delay = 0, y = 24, className, as = 'div' }) {
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
