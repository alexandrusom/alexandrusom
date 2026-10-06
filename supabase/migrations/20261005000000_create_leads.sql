-- Leads captured by the calorie calculator.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (phone ~ '^\+?[0-9]{7,15}$'),
  consent boolean not null check (consent),
  consent_text text not null,

  -- Calculator answers (always stored in metric) and result
  unit_system text not null check (unit_system in ('metric', 'imperial')),
  sex text not null check (sex in ('male', 'female')),
  age smallint not null,
  height_cm numeric(5, 1) not null,
  weight_kg numeric(5, 1) not null,
  goal_weight_kg numeric(5, 1) not null,
  weeks smallint not null,
  activity text not null,
  goal text not null check (goal in ('lose', 'gain', 'maintain')),
  maintenance_kcal integer not null,
  target_kcal integer not null,
  -- none / ambitious / dangerous: how aggressive the goal was, so you know who needs a careful conversation
  risk text not null check (risk in ('none', 'ambitious', 'dangerous'))
);

create index leads_created_at_idx on public.leads (created_at desc);

-- Row level security with no policies: the public API can't read or write this table.
-- Only the submit-lead Edge Function (using the service role) can insert.
alter table public.leads enable row level security;
