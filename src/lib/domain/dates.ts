/**
 * Date helpers operating on local calendar dates as "YYYY-MM-DD" strings.
 * The app is personal and day-oriented, so the client's local date is the
 * source of truth: the UI computes "today" with todayStr() and passes dates
 * to the API, which avoids server-timezone drift.
 */

export const WEEKDAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"] as const;
export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(now: Date = new Date()): string {
  return toDateStr(now);
}

/** Parse "YYYY-MM-DD" to a local Date at midnight. */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isDateStr(s: string): boolean {
  // Round-trips through parse+format so normalized out-of-range values
  // (e.g. "2026-13-40") are rejected, not silently rolled over.
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && toDateStr(parseDate(s)) === s;
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/** Monday as the first day of the week. */
export function startOfWeek(s: string): string {
  const d = parseDate(s);
  const offset = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - offset);
  return toDateStr(d);
}

export function weekDates(s: string): string[] {
  const start = startOfWeek(s);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthField(s: string): { year: number; month: number } {
  const d = parseDate(s);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function daysInMonth(s: string): number {
  const { year, month } = monthField(s);
  return new Date(year, month + 1, 0).getDate();
}

/** All "YYYY-MM-DD" dates in the month containing `s`. */
export function monthDates(s: string): string[] {
  const { year, month } = monthField(s);
  const total = daysInMonth(s);
  return Array.from({ length: total }, (_, i) => toDateStr(new Date(year, month, i + 1)));
}

/** Monday-based blank cells before the 1st, for a calendar grid. */
export function monthLeadingBlanks(s: string): number {
  const { year, month } = monthField(s);
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function isSameMonth(a: string, b: string): boolean {
  const x = monthField(a);
  const y = monthField(b);
  return x.year === y.year && x.month === y.month;
}

/** Human-friendly label relative to `today`. */
export function prettyDate(s: string, today: string): string {
  const diff = Math.round((parseDate(s).getTime() - parseDate(today).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  return parseDate(s).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function monthLabel(s: string): string {
  const { year, month } = monthField(s);
  return `${MONTHS_SHORT[month]} ${year}`;
}
