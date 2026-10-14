-- The app uploads a run's points in batches and retries a batch after a lost
-- response, so the same point can be sent twice. One row per run and
-- timestamp makes those retries harmless: the app inserts with
-- ON CONFLICT (run_id, recorded_at) DO NOTHING.

-- Remove any duplicates already stored, keeping the first copy.
delete from public.run_locations duplicate
using public.run_locations original
where duplicate.run_id = original.run_id
  and duplicate.recorded_at = original.recorded_at
  and duplicate.id > original.id;

create unique index if not exists run_locations_run_id_recorded_at_key
  on public.run_locations (run_id, recorded_at);

-- The unique index serves the same lookups as this one.
drop index if exists public.run_locations_run_recorded_at_idx;
