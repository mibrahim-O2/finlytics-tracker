-- Finlytics — Phase 3: core database schema
-- Tables: categories, transactions, goals, notification_settings
-- Every table is scoped to the signed-in user via Row-Level Security. Even
-- though this is a single-user product, data is isolated per auth.uid() so the
-- anon (unauthenticated) role can read/write nothing.

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null check (char_length(trim(name)) between 1 and 40),
  icon       text not null default 'Tag',
  created_at timestamptz not null default now()
);

-- Case-insensitive unique category name per user.
create unique index if not exists categories_user_name_key
  on public.categories (user_id, lower(name));

alter table public.categories enable row level security;

drop policy if exists "categories_own_rows" on public.categories;
create policy "categories_own_rows" on public.categories
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- transactions
-- Deleting a category sets category_id to NULL (ON DELETE SET NULL) so existing
-- transactions are never orphaned and totals stay correct — the app shows such
-- rows as "Uncategorized".
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  amount      numeric(12,2) not null check (amount > 0),
  type        text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id) on delete set null,
  note        text check (note is null or char_length(note) <= 280),
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);
create index if not exists transactions_user_category_idx
  on public.transactions (user_id, category_id);

alter table public.transactions enable row level security;

drop policy if exists "transactions_own_rows" on public.transactions;
create policy "transactions_own_rows" on public.transactions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- goals  (monthly expense target as a min–max range; one row per month)
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month      int not null check (month between 1 and 12),
  year       int not null check (year between 2000 and 2100),
  min_amount numeric(12,2) not null check (min_amount >= 0),
  max_amount numeric(12,2) not null check (max_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month),
  check (max_amount >= min_amount)
);

alter table public.goals enable row level security;

drop policy if exists "goals_own_rows" on public.goals;
create policy "goals_own_rows" on public.goals
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notification_settings  (exactly one row per user)
-- ---------------------------------------------------------------------------
create table if not exists public.notification_settings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  reminder_time    time not null default '08:00',
  email_enabled    boolean not null default true,
  whatsapp_enabled boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.notification_settings enable row level security;

drop policy if exists "notification_settings_own_rows" on public.notification_settings;
create policy "notification_settings_own_rows" on public.notification_settings
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists trg_notification_settings_updated_at on public.notification_settings;
create trigger trg_notification_settings_updated_at
  before update on public.notification_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Data API grants
-- Since 2026-05-30 Supabase no longer auto-grants table privileges to the API
-- roles on new projects, so RLS alone is not enough — the table privilege must
-- be granted explicitly or PostgREST returns "permission denied for table".
-- The RLS policies above still restrict every request to the user's own rows.
-- Only the `authenticated` role is granted; `anon` is intentionally left with
-- no access to any Finlytics table (this is a private single-user app).
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.categories,
  public.transactions,
  public.goals,
  public.notification_settings
to authenticated;
