import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertOctagon, Target } from 'lucide-react';
import { formatPKR, goalZone, ZONE_COLOR } from '../lib/format';

const R = 54;
const C = 2 * Math.PI * R;

const ZONE_META = {
  green: { icon: CheckCircle2, label: 'On track' },
  amber: { icon: AlertTriangle, label: 'Approaching limit' },
  red: { icon: AlertOctagon, label: 'Over budget' },
};

/**
 * Monthly-goal progress ring. Colour-coded by zone (green <70%, amber 70–99%,
 * red 100%+ of the goal's max_amount). Pairs colour with an icon + label so it
 * stays readable for colourblind users (DESIGN.md). Pulses when the zone
 * changes. Shows a neutral state when no goal is set.
 */
export default function GoalRing({ spent, goal }) {
  const { zone, pct } = goalZone(spent, goal);
  const color = ZONE_COLOR[zone];
  const frac = Math.min(pct / 100, 1);
  const offset = C * (1 - frac);

  const prevZone = useRef(zone);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const changed = prevZone.current !== zone;
    prevZone.current = zone;
    if (changed && zone !== 'none') {
      setPulse(true);
      const id = setTimeout(() => setPulse(false), 900);
      return () => clearTimeout(id);
    }
  }, [zone]);

  const noGoal = zone === 'none';
  const meta = ZONE_META[zone];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[140px] w-[140px]">
        <motion.svg
          viewBox="0 0 140 140"
          className="h-full w-full -rotate-90"
          animate={pulse ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: 0.9 }}
        >
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke="#27968F"
            strokeOpacity="0.25"
            strokeWidth="10"
          />
          {!noGoal && (
            <motion.circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={false}
              animate={{ strokeDashoffset: offset, stroke: color }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
            />
          )}
        </motion.svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {noGoal ? (
            <>
              <Target className="h-6 w-6 text-accent-teal" />
              <span className="mt-1 text-xs text-text-primary/60">No goal set</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-semibold" style={{ color }}>
                {Math.round(pct)}%
              </span>
              <span className="text-[11px] text-text-primary/50">of goal</span>
            </>
          )}
        </div>
      </div>

      {noGoal ? (
        <p className="mt-3 text-center text-xs text-text-primary/50">
          Set a monthly goal on the Goals page to track spending health.
        </p>
      ) : (
        <>
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ color, backgroundColor: `${color}1A` }}
          >
            <meta.icon className="h-3.5 w-3.5" />
            {meta.label}
          </div>
          <p className="mt-2 text-sm text-text-primary/70">
            {formatPKR(spent)}{' '}
            <span className="text-text-primary/40">
              of {formatPKR(goal.max_amount)}
            </span>
          </p>
          <p className="text-xs text-text-primary/40">
            Goal range {formatPKR(goal.min_amount)} – {formatPKR(goal.max_amount)}
          </p>
        </>
      )}
    </div>
  );
}
