-- Multi-coach: every row belongs to a coach, and each coach only sees their own data.
-- A coach is a logged-in user (coaches.id = auth.users.id). Existing data goes to the first admin (Alexandru).
-- Shared data: foods with coach_id null (the Livsmedelsverket import) are visible to every coach and editable by none.

create table public.coaches (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'), -- public id used by the coach's forms
  name text not null check (char_length(name) between 1 and 100),
  alert_email text check (char_length(alert_email) <= 254) -- where new-lead alerts go
);
alter table public.coaches enable row level security;
create policy "coaches see themselves" on public.coaches for select to authenticated using (id = auth.uid());
create policy "coaches update themselves" on public.coaches for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
grant select, update (name, alert_email) on public.coaches to authenticated;
revoke all on public.coaches from anon;

insert into public.coaches (id, slug, name, alert_email)
select user_id, 'alexandru', 'Alexandru Som', 'alex123som2@gmail.com'
from public.admins order by created_at limit 1;

-- Drop the old single-admin policies (and the view that depends on contact_status' key)
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('leads', 'contact_requests', 'contact_status', 'foods', 'diet_plans', 'diet_plan_items', 'client_profiles')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;
drop view public.contacts_overview;

-- Add coach_id, backfill with the first coach. Tables the admin writes default to the logged-in coach.
do $$
declare t text;
begin
  foreach t in array array['leads', 'contact_requests', 'contact_status', 'client_profiles', 'diet_plans'] loop
    execute format('alter table public.%I add column coach_id uuid references public.coaches (id) on delete cascade', t);
    execute format('update public.%I set coach_id = (select id from public.coaches order by created_at limit 1)', t);
    execute format('alter table public.%I alter column coach_id set not null, alter column coach_id set default auth.uid()', t);
    execute format('create index on public.%I (coach_id)', t);
  end loop;
end $$;

-- Per-coach keys: the same phone can be a lead for two different coaches
alter table public.contact_status drop constraint contact_status_pkey, add primary key (coach_id, phone);
alter table public.client_profiles drop constraint client_profiles_pkey, add primary key (coach_id, phone);
drop index public.diet_plans_one_current_per_client;
create unique index diet_plans_one_current_per_client on public.diet_plans (coach_id, phone) where is_current;

-- Foods: own foods belong to a coach; imported foods are shared (coach_id null)
alter table public.foods add column coach_id uuid references public.coaches (id) on delete cascade;
update public.foods set coach_id = (select id from public.coaches order by created_at limit 1) where source = 'mine';
alter table public.foods alter column coach_id set default auth.uid();
alter table public.foods add constraint foods_shared_are_imported check ((coach_id is null) = (source = 'livsmedelsverket'));
create index on public.foods (coach_id);

-- Favourites are per coach
create table public.food_favorites (
  coach_id uuid not null default auth.uid() references public.coaches (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (coach_id, food_id)
);
insert into public.food_favorites (coach_id, food_id)
select (select id from public.coaches order by created_at limit 1), id from public.foods where favorite;
drop index public.foods_favorite_idx;
alter table public.foods drop column favorite;
alter table public.food_favorites enable row level security;
grant select, insert, delete on public.food_favorites to authenticated;
revoke all on public.food_favorites from anon;

-- Policies: a coach sees and changes only their own rows
create policy "coach reads own leads" on public.leads for select to authenticated using (coach_id = auth.uid());
create policy "coach deletes own leads" on public.leads for delete to authenticated using (coach_id = auth.uid());
create policy "coach reads own contact requests" on public.contact_requests for select to authenticated using (coach_id = auth.uid());
create policy "coach deletes own contact requests" on public.contact_requests for delete to authenticated using (coach_id = auth.uid());
create policy "coach manages own contact status" on public.contact_status for all to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "coach manages own client profiles" on public.client_profiles for all to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "coach manages own diet plans" on public.diet_plans for all to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "coach manages items in own diet plans" on public.diet_plan_items for all to authenticated
  using (exists (select 1 from public.diet_plans p where p.id = plan_id and p.coach_id = auth.uid()))
  with check (exists (select 1 from public.diet_plans p where p.id = plan_id and p.coach_id = auth.uid()));
create policy "coach reads shared and own foods" on public.foods for select to authenticated
  using (coach_id is null or coach_id = auth.uid());
create policy "coach writes own foods" on public.foods for insert to authenticated with check (coach_id = auth.uid());
create policy "coach updates own foods" on public.foods for update to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "coach deletes own foods" on public.foods for delete to authenticated using (coach_id = auth.uid());
create policy "coach manages own favourites" on public.food_favorites for all to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());

-- Foods as the logged-in coach sees them, with their favourite flag
create view public.coach_foods
with (security_invoker = on)
as
select f.*, (fav.food_id is not null) as favorite
from public.foods f
left join public.food_favorites fav on fav.food_id = f.id and fav.coach_id = auth.uid();
revoke all on public.coach_foods from anon;
grant select on public.coach_foods to authenticated;

-- One row per person per coach (phone +46 → 0), with their latest calculator and booking data
create view public.contacts_overview
with (security_invoker = on)
as
with all_entries as (
  select coach_id, regexp_replace(phone, '^\+46', '0') as person, created_at, 'calculator' as source from public.leads
  union all
  select coach_id, regexp_replace(phone, '^\+46', '0'), created_at, 'booking' from public.contact_requests
),
people as (
  select
    coach_id,
    person,
    min(created_at) as first_contact,
    max(created_at) as last_contact,
    count(*) filter (where source = 'booking') as booking_requests,
    count(*) filter (where source = 'calculator') as calculator_entries
  from all_entries
  group by coach_id, person
),
latest_booking as (
  select distinct on (coach_id, regexp_replace(phone, '^\+46', '0'))
    coach_id, regexp_replace(phone, '^\+46', '0') as person, name, created_at, topic, message, lang
  from public.contact_requests
  order by coach_id, regexp_replace(phone, '^\+46', '0'), created_at desc
),
latest_calculator as (
  select distinct on (coach_id, regexp_replace(phone, '^\+46', '0'))
    coach_id, regexp_replace(phone, '^\+46', '0') as person, name, created_at,
    sex, age, height_cm, weight_kg, goal_weight_kg, weeks, activity, goal, maintenance_kcal, target_kcal, risk
  from public.leads
  order by coach_id, regexp_replace(phone, '^\+46', '0'), created_at desc
)
select
  p.coach_id,
  p.person as phone,
  case when c.created_at is null or (b.created_at is not null and b.created_at > c.created_at) then b.name else c.name end as name,
  p.last_contact,
  p.first_contact,
  case
    when b.person is not null and c.person is not null then 'calculator + booking'
    when b.person is not null then 'booking'
    else 'calculator'
  end as came_from,
  p.booking_requests,
  p.calculator_entries,
  b.topic as booking_topic,
  b.message as booking_message,
  c.risk,
  c.goal,
  c.weight_kg,
  c.goal_weight_kg,
  c.weeks,
  c.target_kcal,
  c.maintenance_kcal,
  c.sex,
  c.age,
  c.height_cm,
  c.activity,
  coalesce(s.status, 'new') as status,
  coalesce(s.notes, '') as notes
from people p
left join latest_booking b on b.coach_id = p.coach_id and b.person = p.person
left join latest_calculator c on c.coach_id = p.coach_id and c.person = p.person
left join public.contact_status s on s.coach_id = p.coach_id and s.phone = p.person
order by p.last_contact desc;
revoke all on public.contacts_overview from anon;
grant select on public.contacts_overview to authenticated;

-- The single-admin setup is replaced by coaches
drop function public.is_admin();
drop table public.admins;

notify pgrst, 'reload schema';
