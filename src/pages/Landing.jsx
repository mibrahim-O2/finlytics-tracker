import { Suspense, lazy, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ListChecks,
  LineChart,
  Target,
  FileBarChart,
  BellRing,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import AccessGateModal from '../components/landing/AccessGateModal';

const ShowcasePreview = lazy(() => import('../components/landing/ShowcasePreview'));
const DeveloperSection = lazy(() => import('../components/landing/DeveloperSection'));

const FEATURES = [
  {
    Icon: ListChecks,
    title: 'Daily transaction log',
    body: 'Add income and expenses in seconds. Filter and sort a clean daily table — no spreadsheets.',
  },
  {
    Icon: LineChart,
    title: 'Visual dashboard',
    body: 'Spending trend and category breakdown update the moment you log something. No refresh.',
  },
  {
    Icon: Target,
    title: 'Goal zones',
    body: 'Set a monthly min–max range. A colour-coded ring shifts green → amber → red as you spend.',
  },
  {
    Icon: FileBarChart,
    title: 'Monthly & annual reports',
    body: 'Accurate statements with category breakdowns, delivered to your inbox automatically.',
  },
  {
    Icon: BellRing,
    title: 'Gentle reminders',
    body: 'A friendly morning nudge to log the day — snooze it to a time that suits you.',
  },
  {
    Icon: ShieldCheck,
    title: 'Yours alone',
    body: 'Single-user by design, row-level security on every table, and a 100% free-tier stack.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

export default function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);

  const primaryCta = session ? (
    <button
      onClick={() => navigate('/app')}
      className="btn-pill bg-accent-green text-sm text-bg-base"
    >
      Open dashboard
      <ArrowRight className="h-4 w-4" />
    </button>
  ) : (
    <button
      onClick={() => setGateOpen(true)}
      className="btn-pill bg-accent-green text-sm text-bg-base"
    >
      Get started
      <ArrowRight className="h-4 w-4" />
    </button>
  );

  return (
    <div className="min-h-screen">
      {/* glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[520px] opacity-70"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(73,235,246,0.14), transparent 70%), radial-gradient(40% 40% at 80% 10%, rgba(114,255,133,0.12), transparent 70%)',
        }}
      />

      {/* nav */}
      <header className="sticky top-0 z-20 border-b border-accent-teal/15 bg-bg-base/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold tracking-tight">
            Fin<span className="text-accent-green">lytics</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="btn-pill border border-accent-teal/30 text-sm text-text-primary/80 hover:text-text-primary"
            >
              Sign in
            </Link>
            {primaryCta}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        {/* hero */}
        <section className="py-20 text-center sm:py-28">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-accent-teal/30 px-3 py-1 text-xs text-text-primary/70"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-accent-green" />
            Personal · single-user · free to run
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mx-auto max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl"
          >
            Know exactly where your money goes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base text-text-primary/70"
          >
            Finlytics turns a quick daily log into a clear picture — animated
            charts, colour-coded goal tracking, and automatic monthly reports.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.19 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            {primaryCta}
            <a
              href="#preview"
              className="btn-pill border border-accent-teal/30 text-sm text-text-primary/80 hover:text-text-primary"
            >
              See it
            </a>
          </motion.div>
        </section>

        {/* features */}
        <section className="pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, body }, i) => (
              <motion.div
                key={title}
                {...fadeUp}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
                className="glass-card p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-teal/15 text-accent-green">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 font-medium">{title}</h3>
                <p className="mt-1 text-sm text-text-primary/60">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* preview */}
        <section id="preview" className="scroll-mt-20 pb-16">
          <motion.h2 {...fadeUp} className="mb-2 text-2xl font-semibold">
            A dashboard that reacts instantly
          </motion.h2>
          <motion.p {...fadeUp} className="mb-6 max-w-xl text-sm text-text-primary/60">
            The real components, shown here with sample data.
          </motion.p>
          <Suspense
            fallback={
              <div className="flex justify-center py-16 text-accent-cyan">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            }
          >
            <ShowcasePreview />
          </Suspense>
        </section>

        {/* developer */}
        <section className="pb-16">
          <motion.h2 {...fadeUp} className="mb-6 text-2xl font-semibold">
            Built by
          </motion.h2>
          <Suspense fallback={<div className="glass-card h-40 animate-pulse" />}>
            <DeveloperSection />
          </Suspense>
        </section>
      </main>

      <footer className="border-t border-accent-teal/15">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-text-primary/40 sm:flex-row">
          <span>
            Fin<span className="text-accent-green">lytics</span> — personal expense tracker
          </span>
          <Link to="/login" className="hover:text-text-primary/70">
            Sign in
          </Link>
        </div>
      </footer>

      <AccessGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  );
}
