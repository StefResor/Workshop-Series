import { notFound, permanentRedirect } from 'next/navigation'
import { seriesPackagePath } from '@/lib/workshop-paths'
import { sanityFetch } from '@/sanity/lib/fetch'
import { activeSeriesSlugQuery } from '@/sanity/queries'

/**
 * Legacy package URL → active series package.
 * `/workshops/fall-2026` (etc.) is canonical.
 */
export default async function LegacySeriesPackageRedirect() {
  const active = await sanityFetch<{ slug: string } | null>(
    activeSeriesSlugQuery,
  )
  if (!active?.slug) notFound()
  permanentRedirect(seriesPackagePath(active.slug))
}
