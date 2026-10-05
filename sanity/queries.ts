/** Central GROQ queries — no inline queries elsewhere. */

/**
 * Dated offerings are workshopSession. Dual-type keeps webhook/GROQ working
 * if a leftover workshop doc (or workshop_slug Payment Link) is still around.
 */
export const BOOKABLE = `_type in ["workshopSession", "workshop"]`

/** Published listings hide registrationStatus draft (Winter/Spring/Summer seed). */
export const PUBLIC_BOOKABLE = `${BOOKABLE} && registrationStatus != "draft"`

/**
 * Current series: hasn't ended yet, earliest startsOn.
 * "Winter 2027" sorts above "Fall 2026" by title, so never use active + title desc.
 * $today is America/New_York YYYY-MM-DD, injected by sanityFetch.
 */
export const currentSeriesIdQuery = `(*[_type == "series" && defined(endsOn) && endsOn >= $today] | order(startsOn asc) [0]._id)`

/** Phase 1 public surfaces: current series only. Later seasons wait for the Phase 2 catalogue. */
export const CURRENT_SERIES_BOOKABLE = `${PUBLIC_BOOKABLE} && series._ref == ${currentSeriesIdQuery}`

const workshopProjection = `{
  _id,
  "title": coalesce(topic->title, title),
  "slug": slug.current,
  "seriesSlug": series->slug.current,
  "seriesTitle": series->title,
  "seriesActive": series._ref == ${currentSeriesIdQuery},
  "seriesPassPrice": series->passPrice,
  "seriesPassPaymentLink": series->passPaymentLink,
  "seriesWorkshopCount": count(*[${CURRENT_SERIES_BOOKABLE} && series._ref == ^.series._ref]),
  "sessionNumber": coalesce(sessionNumber, topic->order),
  startsAt,
  durationMinutes,
  timeZone,
  price,
  "hook": coalesce(topic->hook, hook),
  stripePaymentLink,
  zoomRegistrationUrl,
  capacity,
  registrationStatus,
  "shortDescription": coalesce(topic->shortDescription, shortDescription),
  "body": coalesce(topic->description, body),
  locationLabel,
  "isPast": startsAt <= now()
}`

/** Homepage: upcoming sessions in the current series window. */
export const homeUpcomingWorkshopsQuery = `*[
  ${CURRENT_SERIES_BOOKABLE} &&
  startsAt > now()
] | order(startsAt asc) ${workshopProjection}`

/** Archive list — current series only, same window as the homepage. */
export const workshopsQuery = `*[${CURRENT_SERIES_BOOKABLE}] | order(startsAt asc) ${workshopProjection}`

/** Series documents that have at least one public session in the current window. */
export const workshopSeriesListQuery = `*[_type == "series" && _id == ${currentSeriesIdQuery}] {
  _id,
  title,
  "slug": slug.current,
  startsOn,
  endsOn,
  passPrice,
  passPaymentLink
}`

export const workshopBySeriesAndSlugQuery = `*[
  ${CURRENT_SERIES_BOOKABLE} &&
  slug.current == $slug &&
  series->slug.current == $series
][0] ${workshopProjection}`

/** Flat slug lookup for 301 redirects from legacy /workshops/[slug]. */
export const workshopBySlugQuery = `*[${CURRENT_SERIES_BOOKABLE} && slug.current == $slug][0] ${workshopProjection}`

export const seriesBySlugQuery = `*[_type == "series" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  startsOn,
  endsOn,
  passPrice,
  passPaymentLink
}`

/** Current series for package CTA / legacy /workshops/series redirect. */
export const activeSeriesSlugQuery = `*[_type == "series" && defined(slug.current) && defined(endsOn) && endsOn >= $today] | order(startsOn asc) [0]{
  "slug": slug.current,
  title
}`

/** Current series with pass display fields for homepage spec composition. */
export const activeSeriesQuery = `*[_type == "series" && defined(slug.current) && defined(endsOn) && endsOn >= $today] | order(startsOn asc) [0]{
  "slug": slug.current,
  title,
  passPrice,
  passPaymentLink
}`

export const workshopsBySeriesSlugQuery = `*[
  ${CURRENT_SERIES_BOOKABLE} &&
  series->slug.current == $series
] | order(startsAt asc) ${workshopProjection}`

/** Single-segment /workshops/[slug] static params: current series + its session slugs. */
export const workshopIndexSlugsQuery = `{
  "series": *[_id == ${currentSeriesIdQuery} && defined(slug.current)].slug.current,
  "workshops": *[${CURRENT_SERIES_BOOKABLE} && defined(slug.current)].slug.current
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
  seriesPassEnabled,
  seriesPrice,
  seriesEyebrow,
  seriesDisplayLine,
  seriesSupportingLine,
  seriesOfferLine,
  seriesScheduleLine,
  seriesInclusions,
  seriesCtaLabel,
  seriesPaymentLink,
  workshopDisclaimer,
  marqueeKeywords
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
  lede,
  "body": body[].text,
  priceUSD,
  durationMinutes
}`

export const pageBySlugQuery = `*[_type == "page" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  eyebrow,
  headline,
  heroSolid,
  heroOutline,
  heroJoin,
  heroFootnote,
  workshopsHeading,
  workshopsSpec,
  workshopsSpecTail,
  workshopsNote,
  portrait {
    alt,
    hotspot,
    crop,
    asset->{
      _id,
      metadata { dimensions { width, height, aspectRatio } }
    }
  },
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

export const workshopsForStaticParamsQuery = `*[${CURRENT_SERIES_BOOKABLE} && defined(slug.current) && defined(series->slug.current)]{
  "slug": slug.current,
  "series": series->slug.current
}`
