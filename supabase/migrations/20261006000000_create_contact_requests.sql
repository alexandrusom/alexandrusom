-- Consultation requests from the booking form (/boka/).
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (phone ~ '^\+?[0-9]{7,15}$'),
  topic text not null check (topic in ('fat_loss', 'muscle', 'health', 'programs', 'other')),
  message text check (char_length(message) <= 2000),
  consent boolean not null check (consent),
  consent_text text not null,
  lang text not null check (lang in ('sv', 'en'))
);

create index contact_requests_created_at_idx on public.contact_requests (created_at desc);

-- Row level security with no policies: only the submit-contact Edge Function (service role) can insert.
alter table public.contact_requests enable row level security;
