/**
 * Format a number as Pakistani Rupees: "Rs. 12,500"
 * No decimals, comma thousands separator (per project spec).
 */
export function formatPKR(amount) {
  const n = Number(amount) || 0;
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}

/** Today's date as an ISO "YYYY-MM-DD" string in local time. */
export function todayISO() {
  return toISODate(new Date());
}

/** A Date -> "YYYY-MM-DD" in local time (not UTC, so no off-by-one). */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2026-09-08" -> "8 Sep 2026" */
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/** { month, year } for the current calendar month (month is 1–12). */
export function currentMonthKey(now = new Date()) {
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/** "September 2026" */
export function formatMonthYear({ month, year }) {
  return `${MONTHS[month - 1]} ${year}`;
}

/** True if an ISO date string falls in the given { month, year }. */
export function isInMonth(iso, { month, year }) {
  if (!iso) return false;
  const [y, m] = iso.split('-').map(Number);
  return y === year && m === month;
}

/** Number of days in a given { month, year }. */
export function daysInMonth({ month, year }) {
  return new Date(year, month, 0).getDate();
}

/** Time-of-day greeting for the dashboard header. */
export function getGreeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Goal-progress zone from spend vs. the goal's max_amount.
 * Green 0–69%, Amber 70–99%, Red 100%+ (SPEC §5). Returns zone 'none' when no
 * goal is set so the dashboard can show a neutral state.
 */
export function goalZone(spent, goal) {
  const max = Number(goal?.max_amount) || 0;
  if (!goal || max <= 0) return { zone: 'none', pct: 0 };
  const pct = (Number(spent) / max) * 100;
  let zone = 'green';
  if (pct >= 100) zone = 'red';
  else if (pct >= 70) zone = 'amber';
  return { zone, pct };
}

export const ZONE_COLOR = {
  green: '#72FF85', // accent-green
  amber: '#FFC24B', // warn-amber
  red: '#FF6B5E', // warn-red
  none: '#27968F', // accent-teal (neutral)
};
