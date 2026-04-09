import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isLogDateAllowed } from "@/lib/constants";

type DailyPayload = {
  training_summary?: string | null;
  sleep_hours?: number | null;
  steps?: number | null;
  protein_g?: number | null;
  calories?: number | null;
  body_weight_kg?: number | null;
};

const SUMMARY_PREFIX = "SUMMARY::";

function normalizePayload(body: Record<string, unknown>): DailyPayload {
  const out: DailyPayload = {};
  if ("training_summary" in body) {
    const v = body.training_summary;
    out.training_summary = typeof v === "string" ? v.trim() : null;
  }
  if ("sleep_hours" in body) {
    const v = body.sleep_hours;
    out.sleep_hours = v === "" || v == null ? null : Number(v);
  }
  if ("steps" in body) {
    const v = body.steps;
    out.steps = v === "" || v == null ? null : Math.round(Number(v));
  }
  if ("protein_g" in body) {
    const v = body.protein_g;
    out.protein_g = v === "" || v == null ? null : Number(v);
  }
  if ("calories" in body) {
    const v = body.calories;
    out.calories = v === "" || v == null ? null : Math.round(Number(v));
  }
  if ("body_weight_kg" in body) {
    const v = body.body_weight_kg;
    out.body_weight_kg = v === "" || v == null ? null : Number(v);
  }
  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const log_date = searchParams.get("date");
  if (!log_date) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const [{ data, error }, { data: summaryRows, error: summaryError }] = await Promise.all([
    supabase
      .from("daily_metrics")
      .select("*")
      .eq("log_date", log_date)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select("exercise_name, created_at")
      .eq("log_date", log_date)
      .like("exercise_name", `${SUMMARY_PREFIX}%`)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (summaryError) return NextResponse.json({ error: summaryError.message }, { status: 500 });
  const summary =
    summaryRows && summaryRows.length > 0
      ? String(summaryRows[0].exercise_name).replace(SUMMARY_PREFIX, "")
      : null;
  return NextResponse.json({
    daily: data ? { ...data, training_summary: summary } : { log_date, training_summary: summary },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const log_date = typeof body.log_date === "string" ? body.log_date : "";
    if (!isLogDateAllowed(log_date)) {
      return NextResponse.json(
        { error: "Logs are allowed from March 1 onward for that year." },
        { status: 400 }
      );
    }
    const patch = normalizePayload(body as Record<string, unknown>);
    const supabase = getSupabaseAdmin();

    const summaryText = (patch.training_summary ?? "").trim();
    const summaryRows = await supabase
      .from("workouts")
      .delete()
      .eq("log_date", log_date)
      .like("exercise_name", `${SUMMARY_PREFIX}%`);
    if (summaryRows.error) {
      return NextResponse.json({ error: summaryRows.error.message }, { status: 500 });
    }
    if (summaryText.length > 0) {
      const summaryInsert = await supabase.from("workouts").insert({
        log_date,
        exercise_name: `${SUMMARY_PREFIX}${summaryText}`,
        weight_kg: 0,
        reps: 0,
      });
      if (summaryInsert.error) {
        return NextResponse.json({ error: summaryInsert.error.message }, { status: 500 });
      }
    }

    const { data: existing } = await supabase
      .from("daily_metrics")
      .select("id")
      .eq("log_date", log_date)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await supabase
        .from("daily_metrics")
        .update({
          sleep_hours: patch.sleep_hours,
          steps: patch.steps,
          protein_g: patch.protein_g,
          calories: patch.calories,
          body_weight_kg: patch.body_weight_kg,
          updated_at: new Date().toISOString(),
        })
        .eq("log_date", log_date)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({
        daily: { ...data, training_summary: summaryText || null },
      });
    }

    const { data, error } = await supabase
      .from("daily_metrics")
      .insert({
        log_date,
        sleep_hours: patch.sleep_hours ?? null,
        steps: patch.steps ?? null,
        protein_g: patch.protein_g ?? null,
        calories: patch.calories ?? null,
        body_weight_kg: patch.body_weight_kg ?? null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ daily: { ...data, training_summary: summaryText || null } });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
