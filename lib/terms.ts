/**
 * Fail-safe Terms copy when the published Sanity `policy` (slug: terms) is
 * missing — intended for Sanity outage / empty read, not as a standing default
 * while a draft awaits approval. Keep policy-terms published for live /terms.
 *
 * Source of truth for review also lives in docs/terms.md.
 *
 * Not legal advice — carrier/attorney review still applies.
 */
export const DEFAULT_TERMS_TITLE = 'Terms & Policies'

export const DEFAULT_TERMS_BODY = `## Registration

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

Questions about these terms can be sent through the contact form at [stefanie-schumacher.com/contact](/contact).`
