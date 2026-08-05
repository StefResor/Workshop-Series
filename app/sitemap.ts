import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site-url'
import { sanityFetch } from '@/sanity/lib/fetch'
import { siteSettingsQuery, workshopsQuery } from '@/sanity/queries'
import type { SiteSettings, Workshop } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [workshops, settings] = await Promise.all([
    sanityFetch<Workshop[]>(workshopsQuery).catch(() => []),
    sanityFetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/approach',
    '/workshops',
    '/fees',
    '/contact',
  ].map((path) => ({
    url: absoluteUrl(path || '/'),
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/workshops' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/workshops' ? 0.9 : 0.7,
  }))

  if (
    settings?.seriesPrice != null &&
    settings?.seriesDisplayLine?.trim()
  ) {
    staticRoutes.push({
      url: absoluteUrl('/workshops/series'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  }

  const workshopRoutes: MetadataRoute.Sitemap = (workshops || []).map((w) => ({
    url: absoluteUrl(`/workshops/${w.slug}`),
    lastModified: new Date(w.startsAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...workshopRoutes]
}
