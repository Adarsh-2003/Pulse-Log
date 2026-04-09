-- Sample dummy data (adjust dates to your current month/year for visible charts)
-- Run after migrations in Supabase SQL Editor

insert into public.workouts (log_date, exercise_name, weight_kg, reps) values
  (current_date - 2, 'Bench press', 60, 8),
  (current_date - 2, 'Squat', 80, 5),
  (current_date - 1, 'Deadlift', 90, 5),
  (current_date, 'Pull-up', 0, 12);

insert into public.daily_metrics (log_date, training_summary, sleep_hours, steps, protein_g, calories, body_weight_kg)
values
  (current_date - 2, 'Upper day: bench 4x8, row 4x10, shoulder press 3x10', 7.5, 8200, 120, 2100, 72.4),
  (current_date - 1, 'Lower day: squat 5x5, RDL 4x8, lunges 3x12', 6.25, 10400, 135, 2300, 72.2),
  (current_date, 'Pull day: pull-ups, barbell row, curls', 8, 6500, 140, 2050, 72.0)
on conflict (log_date) do update set
  training_summary = excluded.training_summary,
  sleep_hours = excluded.sleep_hours,
  steps = excluded.steps,
  protein_g = excluded.protein_g,
  calories = excluded.calories,
  body_weight_kg = excluded.body_weight_kg,
  updated_at = now();
