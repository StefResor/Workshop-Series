/**
 * Server-only workshop fields for Stripe → Resend confirmation.
 * Never import from client components or public page trees for rendering.
 */

export type WorkshopRegistrationPrivate = {
  _id: string
  title: string
  startsAt: string
  endsAt: string
  timeZone: string
  stripeProductId?: string
  zoomLink?: string
  zoomPasscode?: string
}

/** Published docs only — drafts excluded. Private credentials projected. */
export const workshopByStripeProductIdQuery = `*[
  _type == "workshop" &&
  stripeProductId == $productId &&
  !(_id in path("drafts.**"))
][0] {
  _id,
  title,
  startsAt,
  endsAt,
  timeZone,
  stripeProductId,
  zoomLink,
  zoomPasscode
}`
