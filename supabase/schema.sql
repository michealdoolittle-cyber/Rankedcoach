-- RankedCoach persistence schema.
-- Run this in Supabase SQL Editor for the project used by the app's anon key.

create extension if not exists pgcrypto;

create table if not exists public.users_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  riot_id text,
  region text default 'NA',
  profile_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users_profiles add column if not exists riot_id text;
alter table public.users_profiles add column if not exists region text default 'NA';
alter table public.users_profiles add column if not exists profile_json jsonb not null default '{}'::jsonb;
alter table public.users_profiles add column if not exists created_at timestamptz not null default now();
alter table public.users_profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.vip_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_profile_id text,
  profiles_json jsonb not null default '[]'::jsonb,
  log_entries_json jsonb not null default '[]'::jsonb,
  theme_builder_json jsonb not null default '{}'::jsonb,
  theme_builder_ui_json jsonb not null default '{}'::jsonb,
  current_theme_key text default 'default',
  last_save_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reflection_logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null default 'default',
  match_id text,
  agent text,
  role text,
  map text,
  focus text,
  rating numeric,
  mood text,
  team_comms numeric,
  self_comms numeric,
  notes text not null default '',
  warmup boolean not null default false,
  entry_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reflection_logs_user_created_idx
  on public.reflection_logs (user_id, created_at desc);

create index if not exists reflection_logs_user_focus_idx
  on public.reflection_logs (user_id, focus);

create table if not exists public.match_snapshots (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null default 'default',
  riot_match_id text,
  source text default 'app',
  map text,
  agent text,
  role text,
  result text,
  rr_change numeric,
  kills numeric,
  deaths numeric,
  assists numeric,
  acs numeric,
  match_json jsonb not null default '{}'::jsonb,
  played_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists match_snapshots_user_played_idx
  on public.match_snapshots (user_id, played_at desc);

create index if not exists match_snapshots_user_context_idx
  on public.match_snapshots (user_id, map, agent, role);

create table if not exists public.account_security_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  recovery_email text,
  recovery_phone text,
  mfa_enabled boolean not null default false,
  mfa_method text check (mfa_method in ('email', 'phone') or mfa_method is null),
  last_password_change_at timestamptz,
  password_fingerprint_history jsonb not null default '[]'::jsonb,
  security_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.account_security_preferences add column if not exists recovery_email text;
alter table public.account_security_preferences add column if not exists recovery_phone text;
alter table public.account_security_preferences add column if not exists mfa_enabled boolean not null default false;
alter table public.account_security_preferences add column if not exists mfa_method text;
alter table public.account_security_preferences add column if not exists last_password_change_at timestamptz;
alter table public.account_security_preferences add column if not exists password_fingerprint_history jsonb not null default '[]'::jsonb;
alter table public.account_security_preferences add column if not exists security_json jsonb not null default '{}'::jsonb;
alter table public.account_security_preferences add column if not exists created_at timestamptz not null default now();
alter table public.account_security_preferences add column if not exists updated_at timestamptz not null default now();

alter table public.users_profiles enable row level security;
alter table public.vip_app_state enable row level security;
alter table public.reflection_logs enable row level security;
alter table public.match_snapshots enable row level security;
alter table public.account_security_preferences enable row level security;

drop policy if exists "users_profiles_select_own" on public.users_profiles;
create policy "users_profiles_select_own"
  on public.users_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "users_profiles_insert_own" on public.users_profiles;
create policy "users_profiles_insert_own"
  on public.users_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "users_profiles_update_own" on public.users_profiles;
create policy "users_profiles_update_own"
  on public.users_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users_profiles_delete_own" on public.users_profiles;
create policy "users_profiles_delete_own"
  on public.users_profiles for delete
  using (auth.uid() = user_id);

drop policy if exists "vip_app_state_select_own" on public.vip_app_state;
create policy "vip_app_state_select_own"
  on public.vip_app_state for select
  using (auth.uid() = user_id);

drop policy if exists "vip_app_state_insert_own" on public.vip_app_state;
create policy "vip_app_state_insert_own"
  on public.vip_app_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "vip_app_state_update_own" on public.vip_app_state;
create policy "vip_app_state_update_own"
  on public.vip_app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "vip_app_state_delete_own" on public.vip_app_state;
create policy "vip_app_state_delete_own"
  on public.vip_app_state for delete
  using (auth.uid() = user_id);

drop policy if exists "reflection_logs_select_own" on public.reflection_logs;
create policy "reflection_logs_select_own"
  on public.reflection_logs for select
  using (auth.uid() = user_id);

drop policy if exists "reflection_logs_insert_own" on public.reflection_logs;
create policy "reflection_logs_insert_own"
  on public.reflection_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "reflection_logs_update_own" on public.reflection_logs;
create policy "reflection_logs_update_own"
  on public.reflection_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reflection_logs_delete_own" on public.reflection_logs;
create policy "reflection_logs_delete_own"
  on public.reflection_logs for delete
  using (auth.uid() = user_id);

drop policy if exists "match_snapshots_select_own" on public.match_snapshots;
create policy "match_snapshots_select_own"
  on public.match_snapshots for select
  using (auth.uid() = user_id);

drop policy if exists "match_snapshots_insert_own" on public.match_snapshots;
create policy "match_snapshots_insert_own"
  on public.match_snapshots for insert
  with check (auth.uid() = user_id);

drop policy if exists "match_snapshots_update_own" on public.match_snapshots;
create policy "match_snapshots_update_own"
  on public.match_snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "match_snapshots_delete_own" on public.match_snapshots;
create policy "match_snapshots_delete_own"
  on public.match_snapshots for delete
  using (auth.uid() = user_id);

drop policy if exists "account_security_preferences_select_own" on public.account_security_preferences;
create policy "account_security_preferences_select_own"
  on public.account_security_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "account_security_preferences_insert_own" on public.account_security_preferences;
create policy "account_security_preferences_insert_own"
  on public.account_security_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "account_security_preferences_update_own" on public.account_security_preferences;
create policy "account_security_preferences_update_own"
  on public.account_security_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "account_security_preferences_delete_own" on public.account_security_preferences;
create policy "account_security_preferences_delete_own"
  on public.account_security_preferences for delete
  using (auth.uid() = user_id);
