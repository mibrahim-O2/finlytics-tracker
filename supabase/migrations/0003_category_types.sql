-- Finlytics — Phase 3 follow-up: separate income vs expense categories
-- Scoped change: adds categories.type, re-seeds default income categories,
-- and (re)applies the Data API grants. Existing categories and transactions
-- are untouched apart from being tagged type = 'expense'.

-- 1. Add the type column. The 'expense' default tags all 8 existing
--    categories as expense with no data loss.
alter table public.categories
  add column if not exists type text not null default 'expense'
  check (type in ('income', 'expense'));

-- 2. Category names are now unique per (user, type, name) instead of
--    (user, name), so income and expense lists are independent.
drop index if exists public.categories_user_name_key;
create unique index if not exists categories_user_type_name_key
  on public.categories (user_id, type, lower(name));

-- 3. Seed the default income categories for every existing user. Idempotent —
--    re-running does nothing thanks to ON CONFLICT.
insert into public.categories (user_id, name, icon, type)
select u.id, d.name, d.icon, 'income'
from auth.users u
cross join (values
  ('Salary',                  'Wallet'),
  ('Family/Gift',             'Gift'),
  ('Savings Withdrawal',      'PiggyBank'),
  ('Freelance/Personal Work', 'Briefcase'),
  ('Other Income',            'Landmark')
) as d(name, icon)
on conflict (user_id, type, lower(name)) do nothing;

-- 4. Data API grants — required on every migration that touches tables since
--    Supabase stopped auto-granting them (2026-05-30).
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
