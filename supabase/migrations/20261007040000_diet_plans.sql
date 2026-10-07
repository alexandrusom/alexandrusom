-- Diet plans per client. A client is identified like in contacts_overview: phone number with +46 → 0.
create table public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  phone text not null,
  name text not null default 'Kostplan' check (char_length(name) between 1 and 80),
  target_kcal integer check (target_kcal between 800 and 6000),
  -- Meal order for this plan; items reference these names
  meals text[] not null default array['Frukost', 'Lunch', 'Mellanmål', 'Middag'],
  notes text not null default '' check (char_length(notes) <= 5000)
);
create index diet_plans_phone_idx on public.diet_plans (phone);

create table public.diet_plan_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  plan_id uuid not null references public.diet_plans (id) on delete cascade,
  meal text not null check (char_length(meal) between 1 and 40),
  -- restrict: a food that's used in a plan can't be deleted by accident
  food_id uuid not null references public.foods (id) on delete restrict,
  grams numeric(6, 1) not null check (grams > 0 and grams <= 3000),
  position integer not null default 0
);
create index diet_plan_items_plan_idx on public.diet_plan_items (plan_id);

alter table public.diet_plans enable row level security;
alter table public.diet_plan_items enable row level security;
create policy "admins manage diet plans" on public.diet_plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admins manage diet plan items" on public.diet_plan_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.diet_plans, public.diet_plan_items to authenticated;
revoke all on public.diet_plans, public.diet_plan_items from anon;
