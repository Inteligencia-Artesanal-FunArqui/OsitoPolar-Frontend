# Demo mode (OsitoPolar Vue frontend)

Runs the real screens, routes and components against a local, backend-shaped mock. No backend, network, payment, Stripe or email is involved. CoolFreeze is the company, OsitoPolar the product.

## Run

```sh
npm ci --ignore-scripts
VITE_DEMO_MODE=true npm run dev -- --host 127.0.0.1 --port 4174
```

Open `/sign-in` and press "Usar cuenta demo" (or type the credentials):

| Account | User | Password | Type |
|---|---|---|---|
| Owner (default) | `pedro@demo.local` | `Demo123!` | Owner, plan Standard (Snow Bear, 12 units) |
| Provider | `tecnofrio@demo.local` | `Demo123!` | Provider, plan Medium Company (30 clients), TecnoFrio S.A.C. |

The frontend does not gate pages by role, so company pages (`/company/service-requests`, `/technicians`, `/work-orders`) work with either account. Never enable `VITE_DEMO_MODE` in a real deployment.

## Scenario (synthetic, based on `server/db.json` and the real backend contracts)

- Equipment: 10 units from db.json (XK-400, CF-200, MR-100, XK-500, CR-300 + 5 more) in 5 Lima locations. Unit 1 (XK-400) is drifting warm (critical) and drives an alert; 7 is in maintenance, 9 is out of service, 2 and 5 are rented, 8 is leased. Readings and daily summaries are generated live and end exactly at each unit's current values.
- Service requests: 10, one or more per status (pending, accepted, in progress, resolved, completed, cancelled, rejected). Work orders: 6. Technicians: 4. Notifications: 9 (5 unread).
- Plans: the 6 seeded backend plans (owner 1-3, provider 4-6). Profile: real `UserResource` shape (plan, balance, usage).
- Rental (no real backend, legacy db.json shapes): 6 catalog items with inline SVG images, per-item pricing tiers, rental requests. Checkout is **simulated**: the request is stored locally (draft, then submitted, stock is reserved); nothing is charged.
- Contact: static page (CoolFreeze contact data); `GET /contact` mirrors it.

## Blocked on purpose

Payments, Stripe checkout, plan changes, sign-up and external registration answer a clear "disabled in the demo" message (HTTP 403). Unknown routes reject locally with "Operación no incluida en la demostración"; the adapter never falls back to the network. Maps/geolocation are disabled.

## Persistence and reset

Mutations (equipment, requests, work orders, technicians, notifications, rental...) are saved in `localStorage` key `ositopolar-vue-demo-state` (state version 2). Old v1 state (`ositopolar-vue-demo-v1`) is ignored and removed, and corrupted or outdated state reseeds automatically.

Reset to the seed: run `ositopolarDemo.reset()` in the browser console (reloads the page), or delete the key and reload. Sign out/in does not reset data.

## Code layout (`src/demo`)

`mock-api.mjs` (axios adapter, state load/save, `resetDemoState`) · `core.mjs` (errors, enum normalisers, router) · `seed/*` (catalog, equipment, operations, rental, images) · `routes/*` (iam, equipment + analytics, notifications, service requests, technicians + work orders, rental, legacy json-server collections) · `analytics.mjs` (synthetic telemetry).

Decisions where db.json, the backend and the frontend models disagree are commented in the seed/route files (flat PascalCase equipment enums, lowercase_underscore request/work-order status, `orderNumber` format, technician availability, provider company id 3).

## Checks

```sh
node --test src/demo/*.test.mjs   # adapter families, db.json coverage, validators
npx vite build
```
