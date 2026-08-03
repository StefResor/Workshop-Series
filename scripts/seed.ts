/**
 * Seed Sanity from /docs — workshops use UTC strings from workshop-schedule.md verbatim.
 *
 * Fee values: CONFIRM WITH STEF (homepage canonical; Bookings conflicts ignored).
 *
 * Usage: fill .env.local then `npm run seed`
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'

loadEnv({ path: '.env.local' })
loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-27'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!token) throw new Error('Missing SANITY_API_WRITE_TOKEN')

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

// ---------------------------------------------------------------------------
// Workshops — startsAt/endsAt copied verbatim from docs/workshop-schedule.md
// Per-session price comes from siteSettings.defaultWorkshopPrice unless overridden.
// ---------------------------------------------------------------------------

type WorkshopSeed = {
  _id: string
  sessionNumber: number
  title: string
  startsAt: string
  endsAt: string
  shortDescription: string
  body: string
}

const workshops: WorkshopSeed[] = [
  {
    _id: 'workshop-1',
    sessionNumber: 1,
    title: "\"I'm right, you're wrong\" — The Fight That Never Ends",
    startsAt: '2026-09-09T23:00:00.000Z',
    endsAt: '2026-09-10T00:30:00.000Z',
    shortDescription:
      'Why winning the argument loses the connection — and what to do instead.',
    // Corrected: "lose sight" (not "loose sight") — docs/content-corrections.md
    body: `Why trying to be “right” never gets you the understanding and connection you want.

Have you ever walked away from an argument feeling certain you were right — but somehow farther away from the person you love?

We've all been there. As a therapist, I've watched couples repeat the same painful pattern: we become so focused on being understood that we lose our ability to understand. The result isn't resolution — it's distance. We debate facts and objective reality, and lose sight of what our partner is experiencing subjectively. We'll explore why who's right and who's wrong is largely irrelevant — as hard as that may be to believe at first.

Substantial time is dedicated to Q&A, so we can explore as a group how this losing strategy shows up in our lives, and how to shift it.`,
  },
  {
    _id: 'workshop-2',
    sessionNumber: 2,
    title: "If We Can't Control Our Partner, Why Do We Keep Trying?",
    startsAt: '2026-09-16T23:00:00.000Z',
    endsAt: '2026-09-17T00:30:00.000Z',
    shortDescription:
      'The control reflex, where it comes from, and how to put it down.',
    body: `The control reflex, where it comes from, and how to put it down.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-3',
    sessionNumber: 3,
    title: 'Why Unleashing on Your Partner Never Gets You Heard',
    startsAt: '2026-09-23T23:00:00.000Z',
    endsAt: '2026-09-24T00:30:00.000Z',
    // Corrected missing words — docs/content-corrections.md
    shortDescription:
      'Full volume gets full defenses. Getting heard takes something quieter.',
    body: `Full volume gets full defenses. Getting heard takes something quieter — tone, timing, and the willingness to stay in the conversation without flooding it.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-4',
    sessionNumber: 4,
    title: 'The Destructive Force of Retaliation',
    startsAt: '2026-09-30T23:00:00.000Z',
    endsAt: '2026-10-01T00:30:00.000Z',
    shortDescription:
      'Payback feels fair in the moment — and costs the relationship every time.',
    body: `Payback feels fair in the moment — and costs the relationship every time.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-5',
    sessionNumber: 5,
    title: 'The Withdrawal Trap',
    startsAt: '2026-10-07T23:00:00.000Z',
    endsAt: '2026-10-08T00:30:00.000Z',
    shortDescription:
      'When going quiet becomes going missing — and how to come back.',
    body: `When going quiet becomes going missing — and how to come back.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-6',
    sessionNumber: 6,
    title: 'The Art & Skill of Acceptance',
    startsAt: '2026-10-14T23:00:00.000Z',
    endsAt: '2026-10-15T00:30:00.000Z',
    shortDescription:
      "What acceptance actually is (it isn't giving up), and how to practice it.",
    body: `What acceptance actually is (it isn't giving up), and how to practice it.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-7',
    sessionNumber: 7,
    title: 'The Art & Skill of Listening to Understand',
    startsAt: '2026-10-21T23:00:00.000Z',
    endsAt: '2026-10-22T00:30:00.000Z',
    shortDescription:
      'Listening to respond vs. listening to understand — a trainable difference.',
    body: `Listening to respond vs. listening to understand — a trainable difference.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-8',
    sessionNumber: 8,
    title: 'Responsible Distance-Taking & Responsible Feedback',
    startsAt: '2026-10-28T23:00:00.000Z',
    endsAt: '2026-10-29T00:30:00.000Z',
    shortDescription:
      'Taking space without abandoning; saying the hard thing without harm.',
    body: `Taking space without abandoning; saying the hard thing without harm.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-9',
    sessionNumber: 9,
    title: 'The Art of Generosity & Empowering Your Partner',
    // UTC date is Thursday — local Eastern is still Wednesday Nov 4 EST
    startsAt: '2026-11-05T00:00:00.000Z',
    endsAt: '2026-11-05T01:30:00.000Z',
    shortDescription:
      'Generosity as a practice, not a mood — and why it comes back around.',
    body: `Generosity as a practice, not a mood — and why it comes back around.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
  {
    _id: 'workshop-10',
    sessionNumber: 10,
    title: 'The Art of the Apology',
    // UTC date is Thursday — local Eastern is still Wednesday Nov 11 EST
    startsAt: '2026-11-12T00:00:00.000Z',
    endsAt: '2026-11-12T01:30:00.000Z',
    shortDescription:
      'A real apology repairs. A performed one re-injures. Learn the difference.',
    body: `A real apology repairs. A performed one re-injures. Learn the difference.

Each session pairs a practical framework with real examples of how the pattern shows up between people — at home, at work, and in family life.

Substantial time is dedicated to Q&A, so we can explore as a group how this dynamic plays out in your own relationships, and how to shift it.`,
  },
]

// ---------------------------------------------------------------------------
// Services — fee figures CONFIRM WITH STEF
// ---------------------------------------------------------------------------

const services = [
  {
    _id: 'service-individual-relational',
    order: 1,
    title: 'Individuals',
    shortDescription:
      "For people who are precise, effective, and well-regarded at work and cannot reproduce any of it at home. Defensiveness, shame, the reflex to win, the retreat that reads as calm. These patterns were learned early, they predate the relationship you're in, and they outlast it unless something interrupts them.",
    priceUSD: 150, // CONFIRM WITH STEF
    durationMinutes: 50, // CONFIRM WITH STEF
  },
  {
    _id: 'service-couples-same-fight',
    order: 2,
    title: 'Couples',
    shortDescription:
      'The argument that repeats on schedule, and the decision underneath it that neither of you will say out loud. Most couples arrive naming the wrong problem — the money, the dishes, the tone. We work the pattern that generates it. If the honest answer turns out to be separation, that happens deliberately and with structure, rather than by exhaustion.',
    priceUSD: 300, // CONFIRM WITH STEF
    durationMinutes: 75, // CONFIRM WITH STEF
  },
]

// ---------------------------------------------------------------------------
// Pages — corrections from docs/content-corrections.md applied
// ---------------------------------------------------------------------------

const pages = [
  {
    _id: 'page-home',
    title: 'Home',
    slug: 'home',
    eyebrow: 'The People Lab',
    headline: 'Connect Better.',
    summary:
      'Structured, direct relationship work for high-responsibility professionals and leaders. Deliberately small caseload. Private-pay, online, and discreet — all adults welcome.',
    body: `Accountability. Honesty. Repair. Boundaries. Family-of-origin pattern recognition. From reactivity to the Wise Adult.

Clarify the problem, precisely. Understand its origins, with compassion. Build new skills, deliberately. Practice until it shows up in daily life — noticeable change in how you relate every day.`,
    ctaLabel: 'Request a Consultation',
    ctaHref: '/contact',
  },
  {
    _id: 'page-about',
    title: 'About',
    slug: 'about',
    eyebrow: 'About Stefanie',
    headline: 'Steadiness, learned the hard way — and taught deliberately.',
    summary:
      'I am a licensed psychotherapist in private practice since 2015, specializing in Relational Diplomacy for couples and individuals seeking structured, accountable change.',
    body: `Over the past decade I have worked extensively with high-level executives, entrepreneurs, and physicians — including decision-makers at Google, Meta, Apple, Dell, Tesla, SpaceX, and Genentech — who require discretion, clarity, and direct feedback.

My clinical background includes advanced trauma training, work with complex psychiatric presentations, and certification in EMDR. Relationship ruptures can stir profound emotional turmoil, especially for those with a history of trauma. Together, we cultivate the skills and mindful awareness that provide stability when emotions threaten to overwhelm — the foundation you rely on to weather conflict, stay grounded in the storm, and find your way back to connection.

Earlier in my career I interned at the Taos Pueblo Psychiatric Services Division, then served as a therapist at Life Healing Center in Santa Fe — a premier residential treatment center for trauma and complex presentations. That work shaped my ability to navigate intensity with steadiness and precision.

Training: MS, LPC · EMDR-certified · Advanced trauma training
Practice: Zen meditation since 1997 — Soho Zendo (NYC), Upaya Zen Center (Santa Fe)
Discipline: Eight years of Olympic-level swim training; still swims almost daily`,
  },
  {
    _id: 'page-approach',
    title: 'Approach',
    slug: 'approach',
    eyebrow: 'How change actually happens',
    headline: 'From reactivity to the Wise Adult.',
    summary:
      'Structured relational work built on accountability, honesty, repair, boundaries, and family-of-origin pattern recognition.',
    body: `How change happens
I. Accountability
II. Honesty
III. Repair
IV. Boundaries
V. Family-of-origin pattern recognition
VI. From reactivity to the Wise Adult

The process
01 Clarify the problem, precisely
02 Understand its origins, with compassion
03 Build new skills, deliberately
04 Practice until it shows up in daily life

The promise is noticeable change in how you relate every day — not endless insight without movement.`,
  },
  {
    _id: 'page-fees',
    title: 'Fees',
    slug: 'fees',
    eyebrow: 'Private pay',
    headline: 'Fees',
    summary:
      'Private pay for highly motivated clients dedicated to a growth mindset and optimal performance.',
    // Fee figures CONFIRM WITH STEF
    body: `Couples — $300 / 75-minute session · private pay · online

Individuals — $150 / 50-minute session · private pay · online

Relational Diplomacy Workshop Series — $35 per participant · live on Zoom · 90 minutes

Workshop registrations are non-refundable. Workshops are educational and are not psychotherapy.`,
  },
]

const policies = [
  {
    _id: 'policy-workshop-disclaimer',
    title: 'Workshop disclaimer',
    slug: 'workshop-disclaimer',
    body: `Relational Diplomacy Workshops are educational in nature and are not psychotherapy, mental health treatment, or crisis services. Participation does not establish a therapist–client relationship. Registration is per participant; workshop registrations are non-refundable. Adults 18+.`,
  },
  {
    _id: 'policy-consult-form-notice',
    title: 'Consultation form notice',
    slug: 'consult-form-notice',
    body: `Please do not include health details, diagnoses, or other sensitive clinical information in this form. Share only what we need to schedule a confidential consultation. Submissions are emailed and not stored in a database.`,
  },
]

// siteSettings from docs/metadata-truth.md — nothing from the wrong table
const siteSettingsDoc = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'Stefanie Schumacher',
  practiceLine: 'Relational Diplomacy for Individuals and Couples',
  credentials: 'MS, LPC, EMDR',
  canonicalUrl: 'https://stefanie-schumacher.com',
  contactEmail: 'stef8.schumacher@gmail.com', // CONFIRM WITH STEF
  locationLabel: 'Online · Ohio',
  defaultTitle: 'Stefanie Schumacher — Relational Diplomacy',
  defaultDescription:
    'Structured, direct relationship work for high-responsibility professionals and leaders. Private-pay, online, and discreet.',
  twitterTitle: 'Stefanie Schumacher — Relational Diplomacy',
  ogTitle: 'Stefanie Schumacher — Relational Diplomacy',
  defaultWorkshopPrice: 45, // CONFIRM WITH STEF
}

async function main() {
  const tx = client.transaction()

  tx.createOrReplace(siteSettingsDoc)

  for (const w of workshops) {
    tx.createOrReplace({
      _id: w._id,
      _type: 'workshop',
      title: w.title,
      slug: { _type: 'slug', current: slugify(w.title) },
      sessionNumber: w.sessionNumber,
      startsAt: w.startsAt,
      endsAt: w.endsAt,
      timeZone: 'America/New_York',
      registrationStatus: 'draft',
      shortDescription: w.shortDescription,
      body: w.body,
      status: 'published',
      locationLabel: 'Zoom',
    })
  }

  for (const s of services) {
    tx.createOrReplace({
      _id: s._id,
      _type: 'service',
      title: s.title,
      slug: { _type: 'slug', current: slugify(s.title) },
      order: s.order,
      shortDescription: s.shortDescription,
      priceUSD: s.priceUSD,
      durationMinutes: s.durationMinutes,
    })
  }

  for (const p of pages) {
    tx.createOrReplace({
      _id: p._id,
      _type: 'page',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      eyebrow: p.eyebrow,
      headline: p.headline,
      summary: p.summary,
      body: p.body,
      ctaLabel: p.ctaLabel,
      ctaHref: p.ctaHref,
    })
  }

  for (const pol of policies) {
    tx.createOrReplace({
      _id: pol._id,
      _type: 'policy',
      title: pol.title,
      slug: { _type: 'slug', current: pol.slug },
      body: pol.body,
    })
  }

  await tx.commit()
  console.log(
    `Seeded: siteSettings, ${workshops.length} workshops, ${services.length} services, ${pages.length} pages, ${policies.length} policies`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
