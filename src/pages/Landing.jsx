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
import Reveal from '../components/landing/Reveal';
import SectionHeading from '../components/landing/SectionHeading';

const ShowcasePreview = lazy(() => import('../components/landing/ShowcasePreview'));
const DeveloperSection = lazy(() => import('../components/landing/DeveloperSection'));

const EASE = [0.22, 1, 0.36, 1];

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

const NAV_LINKS = [
  { href: '#preview', label: 'Preview' },
  { href: '#features', label: 'Features' },
  { href: '#developer', label: 'Developer' },
];

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
    <div className="relative min-h-screen overflow-x-clip">
      {/* ambient background — fully contained so nothing adds page width */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 50% at 50% -10%, rgba(73,235,246,0.13), transparent 60%), radial-gradient(45% 35% at 85% 5%, rgba(114,255,133,0.10), transparent 65%)',
          }}
        />
        <motion.div
          className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent-green/10 blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-accent-cyan/10 blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* nav */}
      <header className="sticky top-0 z-20 border-b border-accent-teal/15 bg-bg-base/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold tracking-tight">
            Fin<span className="text-accent-green">lytics</span>
          </span>
          <nav className="hidden items-center gap-6 text-sm text-text-primary/60 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-text-primary">
                {l.label}
              </a>
            ))}
          </nav>
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
        <section className="relative pb-14 pt-20 text-center sm:pt-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full opacity-[0.4]"
            style={{
              maskImage: 'radial-gradient(60% 60% at 50% 30%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(60% 60% at 50% 30%, black, transparent)',
              backgroundImage:
                'linear-gradient(rgba(39,150,143,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(39,150,143,0.10) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-accent-teal/30 bg-white/[0.03] px-3 py-1 text-xs text-text-primary/70"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-accent-green" />
            Personal · single-user · free to run
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl"
          >
            Know exactly where your{' '}
            <span className="bg-gradient-to-r from-accent-green to-accent-cyan bg-clip-text text-transparent">
              money goes
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.13, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-primary/70"
          >
            Finlytics turns a quick daily log into a clear picture — animated
            charts, colour-coded goal tracking, and automatic monthly reports.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.21, ease: EASE }}
            className="mt-9 flex items-center justify-center gap-3"
          >
            {primaryCta}
            <a
              href="#preview"
              className="btn-pill border border-accent-teal/30 text-sm text-text-primary/80 hover:text-text-primary"
            >
              See it in action
            </a>
          </motion.div>
        </section>

        {/* preview */}
        <section id="preview" className="scroll-mt-24 pb-24">
          <Suspense
            fallback={
              <div className="flex justify-center py-20 text-accent-cyan">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            }
          >
            <ShowcasePreview />
          </Suspense>
          <Reveal delay={0.1} className="mt-4 text-center text-xs text-text-primary/40">
            Live components, shown here with sample data.
          </Reveal>
        </section>

        {/* features */}
        <section id="features" className="scroll-mt-24 pb-24">
          <SectionHeading
            eyebrow="What you get"
            title="Everything the tracking needs, nothing it doesn't"
            sub="Six focused pieces that work together — log, see, aim, and get told about it."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 3) * 0.07} className="h-full">
                <div className="group relative h-full overflow-hidden glass-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-teal/40">
                  <span
                    aria-hidden
                    className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-accent-green/0 blur-2xl transition-all duration-300 group-hover:bg-accent-green/10"
                  />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-accent-teal/30 bg-accent-teal/10 text-accent-green">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="relative mt-4 font-medium">{title}</h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-text-primary/60">
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* developer */}
        <section id="developer" className="scroll-mt-24 pb-24">
          <Suspense fallback={<div className="glass-card h-64 animate-pulse" />}>
            <DeveloperSection />
          </Suspense>
        </section>
      </main>

      <footer className="border-t border-accent-teal/15 bg-white/[0.02]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-text-primary/40 sm:flex-row">
          <span>
            Fin<span className="text-accent-green">lytics</span> — a personal expense tracker.
          </span>
          <div className="flex items-center gap-4">
            <a href="#preview" className="hover:text-text-primary/70">Preview</a>
            <a href="#features" className="hover:text-text-primary/70">Features</a>
            <Link to="/login" className="hover:text-text-primary/70">Sign in</Link>
          </div>
        </div>
      </footer>

      <AccessGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </div>
  );
}
