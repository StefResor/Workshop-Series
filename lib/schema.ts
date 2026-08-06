import type { SiteSettings, Workshop } from '@/lib/types'
import { absoluteUrl, siteOrigin } from '@/lib/site-url'

type PersonInput = Pick<
  SiteSettings,
  | 'siteName'
  | 'credentials'
  | 'practiceLine'
  | 'contactEmail'
  | 'locationLabel'
  | 'canonicalUrl'
  | 'defaultDescription'
>

type EventInput = Pick<
  Workshop,
  | 'title'
  | 'slug'
  | 'seriesSlug'
  | 'startsAt'
  | 'endsAt'
  | 'durationMinutes'
  | 'shortDescription'
  | 'body'
  | 'stripePaymentLink'
  | 'locationLabel'
  | 'price'
>

/**
 * Person JSON-LD for the practitioner.
 * Do not emit LocalBusiness or ProfessionalService (ProfessionalService is a
 * LocalBusiness subtype on schema.org and inherits address/geo expectations).
 */
export function personJsonLd(settings: PersonInput) {
  const origin = settings.canonicalUrl || siteOrigin()
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${origin}/#person`,
    name: settings.siteName,
    honorificSuffix: settings.credentials || undefined,
    jobTitle: settings.practiceLine,
    email: settings.contactEmail,
    url: origin,
    description: settings.defaultDescription || settings.practiceLine,
    image: absoluteUrl('/stefanie-schumacher.jpg'),
    homeLocation: settings.locationLabel
      ? {
          '@type': 'Place',
          name: settings.locationLabel,
        }
      : undefined,
  }
}

export function websiteJsonLd(settings: PersonInput) {
  const origin = settings.canonicalUrl || siteOrigin()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: settings.siteName,
    description: settings.defaultDescription || settings.practiceLine,
    publisher: { '@id': `${origin}/#person` },
    inLanguage: 'en-US',
  }
}

/** Event JSON-LD for a workshop (online attendance). */
export function workshopEventJsonLd(
  workshop: EventInput,
  organizerName = 'Stefanie Schumacher',
  /** Resolved price (override ?? site default). Prefer this over workshop.price. */
  resolvedPrice?: number | null,
) {
  const origin = siteOrigin()
  const path = workshop.seriesSlug
    ? `/workshops/${workshop.seriesSlug}/${workshop.slug}`
    : `/workshops/${workshop.slug}`
  const url = absoluteUrl(path)
  const offerUrl = workshop.stripePaymentLink || url
  const price = resolvedPrice ?? workshop.price ?? null
  const endDate =
    workshop.endsAt ||
    (workshop.durationMinutes != null
      ? new Date(
          new Date(workshop.startsAt).getTime() +
            workshop.durationMinutes * 60_000,
        ).toISOString()
      : undefined)

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${url}#event`,
    name: workshop.title,
    description: workshop.shortDescription || workshop.body || undefined,
    startDate: workshop.startsAt,
    endDate,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    inLanguage: 'en-US',
    isAccessibleForFree: false,
    location: {
      '@type': 'VirtualLocation',
      url: offerUrl,
      name: workshop.locationLabel || 'Zoom',
    },
    organizer: {
      '@type': 'Person',
      name: organizerName,
      url: origin,
    },
    performer: {
      '@type': 'Person',
      name: organizerName,
      url: origin,
    },
    url,
    image: absoluteUrl('/stefanie-schumacher.jpg'),
    offers:
      price != null
        ? {
            '@type': 'Offer',
            price,
            priceCurrency: 'USD',
            url: offerUrl,
            availability: 'https://schema.org/InStock',
            validFrom: new Date().toISOString(),
          }
        : undefined,
  }
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
