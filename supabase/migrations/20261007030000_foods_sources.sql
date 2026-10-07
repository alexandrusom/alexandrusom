-- Food sources (Livsmedelsverket import vs your own), favourites, and a "dishes" category.
alter table public.foods
  add column source text not null default 'mine' check (source in ('livsmedelsverket', 'mine')),
  add column lmv_number integer unique, -- Livsmedelsverket's food number, so re-imports update instead of duplicating
  add column lmv_group text,            -- Livsmedelsverket's own food group, e.g. "Fågel"
  add column favorite boolean not null default false;

alter table public.foods drop constraint foods_category_check;
alter table public.foods add constraint foods_category_check
  check (category in ('protein', 'carbs', 'fat', 'vegetables', 'fruit', 'dairy', 'dishes', 'snacks', 'drinks', 'other'));

create index foods_favorite_idx on public.foods (favorite) where favorite;
