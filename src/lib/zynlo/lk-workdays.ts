/** Sri Lanka public holidays. Sundays are off separately. */
const LK_PUBLIC_HOLIDAYS = new Set([
  "2025-01-13",
  "2025-01-14",
  "2025-02-04",
  "2025-02-12",
  "2025-02-26",
  "2025-03-13",
  "2025-03-31",
  "2025-04-12",
  "2025-04-13",
  "2025-04-14",
  "2025-04-18",
  "2025-05-01",
  "2025-05-12",
  "2025-05-13",
  "2025-06-07",
  "2025-06-10",
  "2025-07-10",
  "2025-08-08",
  "2025-09-05",
  "2025-09-07",
  "2025-10-06",
  "2025-10-20",
  "2025-11-05",
  "2025-12-04",
  "2025-12-25",
  "2026-01-03",
  "2026-01-15",
  "2026-02-01",
  "2026-02-04",
  "2026-02-15",
  "2026-03-02",
  "2026-03-21",
  "2026-04-01",
  "2026-04-03",
  "2026-04-13",
  "2026-04-14",
  "2026-05-01",
  "2026-05-02",
  "2026-05-28",
  "2026-05-30",
  "2026-05-31",
  "2026-06-29",
  "2026-07-29",
  "2026-08-26",
  "2026-08-27",
  "2026-09-26",
  "2026-10-25",
  "2026-11-08",
  "2026-11-24",
  "2026-12-23",
  "2026-12-25",
]);

function addDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

/** Monday–Saturday, excluding Sri Lanka public holidays. */
export function isLkWorkingDay(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return false;
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (dow === 0) return false;
  return !LK_PUBLIC_HOLIDAYS.has(iso);
}

/** Inclusive count of working days from `from` through `to`. */
export function countLkWorkingDays(from: string, to: string): number {
  if (!from || !to || from > to) return 1;
  let n = 0;
  let cur = from;
  while (cur <= to) {
    if (isLkWorkingDay(cur)) n += 1;
    cur = addDay(cur);
  }
  return Math.max(1, n);
}

function subDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

/** The last `n` working days ending on `today`, oldest first. */
export function lastLkWorkingDays(n: number, today: string): string[] {
  const days: string[] = [];
  let cur = today;
  let guard = 0;
  while (days.length < n && guard < 400) {
    if (isLkWorkingDay(cur)) days.push(cur);
    cur = subDay(cur);
    guard += 1;
  }
  return days.reverse();
}
