alter table public.daily_metrics
add column if not exists training_summary text;
