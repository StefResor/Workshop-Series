# Terms & Policies — draft for Stef's review

Seed content for the Sanity `policy` document (`slug: terms`, `_id: policy-terms`).
All content decisions below are resolved; this is ready for Stef's review and legal review.

**Not legal advice.** The licensure-adjacent language — the therapy disclaimer and
the scope-of-practice framing — is worth a short review by an attorney or her
malpractice carrier before this goes live.

**Effective date:** omit until Stef sets one at approval. Optional first body line
`Effective date: Month D, YYYY` becomes the page eyebrow; placeholders (TBD,
pending, etc.) are stripped and do not render.

---

## Registration

Registration is required for each participant. If you are attending with a
spouse or partner, each person must register individually, even if you will be
participating from the same device or Zoom connection.

Individual registration helps support the continued development of the workshop
series and allows these workshops to remain accessible while maintaining the
quality of the educational experience.

Workshops are open to adults 18 and over.

## Refunds

Because each workshop requires advance planning, scheduling, and preparation,
all registrations are non-refundable.

Thank you for supporting the time, preparation, and care that goes into
creating each workshop.

## Cancellation by Stefanie Schumacher

If a workshop is cancelled and not rescheduled, registrants will receive a full
refund for that workshop.

If a workshop is rescheduled, registration carries over to the new date.
Registrants who are unable to attend the rescheduled date may request a refund
for that workshop.

## These workshops are not therapy

The workshop series is educational and skills-based. These workshops are not
psychotherapy, mental health treatment, crisis intervention, or a substitute
for professional counseling. Participation does not establish a
therapist–client relationship with Stefanie Schumacher.

No particular outcome is promised or guaranteed. What participants take from
the material depends on their own circumstances and engagement.

## Emotional wellbeing during workshops

While relationship topics can naturally evoke emotional responses, participants
are encouraged to engage at a level that feels comfortable and to take breaks
as needed.

If you are experiencing significant emotional distress, please seek support
from a licensed professional in your area. If you are in crisis or thinking
about harming yourself, call or text 988 to reach the Suicide and Crisis
Lifeline, available 24 hours a day in the United States.

## Conduct

To help create a respectful learning environment, participants are expected to
treat one another with courtesy and professionalism. Harassing, disruptive, or
abusive behavior may result in removal from a workshop without refund.

## Recording and group privacy

Zoom recording will be disabled by the host. Participants are prohibited from
recording, photographing, screenshotting, or otherwise capturing any portion of
a workshop without prior written permission.

To help create a safe and respectful learning environment, participants are
asked to honor the privacy of everyone attending. While every effort is made to
foster a respectful atmosphere, these are group educational workshops and
complete confidentiality cannot be guaranteed. Participants are encouraged to
share only what feels comfortable in a group setting.

## Your information

Information collected when you register — your name and email address — is used
to deliver workshop materials and correspondence. Payment information is
handled by Stripe and is never stored by Stefanie Schumacher.

Workshop registration is not clinical care. Registration information is not a
clinical record and is not protected health information.

See the [Privacy Policy](/privacy) for how information is collected, used, and retained.

## Changes to these terms

These terms may be updated from time to time. The effective date above reflects
the most recent revision. Registrations are governed by the terms in effect on
the date of registration.

## Governing law

These terms are governed by the laws of the State of Ohio.

## Contact

Questions about these terms can be sent through the contact form at
[stefanie-schumacher.com/contact](/contact).

---

## Still needed before publishing

- A physical or mailing address, if one is ever published — currently omitted
  by design, but CAN-SPAM will require one for marketing email
- The Privacy Policy this document references, at `/privacy`
- Legal review of the therapy-disclaimer and scope language
- Note for Phase 2: the no-recording clause forecloses gated workshop
  recordings. Revisiting it later means amending published terms and, in
  fairness, not applying the change retroactively to anyone who registered
  under the current version.
- Public route `/terms` (rewrite → `/policies/terms`). Fail-safe in
  `lib/terms.ts` is for CMS outage only — keep `policy-terms` published.
