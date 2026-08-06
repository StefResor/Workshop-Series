import { notFound, permanentRedirect } from 'next/navigation'
import type { Workshop } from '@/lib/types'
import { workshopPath } from '@/lib/workshop-paths'
import { sanityFetch } from '@/sanity/lib/fetch'
import { workshopBySlugQuery } from '@/sanity/queries'

type Props = { params: Promise<{ slug: string }> }

/**
 * Legacy flat URLs → series-scoped paths.
 * `/workshops/series` is a static sibling and wins over this dynamic segment.
 */
export default async function LegacyWorkshopSlugRedirect({ params }: Props) {
  const { slug } = await params
  const workshop = await sanityFetch<Workshop | null>(workshopBySlugQuery, {
    slug,
  })
  if (!workshop?.seriesSlug || !workshop.slug) notFound()
  permanentRedirect(workshopPath(workshop.seriesSlug, workshop.slug))
}
