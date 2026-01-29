-- 1) Table
create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_lower text generated always as (lower(email)) stored,
  source text,
  created_at timestamptz not null default now()
);

-- 2) Unique so duplicates don't spam your DB
create unique index if not exists waitlist_signups_email_lower_key
  on public.waitlist_signups (email_lower);

-- 3) RLS
alter table public.waitlist_signups enable row level security;

-- 4) Allow anyone to INSERT (anon + authenticated), but nobody can SELECT/UPDATE/DELETE
drop policy if exists "waitlist_insert_anyone" on public.waitlist_signups;
create policy "waitlist_insert_anyone"
on public.waitlist_signups
for insert
to anon, authenticated
with check (true);
