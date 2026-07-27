# Current site index — stefanie-schumacher.com (crawled 2026-07-21)

Platform: **Wix**. Site title: "Relational Diplomacy For Couples". Mike will paste per-page layouts separately; this doc is the crawled content/structure baseline.

## Site map (from sitemap.xml, lastmod 2026-07-17)

- `/` — Homepage
- `/services-4` — Relational Diplomacy Workshop Series (workshop listing)
- `/event-list` — Events list (JS-rendered; not scrapeable server-side)
- `/fees-insurance` — Fees & Insurance (JS-rendered; not scrapeable — meta description: "Private pay for highly motivated clients who are dedicated to a growth mindset and optimal performance.")
- `/book-online` — Wix Bookings services list
- `/service-page/individual-weekly`, `/service-page/individual-biweekly`, `/service-page/parent-consultation` — Wix Bookings service pages
- `/pricing-plans/plans-pricing` — Wix Pricing Plans (workshop tickets)
- `/event-details/workshop-{1..10}-…` — 10 individual workshop event pages (Wix Events)

## Homepage content

- **Header:** Stefanie Schumacher MS, LPC, EMDR — "Relational Diplomacy for Individuals and Couples." Positioning: structured, direct relationship work for high-responsibility professionals/leaders; small caseload; private-pay, online, discreet; all adults welcome regardless of age or sexual orientation. CTA: "Request a Confidential Consultation."
- **About:** Licensed since 2015; clients from Google, Meta, Apple, Tesla, SpaceX; trauma training, complex psychiatric cases, EMDR-certified; internship at Taos Pueblo; therapist at Life Healing Center, Santa Fe; 8 years competitive swimming; Zen meditation since 1997.
- **Three service areas:** (1) Couples Stuck in the Same Fight, (2) Couples at a Crossroads (recommit or separate with integrity), (3) Individual Relational Work (shame/defensiveness → accountability).
- **How Change Happens:** Accountability, Honesty, Repair, Boundaries, Family-of-Origin Pattern Recognition; "From Reactivity to the Wise Adult."
- **Process:** clarify problems → understand origins with compassion → build new skills; promise of "noticeable change in how you relate every day."
- **Pricing (homepage):** Couples $300 / 75 min; Individuals $150 / 50 min.
- Only one nav link surfaced in static HTML (→ /services-4); most nav is JS-rendered.

## Workshop series (/services-4)

Weekly live 90-min Zoom workshops, Wednesdays 7:00–8:30 PM EDT; standalone but progressive; ~half of each session is Q&A; join anytime, any order; adults 18+. Framed as educational, **not psychotherapy** (explicit disclaimer; no therapist-client relationship). Registration per participant (couples register individually). Non-refundable.

| # | Title | Date (2026) |
|---|-------|------|
| 1 | "I'm right, you're wrong" aka The Fight That Never Ends | Sep 9 |
| 2 | If We Can't Control Our Partner, Why Do We Keep Trying? | Sep 16 |
| 3 | Why Unleashing on Your Partner Never Gets You Heard | Sep 23 |
| 4 | The Destructive Force of Retaliation | Sep 30 |
| 5 | The Withdrawal Trap | Oct 7 |
| 6 | The Art & Skill of Acceptance | Oct 14 |
| 7 | The Art & Skill of Listening to Understand | Oct 21 |
| 8 | Responsible Distance Taking & Responsible Feedback Skills | Oct 28 |
| 9 | The Art of Generosity & Empowering Your Partner | Nov 4 |
| 10 | The Art of the Apology | Nov 11 |

Event page sample (Workshop #1): full description present, but **"Tickets are not currently on sale."** Separately, /pricing-plans lists a **$35** workshop plan ("entry to multiple events") with Buy Now — ticketing appears split/inconsistent between Wix Events and Wix Pricing Plans.

## Booking (/book-online, Wix Bookings)

- Parent Consultation — 1 hr — from $245
- Individual WEEKLY — 45 min — $165
- Individual BIWEEKLY — 45 min — $225

## Audit findings / issues to raise (rebuild ammo)

1. **Pricing inconsistency:** homepage says Individuals $150/50-min; Bookings says $165/45-min (weekly) and $225/45-min (biweekly — costs MORE than weekly, likely a setup error or unclear per-period pricing). Couples $300/75 appears on homepage but has no booking service.
2. **Placeholder template copy live in production:** individual-weekly service page still shows Wix default "Describe your service here…" text.
3. **Stale/wrong contact metadata:** service page lists email genderpsychotherapyinstitute@gmail.com and location "Austin, Texas" — neither matches Stef's practice (she's Ohio-based; personal email stef8.schumacher@gmail.com). Likely leftover from a reused/transferred Wix account. Also: workshop times listed in EDT.
4. **Ticketing gap:** 10 events published but tickets "not on sale"; a parallel $35 pricing plan exists — two overlapping Wix commerce systems for the same thing.
5. **SEO/render fragility:** key pages (/fees-insurance, /event-list) render only via JS — thin/empty server HTML.
6. **No consultation form found in static crawl** (homepage CTA references one — likely JS-rendered; confirm from Mike's page pastes).
7. Site title brand ("Relational Diplomacy For Couples") vs. domain/personal brand (stefanie-schumacher.com) — worth a branding decision in the rebuild.

## Content model implied for rebuild (Sanity sketch)

Collections: Services (therapy offerings w/ price, duration, format), Workshops/Events (title, date, price, Zoom link, description, ticket state), Pages (about, approach/method, fees), Policies (registration/refund/disclaimer blocks), Testimonials/Press (future), Site settings (contact, credentials, booking links). Nearly all current content is text + a small number of images — a light, clean migration.
