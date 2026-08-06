import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { SeriesPackageContent } from '@/components/SeriesPackageContent'
import { buildPageMetadata } from '@/lib/seo'
import type { Series, SiteSettings, Workshop } from '@/lib/types'
import { seriesPackagePath, workshopPath } from '@/lib/workshop-paths'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  seriesBySlugQuery,
  siteSettingsQuery,
  workshopBySlugQuery,
  workshopIndexSlugsQuery,
  workshopsBySeriesSlugQuery,
} from '@/sanity/queries'

type Props = { params: Promise<{ slug: string }> }

/**
 * Single-segment /workshops/[x]:
 * 1. series slug → package page
 * 2. workshop slug → 301 to /workshops/[series]/[slug]
 * 3. else 404
 *
 * Static sibling /workshops/series wins for the literal path "series".
 */
export async function generateStaticParams() {
  const rows = await sanityFetch<{
    series: string[]
    workshops: string[]
  }>(workshopIndexSlugsQuery).catch(() => ({ series: [], workshops: [] }))
  const slugs = new Set([...(rows.series || []), ...(rows.workshops || [])])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const series = await sanityFetch<Series | null>(seriesBySlugQuery, { slug })
  if (series) {
    const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery)
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
      path: seriesPackagePath(slug),
    })
  }
  return { title: 'Workshop' }
}

export default async function WorkshopsSlugPage({ params }: Props) {
  const { slug } = await params

  const series = await sanityFetch<Series | null>(seriesBySlugQuery, { slug })
  if (series) {
    const [settings, workshops] = await Promise.all([
      sanityFetch<SiteSettings | null>(siteSettingsQuery),
      sanityFetch<Workshop[]>(workshopsBySeriesSlugQuery, {
        series: series.slug,
      }),
    ])
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

  const workshop = await sanityFetch<Workshop | null>(workshopBySlugQuery, {
    slug,
  })
  if (workshop?.seriesSlug && workshop.slug) {
    permanentRedirect(workshopPath(workshop.seriesSlug, workshop.slug))
  }

  notFound()
}
