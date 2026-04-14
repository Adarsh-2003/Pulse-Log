create table if not exists public.viewer_devices (
  viewer_key text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.viewer_devices enable row level security;
