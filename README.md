# LaneOS

Freight operations SaaS for owner operators and small fleets. Automate load booking, document management, and revenue recovery.

## Mission

1. **More booked loads** — AI email parsing turns broker offers into loads instantly
2. **Less administrative work** — Rate con parser, document vault, broker CRM
3. **Faster payments** — Revenue recovery engine for detention, lumper, accessorials

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Web      | Next.js 16, TypeScript, Tailwind 4  |
| Mobile   | Expo 56, React Native, Expo Router  |
| Backend  | Supabase (Postgres, Auth, Storage)  |
| AI       | OpenAI GPT-4o-mini (with regex fallback) |

## Project Structure

```
LaneOS/
├── apps/
│   ├── web/          # Next.js dashboard
│   └── mobile/       # Expo React Native app
├── packages/
│   └── shared/       # Shared TypeScript types
└── supabase/
    └── migrations/   # Database schema + RLS
```

## Features (Phase 1)

- **Authentication** — Supabase Auth with org onboarding
- **Loads** — Full lifecycle tracking (available → paid)
- **Drivers & Trucks** — Fleet management
- **Documents** — Upload to Supabase Storage
- **Broker CRM** — Contacts, payment terms, interaction log
- **Facilities** — Shipper/receiver database with dock intel
- **AI Email Parser** — Paste broker emails → structured load data
- **Rate Confirmation Parser** — Extract fields from rate con text
- **Revenue Recovery** — AI analysis for missed detention/lumper/TONU

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/20250607000001_initial_schema.sql` via the SQL editor
3. Copy your project URL and anon key

### 2. Web App

```bash
cd apps/web
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Seed fleet data (optional)

After migrations, load sample carrier data into your Supabase project:

```bash
# Add SUPABASE_SERVICE_ROLE_KEY to apps/web/.env.local (Dashboard → Settings → API Keys)
npm run db:seed
```

Sign up at `/signup` — new accounts are linked to the seeded **Koper Express LLC** org with loads, drivers, brokers, documents, and claims.

### 3. Mobile App

```bash
cd apps/mobile
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY

npm start
```

## Environment Variables

| Variable | App | Required |
|----------|-----|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Web | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web | Yes |
| `OPENAI_API_KEY` | Web | No (regex fallback) |
| `NEXT_PUBLIC_APP_URL` | Web | Yes (OAuth callbacks) |
| `GOOGLE_CLIENT_ID` | Web | For Gmail integration |
| `GOOGLE_CLIENT_SECRET` | Web | For Gmail integration |
| `MICROSOFT_CLIENT_ID` | Web | For Outlook integration |
| `MICROSOFT_CLIENT_SECRET` | Web | For Outlook integration |
| `EXPO_PUBLIC_SUPABASE_URL` | Mobile | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile | Yes |

## Integrations

### Document scanning
- Upload PDFs or photos in **Documents** — AI OCR + field extraction
- Auto-classifies BOL, POD, rate con, lumper, detention
- Review and edit key data (load #, rate, dates, detention hours)
- Auto-links documents to loads by load/reference number
- Driver mobile app: camera capture uploads to storage

### Email accounts
- Connect **Gmail** or **Outlook** at `/dashboard/integrations`
- **Auto-scan**: polls inbox for broker load offers, parses with AI
- High-confidence offers auto-create loads in booking queue
- **Auto-send**: POD submission, detention notices, invoice follow-ups
- View scanned emails at `/dashboard/email-inbox`

Run migration `supabase/migrations/20250608000001_integrations_and_scanning.sql` after the initial schema.

## Go Live (Supabase + Vercel)

Supabase is your **backend** (database, auth, storage). The Next.js app still needs a host — **Vercel** is the fastest path and pairs well with Supabase.

Your project `guugfijvliettsjtkcvv` is already provisioned: 16 tables with RLS, `documents` storage bucket, and seeded org data. Verify anytime with `npm run db:test`.

### 1. Supabase Auth URLs (required)

In [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/guugfijvliettsjtkcvv/auth/url-configuration):

| Setting | Value |
|---------|-------|
| **Site URL** | `https://YOUR-PRODUCTION-DOMAIN` (e.g. `https://laneos.vercel.app`) |
| **Redirect URLs** | `https://YOUR-PRODUCTION-DOMAIN/**` |

Keep `http://localhost:3000/**` in redirect URLs for local dev.

### 2. Deploy to Vercel

1. Push this repo to GitHub (if not already).
2. [vercel.com/new](https://vercel.com/new) → Import the repo.
3. **Root Directory:** `apps/web` (Framework Preset: Next.js — defaults are fine).
4. Add **Environment Variables** (Production):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://guugfijvliettsjtkcvv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Dashboard → Settings → API Keys (publishable/anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | From Dashboard → Settings → API Keys (**server only**, never `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://laneos.vercel.app` |
| `OPENAI_API_KEY` | Optional — AI parsing falls back to regex without it |

5. Deploy. After the first deploy, copy the Vercel URL and update Supabase Auth URLs (step 1) if you used a placeholder.

CLI alternative from repo root:

```bash
npx vercel --prod
```

### 3. OAuth integrations (optional, for email)

If using Gmail/Outlook at `/dashboard/integrations`, add production redirect URIs:

- Google: `https://YOUR-DOMAIN/api/integrations/email/callback`
- Microsoft: same callback URL

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` in Vercel.

### 4. Custom domain (optional)

- **Vercel:** Project → Settings → Domains
- **Supabase Auth:** update Site URL + Redirect URLs to your custom domain
- Re-run step 3 OAuth redirect URIs with the custom domain

### 5. Post-launch checks

- Sign up at `/signup` on production (creates profile + org membership)
- Upload a document at `/dashboard/documents` (tests Storage + RLS)
- Confirm dashboard loads live data, not demo mode (`npm run db:test` should return `200`)

## Roadmap (Incremental)

- [x] Gmail/Outlook email integration (auto-ingest broker emails)
- [x] PDF OCR for rate confirmations
- [ ] Invoice generation and factoring integrations
- [ ] Driver mobile app: POD photo upload, detention timer
- [ ] Load board integrations (DAT, Truckstop)
- [ ] QuickBooks / accounting sync
- [ ] Multi-org team permissions
- [ ] Push notifications for load updates

## License

Private — All rights reserved.
