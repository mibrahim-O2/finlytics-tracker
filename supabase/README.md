# Supabase setup

This folder holds database migrations and Edge Functions. All steps below are
done once, by hand, in the Supabase dashboard for the Finlytics project.

## Phase 2 — Authentication

### A. Add your Supabase keys to the app

Create **`C:\Users\PMYLS\Documents\Projects\Finlytics\.env`** (copy from
`.env.example`) and fill:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon/public key>
```

Both values: Supabase dashboard → **Settings → API**. Restart `npm run dev`
after saving.

### B. Disable public sign-up

Supabase dashboard → **Authentication → Sign In / Providers → Email**:

1. Keep **"Enable Email provider"** ON.
2. Turn **"Allow new users to sign up"** OFF.
3. (Optional) Turn **"Confirm email"** OFF — with one known account it just adds
   friction. If you leave it ON, you must click the confirmation link before the
   first login works.
4. Click **Save**.

### C. Create the one account

Supabase dashboard → **Authentication → Users → Add user → Create new user**:

- Email: your email
- Password: choose a strong one
- Tick **"Auto Confirm User"** so you can log in immediately.

This is the only account. The app has no sign-up screen by design.

### D. Run the migration

Supabase dashboard → **SQL Editor → New query**. Paste the entire contents of
[`migrations/0001_single_user_guard.sql`](migrations/0001_single_user_guard.sql)
and click **Run**.

This installs a trigger that raises an error if anyone tries to create a second
auth user — a database-level backstop to step B.

> Run this **after** step C. If you run it before creating your account, the
> first "Add user" will also be blocked (the trigger fires when
> `count(*) >= 1`, so zero existing users is fine — but do step C first to be safe).

## Phase 3 — Core schema

Supabase dashboard → **SQL Editor → New query**. Paste the entire contents of
[`migrations/0002_core_schema.sql`](migrations/0002_core_schema.sql) and click
**Run**.

This creates `categories`, `transactions`, `goals`, and `notification_settings`,
enables Row-Level Security on all four (scoped to `auth.uid()`), and adds the
`updated_at` triggers. Run it once; it is safe to re-run (`if not exists` /
`drop policy if exists` throughout).

The **default categories** (Travel, Shopping, Family & Relatives, Friends &
Social, Hoteling, Party & Outings, Bills & Utilities, Others) are **not** seeded
by SQL — the app inserts them automatically the first time you open it with an
empty `categories` table.

## Phase 5 — set a monthly goal for testing (temporary)

The editable goal UI is built in Phase 6. To test the dashboard progress ring
before then, insert a goal row for the current month via **SQL Editor**:

```sql
-- Single-user app, so "the one account" = the only row in auth.users.
insert into public.goals (user_id, month, year, min_amount, max_amount)
values (
  (select id from auth.users order by created_at limit 1),
  extract(month from now())::int,
  extract(year from now())::int,
  5000, 10000
)
on conflict (user_id, year, month)
do update set min_amount = excluded.min_amount, max_amount = excluded.max_amount;
```

Adjust `5000` / `10000` to change where the 70% (amber) and 100% (red) zone
thresholds fall. The SQL editor runs as an admin role (RLS is bypassed there),
so this insert works even though `auth.uid()` is null in that context.

## Verifying (matches the Phase 2 manual test steps)

- Logged out, visiting any app URL redirects to `/login`.
- Wrong password shows an inline error; correct credentials land on the Dashboard.
- In the dashboard **Authentication → Users**, try **Add user** again — it fails
  with "Finlytics is a single-user application."
