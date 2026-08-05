# Privacy Policy — draft for review

Seed content for the Sanity `policy` document (`slug: privacy`, `_id: policy-privacy`,
`footerOrder: 2`, `footerLabel: Privacy`).

**Placeholder.** Written to be accurate to the system as built, but four
sections are marked **DECISION NEEDED** and one depends on what analytics the
site actually runs. Not legal advice — the clinical/non-clinical boundary in
particular is worth a short review by an attorney or her malpractice carrier.

**Effective date:** omit until Stef sets one at approval (same rule as terms).

**Analytics status in repo (2026-08-05):** no Google Analytics, Plausible, Fathom,
or `@vercel/analytics` found in the app. Closest to the “no analytics” option
until something is added.

**Studio:** kept as `drafts.policy-privacy` until the marked decisions are
resolved — do not publish while DECISION NEEDED blocks remain in the body.

---

## What this policy covers

This policy describes how information is handled on stefanie-schumacher.com and
in connection with the Relational Diplomacy workshop series.

It does not cover clinical services. Information shared in the course of
therapy is governed separately by professional confidentiality obligations and
applicable health privacy law, and is described in the paperwork provided to
therapy clients directly.

**Workshop registration is not clinical care.** Registering for a workshop does
not make you a client, does not create a therapist–client relationship, and
does not produce a clinical record. Registration information is not protected
health information.

## What is collected

**When you register for a workshop.** Your name and email address, collected
through Stripe at checkout, along with which workshop you registered for and
the date of registration. If you choose to receive announcements about future
workshops, that choice is recorded along with the date you made it.

**When you pay.** Payment card details are entered directly with Stripe and are
never received or stored by Stefanie Schumacher. Stripe provides only a
confirmation of payment, the amount, and the name and email address you
supplied.

**When you use the contact form.** Your name, email address, and whatever you
choose to write.

**When you attend a workshop.** Zoom collects the name you join under, your
email address, and technical connection information. Workshops are not
recorded.

**When you visit the site.**
[DECISION NEEDED — see "Analytics" below.]

## Who processes this information

| Service | Purpose |
| --- | --- |
| Stripe | Payment processing and workshop registration |
| Resend | Registration confirmations and workshop correspondence |
| Vercel | Website hosting |
| Sanity | Website content and registration records |
| Zoom | Live workshop delivery |

Each of these providers handles information under its own privacy terms.
Information is shared with them only as needed to run the workshops and the
site.

## Analytics

> **DECISION NEEDED.** What the site runs determines both this section and
> whether a cookie banner is required.
>
> **If no analytics:** "This site does not use analytics, advertising cookies,
> or third-party tracking."
>
> **If privacy-preserving analytics** (Plausible, Fathom, Vercel Analytics):
> "This site uses privacy-preserving analytics that count visits without
> cookies and without collecting personal information or building profiles of
> visitors."
>
> **If Google Analytics:** the section has to disclose cookie-based tracking,
> data sharing with Google, and — for visitors in the EU/UK — requires a
> consent banner before any tracking script loads.
>
> **Recommendation: don't use Google Analytics on this site.** A visitor
> browsing a therapy practice is doing something sensitive. Cookieless
> analytics answers the only questions worth asking here — which pages get
> read, which workshops get clicked — with no banner, no consent
> infrastructure, and no third-party profile of who was reading about couples
> therapy at 2am. It also costs about the same as nothing.

## How information is used

To confirm your registration, send you the Zoom link and passcode, remind you
before a workshop, respond to messages you send, and — only if you have opted
in — tell you when new workshop series are announced.

Information is not sold. It is not shared with anyone other than the service
providers listed above, except where required by law.

## Announcements and how to stop them

You may opt in to workshop announcements when you register. Every announcement
email includes an unsubscribe link, and unsubscribing takes effect immediately.

Unsubscribing does not affect the emails required to deliver a workshop you
have already paid for — your confirmation, your Zoom link, and your reminder
will still arrive.

## How long information is kept

> **DECISION NEEDED.** The system is built so past workshops go inert on their
> own, but "kept indefinitely" and "deleted after twelve months" are different
> promises and one has to be made. Options:
>
> **A.** Registration records are kept for twelve months after a workshop
> series ends, then deleted.
>
> **B.** Registration records are kept for three years for business and tax
> purposes, then deleted.
>
> **C.** Registration records are kept indefinitely.
>
> Payment records are separate: Stripe retains transaction records on its own
> schedule for financial and legal reasons, and that is outside Stef's control
> either way. Contact form messages need their own answer too.
>
> B is the common choice and aligns with how long financial records are
> typically retained. A is the more privacy-protective position and fits the
> practice's positioning. C is hard to justify and hard to defend.

## Your choices

You may ask what information is held about you, ask that it be corrected, ask
that it be deleted, and withdraw your consent to announcements at any time.
Requests can be sent through the contact form and will be answered within a
reasonable time.

Some information cannot be deleted on request where it must be retained for tax
or legal reasons — payment records in particular.

## Children

The workshops are for adults 18 and over. Information is not knowingly
collected from anyone under 18.

## Security

Information is held in the services listed above, each of which encrypts data
in transit and at rest. No system is perfectly secure, and no guarantee of
absolute security can be made.

## Visitors outside the United States

> **DECISION NEEDED.** Does Stef expect registrants outside the US?
>
> Her clientele includes people at multinational technology and aerospace
> companies, so EU or UK attendees are plausible rather than hypothetical. If
> so, GDPR obligations attach — a lawful basis for processing, explicit consent
> for marketing, and data subject rights with defined response times.
>
> If she wants to keep it simple, the alternative is stating that workshops are
> offered to participants in the United States only, and enforcing it at
> registration.

Information is processed and stored in the United States.

## Changes to this policy

This policy may be updated. The effective date above reflects the most recent
revision.

## Contact

Questions about this policy can be sent through the contact form at
stefanie-schumacher.com/contact.

---

## Notes for Mike, not for publication

**CCPA/CPRA almost certainly does not apply.** California's law attaches to
businesses above roughly $25M in annual revenue, or handling 100,000+
consumers' data, or deriving half their revenue from selling personal
information. A solo practice selling $47 workshops meets none of them. The same
is true of the Virginia, Colorado, Connecticut, and Texas laws — all have
thresholds far above this. The "Your choices" section above grants those rights
anyway, because it costs nothing and it's the right posture for a discretion-
first practice.

**GDPR is the one that could actually attach**, because it has no revenue
threshold — offering services to people in the EU is enough. Hence the marked
section.

**Ohio's own privacy legislation has moved in recent sessions.** Worth a check
on current status before publishing rather than relying on my knowledge here.

**The bigger analytics question.** If Google Analytics is already on the site,
removing it is easier now than after launch, and it removes the entire consent-
banner problem along with it. Worth deciding before the September traffic
arrives. *(Repo check: none of GA / Plausible / Fathom / Vercel Analytics is
wired in the Next app today.)*

**Still needed before publishing:** decisions on the four marked sections, an
effective date, the analytics answer, and legal review of the clinical /
non-clinical boundary.
