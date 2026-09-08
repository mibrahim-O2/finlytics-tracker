/**
 * Format a number as Pakistani Rupees: "Rs. 12,500"
 * No decimals, comma thousands separator (per project spec).
 */
export function formatPKR(amount) {
  const n = Number(amount) || 0;
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}
