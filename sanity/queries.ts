/** Central GROQ queries — no inline queries elsewhere. */

export const workshopsQuery = `*[_type == "workshop" && status == "published"] | order(startsAt asc) {
  _id,
  title,
  "slug": slug.current,
  sessionNumber,
  startsAt,
  endsAt,
  timeZone,
  price,
  hook,
  stripePaymentLink,
  zoomRegistrationUrl,
  capacity,
  registrationStatus,
  shortDescription,
  body,
  status,
  locationLabel
}`

export const workshopBySlugQuery = `*[_type == "workshop" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  sessionNumber,
  startsAt,
  endsAt,
  timeZone,
  price,
  hook,
  stripePaymentLink,
  zoomRegistrationUrl,
  capacity,
  registrationStatus,
  shortDescription,
  body,
  status,
  locationLabel
}`

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  _id,
  siteName,
  practiceLine,
  credentials,
  canonicalUrl,
  contactEmail,
  locationLabel,
  defaultTitle,
  defaultDescription,
  twitterTitle,
  ogTitle,
  mailingAddress,
  notificationsEnabled,
  defaultWorkshopPrice,
  sessionPrice,
  seriesPrice,
  seriesEyebrow,
  seriesDisplayLine,
  seriesSupportingLine,
  seriesOfferLine,
  seriesScheduleLine,
  seriesInclusions,
  seriesCtaLabel,
  seriesPaymentLink,
  workshopDisclaimer
}`

export const emailSignupQuery = `*[_type == "emailSignup"][0] {
  _id,
  enabled,
  eyebrow,
  heading,
  body,
  nameLabel,
  emailLabel,
  checkboxLabel,
  buttonLabel,
  permissionLine,
  successMessage,
  errorMessage,
  showInFooter,
  footerHeading
}`

export const servicesQuery = `*[_type == "service"] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  order,
  shortDescription,
  body,
  priceUSD,
  durationMinutes
}`

export const pageBySlugQuery = `*[_type == "page" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  eyebrow,
  headline,
  summary,
  body,
  ctaLabel,
  ctaHref
}`

/** Published policies only — drafts are excluded by the API unless previewed. */
export const policyBySlugQuery = `*[_type == "policy" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  body,
  showInFooter,
  footerOrder,
  footerLabel
}`

/** All published policies — footer visibility is separate (`footerPoliciesQuery`). */
export const policiesForStaticParamsQuery = `*[_type == "policy" && defined(slug.current)]{
  "slug": slug.current
}`

export const footerPoliciesQuery = `*[_type == "policy" && showInFooter == true] | order(footerOrder asc) {
  _id,
  title,
  "slug": slug.current,
  footerLabel,
  footerOrder
}`
