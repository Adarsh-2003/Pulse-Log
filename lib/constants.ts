export const SESSION_COOKIE = "tracker_session";

/** Earliest month for logging (March onward). Year is evaluated at runtime. */
export function dataStartsMonth(): { month: number; day: number } {
  return { month: 3, day: 1 };
}

export function minLogDate(year: number): Date {
  const { month, day } = dataStartsMonth();
  return new Date(year, month - 1, day);
}

export function isLogDateAllowed(isoDate: string): boolean {
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return false;
  const y = d.getFullYear();
  const min = minLogDate(y);
  return d >= min;
}
