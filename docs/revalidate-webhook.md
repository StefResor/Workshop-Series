# Sanity → Vercel revalidation webhook

Endpoint: `POST /api/revalidate`  
Handler: `app/api/revalidate/route.ts`  
Secret env: `SANITY_REVALIDATE_SECRET` (same value in Sanity webhook + Vercel + `.env.local`)

## Setup (Sanity → API → Webhooks)

1. **URL** — preview: `https://stefanie-schumacher-com.vercel.app/api/revalidate`. Update to the production domain at cutover.
2. **Secret** — paste `SANITY_REVALIDATE_SECRET`. Must match Vercel env.
3. **Dataset** — `production` (or whatever `NEXT_PUBLIC_SANITY_DATASET` is).
4. **Filter (required)** — published documents only:

```
!(_id in path("drafts.**"))
```

Without this, Studio autosave fires the webhook on nearly every keystroke while editing. That hammers revalidation for as long as someone is typing.

5. **Projection (recommended)** — keep the original slug shape:

```
{_type, slug}
```

Do **not** flatten with `"slug": slug.current`. The handler unwraps `{ current }` via `slugValue()`; a flattened string also works today, but the object form matches Sanity’s native payload and is the safer default. Bandwidth difference is negligible.

6. **Trigger** — create / update / delete on the dataset.

## End-to-end test

Publish a **workshop** edit from Studio (not a draft autosave — **Publish**). Confirm **without** a redeploy:

1. The **individual** `/workshops/[slug]` page shows the edit (this is the one that fails if `slug` is lost).
2. `/workshops` index, `/sitemap.xml`, `/events.json`, and `/events.ics` update too.

If it does not appear immediately: wait up to ~2 minutes before concluding failure. Feeds use `revalidate = 60` plus the Sanity API CDN, so a missed or delayed webhook can leave stale content until those layers expire.

## Local check

```bash
SANITY_REVALIDATE_SECRET=… npx tsx scripts/verify-revalidate.ts
```
