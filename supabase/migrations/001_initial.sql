-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  log_date date not null,
  exercise_name text not null,
  weight_kg numeric(10, 2) not null default 0,
  reps integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  log_date date not null unique,
  training_summary text,
  sleep_hours numeric(4, 2),
  steps integer,
  protein_g numeric(10, 2),
  calories integer,
  body_weight_kg numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workouts_log_date on public.workouts (log_date);
create index if not exists idx_daily_metrics_log_date on public.daily_metrics (log_date);

alter table public.workouts enable row level security;
alter table public.daily_metrics enable row level security;

-- No public policies: app uses service role from server only.
