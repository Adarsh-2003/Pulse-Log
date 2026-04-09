"use client";

import { useMemo } from "react";

type DayCell = { date: string; count: number };

type Props = {
  year: number;
  days: DayCell[];
  todayISO: string;
};

function intensityClass(count: number, isToday: boolean): string {
  if (count === 0) {
    return isToday
      ? "border border-accent/50 bg-white/5 light:border-accent/40 light:bg-zinc-200"
      : "bg-white/5 light:bg-zinc-200";
  }
  if (count === 1) return "bg-accent/30";
  if (count <= 3) return "bg-accent/55";
  if (count <= 6) return "bg-accent/80";
  return "bg-accent";
}

export function WorkoutHeatmap({ year, days, todayISO }: Props) {
  const byDate = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of days) m[d.date] = d.count;
    return m;
  }, [days]);

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const firstSunday = new Date(start);
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

  const weeks: { date: string; count: number; inYear: boolean }[][] = [];
  const cursor = new Date(firstSunday);
  while (cursor <= end || cursor.getDay() !== 0) {
    const week: { date: string; count: number; inYear: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
        cursor.getDate()
      ).padStart(2, "0")}`;
      const inYear = cursor.getFullYear() === year;
      week.push({ date: iso, count: inYear ? byDate[iso] ?? 0 : 0, inYear });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(year, i, 1).toLocaleString("en", { month: "short" })
  );

  return (
    <div className="w-full overflow-x-auto">
      <p className="mb-3 text-xs text-zinc-500 light:text-zinc-600">
        Workout consistency — {year} (full year)
      </p>
      <div className="inline-flex min-w-full flex-col gap-2">
        <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 light:text-zinc-600">
          {monthLabels.map((label) => (
            <div key={label} className="text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="flex min-w-max gap-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-rows-7 gap-1">
              {week.map((c) => (
                <div
                  key={c.date}
                  title={`${c.date}: ${c.inYear ? c.count : 0} workout log(s)`}
                  className={`h-3 w-3 rounded-sm transition-colors ${
                    c.inYear
                      ? intensityClass(c.count, c.date === todayISO)
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 light:text-zinc-600">
          <span>Less</span>
          {[0, 1, 3, 6, 7].map((n) => (
            <span
              key={n}
              className={`h-3 w-3 rounded-sm ${intensityClass(n, false)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
