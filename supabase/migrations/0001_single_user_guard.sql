-- Finlytics — Phase 2: Authentication
-- Single-user product: enforce "only one account can ever exist" at the database
-- level, as a backstop to disabling public sign-up in the Supabase dashboard.
--
-- Per-table Row-Level Security policies are added in Phase 3 alongside the
-- core tables (categories, transactions, goals, notification_settings). This
-- migration only covers the auth layer.

-- 1. Block creation of a second auth user.
create or replace function public.enforce_single_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from auth.users) >= 1 then
    raise exception 'Finlytics is a single-user application. An account already exists.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_single_user on auth.users;
create trigger trg_enforce_single_user
  before insert on auth.users
  for each row execute function public.enforce_single_user();

-- 2. Helper used by every Phase 3 table policy: "is this the signed-in user?"
--    Kept here so the pattern is defined once.
create or replace function public.is_authenticated()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated';
$$;
