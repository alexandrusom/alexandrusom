-- Food list for building client diets. Values are per 100 g. Admin only.
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null check (char_length(name) between 1 and 120),
  brand text check (char_length(brand) <= 80),
  category text not null default 'other'
    check (category in ('protein', 'carbs', 'fat', 'vegetables', 'fruit', 'dairy', 'snacks', 'drinks', 'other')),

  kcal numeric(6, 1) not null check (kcal between 0 and 1000),
  protein_g numeric(5, 1) not null default 0 check (protein_g between 0 and 100),
  carbs_g numeric(5, 1) not null default 0 check (carbs_g between 0 and 100),
  fat_g numeric(5, 1) not null default 0 check (fat_g between 0 and 100),
  fiber_g numeric(5, 1) check (fiber_g between 0 and 100),

  -- Optional standard portion, e.g. "1 egg" = 60 g
  portion_name text check (char_length(portion_name) <= 60),
  portion_grams numeric(6, 1) check (portion_grams > 0 and portion_grams <= 5000),

  notes text check (char_length(notes) <= 2000)
);

create index foods_name_idx on public.foods (lower(name));

alter table public.foods enable row level security;
create policy "admins manage foods" on public.foods for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.foods to authenticated;
revoke all on public.foods from anon;
