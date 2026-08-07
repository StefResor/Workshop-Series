import Link from 'next/link'
import type { SiteSettings } from '@/lib/types'
import { seriesPackagePath } from '@/lib/workshop-paths'
import { sanityFetch } from '@/sanity/lib/fetch'
import { activeSeriesSlugQuery } from '@/sanity/queries'

type SeriesPackageBandProps = {
  settings: SiteSettings | null | undefined
  /** Nest inside a workshop grid/list — no full-bleed rules; spans parent columns. */
  embedded?: boolean
}

export async function SeriesPackageBand({
  settings,
  embedded = false,
}: SeriesPackageBandProps) {
  const seriesPrice = settings?.seriesPrice
  const displayLine = settings?.seriesDisplayLine?.trim()
  // Offer band needs a price and a display line — never invent either.
  if (seriesPrice == null || !displayLine) return null

  const active = await sanityFetch<{ slug: string } | null>(
    activeSeriesSlugQuery,
  ).catch(() => null)
  if (!active?.slug) return null

  const detailsPath = seriesPackagePath(active.slug)
  const eyebrow = settings?.seriesEyebrow?.trim()
  const supporting = settings?.seriesSupportingLine?.trim()
  const offerPhrase = settings?.seriesOfferLine?.trim()
  const scheduleLine = settings?.seriesScheduleLine?.trim()
  // Homepage band links to the series page — "Details", not Register.
  const ctaLabel = 'Details'

  const priceMeta = offerPhrase
    ? `$${seriesPrice} · ${offerPhrase}`
    : `$${seriesPrice}`

  const className = embedded
    ? 'series-package-band series-package-cell'
    : 'series-package-band'

  const inner = (
    <div className="series-package-band-inner">
      <span className="series-package-num" aria-hidden="true">
        01 - 10
      </span>
      {eyebrow ? (
        <p className="series-package-eyebrow">{eyebrow}</p>
      ) : null}
      <h2 id="series-package-heading" className="series-package-display">
        {displayLine}
      </h2>
      {supporting ? (
        <p className="series-package-support">{supporting}</p>
      ) : null}
      <p className="series-package-meta">{priceMeta}</p>
      {scheduleLine ? (
        <p className="series-package-meta">{scheduleLine}</p>
      ) : null}
      <Link
        className="btn series-package-cta"
        href={detailsPath}
        aria-label={`${ctaLabel}: ${displayLine}`}
      >
        {ctaLabel} <span aria-hidden="true">→</span>
      </Link>
    </div>
  )

  if (embedded) {
    return (
      <div className={className} aria-labelledby="series-package-heading">
        {inner}
      </div>
    )
  }

  return (
    <section className={className} aria-labelledby="series-package-heading">
      {inner}
    </section>
  )
}
