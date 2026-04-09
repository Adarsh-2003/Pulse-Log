import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isLogDateAllowed } from "@/lib/constants";
import { monthRangeISO } from "@/lib/dates";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
  }
  const { start, end } = monthRangeISO(year, month - 1);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .gte("log_date", start)
    .lte("log_date", end)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workouts: data ?? [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const log_date = typeof body.log_date === "string" ? body.log_date : "";
    const exercise_name =
      typeof body.exercise_name === "string" ? body.exercise_name.trim() : "";
    const weight_kg = Number(body.weight_kg);
    const reps = Number(body.reps);
    if (!isLogDateAllowed(log_date)) {
      return NextResponse.json(
        { error: "Logs are allowed from March 1 onward for that year." },
        { status: 400 }
      );
    }
    if (!exercise_name) {
      return NextResponse.json({ error: "Exercise name required" }, { status: 400 });
    }
    if (!Number.isFinite(weight_kg) || weight_kg < 0) {
      return NextResponse.json({ error: "Invalid weight" }, { status: 400 });
    }
    if (!Number.isFinite(reps) || reps < 0 || !Number.isInteger(reps)) {
      return NextResponse.json({ error: "Invalid reps" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        log_date,
        exercise_name,
        weight_kg,
        reps,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ workout: data });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
