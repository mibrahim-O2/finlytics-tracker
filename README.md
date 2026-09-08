# Finlytics

A personal, single-user expense tracker. Daily transaction log, visual spending
analytics, editable monthly goals, and automated motivational reminders/reports —
built on a 100% free-tier stack.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS + Framer Motion + Recharts + Lucide Icons |
| Backend / DB | Supabase (Postgres, Auth, Row-Level Security, Edge Functions) |
| Email | Resend (free tier) — Phase 7 |
| WhatsApp | WhatsApp Business Cloud API free tier, behind a feature flag — Phase 7 |
| Hosting | Vercel (frontend) + Supabase (backend) |

## Local setup

Requires Node.js 18+.

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:5173
```

### Environment variables

Edit `.env` (gitignored — never commit it):

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project → Settings → API → "Project URL" |
| `VITE_SUPABASE_ANON_KEY` | Supabase project → Settings → API → "anon" / "public" key |

Resend and WhatsApp variables are documented in `.env.example` and are not
needed until Phase 7.

## Project structure

```
src/
  components/   Reusable UI (AppLayout, ConnectionStatus, ...)
  pages/        Dashboard, Transactions, Categories, Goals, Reports, Settings
  lib/          Supabase client, formatting helpers
  hooks/        Custom React hooks
  styles/       Design tokens (mirrors tailwind.config.js)
supabase/
  migrations/   SQL schema migrations (Phase 3+)
  functions/    Edge functions — email, whatsapp, reports (Phase 6-7)
```

## Build phases

Delivery follows the phased plan in `ARCHITECTURE.md` (Phase 0 analysis →
Phases 1–7 features → Phase 8 deployment). This commit completes **Phase 1 —
Project Setup & Core Structure**.
