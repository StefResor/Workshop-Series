export type Workshop = {
  _id: string
  title: string
  slug: string
  sessionNumber: number
  startsAt: string
  endsAt: string
  timeZone: string
  priceUSD: number
  shortDescription?: string
  body?: string
  status: 'published' | 'draft'
  registrationUrl?: string
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
