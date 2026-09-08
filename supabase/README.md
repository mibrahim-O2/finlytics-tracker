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

## Verifying (matches the Phase 2 manual test steps)

- Logged out, visiting any app URL redirects to `/login`.
- Wrong password shows an inline error; correct credentials land on the Dashboard.
- In the dashboard **Authentication → Users**, try **Add user** again — it fails
  with "Finlytics is a single-user application."
