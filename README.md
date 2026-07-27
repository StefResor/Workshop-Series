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

**Schemas + seed only.** Marketing pages, tokens, Resend form, and feeds are next — after `docs/design-decision.md` revisions are filled in.

## Docs that matter most

- `docs/workshop-schedule.md` — UTC table + DST trap for sessions 9–10
- `docs/content-corrections.md` — typo / copy fixes applied in seed
- `docs/metadata-truth.md` — ban list for Austin / Gender Psychotherapy / Trans-Anon leftovers
- `docs/design-decision.md` — Direction C baseline; revisions still needed

Legacy research/prototype files remain under `design/`, `prototype/`, `site-audit/`, etc.
