import type { MetadataRoute } from 'next'
import { absoluteUrl, siteOrigin } from '@/lib/site-url'

/**
 * Studio is noindex'd in its layout metadata — do not Disallow it here.
 * Disallowing a URL prevents crawlers from seeing noindex, which can leave
 * linked URLs indexable. Public feeds live at /events.json and /events.ics
 * (not under /api/), so /api/ can stay disallowed for contact/revalidate.
 */
export default function robots(): MetadataRoute.Robots {
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
