import type { MetadataRoute } from 'next'
import { absoluteUrl, siteOrigin } from '@/lib/site-url'

/**
 * Studio is noindex'd in its layout metadata — do not Disallow it here.
 * Disallowing a URL prevents crawlers from seeing noindex, which can leave
 * linked URLs indexable. Public feeds live at /events.json and /events.ics
 * (not under /api/), so /api/ can stay disallowed for contact/revalidate.
 *
 * Preview / *.vercel.app deployments: disallow everything. Set
 * NEXT_PUBLIC_SITE_URL to the real production host (not *.vercel.app).
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin()
  const previewAlias =
    origin.includes('vercel.app') || process.env.VERCEL_ENV === 'preview'

  if (previewAlias) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

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
