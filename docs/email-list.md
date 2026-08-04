# Email list (public signup)

Phase 1: single general-list capture via Sanity-editable band/footer → `POST /api/subscribe` → Resend global contacts + segment + topics.

## The two lists

These are different kinds of list and must not be conflated.

| | **General list** | **Cohort list** |
|---|---|---|
| Resend segment | Website Signups | Workshop 2026-09 |
| Segment ID | `a75708de-21c5-44ff-875a-63517f37333f` | `2e8f9e58-4e9f-4391-aa05-433b0fec68eb` |
| Who's in it | Anyone who submits the website form | People who registered and paid for the Sep–Nov series |
| Joined via | Band / footer form — **this build** | Stripe registration — **not this build** |
| Receives | Workshop-series announcements, blog posts, practice updates | Operational mail only: reminders, Zoom/recording links, schedule changes |
| Nature | Marketing, opt-in | Transactional, tied to a purchase |
| Lifespan | Indefinite | Ends with the series |

### Overlap rule

A person can be in both segments. To prevent double-sends and keep consent clean:

- Cohort receives **only** operational mail about the series that person paid for.
- Announcements of *future* series go to the general list **only**.
- A cohort member who wants future announcements joins the general list like anyone else. Never move them across automatically.

Rationale: emailing a paying attendee about the thing they bought is transactional. Using that same list to sell the next series is marketing and requires opt-in.

## Topics (general list only)

| Topic | Env |
|---|---|
| Workshop announcements | `RESEND_TOPIC_WORKSHOP_ANNOUNCEMENTS_ID` |
| Practice news & writing | `RESEND_TOPIC_PRACTICE_NEWS_ID` |

When both IDs are set, new signups are opted into **both** at creation. Missing topic IDs do not block signup — the contact is still added to Website Signups and a `subscribe_topics_incomplete` warning is logged. The form shows no topic checkboxes — the general list means “everything,” and the permission line says so. Resend’s hosted preference page is the escape hatch. Operational cohort mail is not topic-scoped.

## Surfaces

| Surface | Where | Fields | `source` |
|---|---|---|---|
| Band | Home only, after workshops teaser | first name, email | `home_band` |
| Footer | Every page except home and `/workshops/[slug]` | email | `footer` |

Gated on Sanity `emailSignup.enabled` (and `showInFooter` for the footer variant). Band and footer never render on the same page.

Studio: **Site Settings → Email List Signup** (singleton `_id: emailSignup`).

## Env

```
RESEND_API_KEY=                              # shared with contact form; contacts need full-access
RESEND_SEGMENT_ID=                           # Website Signups — required
RESEND_TOPIC_WORKSHOP_ANNOUNCEMENTS_ID=      # optional until topics exist
RESEND_TOPIC_PRACTICE_NEWS_ID=               # optional until topics exist
```

Missing `RESEND_API_KEY` or `RESEND_SEGMENT_ID` → `{ ok: false }` / 503. Missing topic IDs → signup still succeeds (segment only).

Signup capture works without sending-domain DNS. Broadcasts need SPF/DKIM/DMARC on the sending subdomain.

## API

`POST /api/subscribe` — honeypot `website`, rate limit 5 / 10 min / IP (in-memory; resets on cold start), `{ ok: true | false }` only.

Creates a global contact via `resend.contacts.create` with:

- `segments: [{ id: RESEND_SEGMENT_ID }]`
- `topics: [{ id, subscription: 'opt_in' }, …]` for both topic env vars

Already-subscribed addresses return success (no membership disclosure). Consent trail is a structured `subscribe_consent` log: email, firstName, source, timestamp, permissionLineVersion, userAgent.

Single opt-in today. `lib/subscribe.ts` is structured so double opt-in can gate `createContactInSegment()` behind a confirmation token without rewriting the route.

## List hygiene — hard constraint

**Stef's clinical client roster must never be uploaded to Resend or any ESP.** Both segments are populated only by self-signup or by workshop purchase.

- No manual contact adds from any clinical source.
- No properties, topics, or segment names that could imply clinical status.
- Both segments stay separate from anything clinical.
- Workshop attendees are **not** auto-added to the general list at registration.

## Open questions (do not build ahead)

1. Single vs double opt-in — building single; API keeps a confirmation hook point.
2. Cohort automation (Stripe → Workshop 2026-09) — manual for now.
3. Cross-promotion path — how cohort members are invited onto the general list (confirmation page / wrap-up email); copy not yet written.
