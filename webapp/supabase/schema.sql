-- Platform Timer — Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
--
-- Design note: only account/plan status and the saved-schedule library live
-- here. Live timer countdowns and presenter sync are ephemeral and never
-- touch the database (see src/lib/presenterChannel.js) — this keeps the
-- schema small and avoids write-amplification from sub-second timer ticks.

-- ── profiles ──────────────────────────────────────────────────────────────
-- One row per auth.users row, created automatically by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_premium boolean not null default false,
  premium_since timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Deliberately no INSERT/UPDATE policy for regular users: profiles are created
-- only by the handle_new_user trigger, and is_premium is only ever flipped by
-- the server (via the service-role key, which bypasses RLS) after a verified
-- Stripe webhook. If you later add user-editable fields (e.g. display_name),
-- add a narrow UPDATE policy scoped to just those columns.

-- Auto-create a profile row whenever a new auth user is created (covers
-- normal sign-ups AND admin-invited accounts created by the Stripe webhook).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── schedules ─────────────────────────────────────────────────────────────
-- The cloud-synced schedule library (premium feature — free users keep their
-- schedules in browser localStorage only, see src/store/useTimerStore.js).
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  room_name text,
  timers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.schedules enable row level security;

create policy "Users can manage their own schedules"
  on public.schedules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists schedules_user_id_idx on public.schedules (user_id);
