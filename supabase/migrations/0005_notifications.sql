-- Finlytics — Phase 7: notification delivery log + scheduling extensions
-- The Edge Functions (send-reminder, send-report) write one row here per
-- delivery so scheduled runs are idempotent (no duplicate emails).

create table if not exists public.notification_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('reminder', 'monthly_report', 'annual_report')),
  period_key text not null,             -- e.g. '2026-09-08', '2026-09', '2026'
  channel    text not null default 'email' check (channel in ('email', 'whatsapp')),
  status     text not null default 'sent',
  detail     text,
  created_at timestamptz not null default now(),
  unique (user_id, kind, period_key, channel)
);

create index if not exists notification_log_user_created_idx
  on public.notification_log (user_id, created_at desc);

alter table public.notification_log enable row level security;

-- The app only needs to read its own history; all writes happen via the
-- service role inside Edge Functions (which bypasses RLS).
drop policy if exists "notification_log_read_own" on public.notification_log;
create policy "notification_log_read_own" on public.notification_log
  for select
  using (user_id = auth.uid());

grant usage on schema public to authenticated;
grant select on public.notification_log to authenticated;

-- Scheduling extensions. If either line errors, enable it once from
-- Dashboard → Database → Extensions, then re-run this file.
create extension if not exists pg_cron;
create extension if not exists pg_net;
