# AthleOn

Coaching platform rebuilt on Next.js + Supabase. A coach logs in and fills in a
spreadsheet-style weekly plan (one row per athlete, one column per day, planned
+ actual) for every athlete. Each athlete logs in separately, sees only their
own week, and can log what they actually did.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind CSS 4)
- **Supabase** — Postgres database + built-in email/password auth + row-level security

## 1. Create the Supabase project

1. Go to supabase.com and create a new project.
2. In the SQL Editor, paste and run the contents of `supabase/schema.sql`.
   This creates the `profiles`, `weeks`, and `workouts` tables, a trigger
   that auto-creates a profile whenever someone signs up, and the row-level
   security policies that keep athletes scoped to their own data.
3. Go to Project Settings -> Data API and copy the Project URL and anon public key.

## 2. Configure the app

    cp .env.local.example .env.local

Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY with
the values from step 1.

    npm install
    npm run dev

The app runs at http://localhost:3000.

## 3. Create your coach account + athletes

There's no public sign-up page on purpose -- accounts are provisioned by you.

1. In the Supabase dashboard, go to Authentication -> Users -> Add user
   and create yourself (email + password), and one entry per athlete
   (e.g. Pralay, Anisha, Aura...). "Auto confirm user" should be checked so
   they can sign in immediately.
2. Each new user automatically gets a row in public.profiles with
   role = 'athlete'. Go to Table Editor -> profiles and:
   - Change your own row's role to 'coach'.
   - Optionally set group_code for each athlete (e.g. MWTS, TTS) to
     match the old spreadsheet naming (shows as "Anisha-MWTS" in the grid).
3. Sign in at /login -- coaches land on /coach/dashboard, athletes on
   /athlete/dashboard.

## How it works

- Coach dashboard (/coach/dashboard) shows every athlete as a row and
  every day (Mon-Sun) as a pair of columns: Planned and Actual, plus a Week
  Mileage column -- matching the original spreadsheet layout. Use the
  Prev/Next week links to move between weeks; a week (and its 7 blank day
  rows) is created automatically the first time you open it for an athlete.
  Every cell auto-saves on blur.
- Athlete dashboard (/athlete/dashboard) shows the same week as a list
  of days. Athletes can read what's planned and fill in "Actual" for each
  day; they cannot edit the planned workout.
- Row-level security in supabase/schema.sql enforces that athletes can
  only ever read/write their own weeks/workouts rows. Coaches can read
  and write everything.

## Project structure

    src/
      app/
        actions.ts              server actions (auth, week/workout CRUD)
        login/                   login page
        coach/dashboard/         coach's spreadsheet-style weekly grid
        athlete/dashboard/       athlete's day-by-day view
        auth/callback/           Supabase auth callback route
      lib/
        supabase/                Supabase client helpers (browser/server/middleware)
        types.ts                 shared types + week-date helpers
    supabase/
      schema.sql                 full DB schema + RLS policies

## Next steps / ideas

- Add a coach-only "add athlete" form (currently done via Supabase dashboard).
- CSV import for Garmin activity data, matched to workouts.actual by user_id + date.
- Weekly mileage rollup / dashboard charts.
- Race calendar and race-day coordination view.
