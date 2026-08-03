# Stefanie Schumacher — Site Rebuild

Next.js App Router + Sanity CMS rebuild of stefanie-schumacher.com.

## Start here

1. Read [`AGENTS.md`](./AGENTS.md) and everything in [`docs/`](./docs/).
2. Copy `.env.example` → `.env.local` and fill Sanity / Resend / Stripe values.
3. `npm install`
4. `npm run test:timezone` — must pass before any calendar/feed work.
5. `npm run seed` — requires `SANITY_API_WRITE_TOKEN`.
6. `npm run dev` → Studio at [http://localhost:3000/studio](http://localhost:3000/studio).

## Stripe + admin env

| Key | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Webhook + admin buyer lookup |
| `STRIPE_WEBHOOK_SECRET` | `checkout.session.completed` signature |
| `STRIPE_SERIES_PRODUCT_ID` | Product ID (`prod_…`) for the full-series pass |
| `ADMIN_USER` / `ADMIN_PASSWORD` | HTTP Basic for `/admin/*` and `/api/admin/*` (generated password; unset → 503, not open) |
| `CONTACT_FROM_EMAIL` / `RESEND_API_KEY` | Transactional email From + API |

Credential delivery is **date-based** (welcome if the session is more than 8 days away; Zoom details if 8 days or fewer). Series pass matching uses `STRIPE_SERIES_PRODUCT_ID` only (no Sanity series product field). Admin credential sends: `/admin/sessions`.

## Current milestone

Marketing site is live on Vercel preview. Outstanding: Sanity revalidate webhook, Resend domain, Stef confirmations (fees, photo, address, Squarespace), custom domain cutover.

Do **not** hardcode session fees as JSX fallbacks — missing Sanity values must fail visible (`Contact for current fees`). Workshop legal disclaimer may keep a hardcoded fail-safe.

## Docs that matter most

- `docs/workshop-schedule.md` — UTC table + DST trap for sessions 9–10
- `docs/content-corrections.md` — typo / copy fixes applied in seed
- `docs/metadata-truth.md` — ban list for Wix transferred-account metadata leftovers
- `docs/design-decision.md` — Direction C baseline; revisions still needed

Legacy research/prototype files remain under `design/`, `prototype/`, `site-audit/`, etc.
