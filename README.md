# Campreserv

A TypeScript/Node.js backend starter for a campground management and booking system, now paired with a modern React web UI
prototype and an events-first Camp Everyday theme.

## Getting started (API)

1. Install dependencies

```bash
npm install
```

2. Copy env template and configure secrets

```bash
cp .env.example .env
```

3. Generate Prisma client and run migrations (after configuring `DATABASE_URL`)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run the API in dev mode

```bash
npm run dev
```

Key API routes (initial draft):
- `POST /auth/register` – create user; returns JWT
- `POST /auth/login` – login user; returns JWT
- `POST /auth/guest-token` – short-lived token for accountless checkout
- `GET /campgrounds` – list campgrounds
- `POST /campgrounds` – create campground (admin)
- `GET /events` – list events (optional filters for campground/featured)
- `POST /events` – create or edit events (staff/admin)
- `GET /deals` – list deals by campground, event, or date
- `POST /deals` – create or edit deals (staff/admin)
- `GET /campgrounds/:id/settings` – fetch campground-specific policies, taxes, and fees
- `POST /campgrounds/:id/charges` – add/update campground-level taxes/fees (per stay / per night / per person / per pet)
- `PUT /campgrounds/:id/policies` – set cancellation, refund, quiet hours, and booking window rules per campground
- `POST /campgrounds/:id/memberships` – assign per-campground roles (owner, manager, front desk, maintenance, finance, marketing, read-only)
- `GET /sites` – list sites
- `POST /sites` – create site (admin)
- `GET /availability?campgroundId=...&startDate=...&endDate=...` – search available sites
- `POST /reservations` – create reservation after availability check
- `PATCH /reservations/:id/status` – update reservation status (staff/admin)

Notes:
- Payments: default to immediate capture via Stripe Payment Intents; can be adapted to auth/hold + capture by toggling intent confirmation.
- Guests can book without accounts via `guest-token`, but creating an account is encouraged for self-service edits.
- Pricing rules, blackout handling, and OTA sync are modeled in the Prisma schema for future expansion. Campground-specific tax/fee and cancellation policy tables are included.
- SMS/Email providers are configurable via environment variables (example uses Postmark + Twilio) and set to test by default.

## Modern web UI prototype (React)
The `web/` folder contains a Vite + React + TypeScript experience with a booking hero, availability table, admin dashboard snapshot, and auth entry points. Data is mocked for now; wire API calls to the backend as endpoints stabilize.

### Run the web app

```bash
cd web
npm install
npm run dev
```

The UI uses a dark glassmorphic theme, reusable cards, chips, KPIs, and responsive grids suitable for both guests and staff views. Update `web/src/components` as APIs are finalized.

If you want a quick static preview without running the dev server, open `web/preview.html` directly in your browser. The preview and SPA now use the Camp Everyday palette and logo to mirror the uploaded branding.

## Tests

```bash
npm test
```

Includes a small overlap utility test; extend with integration tests after wiring a test database.
