import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  const xfwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown-ip";
  const ua = req.headers.get("user-agent")?.trim() ?? "unknown-ua";
  const viewerKey = createHash("sha256").update(`${xfwd}|${ua}`).digest("hex");

  const touch = await supabase.from("viewer_devices").upsert(
    {
      viewer_key: viewerKey,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "viewer_key" }
  );

  if (touch.error) {
    return NextResponse.json({ count: null, error: touch.error.message }, { status: 200 });
  }

  const countRes = await supabase
    .from("viewer_devices")
    .select("viewer_key", { count: "exact", head: true });

  if (countRes.error) {
    return NextResponse.json({ count: null, error: countRes.error.message }, { status: 200 });
  }

  return NextResponse.json({ count: countRes.count ?? 0 });
}
