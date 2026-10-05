import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { TopicDetail } from '@/components/TopicDetail'
import { buildPageMetadata } from '@/lib/seo'
import type { CatalogueTopic, Series, SiteSettings, Workshop } from '@/lib/types'
import { topicPath, workshopPath } from '@/lib/workshop-paths'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  seriesBySlugQuery,
  siteSettingsQuery,
  topicBySlugQuery,
  workshopBySlugQuery,
  workshopIndexSlugsQuery,
} from '@/sanity/queries'

type Props = { params: Promise<{ series: string }> }

/**
 * Single-segment /workshops/[x]:
 * 1. series slug → /workshops (no series-pass package page)
 * 2. topic slug → topic detail (wins over Fall session slugs)
 * 3. leftover session slug → 301 to /workshops/[series]/[slug]
 * 4. else 404
 */
export async function generateStaticParams() {
  const rows = await sanityFetch<{
    series: string[]
    topics: string[]
    workshops: string[]
  }>(workshopIndexSlugsQuery).catch(() => ({
    series: [],
    topics: [],
    workshops: [],
  }))
  const slugs = new Set([
    ...(rows.series || []),
    ...(rows.topics || []),
    ...(rows.workshops || []),
  ])
  return [...slugs].map((series) => ({ series }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series: segment } = await params
  const series = await sanityFetch<Series | null>(seriesBySlugQuery, {
    slug: segment,
  })
  if (series) {
    return { title: 'Workshops' }
  }

  const topic = await sanityFetch<CatalogueTopic | null>(topicBySlugQuery, {
    slug: segment,
  })
  if (topic) {
    return buildPageMetadata({
      title: topic.title,
      description:
        topic.hook ||
        topic.shortDescription ||
        'Live Relational Diplomacy workshop with Stefanie Schumacher.',
      path: topicPath(topic.slug),
    })
  }

  return { title: 'Workshop' }
}

export default async function WorkshopsSeriesSegmentPage({ params }: Props) {
  const { series: segment } = await params

  const series = await sanityFetch<Series | null>(seriesBySlugQuery, {
    slug: segment,
  })
  if (series) {
    redirect('/workshops')
  }

  const topic = await sanityFetch<CatalogueTopic | null>(topicBySlugQuery, {
    slug: segment,
  })
  if (topic) {
    const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery)
    return <TopicDetail topic={topic} settings={settings} />
  }

  const workshop = await sanityFetch<Workshop | null>(workshopBySlugQuery, {
    slug: segment,
  })
  if (workshop?.seriesSlug && workshop.slug) {
    permanentRedirect(workshopPath(workshop.seriesSlug, workshop.slug))
  }

  notFound()
}
