-- Coach's view of a client: start values and goal (pre-filled from the calculator, editable) and diet preferences.
-- Keyed by phone like contacts_overview (+46 → 0).
create table public.client_profiles (
  phone text primary key,
  updated_at timestamptz not null default now(),

  -- Start values (null = use the calculator answers)
  start_date date,
  start_weight_kg numeric(5, 1) check (start_weight_kg between 30 and 300),
  height_cm numeric(5, 1) check (height_cm between 120 and 230),
  age smallint check (age between 10 and 100),
  sex text check (sex in ('male', 'female')),
  activity text check (activity in ('sedentary', 'light', 'moderate', 'active', 'very_active')),

  -- Goal
  goal_weight_kg numeric(5, 1) check (goal_weight_kg between 30 and 300),
  goal_date date,
  goal_text text check (char_length(goal_text) <= 500),

  -- Diet preferences
  likes text check (char_length(likes) <= 2000),
  dislikes text check (char_length(dislikes) <= 2000),
  allergies text check (char_length(allergies) <= 2000),
  diet_style text check (char_length(diet_style) <= 100),
  meals_per_day smallint check (meals_per_day between 1 and 10),
  preference_notes text check (char_length(preference_notes) <= 5000)
);

alter table public.client_profiles enable row level security;
create policy "admins manage client profiles" on public.client_profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.client_profiles to authenticated;
revoke all on public.client_profiles from anon;

-- One plan per client is the current diet; the rest are older versions
alter table public.diet_plans add column is_current boolean not null default false;
create unique index diet_plans_one_current_per_client on public.diet_plans (phone) where is_current;
