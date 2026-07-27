# Mount Zion Timer — Web

A professional, browser-based event timer with a full-screen presenter view, live cross-device sync, and a
freemium paywall (5 free timers → unlimited for a one-time upgrade, €20 minimum, pay more if you'd like). This is
the web rewrite of the original Electron desktop app (still available at the repo root) — same core timer
experience, now hostable on the internet with no installer.

Everything here — static site, backend, DNS — runs on **Cloudflare** (Pages + Pages Functions), with **Supabase**
for auth/database and **Stripe** for payment. Chosen deliberately for cost: a `.com` domain via Cloudflare
Registrar plus Cloudflare Pages' free tier is roughly the entire hosting bill.

## What's included

- **React 18 + Vite + Tailwind** front end, light/dark/system theme, installable as a PWA.
- **Freemium gating**: unauthenticated/free users get 5 timers, enforced client-side with an upgrade paywall UI.
- **Stripe Checkout** one-time payment (`functions/api/`) that unlocks unlimited timers and creates an account.
- **Supabase** for auth (email/password + magic link) and cloud sync of saved schedules — entirely optional; the
  app runs fully local-only (localStorage) if you never configure it.
- **Presenter view** at `/present/:roomCode`, kept live via `BroadcastChannel` (same device, zero config) and,
  when Supabase is configured, Supabase Realtime broadcast (any device — control from a phone, display on a
  projector laptop across the room).
- Extras: agenda templates, auto-advance, configurable warning thresholds, QR-code share, undo-on-delete, keyboard
  shortcuts, drag-and-drop reordering.

## Project layout

```
webapp/
├── src/                    # React app
│   ├── pages/                # Route-level screens (Dashboard, Presenter, Landing, Auth, Pricing…)
│   ├── components/            # Reusable UI (TimerTile, modals, header, toasts…)
│   ├── store/                  # Zustand stores (timer/room state, UI state)
│   ├── context/                # AuthContext (Supabase session + profile)
│   └── lib/                     # time/sound helpers, Supabase client, Stripe checkout, presenter sync, plan limits
├── functions/api/           # Cloudflare Pages Functions: Stripe checkout + webhook, health check
├── functions/_lib/          # Shared backend helper (Supabase admin actions) — not a route (leading _)
├── scripts/createAdmin.js  # Local-only Node script: grant premium access directly, bypassing Stripe
├── supabase/schema.sql     # DB schema + RLS policies + signup trigger
├── wrangler.toml             # Cloudflare project config
└── public/                    # PWA icons, manifest, favicon
```

**Why Functions instead of a regular Node server**: Pages Functions deploy alongside the static site on the same
Cloudflare project — same domain, same deploy, same free tier, no CORS, no separate service to keep alive or pay
for. They run on Cloudflare's edge network (Workers runtime) rather than Node, which is why `functions/` code uses
Web-standard `Request`/`Response` and reads config from a per-request `env` object instead of `process.env`.

## Quick start (local-only mode — no signup required)

The app is fully usable with zero configuration: local storage persistence, the 5-timer free cap, and the
presenter view all work out of the box.

```bash
cd webapp
npm install
npm run dev
```

Open http://localhost:5174 → `/app` is the control panel. Open `/present/<room-code>` (shown in the Presenter
share dialog) in a second tab to see the live display. This mode has no working `/api/*` calls (see below for that).

## Enabling accounts, cloud sync, and payments

These three features are optional and gated behind environment variables — the app degrades gracefully without
them (an "Accounts aren't set up yet" screen replaces login, and the upgrade button shows a clear error instead of
silently failing).

### 1. Supabase (auth + cloud schedule sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` from this repo — it creates `profiles` and `schedules` tables with
   row-level security, plus a trigger that auto-creates a `profiles` row for every new `auth.users` signup.
3. **Project Settings → API Keys** → copy the **Project URL** and **anon public key** into `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` in `.env` (frontend — see `.env.example`).
4. Same page → copy the **service_role key** into `SUPABASE_SERVICE_ROLE_KEY`, and the Project URL into
   `SUPABASE_URL`, in **`.dev.vars`** (backend — see `.dev.vars.example`). This key must never reach the browser
   or land in `.env`, which is why it lives in a separate file.
5. In Authentication → Email Templates, the default "Invite user" template is what new paying customers receive to
   set their password; customize it if you like.
6. Once you have a real domain (see Deployment below), add it under **Authentication → URL Configuration → Redirect
   URLs** (e.g. `https://mountziontimer.com/**`) — Supabase rejects auth redirects to domains not on this list.

### 2. Stripe (one-time upgrade, €20 minimum — customer can pay more)

1. Create a Stripe account, then **Product catalog → Add product** — "Mount Zion Timer — Unlimited", one-time.
   Under pricing, choose **"Customer chooses price"** (not a fixed amount), set a **minimum** of €20 and a
   **preset/suggested** amount of €20 (leave maximum blank). This makes Stripe's own Checkout page show an
   editable amount field, enforced server-side by Stripe — no custom code needed on our end. Copy the resulting
   **Price ID** into `STRIPE_PRICE_ID` in `.dev.vars`.
2. Copy your **Secret key** into `STRIPE_SECRET_KEY` (`.dev.vars`), and the **Publishable key** into
   `VITE_STRIPE_PUBLISHABLE_KEY` (`.env` — currently only used for display; all charging happens server-side).
3. For local testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run
   `stripe listen --forward-to localhost:8788/api/stripe-webhook` — it prints a `whsec_...`, put that in
   `STRIPE_WEBHOOK_SECRET` (`.dev.vars`). In production, add a webhook endpoint in the Stripe dashboard pointing at
   `https://mountziontimer.com/api/stripe-webhook`, subscribed to `checkout.session.completed`.

### 3. Run the full stack locally (frontend + Functions together)

```bash
cp .env.example .env             # frontend values
cp .dev.vars.example .dev.vars   # backend secrets — fill in both files
npm run dev:full                  # http://localhost:8788 — Wrangler serves Functions + proxies to Vite
```

Plain `npm run dev` (port 5174, no `/api/*`) is faster for pure UI iteration when you don't need working payments.

## How the paywall actually works

- The free-tier cap (`VITE_FREE_TIMER_LIMIT`, default 5) is enforced in `src/lib/plan.js` and checked before every
  timer/template add in `Dashboard.jsx` — hitting it opens `UpgradeModal`.
- Clicking upgrade calls `POST /api/create-checkout-session` (`functions/api/create-checkout-session.js`), which
  creates a Stripe Checkout Session. If the user is already logged in, their Supabase user id rides along as
  `client_reference_id`; otherwise just their email is collected.
- On successful payment, Stripe calls `POST /api/stripe-webhook`. The handler either flips
  `profiles.is_premium = true` for the existing user, or — for a brand-new customer — creates a Supabase account
  via `admin.inviteUserByEmail` and marks it premium, so payment and account creation happen in the same step (see
  `functions/_lib/supabaseAdmin.js`).
- `is_premium` is never writable by the client (no RLS policy grants users UPDATE on `profiles`) — only the
  service-role key, used exclusively in the webhook, can set it.

## Deployment (Cloudflare)

### 1. Buy the domain

**[Cloudflare Registrar](https://dash.cloudflare.com) → Domain Registration → Register a domain** → search
`mountziontimer.com` → purchase (at-cost pricing, WHOIS privacy included free, roughly $9–10/year for `.com`).

### 2. Create the Pages project

Simplest path — direct upload from your machine, no GitHub required:

```bash
npx wrangler login          # opens a browser to authorize Wrangler against your Cloudflare account
npm run deploy               # builds (vite build) then runs `wrangler pages deploy dist`
```

The first run asks you to name the project (e.g. `mount-zion-timer`) and creates it. You'll get a
`*.pages.dev` URL immediately — that already works end-to-end (minus custom domain and secrets, next steps).

*(Alternative: connect this repo on GitHub and link it in the Cloudflare dashboard under Workers & Pages → Create
→ Pages → Connect to Git, with build command `npm run build` and build output directory `dist`. That gets you
auto-deploy on every push instead of running `npm run deploy` by hand — a nice upgrade once things stabilize, but
not required to launch.)*

### 3. Set production secrets

`.dev.vars` is for local dev only and is never uploaded. Set the same names as real Pages secrets:

```bash
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name mount-zion-timer
npx wrangler pages secret put STRIPE_PRICE_ID --project-name mount-zion-timer
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name mount-zion-timer
npx wrangler pages secret put SUPABASE_URL --project-name mount-zion-timer
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name mount-zion-timer
```

Each prompts for the value interactively (nothing lands in shell history). The `VITE_*` frontend values, by
contrast, get baked into the build at deploy time — set them as **Environment variables** (not secrets, they're
public anyway) under the Pages project's **Settings → Environment variables** in the dashboard, then redeploy.

### 4. Attach the domain

Pages project → **Custom domains → Set up a custom domain** → enter `mountziontimer.com` (and `www.mountziontimer.com`
if you want that too). Since the domain's already on Cloudflare, DNS records get added automatically — no manual
DNS editing, and SSL provisions itself within a few minutes.

### 5. Point Stripe and Supabase at the real domain

- Stripe dashboard → **Developers → Webhooks → Add endpoint** → `https://mountziontimer.com/api/stripe-webhook`,
  event `checkout.session.completed`. Copy its signing secret and update the `STRIPE_WEBHOOK_SECRET` Pages secret
  (step 3) — it's different from your local `stripe listen` one.
- Supabase → **Authentication → URL Configuration** → add `https://mountziontimer.com/**` to Redirect URLs (see
  step 6 in the Supabase setup above).
- Supabase → **Authentication → Settings → SMTP Settings**: connect a real email provider (Resend, Postmark,
  SendGrid…) before relying on this in production — Supabase's built-in mailer is rate-limited to a handful of
  emails/hour, which is fine for testing but will silently fail to deliver "set your password" emails to new
  paying customers once you get more than a couple of signups per hour.

That's the whole stack live: `mountziontimer.com` → Cloudflare Pages (frontend + Functions) → Supabase (data/auth)
→ Stripe (payment) — no other services, no other bills beyond the domain and whatever Stripe/Supabase usage costs
you accrue as real customers show up.

## Relationship to the desktop app

The original Electron app (`../src`, `../package.json` at the repo root) is untouched and still builds normally —
this web app is a parallel, from-scratch rewrite, not a migration in place. Rooms/timers/schedules created in the
desktop app do not automatically appear here (different storage — desktop uses `electron-store`, web uses
`localStorage`/Supabase); there's no cross-import between the two today.
