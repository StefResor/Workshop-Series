# Workshop registration & correspondence system

Spec for implementation. Read this before touching anything under `lib/email/`,
`lib/registrations.ts`, `app/api/stripe/`, or `app/api/cron/`.

---

## The one-sentence version

There is no email list. The registration records **are** the list, and every
send is a query against them.

---

## Why it's built this way

A workshop's audience is everyone who paid for that workshop. Modelling that as
a subscribable list creates two failure modes that both end with someone paying
$47 and not receiving a Zoom link:

1. A registrant who declined the marketing opt-in never joins the list.
2. A registrant who unsubscribes after workshop 3 stops receiving credentials
   for workshops 4 through 10.

Deriving the audience from paid registrations removes both. It also expires
itself: nothing queries a finished workshop, so past cohorts go inert with no
list pruning and no retention of people who no longer need to hear from us.

**Zoom credentials are transactional.** They deliver access to a purchased
thing. They ignore marketing consent and unsubscribe state entirely, and they
carry no unsubscribe link. Do not route them through Resend Broadcasts.

**Marketing is the separate thing.** Announcements of future series are
governed by the consent checkbox at Stripe checkout and belong in the campaign
kit (`stef-campaign-kit/`), not here. That checkbox is the only bridge between
cohorts — it is how a Fall registrant hears about the Winter series.

---

## Content model

```
series          Fall 2026, Winter 2027
  └─ workshop   1–10, each with startsAt (UTC), joinUrl, passcode, paymentLink
       └─ registration   workshop ref, email, firstName, source, status
```

`registration` is `readOnly: true` in the Studio. It is written by the Stripe
webhook and by the cron, never by hand — hand-editing desynchronizes it from
Stripe and there is no reconciliation path back.

### Field naming trap

`workshop.sessionNumber` is displayed **everywhere** as "Workshop 01". The field
name is legacy. Do not rename it to `workshopNumber` for consistency — that's a
schema change plus a content migration across ten documents for an identifier
nobody sees. Do not "fix" the display strings to say "Session" either. See
`docs/content-corrections.md`.

---

## Purchase flow

### Payment Link metadata is load-bearing

Every Stripe Payment Link must carry exactly one of:

| Metadata key    | Value              | Used for              |
| --------------- | ------------------ | --------------------- |
| `workshop_slug` | the workshop slug  | single workshop sale  |
| `series_slug`   | the series slug    | full-series pass      |

Without it the webhook throws and Stripe retries. This is the single most
likely configuration mistake across eleven Payment Links.

Success URL per link:

```
https://stefanie-schumacher.com/workshops/{slug}/thank-you?session_id={CHECKOUT_SESSION_ID}
```

Stripe substitutes `{CHECKOUT_SESSION_ID}` literally. `{slug}` you fill in.

### Series pass fans out

One pass purchase writes **ten** registration records, each `source: 'pass'`
with a shared `passId`, and sends ten confirmations — one per workshop, each
with its own calendar file.

Ten records rather than one flag because: every send has a single code path,
per-workshop headcount is a real number Stef can read, and a refund voids the
set in one query.

`fanOutSeriesPass` is re-runnable. If a workshop is added to a series after
passes were sold, call it again with the same `passId` to backfill.

### Dedupe

Registration `_id` is deterministic: `registration.{workshopId}.{sha256(email)[0:16]}`.

The email is hashed, not embedded — document IDs surface in URLs, logs, and the
Studio history pane, and addresses don't belong there.

This makes someone who bought workshop 03 individually and later upgraded to a
pass collapse to one registration rather than receiving everything twice.

### Refunds

`charge.refunded` → `voidRegistrations(sessionId)` → `status: 'refunded'`.
Matches on both `stripeSessionId` and `passId`, so refunding a pass voids all
ten. Records are kept, not deleted; every send filters on `status == 'active'`.

### Delayed payment methods

ACH and Klarna return `checkout.session.completed` with
`payment_status: 'unpaid'` while funds clear. That case is skipped and picked up
on `checkout.session.async_payment_succeeded` instead. Registering on the first
event would enroll people whose payment later fails.

---

## Correspondence

Three transactional emails, all in `lib/email/`, all sharing `theme.ts`:

| When            | File                       | Contains                        |
| --------------- | -------------------------- | ------------------------------- |
| On purchase     | `workshop-confirmation.ts` | What they bought. **No Zoom link.** |
| 8 days before   | `workshop-credentials.ts`  | Join link + passcode            |
| Workshop day    | `workshop-credentials.ts`  | Link + passcode again, short    |

`CREDENTIALS_LEAD_DAYS` in `theme.ts` is the single source of truth for "8
days." The confirmation email computes and prints the actual date from it, and
the thank-you page imports the same constant. Change it in one place.

The confirmation promises a day-of reminder. If that send is ever removed, cut
the promise too — a promised email that never arrives is worse than no promise.

### Subject line format

```
Workshop 01 · Wed, Sep 9 · I'm right, you're wrong — the fight that never ends
```

Number and date lead so they survive truncation regardless of title length, and
so a run of confirmations reads as an ordered series in the inbox. "Relational
Diplomacy" lives in the preheader — still indexed for search, not eating the
truncation budget. The email tells recipients that search term explicitly.

---

## The cron

`/api/cron/workshop-credentials`, daily at 14:00 UTC (`vercel.json`).
Authorized via `Authorization: Bearer $CRON_SECRET`, which Vercel sends
automatically.

**The query selects on "not yet sent," never on "due today."** This is
deliberate and should not be optimized into a date-equality check. If the cron
misses a day — outage, deploy, quota — a date match would skip that cohort
permanently and nobody gets their link. Absence of a `sentAt` timestamp means a
missed run self-heals on the next one. Late is recoverable; never is not.

Each registration is marked immediately after its own send, not in a batch
commit at the end. A batch would risk re-sending the whole cohort if the
function timed out midway.

A workshop with no `joinUrl` is skipped **without** being marked sent, so it
goes out on the next run once Stef fills it in. Watch the `missingJoinUrl`
array in the cron's response.

---

## Environment

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SANITY_API_WRITE_TOKEN     # server-only; never import lib/registrations.ts into a client component
RESEND_API_KEY
WORKSHOP_REPLY_TO
CRON_SECRET
NEXT_PUBLIC_SITE_URL
```

`npm i stripe` and pin the version in `AGENTS.md` alongside the others.

---

## Testing

Stripe test mode is a separate universe — products, prices, Payment Links,
webhooks and customers do not cross over. Recreate at least one workshop link
and one pass link in test mode.

Cards: `4242…4242` succeeds, `4000…0002` declines, `4000 0025 0000 3155`
forces 3D Secure. Run the 3DS one — corporate and European cards will hit it.

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/workshop-credentials
```

To exercise the cron without waiting, set a test workshop's `startsAt` to seven
days out and run it.

### Checklist

- [ ] Single workshop purchase → 1 registration, 1 confirmation, no Zoom link in it
- [ ] Series pass purchase → 10 registrations sharing a `passId`, 10 confirmations
- [ ] Buy workshop 03, then buy the pass → still **one** registration for 03
- [ ] Refund a pass → all 10 go `refunded`, none receive credentials
- [ ] Cron with `startsAt` 7 days out → credentials send, `credentialsSentAt` set
- [ ] Run cron twice → second run sends nothing
- [ ] Workshop with no `joinUrl` → skipped, not marked, appears in `missingJoinUrl`
- [ ] Thank-you page with a bogus `session_id` → does not claim registration failed
- [ ] Confirmation renders in Gmail, Apple Mail, and Outlook (Arial Black fallback)

---

## Open, needs Stef

- Zoom passcodes for all 10 workshops
- Whether the day-of reminder is actually part of the sequence
- Wording of the Stripe marketing-consent checkbox — it's the only bridge
  between cohorts, so it needs to earn the tick. Something closer to
  "Email me when new workshop series are announced" than a generic opt-in.
- Where registration records live is a decision she should make knowingly.
  These aren't clinical records, but they're people who signed up for a
  therapist's workshops, and they sit in Sanity where anyone with Studio
  access can read them.
