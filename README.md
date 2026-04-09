# PulseLog — personal fitness tracker

Single-user Next.js app: log daily training summary + health metrics in Supabase, view a GitHub-style heatmap (current year) and Recharts analytics with a global month/year selector.

## Checklist: what you do next (local → live)

You only need **two external services** for a full setup: **Supabase** (database) and **Vercel** (hosting). No separate auth product, Firebase, or paid tier is required for a personal app.

### A) Run it on your computer first

1. **Install Node.js** (LTS) if you do not have it: [https://nodejs.org](https://nodejs.org)
2. In this folder: `npm install`
3. **Create a Supabase project** (free): [https://supabase.com/dashboard](https://supabase.com/dashboard) → New project → wait until it is healthy.
4. **Create the tables**: Supabase → **SQL Editor** → New query → paste contents of `supabase/migrations/001_initial.sql` → Run.
5. **Copy API keys**: Supabase → **Project Settings** (gear) → **API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` **secret** (not the anon key) → `SUPABASE_SERVICE_ROLE_KEY`  
   Never put the service role key in client-side code or public repos; this app only uses it in server routes.
6. **Configure `.env.local`** (create from `.env.example` if needed):
   - Paste the two Supabase values above.
   - Set `TRACKER_EMAIL` / `TRACKER_PASSWORD_HASH` / `SESSION_SECRET` (see §3). You already have a hash if you followed the password script earlier.
7. **Smoke test**: `npm run dev` → open `http://localhost:3000` → click **Logs** (this triggers login) → add one training summary and one daily row → confirm **Home** charts/heatmap update.
8. **Optional**: run `supabase/seed_sample.sql` in the SQL Editor for quick demo data.

### B) Put it on the internet (Vercel)

1. **Git repository**: Initialize git in this folder (if needed), commit, push to **GitHub** (or GitLab/Bitbucket). Do **not** commit `.env.local` (it is gitignored).
2. **Vercel**: [https://vercel.com](https://vercel.com) → sign in → **Add New…** → **Project** → import the repo.
3. **Environment variables** in Vercel (Project → Settings → Environment Variables): add **every** variable from your `.env.local`, same names and values. Enable at least **Production** (and Preview if you use preview deployments).
4. **Deploy** → open the production URL → log in again and verify Logs/Home.

### C) After deployment

- If login or API calls fail, almost always a **missing or wrong env var** on Vercel (typo, wrong project URL, or service role pasted incorrectly).
- Supabase free tier pauses idle projects; wake the project in the dashboard if the app suddenly cannot reach the DB.

### What you do *not* need

- Supabase **Auth** (email magic links, etc.) — this app uses env-based login + a session cookie.
- The Supabase **anon** key for this minimal setup — only URL + **service role** are used server-side.
- A paid database unless you outgrow the free tier.

---

## 1) Folder structure

```
.
├── app/
│   ├── api/
│   │   ├── analytics/route.ts      # Monthly series + heatmap payload
│   │   ├── auth/login|logout/      # Session cookie (JWT)
│   │   ├── daily/route.ts          # GET/POST daily_metrics by date
│   │   └── workouts/route.ts       # GET/POST workouts
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── logs/page.tsx
│   ├── page.tsx                    # Home: quote, heatmap, analytics
├── components/
│   ├── AnalyticsCharts.tsx
│   ├── Footer.tsx
│   ├── HomeDashboard.tsx
│   ├── LogsView.tsx
│   ├── MonthYearPicker.tsx
│   ├── Navbar.tsx
│   └── WorkoutHeatmap.tsx
├── lib/
│   ├── auth.ts
│   ├── constants.ts                # Session cookie name, March 1 rule
│   ├── dates.ts
│   ├── session.ts                  # JWT sign/verify (jose)
│   └── supabase/admin.ts           # Service role client (server only)
├── middleware.ts                   # Auth gate for /logs and /api/daily
├── scripts/hash-password.cjs       # Generate TRACKER_PASSWORD_HASH
├── supabase/
│   ├── migrations/001_initial.sql
│   ├── migrations/002_add_training_summary.sql
│   └── seed_sample.sql
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## 2) Setup (step-by-step)

1. **Clone / open** this folder and install dependencies:

   ```bash
   npm install
   ```

2. **Supabase**: create a project at [https://supabase.com](https://supabase.com).

3. In Supabase **SQL Editor**, run `supabase/migrations/001_initial.sql` to create tables.

4. **Environment file**: copy `.env.example` to `.env.local` (Next.js loads it automatically).

5. **Login** in `.env.local`: set `TRACKER_EMAIL` and **`TRACKER_PASSWORD`** (plain text — easiest). Optional bcrypt: `node scripts/hash-password.cjs "your-password"` → `TRACKER_PASSWORD_HASH` (wrap hash in quotes in `.env` because of `$`).

6. Fill **Supabase URL**, **service role key**, and **SESSION_SECRET** (see below).

7. **Run locally**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — click **Logs** to sign in.

8. Optional: load **sample data** with `supabase/seed_sample.sql` in the SQL Editor.

## 3) Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (**secret**) | Server-only DB access; never expose to the browser |
| `TRACKER_EMAIL` | You | Username (or email) checked at login (lowercased) |
| `TRACKER_PASSWORD` | You (optional) | **Easiest:** plain password. Use this unless you prefer a bcrypt hash. |
| `TRACKER_PASSWORD_HASH` | From `scripts/hash-password.cjs` | Optional: bcrypt hash instead of `TRACKER_PASSWORD` (wrap in quotes in `.env` if the hash has `$`) |
| `SESSION_SECRET` | Random string, 32+ chars | Signs the HTTP-only session JWT |

`.env` / `.env.local` are listed in `.gitignore` so secrets are not committed.

## 4) Deployment (Vercel + Supabase)

1. Push the repo to GitHub (without `.env.local`).

2. **Vercel** → New Project → import the repo, framework Next.js.

3. In Vercel **Environment Variables**, add the same keys as in `.env.local` (use Production and Preview as needed).

4. Deploy. Visit the production URL and sign in with `TRACKER_EMAIL` + your plain password.

**Notes**

- The app uses the **service role** only on the server (API routes + middleware secret). The anon key is not required for this minimal setup.
- Supabase **RLS** is enabled with **no** public policies; the service role bypasses RLS for your single-user app.

## 5) Sample dummy data

- File: `supabase/seed_sample.sql` — inserts training summary and `daily_metrics` rows relative to `current_date` so charts show data in the current month.

- Manual snippet (replace dates):

  ```sql
  insert into public.workouts (log_date, exercise_name, weight_kg, reps) values
    ('2026-04-01', 'Bench press', 62.5, 8);

  insert into public.daily_metrics (log_date, sleep_hours, steps, protein_g, calories, body_weight_kg)
  values ('2026-04-01', 7.5, 9000, 130, 2200, 73.0)
  on conflict (log_date) do update set
    sleep_hours = excluded.sleep_hours,
    steps = excluded.steps,
    protein_g = excluded.protein_g,
    calories = excluded.calories,
    body_weight_kg = excluded.body_weight_kg,
    updated_at = now();
  ```

## Rules & behavior

- **Logging**: allowed from **March 1** of the selected date’s year through today (enforced in API + date inputs).
- **Heatmap**: always the **current calendar year** (daily training consistency).
- **Analytics**: driven by the **month/year** selector; empty months show **“No records found”**.

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm start` — run production build locally
