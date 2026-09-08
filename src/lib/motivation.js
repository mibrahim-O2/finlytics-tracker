/**
 * Friendly, motivating one-liners for the daily logging nudge (SPEC §6).
 * Neutral and encouraging — never guilt-based.
 */
const MESSAGES = [
  'A minute today keeps the month on track.',
  'Small entries add up to a clear picture.',
  'Log what you spent — future you will thank you.',
  'Every transaction you record is one less surprise later.',
  'Quick check-in: what did today cost?',
  'Staying on top of it is the whole game. Nice work.',
  'Consistency beats perfection. Log today and move on.',
  'A tidy log makes month-end easy.',
  'Know where it goes, and you decide where it goes.',
  'Two taps now saves a puzzle later.',
];

/** Deterministic message for a given date, so it doesn't flicker on re-render. */
export function getDailyMessage(date = new Date()) {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return MESSAGES[dayNumber % MESSAGES.length];
}
