# Email list (public signup)

Phase 1: public capture via Sanity-editable band/footer → `POST /api/subscribe` → Resend global contacts in one or two segments.

## The lists

| Segment | Resend ID | Who's on it |
|---|---|---|
| Workshop Announcements | `a75708de-21c5-44ff-875a-63517f37333f` | Everyone who submits the form |
| Blog & Practice Updates | `2e8f9e58-4e9f-4391-aa05-433b0fec68eb` | Only those who tick the band checkbox |

A person can be on one or both. Contacts are global — one contact, one quota seat.

The band’s primary offer is workshop announcements. The checkbox is a secondary opt-in to Blog & Practice Updates (unchecked by default). The footer subscribes to Workshop Announcements only (no checkbox).

### Not in this build

A paid Sep–Nov **cohort** segment (reminders, Zoom, recordings) is out of scope. Manual from Stripe later — no registration→segment automation here.

## Surfaces

| Surface | Where | Fields | `source` |
|---|---|---|---|
| Band | Home only, after workshops teaser | first name, email, blog checkbox | `home_band` |
| Footer | Every page except home and `/workshops/[slug]` | full name (optional), email | `footer` |

Footer full name is split on the first space into Resend `firstName` / `lastName` so `{{FIRST_NAME}}` stays useful in broadcasts. Name is never required to subscribe.

Gated on Sanity `emailSignup.enabled` (and `showInFooter` for the footer). Band and footer never render on the same page.

Studio: **Site Settings → Email List Signup** (singleton `_id: emailSignup`).

## Env

```
RESEND_API_KEY=                      # required; contacts need full-access
RESEND_SEGMENT_WORKSHOPS_ID=         # required
RESEND_SEGMENT_BLOG_PRACTICE_ID=     # optional; warn + skip if missing when checkbox ticked
```

Missing API key or workshops segment → `{ ok: false }` / 503.

## API

`POST /api/subscribe` — body includes `blogOptIn: boolean`. Honeypot `website`, rate limit 5 / 10 min / IP.

Always adds Workshop Announcements. When `blogOptIn` is true and the blog segment env is set, both IDs go in a **single** `contacts.create` call.

Already-subscribed → success (no membership disclosure); best-effort segment repair. Consent log: email, firstName, source, blogOptIn, segmentIds, timestamp, permissionLineVersion, userAgent.

Single opt-in today. `lib/subscribe.ts` keeps a hook point for double opt-in later.

## List hygiene — hard constraint

**Stef's clinical client roster must never be uploaded to Resend or any ESP.** Both segments are populated only by self-signup through this form.

- No manual contact adds from any clinical source.
- No properties or segment names that could imply clinical status.

## Open questions (do not build ahead)

1. Single vs double opt-in — building single.
2. Checkbox default — unchecked (honest opt-in); Stef may flip later.
3. Cohort segment + Stripe — out of scope.
