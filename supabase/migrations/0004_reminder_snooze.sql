-- Finlytics — Phase 6: "remind me later" support
-- Stores the user-picked follow-up reminder time so both the in-app nudge and
-- the Phase 7 email reminder can honour it. Null = no snooze active.

alter table public.notification_settings
  add column if not exists snooze_until timestamptz;

-- Re-apply grants (required on every migration touching tables since 2026-05-30).
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.notification_settings to authenticated;
