-- ============================================================
-- AthleOn database schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor for a fresh project.
-- ============================================================

-- 1. Profiles ---------------------------------------------------
-- One row per auth user. Created automatically by the trigger below
-- whenever someone signs up. role is set manually by the coach
-- (see "Adding people" in README.md) since self-signup should not
-- grant coach access.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('coach', 'athlete')) default 'athlete',
  -- e.g. "MWTS" (Mon/Wed/Thu/Sat) -- matches the training-group suffix
  -- used in the coach's old spreadsheet (e.g. "Anisha-MWTS")
  group_code text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can see the list of profiles (needed for the coach's athlete
-- picker, and so athletes can see their coach's name). No sensitive data
-- lives here beyond name/email.
create policy "profiles are viewable by any authenticated user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- Auto-create a profile row when a new auth user is created.
-- Role defaults to 'athlete'; promote to 'coach' manually in the
-- Supabase table editor for yourself.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'athlete')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Weeks -------------------------------------------------------
-- One row per athlete per week. week_start is always a Monday.
create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  coach_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  week_mileage numeric,
  created_at timestamptz not null default now(),
  unique (athlete_id, week_start)
);

alter table public.weeks enable row level security;

create policy "coach can do anything with weeks"
  on public.weeks for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'));

create policy "athlete can view own weeks"
  on public.weeks for select
  to authenticated
  using (athlete_id = auth.uid());

-- 3. Workouts ------------------------------------------------------
-- One row per day within a week. "planned" is set by the coach,
-- "actual" is filled in by the athlete after training.
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  day_of_week text not null check (
    day_of_week in ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')
  ),
  planned text,
  actual text,
  actual_distance_km numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (week_id, day_of_week)
);

alter table public.workouts enable row level security;

create policy "coach can do anything with workouts"
  on public.workouts for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach'));

create policy "athlete can view own workouts"
  on public.workouts for select
  to authenticated
  using (
    exists (
      select 1 from public.weeks w
      where w.id = workouts.week_id and w.athlete_id = auth.uid()
    )
  );

-- Athletes may only log "actual" -- the app layer (server action) is
-- responsible for never sending a changed "planned" value on their
-- behalf. Postgres RLS can't restrict individual columns without
-- extra plumbing, so this is enforced in code (see actions.ts).
create policy "athlete can update own workouts"
  on public.workouts for update
  to authenticated
  using (
    exists (
      select 1 from public.weeks w
      where w.id = workouts.week_id and w.athlete_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.weeks w
      where w.id = workouts.week_id and w.athlete_id = auth.uid()
    )
  );

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute procedure public.set_updated_at();
