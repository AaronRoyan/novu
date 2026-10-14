-- Email waitlist for the app launch, filled from the website's "App coming soon"
-- section. Visitors can add themselves; nobody can read the list through the API.

create table if not exists public.app_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    check (email = lower(email) and char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text not null default 'website' check (char_length(source) <= 64),
  created_at timestamptz not null default now()
);

alter table public.app_waitlist enable row level security;

-- Insert-only: with no select policy, existing emails can't be listed or probed.
create policy "Anyone can join the waitlist"
  on public.app_waitlist
  for insert
  to anon, authenticated
  with check (true);
