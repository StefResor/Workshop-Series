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

Price: **$35** per participant (mark `// CONFIRM WITH STEF` in seed). Location: Zoom. Status: published.

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
| `price` | number | per-participant USD |
| `hook` | string | max ~90 chars; cards / social |
| `stripePaymentLink` | url | Stripe Payment Link |
| `capacity` | number | optional; empty = unlimited |
| `registrationStatus` | string | `draft` \| `open` \| `sold-out` \| `past` |
| `shortDescription` | text | feed / cards |
| `body` | text | full event page (plain text paragraphs for now) |
| `status` | string | `published` \| `draft` |
| `zoomRegistrationUrl` | url | Zoom registration page — never store join links |
| `locationLabel` | string | default `Zoom` |
