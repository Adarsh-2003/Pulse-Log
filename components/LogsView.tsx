"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { minLogDate, isLogDateAllowed } from "@/lib/constants";
import { toISODate } from "@/lib/dates";

function clampDateForPicker(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const y = d.getFullYear();
  const min = minLogDate(y);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (d < min) return toISODate(min);
  if (d > today) return toISODate(new Date());
  return iso;
}

export function LogsView() {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [logDate, setLogDate] = useState(todayISO);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [trainingSummary, setTrainingSummary] = useState("");

  const [sleep, setSleep] = useState("");
  const [steps, setSteps] = useState("");
  const [protein, setProtein] = useState("");
  const [calories, setCalories] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");
  const [dailyLoading, setDailyLoading] = useState(false);
  const dailyReqId = useRef(0);

  const minForYear = useMemo(() => {
    const y = new Date(logDate + "T12:00:00").getFullYear();
    return toISODate(minLogDate(y));
  }, [logDate]);

  const maxDate = todayISO;

  const loadDaily = useCallback(async (date: string) => {
    const reqId = ++dailyReqId.current;
    setDailyLoading(true);
    try {
      const r = await fetch(`/api/daily?date=${encodeURIComponent(date)}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!r.ok) return;
      const j = await r.json();
      if (reqId !== dailyReqId.current) return;
      const d = j.daily;
      if (!d) {
        setTrainingSummary("");
        setSleep("");
        setSteps("");
        setProtein("");
        setCalories("");
        setBodyWeight("");
        return;
      }
      setTrainingSummary(d.training_summary != null ? String(d.training_summary) : "");
      setSleep(d.sleep_hours != null ? String(d.sleep_hours) : "");
      setSteps(d.steps != null ? String(d.steps) : "");
      setProtein(d.protein_g != null ? String(d.protein_g) : "");
      setCalories(d.calories != null ? String(d.calories) : "");
      setBodyWeight(d.body_weight_kg != null ? String(d.body_weight_kg) : "");
    } finally {
      if (reqId === dailyReqId.current) {
        setDailyLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadDaily(logDate);
  }, [loadDaily, logDate]);

  function flash(ok: string) {
    setErr(null);
    setMsg(ok);
    setTimeout(() => setMsg(null), 3200);
  }

  async function submitTrainingSummary(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await fetch("/api/daily", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        log_date: logDate,
        training_summary: trainingSummary,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setErr(j.error ?? "Could not save training summary");
      return;
    }
    flash("Training summary saved.");
    await loadDaily(logDate);
  }

  async function submitDaily(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (dailyLoading) return;
    if (!isLogDateAllowed(logDate)) {
      setErr("Data starts March 1 onward for that year.");
      return;
    }
    const r = await fetch("/api/daily", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        log_date: logDate,
        training_summary: trainingSummary,
        sleep_hours: sleep === "" ? null : Number(sleep),
        steps: steps === "" ? null : Number(steps),
        protein_g: protein === "" ? null : Number(protein),
        calories: calories === "" ? null : Number(calories),
        body_weight_kg: bodyWeight === "" ? null : Number(bodyWeight),
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setErr(j.error ?? "Could not save daily metrics");
      return;
    }
    flash("Daily metrics saved.");
    await loadDaily(logDate);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-100 light:text-zinc-900">Logs</h1>
      <p className="mt-1 text-sm text-zinc-500 light:text-zinc-600">
        Pick a date, then add workouts and daily metrics. Charts update from March 1 onward.
      </p>

      <div className="mt-8 rounded-xl border border-white/10 bg-surface-muted/30 p-4 light:border-zinc-200 light:bg-zinc-50">
        <label className="text-xs text-zinc-400 light:text-zinc-600">Date for all entries</label>
        <input
          type="date"
          min={minForYear}
          max={maxDate}
          value={logDate}
          onChange={(e) => setLogDate(clampDateForPicker(e.target.value))}
          className="mt-1 block w-full rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm text-zinc-100 light:border-zinc-300 light:bg-white light:text-zinc-900"
        />
      </div>

      {msg && <p className="mt-4 text-sm text-accent">{msg}</p>}
      {err && (
        <p className="mt-4 text-sm text-red-400 light:text-red-600" role="alert">
          {err}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-zinc-300 light:text-zinc-800">
          Training summary
        </h2>
        <form onSubmit={submitTrainingSummary} className="mt-3 flex flex-col gap-3">
          <textarea
            value={trainingSummary}
            onChange={(e) => setTrainingSummary(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm light:border-zinc-300 light:bg-white light:text-zinc-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent py-2 text-sm font-medium text-zinc-950 hover:bg-accent-dim"
          >
            Save training summary
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-zinc-300 light:text-zinc-800">
          Daily Metrics
        </h2>
        {dailyLoading && (
          <p className="mt-2 text-xs text-zinc-500 light:text-zinc-600">
            Loading saved values for {logDate}...
          </p>
        )}
        <form onSubmit={submitDaily} className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
            <label className="text-sm text-zinc-300 light:text-zinc-700">Sleep (hrs)</label>
            <input
              type="number"
              step="0.25"
              min={0}
              max={24}
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm light:border-zinc-300 light:bg-white light:text-zinc-900"
            />
            <label className="text-sm text-zinc-300 light:text-zinc-700">Steps</label>
            <input
              type="number"
              min={0}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm light:border-zinc-300 light:bg-white light:text-zinc-900"
            />
            <label className="text-sm text-zinc-300 light:text-zinc-700">Protein (g)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm light:border-zinc-300 light:bg-white light:text-zinc-900"
            />
            <label className="text-sm text-zinc-300 light:text-zinc-700">Calories</label>
            <input
              type="number"
              min={0}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm light:border-zinc-300 light:bg-white light:text-zinc-900"
            />
            <label className="text-sm text-zinc-300 light:text-zinc-700">Body weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              className="rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm light:border-zinc-300 light:bg-white light:text-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={dailyLoading}
            className="rounded-lg bg-accent py-2 text-sm font-medium text-zinc-950 hover:bg-accent-dim disabled:opacity-50"
          >
            {dailyLoading ? "Loading..." : "Save daily metrics"}
          </button>
        </form>
      </section>
    </div>
  );
}
