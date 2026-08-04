export type Workshop = {
  _id: string
  title: string
  slug: string
  sessionNumber: number
  startsAt: string
  endsAt: string
  timeZone: string
  price?: number
  hook?: string
  stripePaymentLink?: string
  zoomRegistrationUrl?: string
  capacity?: number
  registrationStatus?: 'draft' | 'open' | 'sold-out' | 'past'
  shortDescription?: string
  body?: string
  status: 'published' | 'draft'
  locationLabel?: string
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
  defaultWorkshopPrice?: number
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

export type PageDoc = {
  _id: string
  title: string
  slug: string
  eyebrow?: string
  headline?: string
  summary?: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}
