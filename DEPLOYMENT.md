# Finlytics — Deployment (Phase 8)

Do this only after Phase 1–7 manual testing has passed. Frontend → Vercel,
backend → Supabase (already live). 100% free tier.

---

## A. Prerequisites

- The GitHub repo `mibrahim-O2/finlytics-tracker` is pushed and up to date.
- Supabase project is set up, all migrations `0001`–`0005` have been run.
- Edge Functions deployed and cron scheduled (`supabase/DEPLOY.md`).
- A Vercel account (free), signed in with GitHub.

## B. Deploy the frontend to Vercel

1. Vercel → **Add New… → Project** → import `mibrahim-O2/finlytics-tracker`.
2. Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output directory `dist` — already set in `vercel.json`, leave as is.
3. **Environment Variables** — add both (Production, Preview, Development):

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://<your-ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | your publishable / anon key (same as local `.env`) |

4. **Deploy**. Note the production URL, e.g. `https://finlytics-tracker.vercel.app`.

## C. Point Supabase Auth at the live URL

Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL:** `https://finlytics-tracker.vercel.app`
- **Redirect URLs:** add `https://finlytics-tracker.vercel.app/**`

## D. Update the cron target (if the functions URL is unchanged, skip)

The functions URL (`https://<ref>.functions.supabase.co/...`) does not change on
frontend deploy, so the pg_cron jobs from `supabase/DEPLOY.md` keep working.
Nothing to do unless you rotated `CRON_SECRET` — then re-run step 5 there.

## E. Post-deploy smoke test (live URL)

| # | Action | Expected |
|---|---|---|
| D.1 | Visit the Vercel URL logged out | Redirects to `/login`. |
| D.2 | Hard-refresh `/transactions` (deep link) | Still resolves (no 404) — the SPA rewrite works. |
| D.3 | Sign in with your account | Lands on the dashboard with your real data. |
| D.4 | Add a transaction | Persists; reload the page — still there (talking to Supabase from prod). |
| D.5 | Reports → "Email me this report" | Email arrives (Edge Function reachable from prod). |
| D.6 | Open DevTools console | No CORS errors, no failed Supabase calls. |
| D.7 | Lighthouse / mobile view | Layout is responsive; no horizontal scroll. |
| D.8 | `cron.job` in Supabase SQL editor | Both jobs listed and `active`. |

## F. Final commit

Add the production URL to `README.md` and commit:

```
docs: add live deployment URL
```
