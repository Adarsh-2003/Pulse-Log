export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

export function monthRangeISO(year: number, monthIndex0: number): { start: string; end: string } {
  const start = new Date(year, monthIndex0, 1);
  const end = new Date(year, monthIndex0, daysInMonth(year, monthIndex0));
  return { start: toISODate(start), end: toISODate(end) };
}

export function eachDayInMonth(year: number, monthIndex0: number): string[] {
  const n = daysInMonth(year, monthIndex0);
  const out: string[] = [];
  for (let d = 1; d <= n; d++) {
    out.push(toISODate(new Date(year, monthIndex0, d)));
  }
  return out;
}

export function yearRangeISO(year: number): { start: string; end: string } {
  return {
    start: toISODate(new Date(year, 0, 1)),
    end: toISODate(new Date(year, 11, 31)),
  };
}

export function eachDayInYear(year: number): string[] {
  const out: string[] = [];
  const d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    out.push(toISODate(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}
