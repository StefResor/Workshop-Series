import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { allowSearchIndexing } from '@/lib/indexing'
import { absoluteUrl, siteOrigin } from '@/lib/site-url'

/**
 * Studio is noindex'd in its layout metadata — do not Disallow it here.
 * Disallowing a URL prevents crawlers from seeing noindex, which can leave
 * linked URLs indexable. Public feeds live at /events.json and /events.ics
 * (not under /api/), so /api/ can stay disallowed for contact/revalidate.
 *
 * robots.txt must match meta robots: key off the *request host*, not only
 * NEXT_PUBLIC_SITE_URL (which stays on the Vercel alias until DNS cutover).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host')
  const indexable = allowSearchIndexing(host)

  if (!indexable) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

  const origin = siteOrigin()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: origin,
  }
}
