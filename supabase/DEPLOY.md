# Supabase Edge Functions & scheduling — deploy guide (Phase 7)

Email delivery (Resend) and the daily/monthly notification schedule. WhatsApp
stays disabled (`WHATSAPP_ENABLED=false`) — email only for now.

Everything here is done once. You need the **Supabase CLI**
(`npm i -g supabase` or scoop/brew) and a **Resend** account (free, no card).

---

## 1. Run the SQL migrations

Supabase dashboard → **SQL Editor** → run these in order if not already done:

1. `supabase/migrations/0004_reminder_snooze.sql`
2. `supabase/migrations/0005_notifications.sql`

If `0005` errors on `create extension pg_cron` / `pg_net`, open
**Database → Extensions**, enable **pg_cron** and **pg_net**, then re-run the file.

## 2. Get a Resend API key

1. resend.com → sign up → **API Keys → Create API Key** (name it "Finlytics").
2. Copy the key (starts `re_...`).
3. Sender address:
   - Quick test: use `Finlytics <onboarding@resend.dev>` (works with no domain).
   - Real: **Domains → Add Domain**, add the DNS records, then use
     `Finlytics <reports@yourdomain>`.

## 3. Link the project & set secrets

From the project root (`C:\Users\PMYLS\Documents\Projects\Finlytics`):

```bash
supabase login
supabase link --project-ref <YOUR-PROJECT-REF>
```

`<YOUR-PROJECT-REF>` is the subdomain of your project URL
(`https://<ref>.supabase.co`).

Generate a cron secret (any long random string), then:

```bash
supabase secrets set ^
  RESEND_API_KEY=re_xxxxxxxx ^
  "RESEND_FROM=Finlytics <onboarding@resend.dev>" ^
  CRON_SECRET=<your-random-string> ^
  WHATSAPP_ENABLED=false
```

(`^` is the Windows line-continuation character in `cmd`. In PowerShell use a
backtick `` ` `` or just put it all on one line.)

Verify: `supabase secrets list`

## 4. Deploy the functions

```bash
supabase functions deploy send-report
supabase functions deploy send-reminder
```

Both are deployed with `verify_jwt = false` (from `supabase/config.toml`) —
they check auth internally (your user JWT, or the cron secret).

## 5. Schedule the jobs (pg_cron)

Supabase dashboard → **SQL Editor** → paste, **replace the two placeholders**,
and run:

```sql
-- <PROJECT_REF>  = your project ref
-- <CRON_SECRET>  = the same value you set in step 3

-- Daily logging reminder — runs hourly; the function decides if it's time
-- (compares the user's reminder_time / snooze against Pakistan time).
select cron.schedule(
  'finlytics-daily-reminder',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/send-reminder',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
    body    := '{}'::jsonb
  );
  $$
);

-- Monthly statement (and the annual/partial-year summary each January) —
-- 00:30 UTC on the 1st = 05:30 Pakistan time.
select cron.schedule(
  'finlytics-monthly-report',
  '30 0 1 * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/send-report',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
    body    := jsonb_build_object('auto', true)
  );
  $$
);
```

Check what's scheduled: `select * from cron.job;`
To remove one: `select cron.unschedule('finlytics-daily-reminder');`

> **Partial-year report:** the monthly job on **1 Jan** sends the previous
> year's annual summary. If tracking started mid-year (e.g. Sep 2026), that
> report naturally covers only Sep–Dec 2026 — no separate job needed.

## 6. Test now (without waiting for cron)

**From the app:** open **Reports**, pick a month with data, click
**"Email me this report"** → you should receive the email within a minute.

**Reminder, via curl** (replace placeholders):

```bash
curl -X POST "https://<PROJECT_REF>.functions.supabase.co/send-reminder" ^
  -H "Content-Type: application/json" ^
  -H "x-cron-secret: <CRON_SECRET>" ^
  -d "{}"
```

A manual call always sends (bypasses the "is it the right hour?" check) so you
can confirm the email arrives.

**Monthly auto flow, via curl:**

```bash
curl -X POST "https://<PROJECT_REF>.functions.supabase.co/send-report" ^
  -H "Content-Type: application/json" ^
  -H "x-cron-secret: <CRON_SECRET>" ^
  -d "{\"auto\":true}"
```

## 7. Local testing (optional)

```bash
cp supabase/functions/.env.example supabase/functions/.env   # fill in values
supabase functions serve --env-file supabase/functions/.env
```

Then POST to `http://localhost:54321/functions/v1/send-reminder`.
