import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { eachDayInMonth, eachDayInYear, monthRangeISO, toISODate, yearRangeISO } from "@/lib/dates";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
  }
  const monthIndex0 = month - 1;
  const { start, end } = monthRangeISO(year, monthIndex0);
  const currentYear = new Date().getFullYear();
  const { start: yearStart, end: yearEnd } = yearRangeISO(currentYear);
  const supabase = getSupabaseAdmin();

  const SUMMARY_PREFIX = "SUMMARY::";

  const [{ data: workouts }, { data: daily }, { data: yearWorkouts }, { data: summaryRows }] =
    await Promise.all([
      supabase
        .from("workouts")
        .select("log_date")
        .gte("log_date", start)
        .lte("log_date", end),
      supabase
        .from("daily_metrics")
        .select("log_date, sleep_hours, steps, protein_g, calories, body_weight_kg")
        .gte("log_date", start)
        .lte("log_date", end),
      supabase
        .from("workouts")
        .select("log_date")
        .gte("log_date", yearStart)
        .lte("log_date", yearEnd),
      supabase
        .from("workouts")
        .select("log_date, exercise_name")
        .gte("log_date", start)
        .lte("log_date", end)
        .like("exercise_name", `${SUMMARY_PREFIX}%`)
        .order("log_date", { ascending: false }),
    ]);

  const trainingLogs = (summaryRows ?? []).map((row) => ({
    date: row.log_date as string,
    text: String(row.exercise_name).replace(SUMMARY_PREFIX, ""),
  }));
  const workoutRows = workouts ?? [];
  const dailyRows = (daily ?? []) as Array<{
    log_date: string;
    sleep_hours?: number | null;
    steps?: number | null;
    protein_g?: number | null;
    calories?: number | null;
    body_weight_kg?: number | null;
  }>;

  const workoutCountByDay: Record<string, number> = {};
  for (const row of workoutRows) {
    const k = row.log_date as string;
    workoutCountByDay[k] = (workoutCountByDay[k] ?? 0) + 1;
  }

  const dailyByDate: Record<string, (typeof dailyRows)[0]> = {};
  for (const row of dailyRows) {
    dailyByDate[row.log_date as string] = row;
  }

  const days = eachDayInMonth(year, monthIndex0);
  const series = days.map((date) => {
    const d = dailyByDate[date];
    return {
      dayLabel: date.slice(8, 10),
      date,
      workouts: workoutCountByDay[date] ?? 0,
      sleep: d?.sleep_hours != null ? Number(d.sleep_hours) : null,
      steps: d?.steps != null ? Number(d.steps) : null,
      protein: d?.protein_g != null ? Number(d.protein_g) : null,
      calories: d?.calories != null ? Number(d.calories) : null,
      weight: d?.body_weight_kg != null ? Number(d.body_weight_kg) : null,
    };
  });

  const hasAny =
    workoutRows.length > 0 ||
    dailyRows.some(
      (r) =>
        r.sleep_hours != null ||
        r.steps != null ||
        r.protein_g != null ||
        r.calories != null ||
        r.body_weight_kg != null
    );

  const yearWorkoutRows = yearWorkouts ?? [];
  const yearWorkoutCountByDay: Record<string, number> = {};
  for (const row of yearWorkoutRows) {
    const k = row.log_date as string;
    yearWorkoutCountByDay[k] = (yearWorkoutCountByDay[k] ?? 0) + 1;
  }

  const now = new Date();
  const heatmapDays = eachDayInYear(currentYear).map((date) => ({
    date,
    count: yearWorkoutCountByDay[date] ?? 0,
  }));

  return NextResponse.json({
    hasData: hasAny,
    series,
    trainingLogs,
    heatmap: {
      year: currentYear,
      days: heatmapDays,
    },
    today: toISODate(now),
  });
}
