-- Units per food ("1 st" = 60 g, "1 dl" = 35 g …) so diets can say "2 ägg" instead of "120 g".
-- Livsmedelsverket has no portion data, so shared units (coach_id null) are seeded below from standard Swedish
-- weights; each coach adds their own as they go. Diet items still store grams; the unit is how it's shown.

create table public.food_units (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  food_id uuid not null references public.foods (id) on delete cascade,
  coach_id uuid default auth.uid() references public.coaches (id) on delete cascade, -- null = shared starter unit
  name text not null check (char_length(name) between 1 and 40),
  grams numeric(7, 1) not null check (grams > 0 and grams <= 5000),
  unique nulls not distinct (food_id, coach_id, name)
);
create index on public.food_units (food_id);
alter table public.food_units enable row level security;
create policy "coach reads shared and own units" on public.food_units for select to authenticated
  using (coach_id is null or coach_id = auth.uid());
create policy "coach adds own units" on public.food_units for insert to authenticated with check (coach_id = auth.uid());
create policy "coach updates own units" on public.food_units for update to authenticated
  using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "coach deletes own units" on public.food_units for delete to authenticated using (coach_id = auth.uid());
grant select, insert, update, delete on public.food_units to authenticated;
revoke all on public.food_units from anon;

-- A diet item can be "quantity × unit"; grams stays the source of truth for the totals
alter table public.diet_plan_items
  add column unit_id uuid references public.food_units (id) on delete set null,
  add column quantity numeric(6, 2) check (quantity > 0 and quantity <= 1000);

-- Coaches' own foods: their existing single portion becomes a unit
insert into public.food_units (food_id, coach_id, name, grams)
select id, coach_id, portion_name, portion_grams from public.foods
where coach_id is not null and portion_name is not null and portion_grams is not null
on conflict do nothing;

-- Starter units for the shared Livsmedelsverket foods: (name pattern, unit, grams)
insert into public.food_units (food_id, coach_id, name, grams)
select f.id, null, r.unit, r.grams
from public.foods f
join (values
  -- Ägg
  ('^ägg (kokt|rått|stekt)', '1 st', 60),
  ('^äggula', '1 st', 18),
  ('^äggvita', '1 st', 35),
  -- Kött, fågel, fisk
  ('^kyckling bröstfilé', '1 filé', 130),
  ('^kyckling (lårfilé|lår filé)', '1 filé', 90),
  ('^kalkon filé', '1 portion', 125),
  ('^kalkon rökt', '1 skiva', 10),
  ('^nöt färs', '1 portion', 125),
  ('^lax (odlad|vildfångad|stekt|kokt|varmrökt)', '1 bit', 125),
  ('^lax (gravad|kallrökt)', '1 skiva', 15),
  ('^torsk (rå|stekt|filé kokt)', '1 bit', 125),
  ('^tonfisk i (vatten|olja) konserv', '1 burk', 120),
  ('^räkor', '1 dl', 55),
  ('^tofu', '1 portion', 100),
  -- Mejeri
  ('^mjölk fett', '1 dl', 103),
  ('^mjölk fett', '1 glas', 200),
  ('^(filmjölk|yoghurt naturell|yoghurt mild)', '1 dl', 103),
  ('^yoghurt smaksatt m. sötningsm. fett 0%', '1 dl', 105),
  ('^kvarg (naturell|smaksatt|färskost)', '1 dl', 105),
  ('^kvarg (naturell|smaksatt)', '1 burk', 500),
  ('^keso', '1 dl', 95),
  ('^ost hårdost', '1 skiva', 10),
  ('^ost hårdost parmesan', '1 msk riven', 5),
  ('^ost mozzarella', '1 st', 125),
  ('^ost halloumi', '1 skiva', 30),
  ('^crème fraiche', '1 msk', 15),
  ('^smör (fett|osaltat|extrasaltat)', '1 tsk', 5),
  ('^smör (fett|osaltat|extrasaltat)', '1 msk', 14),
  -- Spannmål, bröd
  ('^havregryn( |$)', '1 dl', 35),
  ('^havregrynsgröt', '1 portion', 250),
  ('^ris .*okokt', '1 dl', 85),
  ('^ris .*\mkokt', '1 dl', 65),
  ('^pasta .*okokt', '1 dl', 40),
  ('^pasta .*\mkokt', '1 dl', 50),
  ('^(bulgur|couscous)$', '1 dl', 75),
  ('^(bulgur|couscous) (kokt|tillagad)', '1 dl', 60),
  ('^vetemjöl', '1 dl', 60),
  ('^bröd (vitt|fullkorn|rågsikt|osötat|fröbröd)', '1 skiva', 30),
  ('^bröd vitt (vetetortilla|tortilla)', '1 st', 40),
  ('^bröd vitt .*pitabröd', '1 st', 70),
  ('^knäckebröd', '1 st', 12),
  ('^majskorn', '1 dl', 65),
  -- Potatis, grönsaker
  ('^potatis (färsk|höst|kokt|rå|asterix|king edward|inova|solist|swift|mandelpotatis)', '1 st', 90),
  ('^sötpotatis', '1 st', 250),
  ('^tomat$', '1 st', 100),
  ('^tomat körsbärstomat', '1 st', 15),
  ('^tomat krossad', '1 förp', 400),
  ('^gurka$', '1 st', 350),
  ('^paprika (röd|gul|grön)', '1 st', 150),
  ('^lök (gul|röd)$', '1 st', 100),
  ('^morot$', '1 st', 70),
  ('^avokado$', '1 st', 150),
  ('^broccoli$', '1 dl', 30),
  ('^spenat färsk', '1 dl', 10),
  ('^majskolv', '1 st', 150),
  ('^kikärtor konserv', '1 förp', 265),
  -- Frukt, bär
  ('^banan$', '1 st', 120),
  ('^äpple (m\. skal|u\. skal|aroma|frida|golden|ingrid)', '1 st', 150),
  ('^apelsin$', '1 st', 130),
  ('^päron$', '1 st', 150),
  ('^kiwi', '1 st', 75),
  ('^mango$', '1 st', 300),
  ('^(blåbär|hallon|jordgubbar)( frysvara)?$', '1 dl', 65),
  ('^russin', '1 msk', 10),
  ('^dadlar', '1 st', 8),
  -- Fett, nötter, frön, sött
  ('^(olivolja|rapsolja|solrosolja|majsolja)', '1 msk', 13),
  ('^(olivolja|rapsolja|solrosolja|majsolja)', '1 tsk', 4.5),
  ('^jordnötssmör', '1 msk', 16),
  ('^(valnötter|cashewnötter|mandel )', '1 näve', 25),
  ('^(chiafrö|solrosfrö|pumpafrö)', '1 msk', 10),
  ('^honung$', '1 tsk', 7),
  ('^socker$', '1 tsk', 4),
  ('^socker$', '1 dl', 85)
) as r(pattern, unit, grams) on f.name ~* r.pattern
where f.coach_id is null
on conflict do nothing;

notify pgrst, 'reload schema';
