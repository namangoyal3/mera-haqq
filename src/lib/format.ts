/** Formats a rupee amount with Indian digit grouping, e.g. "Rs 1,20,000". */
export function formatRupees(n: number): string {
  return `Rs ${Math.round(n).toLocaleString('en-IN')}`;
}

/**
 * Formats an ISO date (YYYY-MM-DD or full ISO timestamp) for display.
 * Uses UTC so a plain date does not shift by a day in other timezones.
 */
export function formatDate(iso: string, lang: 'en' | 'hi'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
