-- Admin access: only users listed in public.admins can read leads and manage contacts.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "admins can see themselves" on public.admins for select to authenticated using (user_id = auth.uid());

-- True when the logged-in user is an admin. security definer so it can read admins regardless of RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Admins can read the raw form data
create policy "admins read leads" on public.leads for select to authenticated using (public.is_admin());
create policy "admins read contact requests" on public.contact_requests for select to authenticated using (public.is_admin());
create policy "admins delete leads" on public.leads for delete to authenticated using (public.is_admin());
create policy "admins delete contact requests" on public.contact_requests for delete to authenticated using (public.is_admin());

-- Follow-up status and notes per person (keyed like contacts_overview: phone with +46 → 0)
create table public.contact_status (
  phone text primary key,
  status text not null default 'new' check (status in ('new', 'called', 'client', 'not_interested')),
  notes text not null default '' check (char_length(notes) <= 10000),
  updated_at timestamptz not null default now()
);
alter table public.contact_status enable row level security;
create policy "admins manage contact status" on public.contact_status for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.contact_status to authenticated;
revoke all on public.contact_status from anon;

-- The overview, now with status and notes
create or replace view public.contacts_overview
with (security_invoker = on)
as
with all_entries as (
  select regexp_replace(phone, '^\+46', '0') as person, created_at, 'calculator' as source from public.leads
  union all
  select regexp_replace(phone, '^\+46', '0'), created_at, 'booking' from public.contact_requests
),
people as (
  select
    person,
    min(created_at) as first_contact,
    max(created_at) as last_contact,
    count(*) filter (where source = 'booking') as booking_requests,
    count(*) filter (where source = 'calculator') as calculator_entries
  from all_entries
  group by person
),
latest_booking as (
  select distinct on (regexp_replace(phone, '^\+46', '0'))
    regexp_replace(phone, '^\+46', '0') as person, name, created_at, topic, message, lang
  from public.contact_requests
  order by regexp_replace(phone, '^\+46', '0'), created_at desc
),
latest_calculator as (
  select distinct on (regexp_replace(phone, '^\+46', '0'))
    regexp_replace(phone, '^\+46', '0') as person, name, created_at,
    sex, age, height_cm, weight_kg, goal_weight_kg, weeks, activity, goal, maintenance_kcal, target_kcal, risk
  from public.leads
  order by regexp_replace(phone, '^\+46', '0'), created_at desc
)
select
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
left join latest_booking b on b.person = p.person
left join latest_calculator c on c.person = p.person
left join public.contact_status s on s.phone = p.person
order by p.last_contact desc;

-- Logged-in users may query the view; the tables' RLS still means only admins see rows
revoke all on public.contacts_overview from anon;
grant select on public.contacts_overview to authenticated;
