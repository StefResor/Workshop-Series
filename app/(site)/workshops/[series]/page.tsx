import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { SeriesPackageContent } from '@/components/SeriesPackageContent'
import { TopicDetail } from '@/components/TopicDetail'
import { buildPageMetadata } from '@/lib/seo'
import type { CatalogueTopic, Series, SiteSettings, Workshop } from '@/lib/types'
import { seriesPackagePath, topicPath, workshopPath } from '@/lib/workshop-paths'
import { isSeriesPassEnabled } from '@/lib/workshop-price'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  seriesBySlugQuery,
  siteSettingsQuery,
  topicBySlugQuery,
  workshopBySlugQuery,
  workshopIndexSlugsQuery,
  workshopsBySeriesSlugQuery,
} from '@/sanity/queries'

type Props = { params: Promise<{ series: string }> }

/**
 * Single-segment /workshops/[x]:
 * 1. series slug → package page (or /workshops when the pass is hidden)
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
    const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery)
    if (!isSeriesPassEnabled(settings)) {
      return { title: 'Workshops' }
    }
    const title =
      settings?.seriesDisplayLine?.trim() ||
      settings?.seriesEyebrow?.trim() ||
      series.title ||
      'Full Series'
    return buildPageMetadata({
      title,
      description:
        settings?.seriesSupportingLine?.trim() ||
        'All ten Relational Diplomacy workshop sessions — live online.',
      path: seriesPackagePath(segment),
    })
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
    const [settings, workshops] = await Promise.all([
      sanityFetch<SiteSettings | null>(siteSettingsQuery),
      sanityFetch<Workshop[]>(workshopsBySeriesSlugQuery, {
        series: series.slug,
      }),
    ])
    if (!isSeriesPassEnabled(settings)) {
      redirect('/workshops')
    }
    if (
      !settings ||
      settings.seriesPrice == null ||
      !settings.seriesDisplayLine?.trim()
    ) {
      notFound()
    }
    return (
      <SeriesPackageContent
        seriesSlug={series.slug}
        settings={settings}
        workshops={workshops || []}
      />
    )
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
