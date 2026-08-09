-- ============================================================
-- AWEN Supabase Database Schema  (idempotent — safe to re-run)
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  timezone text default 'Asia/Kolkata',
  observation_mode boolean default true,
  observation_start timestamptz default now(),
  observation_day integer default 1,
  baseline_confidence text default 'Learning',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- TRIGGER: Auto-create profile row on new user signup
-- Fires for BOTH Email/Password AND Google OAuth sign-ups
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, timezone, observation_mode, baseline_confidence)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'),
    new.email,
    'Asia/Kolkata',
    true,
    'Learning'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLE: physiological_readings
-- ============================================================
create table if not exists public.physiological_readings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  heart_rate numeric,
  spo2 numeric,
  temperature numeric,
  activity_state text,
  data_source text default 'demo',
  created_at timestamptz default now()
);

alter table public.physiological_readings enable row level security;

drop policy if exists "Users can view own readings"   on public.physiological_readings;
drop policy if exists "Users can insert own readings" on public.physiological_readings;

create policy "Users can view own readings"
  on public.physiological_readings for select
  using (auth.uid() = user_id);

create policy "Users can insert own readings"
  on public.physiological_readings for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLE: user_checkins
-- ============================================================
create table if not exists public.user_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mood text,
  activity_context text,
  notes text,
  created_at timestamptz default now()
);

alter table public.user_checkins enable row level security;

drop policy if exists "Users can view own checkins"   on public.user_checkins;
drop policy if exists "Users can insert own checkins" on public.user_checkins;

create policy "Users can view own checkins"
  on public.user_checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert own checkins"
  on public.user_checkins for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLE: awen_conversations
-- ============================================================
create table if not exists public.awen_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_message text,
  awen_response text,
  topic text default 'general',
  created_at timestamptz default now()
);

alter table public.awen_conversations enable row level security;

drop policy if exists "Users can view own conversations"   on public.awen_conversations;
drop policy if exists "Users can insert own conversations" on public.awen_conversations;

create policy "Users can view own conversations"
  on public.awen_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.awen_conversations for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLE: user_baselines
-- ============================================================
create table if not exists public.user_baselines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  resting_hr numeric default 70,
  resting_spo2 numeric default 98,
  resting_temp numeric default 36.6,
  hr_variance numeric default 8,
  confidence text default 'Learning',
  updated_at timestamptz default now()
);

alter table public.user_baselines enable row level security;

drop policy if exists "Users can view own baseline"   on public.user_baselines;
drop policy if exists "Users can insert own baseline" on public.user_baselines;
drop policy if exists "Users can update own baseline" on public.user_baselines;

create policy "Users can view own baseline"
  on public.user_baselines for select
  using (auth.uid() = user_id);

create policy "Users can insert own baseline"
  on public.user_baselines for insert
  with check (auth.uid() = user_id);

create policy "Users can update own baseline"
  on public.user_baselines for update
  using (auth.uid() = user_id);
