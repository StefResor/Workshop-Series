import { getReadClient } from '@/sanity/lib/client'
import { workshopsQuery } from '@/sanity/queries'
import { formatWorkshopIcsUtc } from '@/lib/datetime'
import { buildIcsCalendar } from '@/lib/ics'
import type { Workshop } from '@/lib/types'
import { siteOrigin } from '@/lib/site-url'

// Cached route — Sanity CDN on miss; /api/revalidate busts on publish.
export const revalidate = 60

export async function GET() {
  const client = getReadClient()
  const workshops = await client.fetch<Workshop[]>(workshopsQuery)
  const origin = siteOrigin()
  const nowStamp = formatWorkshopIcsUtc(new Date().toISOString())

  const events = (workshops || []).map((w) => {
    const url = `${origin}/workshops/${w.slug}`
    return {
      uid: `${w._id}@stefanie-schumacher.com`,
      dtStamp: nowStamp,
      dtStart: formatWorkshopIcsUtc(w.startsAt),
      dtEnd: formatWorkshopIcsUtc(w.endsAt),
      summary: w.title,
      description: w.shortDescription || w.body || undefined,
      location: w.locationLabel || 'Zoom',
      url,
    }
  })

  const body = buildIcsCalendar(events, '-//Stefanie Schumacher//Workshops//EN')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  })
}
