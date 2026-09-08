/**
 * Design tokens from DESIGN.md, mirrored here for use in JS contexts
 * (Recharts props, Framer Motion, inline SVG) where Tailwind classes
 * cannot reach. Keep in sync with tailwind.config.js.
 */
export const colors = {
  bgBase: '#011613',
  accentTeal: '#27968F',
  accentGreen: '#72FF85',
  accentCyan: '#49EBF6',
  textPrimary: '#FFFFFF',
  // Warning states - goal-progress indicators ONLY
  warnAmber: '#FFC24B',
  warnRed: '#FF6B5E',
};

/**
 * Categorical palette for charts. Deliberately kept within the teal/green/cyan
 * family so warning colours (amber/red) stay reserved for goal progress only
 * (DESIGN.md). Used for category-breakdown segments.
 */
export const CHART_PALETTE = [
  '#72FF85',
  '#49EBF6',
  '#2FB3A6',
  '#9CE7FF',
  '#4ADE80',
  '#22D3EE',
  '#5FD0A8',
  '#7CC4FF',
  '#34D399',
  '#38BDF8',
];

/** Colour for the "Uncategorized" bucket - muted, outside the palette. */
export const UNCATEGORIZED_COLOR = '#64748B';
