/**
 * Server-only workshop fields for Stripe → Resend confirmation.
 * Never import from client components or public page trees for rendering.
 */

export type WorkshopRegistrationPrivate = {
  _id: string
  title: string
  sessionNumber?: number
  startsAt: string
  endsAt: string
  timeZone: string
  stripeProductId?: string
  zoomLink?: string
  zoomPasscode?: string
}

const privateProjection = `{
  _id,
  title,
  sessionNumber,
  startsAt,
  endsAt,
  timeZone,
  stripeProductId,
  zoomLink,
  zoomPasscode
}`

/** Published docs only — drafts excluded. Private credentials projected. */
export const workshopByStripeProductIdQuery = `*[
  _type == "workshop" &&
  stripeProductId == $productId &&
  !(_id in path("drafts.**"))
][0] ${privateProjection}`

/** All published workshops, chronological — for series pass emails + admin. */
export const publishedWorkshopsPrivateQuery = `*[
  _type == "workshop" &&
  status == "published" &&
  !(_id in path("drafts.**"))
] | order(startsAt asc) ${privateProjection}`

/** Single published workshop by Sanity document id. */
export const workshopPrivateByIdQuery = `*[
  _type == "workshop" &&
  _id == $id &&
  !(_id in path("drafts.**"))
][0] ${privateProjection}`

/**
 * Admin list — booleans only for Zoom presence (never project join URL/passcode).
 */
export type WorkshopAdminListItem = {
  _id: string
  title: string
  sessionNumber?: number
  startsAt: string
  timeZone: string
  stripeProductId?: string
  hasZoomLink: boolean
  hasZoomPasscode: boolean
}

export const workshopsAdminListQuery = `*[
  _type == "workshop" &&
  status == "published" &&
  !(_id in path("drafts.**"))
] | order(startsAt asc) {
  _id,
  title,
  sessionNumber,
  startsAt,
  timeZone,
  stripeProductId,
  "hasZoomLink": defined(zoomLink) && zoomLink != "",
  "hasZoomPasscode": defined(zoomPasscode) && zoomPasscode != ""
}`
