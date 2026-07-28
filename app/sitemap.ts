import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site-url'
import { sanityFetch } from '@/sanity/lib/fetch'
import { workshopsQuery } from '@/sanity/queries'
import type { Workshop } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const workshops = await sanityFetch<Workshop[]>(workshopsQuery).catch(() => [])

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

  const workshopRoutes: MetadataRoute.Sitemap = (workshops || []).map((w) => ({
    url: absoluteUrl(`/workshops/${w.slug}`),
    lastModified: new Date(w.startsAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...workshopRoutes]
}
