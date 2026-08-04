# Handoff: Email List Signup — band + footer (v3)

**Project:** stefanie-schumacher.com
**Scope:** Phase 1. Public email capture, editable in Sanity, wired to Resend.
**Supersedes:** v1 and v2. Delete both. Where any of them conflict with this, this wins.

---

## 0. What changed from v2

v2 described **one segment plus two topics**. That's wrong. The correct model is **two segments plus a checkbox**.

| | v2 (wrong) | v3 (correct) |
|---|---|---|
| Lists | 1 segment | 2 segments |
| Preference mechanism | Resend Topics | A checkbox on the form |
| Topics | Two, opted into at signup | **None. Remove all topic code and env vars.** |

**Remove entirely:** `RESEND_TOPIC_WORKSHOP_ANNOUNCEMENTS_ID`, `RESEND_TOPIC_PRACTICE_NEWS_ID`, all topic opt-in logic, the `subscribe_topics_incomplete` warning, and every mention of topics in `.env.example`, `.env.local`, `AGENTS.md`, and `docs/email-list.md`.

Also remove `RESEND_SEGMENT_ID` — replaced by the two vars below.

## 1. The lists

**The band sells workshop signups.** That's the primary offer. The checkbox is a secondary opt-in to a separate list.

| Segment | Resend ID | Who's on it |
|---|---|---|
| `Workshop Announcements` | `a75708de-21c5-44ff-875a-63517f37333f` | Everyone who submits the form |
| `Blog & Practice Updates` | `2e8f9e58-4e9f-4391-aa05-433b0fec68eb` | Only those who tick the checkbox |

A person can be on one or both. Contacts are global in Resend, so someone on both is a single contact and counts once against quota.

### Not in this build

A third segment for the **paid Sep–Nov cohort** (session reminders, Zoom links, recording links) does not exist yet and is out of scope. It will be populated manually from Stripe. Do not build registration→segment automation.

## 2. Env

```
RESEND_API_KEY=                    # required
RESEND_SEGMENT_WORKSHOPS_ID=a75708de-21c5-44ff-875a-63517f37333f      # required
RESEND_SEGMENT_BLOG_PRACTICE_ID=2e8f9e58-4e9f-4391-aa05-433b0fec68eb  # optional
```

Set in `.env.local` and all three Vercel environments.

**The API key may need upgrading.** Contact and segment operations require a full-access key; a send-only key returns 403. If test submissions fail with an auth error, that's the cause.

## 3. Sanity schema

Singleton, grouped with Site Settings. Studio title **Email List Signup**.

```ts
defineType({
  name: 'emailSignup',
  title: 'Email List Signup',
  type: 'document',
  fields: [
    { name: 'enabled', type: 'boolean', title: 'Show signup on site', initialValue: true },

    { name: 'eyebrow', type: 'string', title: 'Eyebrow',   validation: r => r.max(40) },
    { name: 'heading', type: 'string', title: 'Heading',   validation: r => r.required().max(60) },
    { name: 'body',    type: 'text',   title: 'Body copy', rows: 2, validation: r => r.max(160) },

    { name: 'nameLabel',     type: 'string', title: 'First name field label', initialValue: 'First name', validation: r => r.max(30) },
    { name: 'emailLabel',    type: 'string', title: 'Email field label',      initialValue: 'Email',      validation: r => r.max(30) },
    { name: 'checkboxLabel', type: 'string', title: 'Opt-in checkbox label',
      initialValue: 'Also send me blog posts and practice updates',
      description: 'Secondary opt-in to the Blog & Practice Updates list. Unchecked by default.',
      validation: r => r.required().max(80) },
    { name: 'buttonLabel',   type: 'string', title: 'Button label', initialValue: 'Subscribe', validation: r => r.max(24) },
    { name: 'permissionLine', type: 'text', title: 'Permission line', rows: 2,
      description: 'Shown below the button. Must state what subscribers receive and that they can unsubscribe.',
      validation: r => r.required().max(180) },

    { name: 'successMessage', type: 'text', title: 'Success message', rows: 2, validation: r => r.required().max(160) },
    { name: 'errorMessage',   type: 'text', title: 'Error message',   rows: 2, validation: r => r.required().max(160) },

    { name: 'showInFooter',  type: 'boolean', title: 'Show compact version in footer', initialValue: true },
    { name: 'footerHeading', type: 'string',  title: 'Footer heading', validation: r => r.max(48) },
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: 'Email List Signup', subtitle: title }) },
})
```

Character limits are load-bearing — the band breaks with a long heading. Do not relax them. Register as a singleton (single document, no "create new").

### Starter content

- **eyebrow:** `Stay in touch`
- **heading:** `Workshop dates, first.`
- **body:** `Announcements for the workshop series — dates, topics, and when registration opens.`
- **checkboxLabel:** `Also send me blog posts and practice updates`
- **permissionLine:** `A few emails a month. Unsubscribe anytime. This list isn't a way to reach Stefanie about care — use the consultation form for that.`
- **successMessage:** `You're on the list. Workshop announcements will come to this address.`
- **errorMessage:** `That didn't go through. Check the email address and try again.`
- **footerHeading:** `Workshop announcements`

## 4. Components

### `<EmailSignupBand>` — home page only

Full-bleed. Ink ground `#14110E`, bone type `#F3EFE7`, vermillion `#FF4A17` button.

Fields, in order: **first name · email · checkbox · submit.**

- Checkbox sits below the email field, **unchecked by default**, label from `checkboxLabel`.
- Style the checkbox to match: bone hairline square, vermillion check mark. No native browser checkbox.
- Eyebrow in Archivo, uppercase, tracked, vermillion.
- Heading in Archivo Black, uppercase, **left-aligned to the page grid, not centered**. Centered stacks are the current Wix site's only layout move and an explicit anti-pattern.
- Inputs are **bone hairline-underline fields** — no boxes, no border-radius, transparent background. Boxed inputs read as a stock form and break the gallery language.
- Focus state: vermillion underline, 2px, visible for keyboard users. The checkbox needs a visible focus ring too.
- Button solid vermillion, ink label, square corners.
- Permission line below the button, small, bone at ~70% opacity.
- Desktop: heading/body left column, form right. Mobile: stacked.

**Spacing:** Direction C already has a marquee band of the five method words. Keep real vertical distance between the two or the home page reads as stripes.

### `<EmailSignupFooter>` — all other pages

Email + submit on one line. **No checkbox, no first name.** Subscribes to Workshop Announcements only. Inherits the footer ground, same underline treatment scaled down. Permission line collapses to a short link to the privacy note.

### Placement

- Band on `/` only, gated on `enabled`.
- Footer variant on all routes except `/`, gated on `enabled && showInFooter`.
- **Suppress both on workshop detail pages** (`/workshops/[slug]`) — that page's job is registration, and a competing CTA weakens it.

### Behavior

- Client-side validation on email format only. Never block on first name.
- Submit swaps the form for the success message in place — no redirect, no reload.
- Success and error announced via `aria-live="polite"`.
- Real `<label>` elements on every field including the checkbox.
- Button disabled with a pending state during the request.
- Respect `prefers-reduced-motion`.

## 5. API route

`POST /api/subscribe`

**Request:** `{ firstName?: string, email: string, blogOptIn: boolean, source: string, website?: string }`

`website` is the honeypot — hidden field; non-empty means bot, return the success shape and create nothing.

**Behavior:**

1. Validate email server-side. Malformed → 400.
2. Rate limit by IP: 5 requests / 10 min. In-memory is fine at launch volume.
3. Build the segment list: always `RESEND_SEGMENT_WORKSHOPS_ID`; add `RESEND_SEGMENT_BLOG_PRACTICE_ID` only when `blogOptIn` is true. **Pass both in a single `contacts.create` call** — not two calls.
4. **Already-subscribed returns success**, not an error. Never reveal list membership — for a clinician's site that's a real disclosure risk. Best-effort repair of missing segment membership on the existing contact is fine.
5. Log the consent record: `email`, `firstName`, `source`, `blogOptIn`, **which segments the contact was added to**, `timestamp`, `permissionLineVersion` (short hash of the permission copy displayed at submit), `userAgent`.

**Failure modes:**

- Missing `RESEND_API_KEY` or `RESEND_SEGMENT_WORKSHOPS_ID` → 503. Without them there's nowhere to put the contact.
- `blogOptIn` true but `RESEND_SEGMENT_BLOG_PRACTICE_ID` unset → **still create the contact in Workshop Announcements**, log a warning. Never fail a signup over the optional list.

**Response:** `{ ok: true }` or `{ ok: false }`. Never return Resend's raw error to the client.

### `source` values

`home_band`, `footer`. Pass explicitly from the component; never infer from referrer.

## 6. Hard constraint — list hygiene

**Stef's clinical client roster must never be uploaded to Resend or any ESP.** Both segments are populated only by self-signup through this form.

- No manual contact adds from any clinical source.
- No properties or segment names that could imply clinical status.

Keep this in `docs/email-list.md`, updated for the two-segment model.

## 7. Acceptance

- [ ] Editing heading/body/labels/checkbox label in Sanity changes the live band with no code deploy.
- [ ] `enabled: false` removes band and footer variant everywhere.
- [ ] Band on home only; footer variant on all other pages except workshop detail pages.
- [ ] Submit with checkbox **unchecked** → contact in Workshop Announcements only.
- [ ] Submit with checkbox **ticked** → contact in both segments, counted as one contact.
- [ ] Same address submitted twice → success both times, no duplicate.
- [ ] Honeypot submission → success response, no contact created.
- [ ] Keyboard-only: tab through name, email, checkbox, button; focus visible on all four; submits on Enter; checkbox togglable with space.
- [ ] Success message announced by a screen reader.
- [ ] Band legible and correctly stacked at 375px.
- [ ] A 60-character heading does not break the band layout.
- [ ] No references to topics remain anywhere in the codebase.

## 8. Open questions — do not build ahead of these

1. **Single vs. double opt-in.** Building single. Keep the route structured so a confirmation flow could be added without a rewrite.
2. **Checkbox default.** Currently unchecked — the more honest opt-in and the safer posture for a clinician's site. Stef may want it flipped.
3. **Cohort segment and Stripe.** Out of scope; manual for now.

## 9. Blockers

- API key permission level — needs full access, being confirmed.
- Sending domain DNS (SPF/DKIM/DMARC on `mail.stefanie-schumacher.com`) not configured. **Signup capture works without it**; only sending is blocked.
