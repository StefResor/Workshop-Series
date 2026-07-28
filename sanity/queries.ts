/** Central GROQ queries — no inline queries elsewhere. */

export const workshopsQuery = `*[_type == "workshop" && status == "published"] | order(startsAt asc) {
  _id,
  title,
  "slug": slug.current,
  sessionNumber,
  startsAt,
  endsAt,
  timeZone,
  priceUSD,
  shortDescription,
  body,
  status,
  registrationUrl,
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
  priceUSD,
  shortDescription,
  body,
  status,
  registrationUrl,
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
  ogTitle
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
