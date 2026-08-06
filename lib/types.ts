export type Workshop = {
  _id: string
  title: string
  slug: string
  seriesSlug?: string
  seriesTitle?: string
  seriesActive?: boolean
  seriesPassPrice?: number
  seriesPassPaymentLink?: string
  seriesWorkshopCount?: number
  sessionNumber: number
  startsAt: string
  durationMinutes?: number
  timeZone: string
  price?: number
  hook?: string
  stripePaymentLink?: string
  zoomRegistrationUrl?: string
  capacity?: number
  registrationStatus?: 'draft' | 'open' | 'closed' | 'sold-out'
  shortDescription?: string
  body?: string
  locationLabel?: string
  isPast?: boolean
}

export type Series = {
  _id: string
  title: string
  slug: string
  active?: boolean
  passPrice?: number
  passPaymentLink?: string
}

export type SiteSettings = {
  _id: string
  siteName: string
  practiceLine: string
  credentials?: string
  canonicalUrl: string
  contactEmail: string
  locationLabel?: string
  defaultTitle: string
  defaultDescription: string
  twitterTitle: string
  ogTitle: string
  mailingAddress?: string
  notificationsEnabled?: boolean
  /** @deprecated Prefer sessionPrice */
  defaultWorkshopPrice?: number
  sessionPrice?: number
  seriesPrice?: number
  seriesEyebrow?: string
  seriesDisplayLine?: string
  seriesSupportingLine?: string
  seriesOfferLine?: string
  seriesScheduleLine?: string
  seriesInclusions?: string[]
  seriesCtaLabel?: string
  seriesPaymentLink?: string
  workshopDisclaimer?: string
}

export type EmailSignup = {
  _id: string
  enabled?: boolean
  eyebrow?: string
  heading: string
  body?: string
  nameLabel?: string
  emailLabel?: string
  checkboxLabel?: string
  buttonLabel?: string
  permissionLine: string
  successMessage: string
  errorMessage: string
  showInFooter?: boolean
  footerHeading?: string
}

export type Service = {
  _id: string
  title: string
  slug: string
  order: number
  shortDescription?: string
  body?: string
  priceUSD?: number
  durationMinutes?: number
}

export type HeroJoin = 'break' | 'space' | 'none'

export type PageDoc = {
  _id: string
  title: string
  slug: string
  eyebrow?: string
  /** Non-home pages. Deprecated on home — use heroSolid / heroOutline. */
  headline?: string
  heroSolid?: string
  heroOutline?: string
  heroJoin?: HeroJoin
  summary?: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export type Policy = {
  _id: string
  title: string
  slug: string
  body: string
  showInFooter?: boolean
  footerOrder?: number
  footerLabel?: string
}
