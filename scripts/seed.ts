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
// Per-session price comes from siteSettings.sessionPrice unless overridden.
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
    eyebrow: 'The Connection Lab',
    // Home hero is authored as solid + outline (+ join). Do not set headline.
    heroSolid: 'Notice',
    heroOutline: '*',
    heroJoin: 'none' as const,
    heroFootnote: '*Easier said than done.',
    workshopsHeading: 'The Notice* Workshop Series.',
    workshopsSpecTail: 'Join any session, in any order · 18+',
    workshopsNote:
      'Separate from the series, I see a small number of couples and individuals privately.',
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

Relational Diplomacy Workshop Series — $47 per participant · live on Zoom · 90 minutes

Workshop registrations are non-refundable. Workshops are educational and are not psychotherapy.`,
  },
]

const policies = [
  {
    _id: 'policy-workshop-disclaimer',
    title: 'Workshop disclaimer',
    slug: 'workshop-disclaimer',
    showInFooter: false,
    body: `Relational Diplomacy Workshops are educational in nature and are not psychotherapy, mental health treatment, or crisis services. Participation does not establish a therapist–client relationship. Registration is per participant; workshop registrations are non-refundable. Adults 18+.`,
  },
  {
    _id: 'policy-consult-form-notice',
    title: 'Consultation form notice',
    slug: 'consult-form-notice',
    showInFooter: false,
    body: `Please do not include health details, diagnoses, or other sensitive clinical information in this form. Share only what we need to schedule a confidential consultation. Submissions are emailed and not stored in a database.`,
  },
  // Full Terms — source docs/terms.md. Fail-safe in lib/terms.ts is for CMS outage only.
  {
    _id: 'policy-terms',
    title: 'Terms & Policies',
    slug: 'terms',
    showInFooter: true,
    footerOrder: 1,
    footerLabel: 'Terms',
    body: `## Registration

Registration is required for each participant. If you are attending with a spouse or partner, each person must register individually, even if you will be participating from the same device or Zoom connection.

Individual registration helps support the continued development of the workshop series and allows these workshops to remain accessible while maintaining the quality of the educational experience.

Workshops are open to adults 18 and over.

## Refunds

Because each workshop requires advance planning, scheduling, and preparation, all registrations are non-refundable.

Thank you for supporting the time, preparation, and care that goes into creating each workshop.

## Cancellation by Stefanie Schumacher

If a workshop is cancelled and not rescheduled, registrants will receive a full refund for that workshop.

If a workshop is rescheduled, registration carries over to the new date. Registrants who are unable to attend the rescheduled date may request a refund for that workshop.

## These workshops are not therapy

The workshop series is educational and skills-based. These workshops are not psychotherapy, mental health treatment, crisis intervention, or a substitute for professional counseling. Participation does not establish a therapist–client relationship with Stefanie Schumacher.

No particular outcome is promised or guaranteed. What participants take from the material depends on their own circumstances and engagement.

## Emotional wellbeing during workshops

While relationship topics can naturally evoke emotional responses, participants are encouraged to engage at a level that feels comfortable and to take breaks as needed.

If you are experiencing significant emotional distress, please seek support from a licensed professional in your area. If you are in crisis or thinking about harming yourself, call or text 988 to reach the Suicide and Crisis Lifeline, available 24 hours a day in the United States.

## Conduct

To help create a respectful learning environment, participants are expected to treat one another with courtesy and professionalism. Harassing, disruptive, or abusive behavior may result in removal from a workshop without refund.

## Recording and group privacy

Zoom recording will be disabled by the host. Participants are prohibited from recording, photographing, screenshotting, or otherwise capturing any portion of a workshop without prior written permission.

To help create a safe and respectful learning environment, participants are asked to honor the privacy of everyone attending. While every effort is made to foster a respectful atmosphere, these are group educational workshops and complete confidentiality cannot be guaranteed. Participants are encouraged to share only what feels comfortable in a group setting.

## Your information

Information collected when you register — your name and email address — is used to deliver workshop materials and correspondence. Payment information is handled by Stripe and is never stored by Stefanie Schumacher.

Workshop registration is not clinical care. Registration information is not a clinical record and is not protected health information.

See the [Privacy Policy](/privacy) for how information is collected, used, and retained.

## Changes to these terms

These terms may be updated from time to time. The effective date above reflects the most recent revision. Registrations are governed by the terms in effect on the date of registration.

## Governing law

These terms are governed by the laws of the State of Ohio.

## Contact

Questions about these terms can be sent through the contact form at [stefanie-schumacher.com/contact](/contact).`,
  },
  // Privacy — source docs/privacy.md. Keep unpublished while DECISION NEEDED remains.
  {
    _id: 'policy-privacy',
    title: 'Privacy Policy',
    slug: 'privacy',
    showInFooter: true,
    footerOrder: 2,
    footerLabel: 'Privacy',
    body: `## What this policy covers

This policy describes how information is handled on stefanie-schumacher.com and in connection with the Relational Diplomacy workshop series.

It does not cover clinical services. Information shared in the course of therapy is governed separately by professional confidentiality obligations and applicable health privacy law, and is described in the paperwork provided to therapy clients directly.

**Workshop registration is not clinical care.** Registering for a workshop does not make you a client, does not create a therapist–client relationship, and does not produce a clinical record. Registration information is not protected health information.

## What is collected

**When you register for a workshop.** Your name and email address, collected through Stripe at checkout, along with which workshop you registered for and the date of registration. If you choose to receive announcements about future workshops, that choice is recorded along with the date you made it.

**When you pay.** Payment card details are entered directly with Stripe and are never received or stored by Stefanie Schumacher. Stripe provides only a confirmation of payment, the amount, and the name and email address you supplied.

**When you use the contact form.** Your name, email address, and whatever you choose to write.

**When you attend a workshop.** Zoom collects the name you join under, your email address, and technical connection information. Workshops are not recorded.

**When you visit the site.** [DECISION NEEDED — see Analytics below.]

## Who processes this information

- **Stripe** — Payment processing and workshop registration
- **Resend** — Registration confirmations and workshop correspondence
- **Vercel** — Website hosting
- **Sanity** — Website content and registration records
- **Zoom** — Live workshop delivery

Each of these providers handles information under its own privacy terms. Information is shared with them only as needed to run the workshops and the site.

## Analytics

**DECISION NEEDED.** What the site runs determines both this section and whether a cookie banner is required.

**If no analytics:** "This site does not use analytics, advertising cookies, or third-party tracking."

**If privacy-preserving analytics** (Plausible, Fathom, Vercel Analytics): "This site uses privacy-preserving analytics that count visits without cookies and without collecting personal information or building profiles of visitors."

**If Google Analytics:** the section has to disclose cookie-based tracking, data sharing with Google, and — for visitors in the EU/UK — requires a consent banner before any tracking script loads.

**Recommendation: don't use Google Analytics on this site.** A visitor browsing a therapy practice is doing something sensitive. Cookieless analytics answers the only questions worth asking here — which pages get read, which workshops get clicked — with no banner, no consent infrastructure, and no third-party profile of who was reading about couples therapy at 2am. It also costs about the same as nothing.

## How information is used

To confirm your registration, send you the Zoom link and passcode, remind you before a workshop, respond to messages you send, and — only if you have opted in — tell you when new workshop series are announced.

Information is not sold. It is not shared with anyone other than the service providers listed above, except where required by law.

## Announcements and how to stop them

You may opt in to workshop announcements when you register. Every announcement email includes an unsubscribe link, and unsubscribing takes effect immediately.

Unsubscribing does not affect the emails required to deliver a workshop you have already paid for — your confirmation, your Zoom link, and your reminder will still arrive.

## How long information is kept

**DECISION NEEDED.** The system is built so past workshops go inert on their own, but "kept indefinitely" and "deleted after twelve months" are different promises and one has to be made. Options:

- **A.** Registration records are kept for twelve months after a workshop series ends, then deleted.
- **B.** Registration records are kept for three years for business and tax purposes, then deleted.
- **C.** Registration records are kept indefinitely.

Payment records are separate: Stripe retains transaction records on its own schedule for financial and legal reasons, and that is outside Stef's control either way. Contact form messages need their own answer too.

B is the common choice and aligns with how long financial records are typically retained. A is the more privacy-protective position and fits the practice's positioning. C is hard to justify and hard to defend.

## Your choices

You may ask what information is held about you, ask that it be corrected, ask that it be deleted, and withdraw your consent to announcements at any time. Requests can be sent through the [contact form](/contact) and will be answered within a reasonable time.

Some information cannot be deleted on request where it must be retained for tax or legal reasons — payment records in particular.

## Children

The workshops are for adults 18 and over. Information is not knowingly collected from anyone under 18.

## Security

Information is held in the services listed above, each of which encrypts data in transit and at rest. No system is perfectly secure, and no guarantee of absolute security can be made.

## Visitors outside the United States

**DECISION NEEDED.** Does Stef expect registrants outside the US?

Her clientele includes people at multinational technology and aerospace companies, so EU or UK attendees are plausible rather than hypothetical. If so, GDPR obligations attach — a lawful basis for processing, explicit consent for marketing, and data subject rights with defined response times.

If she wants to keep it simple, the alternative is stating that workshops are offered to participants in the United States only, and enforcing it at registration.

Information is processed and stored in the United States.

## Changes to this policy

This policy may be updated. The effective date above reflects the most recent revision.

## Contact

Questions about this policy can be sent through the contact form at [stefanie-schumacher.com/contact](/contact).`,
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
  defaultWorkshopPrice: 47, // CONFIRM WITH STEF — legacy alias of sessionPrice
  sessionPrice: 47, // CONFIRM WITH STEF
  seriesPrice: 423, // CONFIRM WITH STEF
  seriesEyebrow: 'The Full Series',
  seriesDisplayLine: 'All Ten Sessions',
  // CONFIRM WITH STEF — draft supporting line pending client review
  seriesSupportingLine:
    'From the fight that never ends through listening, acceptance, and repair — the full Relational Diplomacy arc.',
  seriesOfferLine: 'ten sessions, one free',
  seriesScheduleLine: 'Wednesdays · 7:00–8:30 PM ET · Zoom',
  seriesCtaLabel: 'Register for the series',
  // seriesPaymentLink: paste Stripe Payment Link in Studio
}

// Public mailing list copy — see docs/email-list.md (never seed clinical contacts)
const emailSignupDoc = {
  _id: 'emailSignup',
  _type: 'emailSignup',
  enabled: true,
  eyebrow: 'Stay in touch',
  heading: 'Workshop updates',
  body: 'Announcements for the workshop series — dates, topics, and when registration opens.',
  nameLabel: 'First name',
  emailLabel: 'Email',
  checkboxLabel: 'Also send me blog posts and practice updates',
  buttonLabel: 'Subscribe',
  permissionLine:
    'Unsubscribe anytime. Your address is never shared or sold. See the Privacy Policy.',
  successMessage:
    "You're on the list. Workshop announcements will come to this address.",
  errorMessage:
    "That didn't go through. Check the email address and try again.",
  showInFooter: true,
  footerHeading: 'Hear about new workshops',
}

async function main() {
  const tx = client.transaction()

  tx.createOrReplace(siteSettingsDoc)
  tx.createOrReplace(emailSignupDoc)

  for (const w of workshops) {
    tx.createOrReplace({
      _id: w._id,
      _type: 'workshop',
      title: w.title,
      slug: { _type: 'slug', current: slugify(w.title) },
      sessionNumber: w.sessionNumber,
      startsAt: w.startsAt,
      durationMinutes: Math.round(
        (new Date(w.endsAt).getTime() - new Date(w.startsAt).getTime()) /
          60_000,
      ),
      timeZone: 'America/New_York',
      registrationStatus: 'draft',
      shortDescription: w.shortDescription,
      body: w.body,
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
      ...('headline' in p && p.headline != null ? { headline: p.headline } : {}),
      ...('heroSolid' in p ? { heroSolid: p.heroSolid } : {}),
      ...('heroOutline' in p ? { heroOutline: p.heroOutline } : {}),
      ...('heroJoin' in p ? { heroJoin: p.heroJoin } : {}),
      ...('heroFootnote' in p ? { heroFootnote: p.heroFootnote } : {}),
      ...('workshopsHeading' in p
        ? { workshopsHeading: p.workshopsHeading }
        : {}),
      ...('workshopsSpecTail' in p
        ? { workshopsSpecTail: p.workshopsSpecTail }
        : {}),
      ...('workshopsNote' in p ? { workshopsNote: p.workshopsNote } : {}),
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
      showInFooter: pol.showInFooter ?? false,
      ...(pol.footerOrder != null ? { footerOrder: pol.footerOrder } : {}),
      ...(pol.footerLabel ? { footerLabel: pol.footerLabel } : {}),
    })
  }

  await tx.commit()
  console.log(
    `Seeded: siteSettings, emailSignup, ${workshops.length} workshops, ${services.length} services, ${pages.length} pages, ${policies.length} policies`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
