create extension if not exists pgcrypto with schema extensions;

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'discarded')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  distance_meters double precision not null default 0,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.run_locations (
  id bigserial primary key,
  run_id uuid not null references public.runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_at timestamptz not null,
  latitude double precision not null,
  longitude double precision not null,
  altitude double precision,
  accuracy double precision,
  speed double precision,
  heading double precision,
  distance_from_previous_meters double precision not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists runs_user_started_at_idx
  on public.runs(user_id, started_at desc);

create index if not exists run_locations_run_recorded_at_idx
  on public.run_locations(run_id, recorded_at);

alter table public.runs enable row level security;
alter table public.run_locations enable row level security;

create policy "Users can manage their own runs"
  on public.runs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own run locations"
  on public.run_locations
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.runs
      where runs.id = run_locations.run_id
        and runs.user_id = auth.uid()
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists runs_set_updated_at on public.runs;

create trigger runs_set_updated_at
  before update on public.runs
  for each row
  execute function public.set_updated_at();
