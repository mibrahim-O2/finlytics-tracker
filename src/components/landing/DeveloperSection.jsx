import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Facebook, Mail } from 'lucide-react';

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/mibrahim-O2', Icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/muhammad-ibrahim-o2/', Icon: Linkedin },
  { label: 'X (Twitter)', href: 'https://x.com/MIbraheem_02', Icon: Twitter },
  { label: 'Facebook', href: 'https://web.facebook.com/mibrahim.O2', Icon: Facebook },
  { label: 'Email', href: 'mailto:mibrahimkhalid306@gmail.com', Icon: Mail },
];

const GH_USER = 'mibrahim-O2';
const STATS_CARD = `https://github-readme-stats.vercel.app/api?username=${GH_USER}&show_icons=true&hide_border=true&bg_color=00000000&title_color=72FF85&text_color=FFFFFF&icon_color=49EBF6&hide=contribs`;
const CONTRIB_CHART = `https://ghchart.rshah.org/72FF85/${GH_USER}`;

export default function DeveloperSection() {
  const [statsOk, setStatsOk] = useState(true);
  const [chartOk, setChartOk] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 sm:p-8"
    >
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
        <img
          src={`https://github.com/${GH_USER}.png`}
          alt="Muhammad Ibrahim"
          width={96}
          height={96}
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-full border border-accent-teal/30 object-cover"
        />
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-accent-teal">Developer</p>
          <h3 className="mt-1 text-xl font-semibold">Muhammad Ibrahim</h3>
          <p className="mt-2 max-w-xl text-sm text-text-primary/70">
            Computer Science student and web developer. Built Finlytics to solve a
            real personal problem — knowing where the money actually goes — and to
            keep it clean, fast, and free to run.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
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
          </div>
        </div>
      </div>

      {(statsOk || chartOk) && (
        <div className="mt-6 grid gap-4 border-t border-accent-teal/15 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          {statsOk && (
            <img
              src={STATS_CARD}
              alt={`${GH_USER} GitHub stats`}
              loading="lazy"
              onError={() => setStatsOk(false)}
              className="w-full max-w-md rounded-lg"
            />
          )}
          {chartOk && (
            <img
              src={CONTRIB_CHART}
              alt={`${GH_USER} GitHub contributions`}
              loading="lazy"
              onError={() => setChartOk(false)}
              className="w-full rounded-lg bg-white/5 p-2"
            />
          )}
        </div>
      )}
    </motion.div>
  );
}
