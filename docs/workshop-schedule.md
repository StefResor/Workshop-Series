# Workshop schedule — Relational Diplomacy Series (2026)

**Canonical local wall time:** Wednesdays **7:00–8:30 PM** in `America/New_York`.  
**Storage rule:** Sanity `startsAt` / `endsAt` are ISO **UTC**. Seed these strings **verbatim** — do not recompute.

US DST ends **2026-11-01** (first Sunday in November). Sessions 1–8 are **EDT** (UTC−4). Sessions 9–10 are **EST** (UTC−5).

## Critical DST / UTC-date bug

For sessions 9 and 10, 7:00 PM Eastern is **exactly midnight UTC**, so the **UTC calendar date is the following day** (Thursday). Naive code that takes `startsAt.slice(0,10)` or formats in UTC will show **Thursday** and wrong times in `.ics` feeds — which then land in people's real calendars.

| # | Local date (Wed) | Local start | Zone | `startsAt` (UTC) | `endsAt` (UTC) | UTC date |
|---|---|---|---|---|---|---|
| 1 | 2026-09-09 | 7:00 PM | EDT | `2026-09-09T23:00:00.000Z` | `2026-09-10T00:30:00.000Z` | Wed |
| 2 | 2026-09-16 | 7:00 PM | EDT | `2026-09-16T23:00:00.000Z` | `2026-09-17T00:30:00.000Z` | Wed |
| 3 | 2026-09-23 | 7:00 PM | EDT | `2026-09-23T23:00:00.000Z` | `2026-09-24T00:30:00.000Z` | Wed |
| 4 | 2026-09-30 | 7:00 PM | EDT | `2026-09-30T23:00:00.000Z` | `2026-10-01T00:30:00.000Z` | Wed |
| 5 | 2026-10-07 | 7:00 PM | EDT | `2026-10-07T23:00:00.000Z` | `2026-10-08T00:30:00.000Z` | Wed |
| 6 | 2026-10-14 | 7:00 PM | EDT | `2026-10-14T23:00:00.000Z` | `2026-10-15T00:30:00.000Z` | Wed |
| 7 | 2026-10-21 | 7:00 PM | EDT | `2026-10-21T23:00:00.000Z` | `2026-10-22T00:30:00.000Z` | Wed |
| 8 | 2026-10-28 | 7:00 PM | EDT | `2026-10-28T23:00:00.000Z` | `2026-10-29T00:30:00.000Z` | Wed |
| 9 | 2026-11-04 | 7:00 PM | EST | `2026-11-05T00:00:00.000Z` | `2026-11-05T01:30:00.000Z` | **Thu** |
| 10 | 2026-11-11 | 7:00 PM | EST | `2026-11-12T00:00:00.000Z` | `2026-11-12T01:30:00.000Z` | **Thu** |

## Titles (seed)

1. "I'm right, you're wrong" — The Fight That Never Ends  
2. If We Can't Control Our Partner, Why Do We Keep Trying?  
3. Why Unleashing on Your Partner Never Gets You Heard  
4. The Destructive Force of Retaliation  
5. The Withdrawal Trap  
6. The Art & Skill of Acceptance  
7. The Art & Skill of Listening to Understand  
8. Responsible Distance-Taking & Responsible Feedback  
9. The Art of Generosity & Empowering Your Partner  
10. The Art of the Apology  

Price: default **$47** per participant on `siteSettings.defaultWorkshopPrice` (mark `// CONFIRM WITH STEF` in seed). Per-workshop `price` is an optional override. Location: Zoom. Status: published.

## Timezone assertion (write this test before any feed code)

Using `America/New_York`:

1. Session **1** (`2026-09-09T23:00:00.000Z`) renders local time **7:00 PM** with label **EDT**.  
2. Session **10** (`2026-11-12T00:00:00.000Z`) renders local time **7:00 PM** with label **EST**.  
3. Session **10** local **calendar date** is **Wednesday, November 11, 2026** — not Thursday Nov 12.

## Workshop schema fields

Document type: `workshop`

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `slug` | slug | from title (no `workshop-N-` prefix) |
| `sessionNumber` | number | 1–10 |
| `startsAt` | datetime | UTC ISO from table |
| `endsAt` | datetime | UTC ISO from table |
| `timeZone` | string | always `America/New_York` |
| `price` | number | optional override; else `siteSettings.defaultWorkshopPrice` ($47 seeded) |
| `hook` | string | max ~90 chars; cards / social |
| `stripePaymentLink` | url | Stripe Payment Link (public CTA) |
| `capacity` | number | optional; empty = unlimited |
| `registrationStatus` | string | `draft` \| `open` \| `sold-out` \| `past` |
| `shortDescription` | text | feed / cards |
| `body` | text | full event page (plain text paragraphs for now) |
| `status` | string | `published` \| `draft` |
| `zoomRegistrationUrl` | url | Zoom public registration page (may appear on site/feeds) |
| `locationLabel` | string | default `Zoom` |
| `stripeProductId` | string | **Private** — Stripe Product ID (`prod_…`); maps checkout → workshop |
| `zoomLink` | url | **Private** — Zoom join URL for paid-buyer confirmation email only |
| `zoomPasscode` | string | **Private** — Zoom passcode for paid-buyer confirmation email only |

Private fields live under Studio fieldset **Registration (private)**. They must never appear in public GROQ projections, pages, feeds, sitemaps, or client bundles. Join credentials are emailed via the Stripe webhook → Resend flow after `checkout.session.completed`, and via the admin tool at `/admin/sessions`.

### Credential delivery rule (date only)

Compare `Date.now()` to the workshop’s stored UTC `startsAt` instant (never `startsAt.slice(0,10)` — sessions 9–10 are Thursday in UTC):

| Days until `startsAt` (UTC) | Email |
|---|---|
| **> 8** | Welcome — schedule, no Zoom credentials |
| **≤ 8** (including past) | Confirmation **with** Zoom credentials |

Stef also sends credentials manually ~8 days before each session. Duplicate credential emails are expected; do not dedupe send history.

### Series pass

Identified by env **`STRIPE_SERIES_PRODUCT_ID`** (Stripe Product ID `prod_…`), not a Sanity field. On purchase: one email listing all ten published workshops; credentials inlined only for sessions inside the 8-day window.

### Stripe confirmation ops

1. In Stripe, each workshop Payment Link must use a distinct Product; copy that Product ID (`prod_…`) into Studio → workshop → **Registration (private)** → `stripeProductId`. Paste the Payment Link URL into public `stripePaymentLink`.
2. Create a series-pass Product; set `STRIPE_SERIES_PRODUCT_ID` on Vercel to that `prod_…`.
3. Enter `zoomLink` + `zoomPasscode` in the private fieldset before selling tickets / blasting credentials.
4. Stripe Dashboard → Webhooks → endpoint `https://<host>/api/stripe/webhook`, event `checkout.session.completed`. Secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SERIES_PRODUCT_ID` (plus Resend / `CONTACT_FROM_EMAIL`).
5. Admin blast: `/admin/sessions` (Basic auth `ADMIN_USER` / `ADMIN_PASSWORD`) — unions individual + series buyers, dedupes by email, sends single-session credentials.
6. Local test: `stripe listen --forward-to localhost:3000/api/stripe/webhook` then complete a test Payment Link checkout. Window math: `npm run test:workshop-window`.

### Pre-launch verification

Do these in order. Local `next start` is not a substitute for step 3 (Vercel Edge). DNS cutover only after steps 6–8 pass.

1. **Env (Production, Preview, and Development on Vercel):** set a generated `ADMIN_USER` / `ADMIN_PASSWORD` (never memorable) and `STRIPE_SERIES_PRODUCT_ID` once the series Product exists. Middleware treats unset, empty string, and whitespace-only values as **not configured → 503** (never open, never compare against `""`).
2. **Deploy** the admin / webhook / email branch.
3. **Production re-curl** against `https://stefanie-schumacher-com.vercel.app` with no `Authorization` on all three routes — expect `401` when env is set correctly, or `503 Admin auth not configured` if missing/empty/whitespace (never `200`):

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://stefanie-schumacher-com.vercel.app/admin/sessions"
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "https://stefanie-schumacher-com.vercel.app/api/admin/sessions/recipients" \
  -H "Content-Type: application/json" -d '{"workshopId":"x"}'
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "https://stefanie-schumacher-com.vercel.app/api/admin/sessions/send" \
  -H "Content-Type: application/json" -d '{"workshopId":"x"}'
```

   Also confirm `/admin` is absent from `/sitemap.xml` and authenticated `/admin/sessions` HTML includes `noindex`. Do not Disallow `/admin` in `robots.txt`.

4. **Stripe catalog:** eleven Products (10 workshops + series pass); archive superseded $45 Prices if replaced by $47; eleven Payment Links.
5. **Studio:** for all ten workshops, set public `stripePaymentLink` and private `stripeProductId`, `zoomLink`, `zoomPasscode`.
6. **Workshop 01 purchase** (`startsAt` 2026-09-09, currently ~37 days out) → welcome email **without** Zoom credentials. Confirms webhook + product mapping only. Easy to misread a missing passcode as a bug; it is correct.
7. **Near-dated fixture (do not skip):** map a test Product to a workshop with `startsAt` ≤ 8 days away (or a short-lived fixture). Buy once → credentials email with join button, plain URL, and passcode block. Step 6 passing does **not** validate this path.
8. **Series pass purchase** → one email listing all ten sessions; credentials inlined only for in-window sessions (today: expect none inlined).
9. **Refund** all three test charges.
10. **Gmail + Outlook** render check on welcome and credentials variants.
