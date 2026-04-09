"use client";

import { useCallback, useEffect, useState } from "react";
import { MonthYearPicker } from "./MonthYearPicker";
import { WorkoutHeatmap } from "./WorkoutHeatmap";
import { AnalyticsCharts, type SeriesRow } from "./AnalyticsCharts";

const quotes = [
  "Discipline is remembering what you want.",
  "Control what you can, release what you cannot.",
  "The obstacle is the way.",
  "First rule your mind, then your day.",
  "No excuses, only choices.",
  "Progress is quiet consistency.",
];

function pickQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

type AnalyticsRes = {
  hasData: boolean;
  series: SeriesRow[];
  heatmap: { year: number; days: { date: string; count: number }[] };
  today: string;
};

export function HomeDashboard() {
  const [quote, setQuote] = useState("The obstacle is the way.");
  const [ySel, setYSel] = useState(() => new Date().getFullYear());
  const [mSel, setMSel] = useState(() => new Date().getMonth() + 1);
  const [heatmapData, setHeatmapData] = useState<AnalyticsRes | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsRes | null>(null);
  const [heatmapErr, setHeatmapErr] = useState<string | null>(null);
  const [chartErr, setChartErr] = useState<string | null>(null);
  const [todaySubmitted, setTodaySubmitted] = useState<boolean | null>(null);

  const load = useCallback(async (year: number, month: number) => {
    const r = await fetch(`/api/analytics?year=${year}&month=${month}`, {
      credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to load analytics");
    return (await r.json()) as AnalyticsRes;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const d = new Date();
    const hy = d.getFullYear();
    const hm = d.getMonth() + 1;
    load(hy, hm)
      .then((data) => {
        if (!cancelled) {
          setHeatmapData(data);
          setHeatmapErr(null);
          const todayCount =
            data.heatmap.days.find((d) => d.date === data.today)?.count ?? 0;
          setTodaySubmitted(todayCount > 0);
        }
      })
      .catch(() => {
        if (!cancelled) setHeatmapErr("Could not load heatmap.");
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    setChartErr(null);
    load(ySel, mSel)
      .then((d) => {
        if (!cancelled) setAnalyticsData(d);
      })
      .catch(() => {
        if (!cancelled) setChartErr("Could not load analytics.");
      });
    return () => {
      cancelled = true;
    };
  }, [load, ySel, mSel]);

  const h = heatmapData;

  useEffect(() => {
    setQuote(pickQuote());
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-zinc-100 light:text-zinc-900 md:text-4xl">
          Welcome Adarsh
        </h1>
        <p className="mt-2 text-sm text-zinc-400 light:text-zinc-600">
          {todaySubmitted == null
            ? "Checking today's logs..."
            : todaySubmitted
              ? "Logs submitted!"
              : "Logs have been not added for today"}
        </p>
      </div>
      <p className="mb-8 text-center text-lg font-medium text-zinc-300 light:text-zinc-700 md:text-xl">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="mb-16 rounded-2xl border border-white/10 bg-surface-muted/30 p-6 light:border-zinc-200 light:bg-zinc-100/80">
        {heatmapErr && !h ? (
          <p className="text-sm text-red-400">{heatmapErr}</p>
        ) : h ? (
          <WorkoutHeatmap
            year={h.heatmap.year}
            days={h.heatmap.days}
            todayISO={h.today}
          />
        ) : (
          <p className="text-sm text-zinc-500">Loading heatmap…</p>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-zinc-100 light:text-zinc-900">
          Monthly analysis
        </h2>
        <MonthYearPicker
          year={ySel}
          month={mSel}
          onChange={(y, m) => {
            setYSel(y);
            setMSel(m);
          }}
        />
      </div>

      {chartErr && (
        <p className="mb-4 text-sm text-red-400" role="alert">
          {chartErr}
        </p>
      )}
      {!analyticsData ? (
        <p className="text-sm text-zinc-500">Loading charts…</p>
      ) : !analyticsData.hasData ? (
        <p className="rounded-xl border border-dashed border-white/20 py-16 text-center text-zinc-500 light:border-zinc-300 light:text-zinc-600">
          No records found
        </p>
      ) : (
        <AnalyticsCharts series={analyticsData.series} />
      )}
    </div>
  );
}
