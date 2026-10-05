import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site-url'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  catalogueTopicsQuery,
  footerPoliciesQuery,
} from '@/sanity/queries'
import type { CatalogueTopic, Policy } from '@/lib/types'
import { topicPath } from '@/lib/workshop-paths'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [topics, footerPolicies] = await Promise.all([
    sanityFetch<CatalogueTopic[]>(catalogueTopicsQuery).catch(() => []),
    sanityFetch<Pick<Policy, 'slug'>[]>(footerPoliciesQuery).catch(() => []),
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

  for (const p of footerPolicies || []) {
    if (!p.slug) continue
    staticRoutes.push({
      url: absoluteUrl(`/${p.slug}`),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    })
  }

  const topicRoutes: MetadataRoute.Sitemap = (topics || [])
    .filter((t) => t.slug)
    .map((t) => ({
      url: absoluteUrl(topicPath(t.slug)),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...staticRoutes, ...topicRoutes]
}
