# Swift CRM

**SwiftDash AI · "Never lose a customer."**

A lightweight CRM for real-estate professionals: leads, properties,
follow-ups, site visits, deals, and expenses — in one simple workspace.

This is a real, runnable MVP (Next.js 14 App Router + TypeScript +
Tailwind + Supabase). It was generated as source code — you need to
install dependencies and connect your own Supabase project before it
will run, following the steps below.

---

## 1. Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account/project

## 2. Set up Supabase

1. Create a new Supabase project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. In the Supabase SQL editor, run `supabase/schema.sql` (this creates all
   8 tables, RLS policies, and triggers). Run it once, top to bottom.
4. (Optional) In **Authentication → Providers → Email**, you can disable
   "Confirm email" while developing so signup logs you straight in.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected
to `/login`. Sign up with an email + password to create your first account.

## 5. (Optional) Load demo data

1. Sign up once in the app.
2. In Supabase → **Authentication → Users**, copy your new user's UUID.
3. Open `supabase/seed.sql`, replace `YOUR_USER_ID` with that UUID.
4. Run the file in the Supabase SQL editor.

This adds 4 sample leads, 5 sample properties (Whitefield, Indiranagar,
Electronic City, Gurgaon), a couple of follow-ups, a site visit, a deal,
and a few expenses — all clearly demo data you can delete any time from
the Table Editor.

---

## What's included (P0 + P1 from the brief)

- **Auth** — Supabase Auth (email/password), protected routes via middleware
- **Dashboard** — live metrics, "Attention Required" cards, recent leads, recent activity
- **Leads** — table + mobile cards, search, status filters, create/edit drawer, full detail page
- **Lead detail** — requirement, pending follow-up with Complete/Reschedule, matching properties, site visits, activity timeline
- **Properties** — inventory list, search, status filters, create/edit drawer, detail page with matching leads
- **Follow-ups** — Overdue / Today / Upcoming / Completed tabs, Complete/Reschedule actions
- **Site Visits** — schedule, mark completed with outcome, cancel
- **Deals** — commission auto-calculated from deal value × %, payment status, won/lost
- **Expenses** — simple log, this month's total, category breakdown
- **Settings** — edit name/agency/phone, log out
- **Lead ↔ Property matching** — deterministic (no AI): property type, BHK, location, budget overlap (`src/lib/utils.ts` → `isMatch`)
- **WhatsApp** — every "Open WhatsApp" button builds a `wa.me` deep link with a pre-filled message. It opens WhatsApp; you still tap Send. There is no automated sending, by design.
- **Row Level Security** — every table is scoped to `auth.uid() = user_id`; users can only ever see their own data.

## Intentionally not built (per the brief)

No AI features, no WhatsApp Business API/automation, no email automation,
no push notifications, no billing, no advanced multi-tenant/team roles.
The architecture (separate `lib/`, typed domain objects, one table per
concern) leaves room to add these later without a rewrite.

## Project structure

```
src/
  app/
    login/                 Login + signup
    auth/callback/         Email-confirmation redirect handler
    (app)/                 Protected routes, wrapped in the sidebar layout
      dashboard/
      leads/, leads/[id]/
      properties/, properties/[id]/
      followups/
      site-visits/
      deals/
      expenses/
      settings/
  components/               UI split by feature (leads/, properties/, ...)
  lib/
    supabase/                client.ts, server.ts, middleware.ts
    types.ts                 Domain types matching supabase/schema.sql
    utils.ts                 Formatting, WhatsApp links, matching, validation
supabase/
  schema.sql                 Full schema + RLS (run this first)
  seed.sql                   Demo data (optional, run after signing up)
```

## Notes on this build

This codebase was written directly as files — it has not been run through
`npm install` / `npm run build` in the environment that generated it (no
network access there). Everything follows standard, well-trodden
Next.js App Router + `@supabase/ssr` patterns, but budget a few minutes
after `npm install` to fix any small TypeScript nits before your first
`npm run dev`.
