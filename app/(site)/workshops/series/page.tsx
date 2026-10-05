import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { seriesPackagePath } from '@/lib/workshop-paths'
import { isSeriesPassEnabled } from '@/lib/workshop-price'
import { sanityFetch } from '@/sanity/lib/fetch'
import { activeSeriesSlugQuery, siteSettingsQuery } from '@/sanity/queries'
import type { SiteSettings } from '@/lib/types'

/**
 * Legacy package URL → active series package.
 * `/workshops/fall-2026` (etc.) is canonical.
 * When the pass is hidden, send people to the session list.
 */
export default async function LegacySeriesPackageRedirect() {
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery)
  if (!isSeriesPassEnabled(settings)) {
    redirect('/workshops')
  }
  const active = await sanityFetch<{ slug: string } | null>(
    activeSeriesSlugQuery,
  )
  if (!active?.slug) notFound()
  permanentRedirect(seriesPackagePath(active.slug))
}
