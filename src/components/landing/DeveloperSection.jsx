import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Facebook, Mail, ArrowUpRight } from 'lucide-react';

const GH_USER = 'mibrahim-O2';
const GH_URL = `https://github.com/${GH_USER}`;

const SOCIALS = [
  { label: 'GitHub', href: GH_URL, Icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/muhammad-ibrahim-o2/', Icon: Linkedin },
  { label: 'X (Twitter)', href: 'https://x.com/MIbraheem_02', Icon: Twitter },
  { label: 'Facebook', href: 'https://web.facebook.com/mibrahim.O2', Icon: Facebook },
  { label: 'Email', href: 'mailto:mibrahimkhalid306@gmail.com', Icon: Mail },
];

// Dark-themed remote widgets — solid #011613 background so they match the
// page exactly regardless of how each service renders its plot area.
const ACTIVITY_GRAPH =
  `https://github-readme-activity-graph.vercel.app/graph?username=${GH_USER}` +
  '&bg_color=011613&hide_border=true&hide_title=true&color=72FF85&line=49EBF6&point=72FF85&area=true&area_color=27968F';
const STATS_CARD =
  `https://github-readme-stats.vercel.app/api?username=${GH_USER}` +
  '&show_icons=true&hide_border=true&hide_rank=false&bg_color=011613&title_color=72FF85&text_color=FFFFFF&icon_color=49EBF6&ring_color=72FF85&hide=contribs';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function DeveloperSection() {
  const [graphOk, setGraphOk] = useState(true);
  const [statsOk, setStatsOk] = useState(true);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className="relative overflow-hidden"
    >
      {/* oversized ghost word behind the block */}
      <motion.span
        variants={item}
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-2 select-none text-[22vw] font-semibold leading-none text-white/[0.025] sm:text-[9rem]"
      >
        code
      </motion.span>

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,auto)_1fr] lg:items-center">
        {/* identity — avatar with animated rings */}
        <motion.div variants={item} className="flex justify-center lg:justify-start">
          <div className="relative h-44 w-44 sm:h-52 sm:w-52">
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: i === 0 ? '#27968F55' : '#49EBF633' }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: i * 1.4 }}
              />
            ))}
            <span
              aria-hidden
              className="absolute inset-4 rounded-full blur-2xl"
              style={{ background: 'radial-gradient(circle, rgba(114,255,133,0.25), transparent 70%)' }}
            />
            <img
              src={`https://github.com/${GH_USER}.png`}
              alt="Muhammad Ibrahim"
              width={208}
              height={208}
              loading="lazy"
              className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-full border border-accent-teal/40 object-cover"
            />
          </div>
        </motion.div>

        {/* text column */}
        <div>
          <motion.p
            variants={item}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-teal"
          >
            The developer
          </motion.p>

          <motion.h3
            variants={item}
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Muhammad{' '}
            <span className="bg-gradient-to-r from-accent-green to-accent-cyan bg-clip-text text-transparent">
              Ibrahim
            </span>
          </motion.h3>

          <motion.div variants={item} className="mt-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-teal/30 bg-white/[0.03] px-3 py-1 text-sm text-text-primary/80">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
              AI Engineer &amp; Full-Stack Developer
            </span>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl border-l-2 border-accent-green/50 pl-4 text-lg leading-relaxed text-text-primary/85"
          >
            “Every great idea begins with code. I&apos;m an AI engineer and
            software developer building intelligent, real-world solutions.”
          </motion.p>

          <motion.a
            variants={item}
            href={GH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-green"
          >
            Explore more of my work on GitHub
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.a>

          <motion.div variants={item} className="mt-6 flex flex-wrap gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-teal/30 text-text-primary/70 transition-colors hover:border-accent-green hover:text-accent-green"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* GitHub widgets */}
      {(graphOk || statsOk) && (
        <motion.div
          variants={item}
          className="mt-10 grid gap-4 lg:grid-cols-[1.5fr_1fr]"
        >
          {graphOk && (
            <figure className="glass-card overflow-hidden p-4">
              <figcaption className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-text-primary/40">
                Contribution activity
              </figcaption>
              <img
                src={ACTIVITY_GRAPH}
                alt={`${GH_USER} GitHub contribution activity`}
                loading="lazy"
                onError={() => setGraphOk(false)}
                className="w-full"
              />
            </figure>
          )}
          {statsOk && (
            <figure className="glass-card flex items-center justify-center overflow-hidden p-4">
              <img
                src={STATS_CARD}
                alt={`${GH_USER} GitHub stats`}
                loading="lazy"
                onError={() => setStatsOk(false)}
                className="w-full max-w-sm"
              />
            </figure>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
