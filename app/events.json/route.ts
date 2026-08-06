import { NextResponse } from 'next/server'
import { getReadClient } from '@/sanity/lib/client'
import { siteSettingsQuery, workshopsQuery } from '@/sanity/queries'
import type { SiteSettings, Workshop } from '@/lib/types'
import { siteOrigin } from '@/lib/site-url'
import { workshopPath } from '@/lib/workshop-paths'
import { resolveWorkshopPrice } from '@/lib/workshop-price'

// Cached route — Sanity CDN on miss; /api/revalidate busts on publish.
export const revalidate = 60

export async function GET() {
  const client = getReadClient()
  const [settings, workshops] = await Promise.all([
    client.fetch<SiteSettings | null>(siteSettingsQuery),
    client.fetch<Workshop[]>(workshopsQuery),
  ])

  const origin = siteOrigin()
  const feedUrl = `${origin}/events.json`

  const items = (workshops || []).map((w) => {
    const url =
      w.seriesSlug && w.slug
        ? `${origin}${workshopPath(w.seriesSlug, w.slug)}`
        : `${origin}/workshops/${w.slug}`
    return {
      id: url,
      url,
      title: w.title,
      content_text: w.shortDescription || w.body || '',
      date_published: w.startsAt,
      date_modified: w.startsAt,
      authors: settings
        ? [{ name: settings.siteName, url: origin }]
        : undefined,
      tags: ['workshop', 'relational-diplomacy'],
      _stef: {
        sessionNumber: w.sessionNumber,
        endsAt: w.endsAt,
        price: resolveWorkshopPrice(w, settings),
        locationLabel: w.locationLabel || 'Zoom',
        stripePaymentLink: w.stripePaymentLink || null,
        zoomRegistrationUrl: w.zoomRegistrationUrl || null,
        registrationStatus: w.registrationStatus || null,
      },
    }
  })

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: settings
      ? `${settings.siteName} — Workshops`
      : 'Stefanie Schumacher — Workshops',
    home_page_url: origin,
    feed_url: feedUrl,
    description:
      settings?.defaultDescription ||
      'Relational Diplomacy workshop series — live online.',
    language: 'en-US',
    items,
  }

  return NextResponse.json(feed, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  })
}
