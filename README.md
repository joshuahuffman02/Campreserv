# Campreserv

A TypeScript/Node.js backend starter for a campground management and booking system. It includes Prisma schema, Express routes, and availability search logic ready for PostgreSQL.

## Getting started

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

## Key API routes (initial draft)
- `POST /auth/register` – create user; returns JWT
- `POST /auth/login` – login user; returns JWT
- `POST /auth/guest-token` – short-lived token for accountless checkout
- `GET /campgrounds` – list campgrounds
- `POST /campgrounds` – create campground (admin)
- `GET /sites` – list sites
- `POST /sites` – create site (admin)
- `GET /availability?campgroundId=...&startDate=...&endDate=...` – search available sites
- `POST /reservations` – create reservation after availability check
- `PATCH /reservations/:id/status` – update reservation status (staff/admin)

## Notes
- Payments: default to immediate capture via Stripe Payment Intents; can be adapted to auth/hold + capture by toggling intent confirmation.
- Guests can book without accounts via `guest-token`, but creating an account is encouraged for self-service edits.
- Pricing rules, blackout handling, and OTA sync are modeled in the Prisma schema for future expansion.

## Tests

```bash
npm test
```

Includes a small overlap utility test; extend with integration tests after wiring a test database.
