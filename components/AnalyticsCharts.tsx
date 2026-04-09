"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type SeriesRow = {
  dayLabel: string;
  date: string;
  workouts: number;
  sleep: number | null;
  steps: number | null;
  protein: number | null;
  calories: number | null;
  weight: number | null;
};

const grid = "stroke-white/10 light:stroke-zinc-200";
const axis = "text-xs fill-zinc-500 light:fill-zinc-600";
const tipStyle = {
  backgroundColor: "rgba(24,24,27,0.95)",
  border: "1px solid rgba(63,63,70,0.5)",
  borderRadius: "8px",
  fontSize: "12px",
};

function ChartShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-surface-muted/40 p-4 light:border-zinc-200 light:bg-zinc-50">
      <h3 className="mb-4 text-sm font-medium text-zinc-200 light:text-zinc-800">
        {title}
      </h3>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

export function AnalyticsCharts({ series }: { series: SeriesRow[] }) {
  return (
    <div className="flex flex-col gap-10">
      <ChartShell title="Sleep (hours)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid className={grid} strokeDasharray="3 3" />
            <XAxis dataKey="dayLabel" tick={{ className: axis }} />
            <YAxis tick={{ className: axis }} width={36} />
            <Tooltip
              contentStyle={tipStyle}
              labelFormatter={(_, p) => (p?.[0]?.payload as SeriesRow)?.date ?? ""}
            />
            <Line
              type="monotone"
              dataKey="sleep"
              stroke="rgb(34 197 94)"
              strokeWidth={2}
              dot={{ r: 3, fill: "rgb(34 197 94)" }}
              connectNulls
              name="Hours"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Steps">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid className={grid} strokeDasharray="3 3" />
            <XAxis dataKey="dayLabel" tick={{ className: axis }} />
            <YAxis tick={{ className: axis }} width={44} />
            <Tooltip
              contentStyle={tipStyle}
              labelFormatter={(_, p) => (p?.[0]?.payload as SeriesRow)?.date ?? ""}
            />
            <Line
              type="monotone"
              dataKey="steps"
              stroke="rgb(34 197 94)"
              strokeWidth={2}
              dot={{ r: 3, fill: "rgb(34 197 94)" }}
              connectNulls
              name="Steps"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Protein (g)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid className={grid} strokeDasharray="3 3" />
            <XAxis dataKey="dayLabel" tick={{ className: axis }} />
            <YAxis tick={{ className: axis }} width={40} />
            <Tooltip
              contentStyle={tipStyle}
              labelFormatter={(_, p) => (p?.[0]?.payload as SeriesRow)?.date ?? ""}
            />
            <Line
              type="monotone"
              dataKey="protein"
              stroke="rgb(34 197 94)"
              strokeWidth={2}
              dot={{ r: 3, fill: "rgb(34 197 94)" }}
              connectNulls
              name="Protein (g)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Calorie intake">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid className={grid} strokeDasharray="3 3" />
            <XAxis dataKey="dayLabel" tick={{ className: axis }} />
            <YAxis tick={{ className: axis }} width={44} />
            <Tooltip
              contentStyle={tipStyle}
              labelFormatter={(_, p) => (p?.[0]?.payload as SeriesRow)?.date ?? ""}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="rgb(34 197 94)"
              strokeWidth={2}
              dot={{ r: 3, fill: "rgb(34 197 94)" }}
              connectNulls
              name="Calories"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell title="Body weight (kg)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid className={grid} strokeDasharray="3 3" />
            <XAxis dataKey="dayLabel" tick={{ className: axis }} />
            <YAxis tick={{ className: axis }} width={40} />
            <Tooltip
              contentStyle={tipStyle}
              labelFormatter={(_, p) => (p?.[0]?.payload as SeriesRow)?.date ?? ""}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="rgb(34 197 94)"
              strokeWidth={2}
              dot={{ r: 3, fill: "rgb(34 197 94)" }}
              connectNulls
              name="Weight (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  );
}
