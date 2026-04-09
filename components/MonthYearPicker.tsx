"use client";

type Props = {
  year: number;
  month: number;
  onChange: (y: number, m: number) => void;
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthYearPicker({ year, month, onChange }: Props) {
  const years = [];
  const yNow = new Date().getFullYear();
  for (let y = yNow; y >= yNow - 5; y--) years.push(y);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-zinc-400 light:text-zinc-600">Period</label>
      <select
        value={month}
        onChange={(e) => onChange(year, Number(e.target.value))}
        className="rounded-lg border border-white/15 bg-surface-muted px-3 py-2 text-sm text-zinc-100 light:border-zinc-300 light:bg-white light:text-zinc-900"
      >
        {months.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => onChange(Number(e.target.value), month)}
        className="rounded-lg border border-white/15 bg-surface-muted px-3 py-2 text-sm text-zinc-100 light:border-zinc-300 light:bg-white light:text-zinc-900"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
