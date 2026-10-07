-- One row per person across calculator leads and booking requests.
-- People are matched by phone number (+46 7x… and 07x… count as the same).
-- Keeps the latest booking info (topic, message) and the latest calculator info (goal, target, risk).
create or replace view public.contacts_overview
with (security_invoker = on) -- respects the tables' row level security, so it's not public
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
  -- Name from whichever form they filled in most recently
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
  c.activity
from people p
left join latest_booking b on b.person = p.person
left join latest_calculator c on c.person = p.person
order by p.last_contact desc;

revoke all on public.contacts_overview from anon, authenticated;
