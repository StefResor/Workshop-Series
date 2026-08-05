# Stefanie Schumacher — Site Rebuild

Next.js App Router + Sanity CMS rebuild of stefanie-schumacher.com.

## Start here

1. Read [`AGENTS.md`](./AGENTS.md) and everything in [`docs/`](./docs/).
2. Copy `.env.example` → `.env.local` and fill Sanity / Resend / Stripe values.
3. `npm install`
4. `npm run test:timezone` — must pass before any calendar/feed work.
5. `npm run seed` — requires `SANITY_API_WRITE_TOKEN`.
6. `npm run dev` → Studio at [http://localhost:3000/studio](http://localhost:3000/studio).

## Stripe + workshop registration

| Key | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Webhook + thank-you Checkout Session lookup |
| `STRIPE_WEBHOOK_SECRET` | Signature for `POST /api/stripe/webhook` |
| `WORKSHOP_FROM_EMAIL` | From on confirmation / credentials mail |
| `WORKSHOP_REPLY_TO` | Reply-To on those mails |
| `CRON_SECRET` | Bearer for `GET /api/cron/workshop-credentials` |
| `CONTACT_FROM_EMAIL` / `RESEND_API_KEY` | Contact form + Resend API |

Registration and credentials flow: see [`docs/workshop-registration-system.md`](./docs/workshop-registration-system.md). Payment Links must carry `workshop_slug` or `series_slug` metadata.

## Current milestone

Marketing site is live on Vercel preview. Outstanding: Sanity revalidate webhook, Resend domain, Stef confirmations (fees, photo, address), custom domain cutover, Payment Link metadata migration to `workshop_slug` / `series_slug`.

Do **not** hardcode session fees as JSX fallbacks — missing Sanity values must fail visible (`Contact for current fees`). Workshop legal disclaimer may keep a hardcoded fail-safe.

## Docs that matter most

- `docs/workshop-registration-system.md` — purchase, confirmations, cron credentials
- `docs/workshop-schedule.md` — UTC table + DST trap for sessions 9–10
- `docs/content-corrections.md` — typo / copy fixes applied in seed
- `docs/metadata-truth.md` — ban list for Wix transferred-account metadata leftovers
- `docs/design-decision.md` — Direction C baseline; revisions still needed

Legacy research/prototype files remain under `design/`, `prototype/`, `site-audit/`, etc.
