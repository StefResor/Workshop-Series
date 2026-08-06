/** Central GROQ queries — no inline queries elsewhere. */

const workshopProjection = `{
  _id,
  title,
  "slug": slug.current,
  "seriesSlug": series->slug.current,
  "seriesTitle": series->title,
  "seriesActive": series->active,
  sessionNumber,
  startsAt,
  endsAt,
  durationMinutes,
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
  locationLabel,
  "isPast": startsAt <= now()
}`

/** Homepage: next 4 upcoming across active series. */
export const homeUpcomingWorkshopsQuery = `*[
  _type == "workshop" &&
  startsAt > now() &&
  series->active == true
] | order(startsAt asc) [0...4] ${workshopProjection}`

/** Archive list — all workshops; UI groups by series. */
export const workshopsQuery = `*[_type == "workshop"] | order(startsAt asc) ${workshopProjection}`

/** Series documents that have at least one workshop, newest first. */
export const workshopSeriesListQuery = `*[_type == "series" && count(*[_type == "workshop" && series._ref == ^._id]) > 0] | order(title desc) {
  _id,
  title,
  "slug": slug.current,
  active,
  passPrice,
  passPaymentLink
}`

export const workshopBySeriesAndSlugQuery = `*[
  _type == "workshop" &&
  slug.current == $slug &&
  series->slug.current == $series
][0] ${workshopProjection}`

/** Flat slug lookup for 301 redirects from legacy /workshops/[slug]. */
export const workshopBySlugQuery = `*[_type == "workshop" && slug.current == $slug][0] ${workshopProjection}`

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

export const workshopsForStaticParamsQuery = `*[_type == "workshop" && defined(slug.current) && defined(series->slug.current)]{
  "slug": slug.current,
  "series": series->slug.current
}`
