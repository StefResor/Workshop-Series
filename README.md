# Stefanie Schumacher — Site Rebuild

Next.js App Router + Sanity CMS rebuild of stefanie-schumacher.com.

## Start here

1. Read [`AGENTS.md`](./AGENTS.md) and everything in [`docs/`](./docs/).
2. Copy `.env.example` → `.env.local` and fill Sanity / Resend values.
3. `npm install`
4. `npm run test:timezone` — must pass before any calendar/feed work.
5. `npm run seed` — requires `SANITY_API_WRITE_TOKEN`.
6. `npm run dev` → Studio at [http://localhost:3000/studio](http://localhost:3000/studio).

## Current milestone

Marketing site is live on Vercel preview. Outstanding: Sanity revalidate webhook, Resend domain, Stef confirmations (fees, photo, address, Squarespace), custom domain cutover.

Do **not** hardcode session fees as JSX fallbacks — missing Sanity values must fail visible (`Contact for current fees`). Workshop legal disclaimer may keep a hardcoded fail-safe.

## Docs that matter most

- `docs/workshop-schedule.md` — UTC table + DST trap for sessions 9–10
- `docs/content-corrections.md` — typo / copy fixes applied in seed
- `docs/metadata-truth.md` — ban list for Wix transferred-account metadata leftovers
- `docs/design-decision.md` — Direction C baseline; revisions still needed

Legacy research/prototype files remain under `design/`, `prototype/`, `site-audit/`, etc.
