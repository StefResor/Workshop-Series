# AGENTS.md — Stefanie Schumacher site rebuild

Read this file and everything in `/docs` before writing any code.

## Stack pins (looked up on npm 2026-07-27 — do not "correct" toward training data)

| Package | Version | Notes |
|---|---|---|
| `next` | `16.2.12` | App Router only. No Pages Router. No `pages/api`. |
| `react` / `react-dom` | `19.2.8` | |
| `typescript` | `7.0.2` | Next 16 needs `experimental.useTypeScriptCli: true` in `next.config.ts` until it supports the TS 7 compiler API. |
| `sanity` | `6.6.0` | Studio + schema. Not 3.x / 4.x. |
| `next-sanity` | `13.2.2` | Not v5 patterns. |
| `@sanity/client` | `7.25.0` | **Peer of next-sanity — install explicitly.** |
| `styled-components` | `6.4.4` | **Peer for Sanity Studio — install explicitly.** App UI still uses CSS tokens, not styled-components. |
| `@sanity/vision` | `6.6.0` | Match `sanity` major/minor. |
| `stripe` | `22.4.0` | Server webhook + Checkout Session lookup. Not used in client components. |

Do not invent older Sanity v2 `sanityClient` configs, `lib/sanity.js` patterns, or Pages Router API routes.

## Architecture rules

1. **Schemas before pages.** Content lives in Sanity. Do not hardcode copy into JSX.
2. **Embedded Studio** at `/studio` (`app/studio/[[...tool]]/page.tsx` + root `sanity.config.ts`).
3. **Design tokens** live in `app/styles/tokens.css`. No one-off hex in components.
4. **Workshop datetimes** are stored as ISO **UTC** strings from `docs/workshop-schedule.md` verbatim. Never recompute or convert when seeding. Render with `America/New_York` and an explicit EDT/EST label.
5. **Contact form**: Resend only — no DB persistence. Honeypot + rate limit. PHI disclaimer. `replyTo` = submitter. From-address on verified subdomain `send.stefanie-schumacher.com`.
6. **Metadata** comes from `siteSettings` seeded from `docs/metadata-truth.md`. Nothing from the "wrong" table may appear anywhere. `*.vercel.app` (and localhost) must be `noindex` via request-host checks in root metadata **and** `robots.ts`.
7. **Fees** from Sanity only — never invent JSX price fallbacks. Mark seed values `// CONFIRM WITH STEF`.
8. **`NEXT_PUBLIC_SITE_URL`**: pre-cutover = Vercel alias so feeds/OG/sitemap absolute URLs hit a live Next host. Apex domain only after DNS points here. Host-based noindex covers the alias either way.

## Site map

`/`, `/about`, `/approach`, `/workshops`, `/workshops/[slug]`, `/fees`, `/contact`, `/terms` (rewrite → `/policies/terms`; `/privacy` same pattern when published)

Private agency notes (`correspondence/`, `meetings/`, `ideas/`) live in **endesignllc/endesign-stef-notes**, not this client-facing repo.

## Feeds + revalidation

`/events.json`, `/events.ics`, per-event JSON-LD. Timezone assertion in `docs/workshop-schedule.md` must pass before feed code. Studio is noindex'd in metadata — do not Disallow `/studio` in robots.txt (blocked URLs never see noindex).

Sanity publish webhook: see `docs/revalidate-webhook.md`. **Filter must exclude drafts** (`!(_id in path("drafts.**"))`) or Studio autosave will hammer `/api/revalidate`.

## Env keys (`.env.example`)

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=2026-07-27
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=
SANITY_REVALIDATE_SECRET=
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
RESEND_SEGMENT_WORKSHOPS_ID=
RESEND_SEGMENT_BLOG_PRACTICE_ID=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
WORKSHOP_FROM_EMAIL=
WORKSHOP_REPLY_TO=
CRON_SECRET=
```

Pre-cutover `NEXT_PUBLIC_SITE_URL` should be `https://stefanie-schumacher-com.vercel.app` so `/events.ics` and OG URLs resolve to Next, not Wix. Switch to `https://stefanie-schumacher.com` at DNS cutover.

Workshop registration: see `docs/workshop-registration-system.md`. Webhook matches Payment Link metadata `workshop_slug` / `series_slug` → Sanity workshop/series, writes `registration` docs, sends confirmation (no Zoom). Cron at `/api/cron/workshop-credentials` sends Zoom from `zoomLink` / `zoomPasscode` eight days out. Never project `zoomLink` / `zoomPasscode` / `stripeProductId` in public GROQ.

The `production` dataset is **private**. `SANITY_API_READ_TOKEN` (Viewer) must be set on Vercel — without it, pages render empty shells (no workshops/fees). Create under Sanity → project → API → Tokens.

## Images

Content images are served through the Sanity image CDN via `@sanity/image-url` with `auto('format')` and explicit width/quality. Do not convert or re-encode at upload — originals are preserved and format is negotiated per request.

Provide `urlForImage()` in `lib/image.ts`. All image URLs go through it; no hand-built Sanity CDN URLs in components.

Always set explicit width and height to prevent layout shift. Responsive `srcset` via the helper (`imageSrcSet`).

Exceptions — must **NOT** be WebP:

- `og:image` and `twitter:image` must be PNG or JPEG (social platforms have unreliable WebP support), minimum 1200×630. Use `urlForImage(src, { width: 1200, height: 630, format: 'jpg' })` (or `png`).
- Favicon is SVG with PNG fallback.

Static images committed to `/public` should be WebP, except the OG and favicon assets above.

## Current task scope gate

If the user asks for schemas + seed only: **do not** create marketing pages, layouts, components, or styling beyond what Studio requires.

If the user asks for data/routes only: **do not** create marketing pages, components, layouts, design tokens, or styling.
