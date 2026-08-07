import Link from 'next/link'
import {
  formatWorkshopDisplay,
  DISPLAY_TIME_ZONE,
} from '@/lib/datetime'
import { seriesPassIndexOfferLine, numberWord } from '@/lib/series-pass-copy'
import type { SiteSettings, Workshop } from '@/lib/types'
import { seriesPackagePath } from '@/lib/workshop-paths'
import { resolveSessionPrice } from '@/lib/workshop-price'

type SeriesIndexRowProps = {
  seriesSlug: string
  seriesTitle: string
  passPrice: number
  passPaymentLink: string
  workshops: Workshop[]
  settings: SiteSettings | null | undefined
}

function seriesMonthSpan(workshops: Workshop[]): string {
  if (!workshops.length) return ''
  const sorted = [...workshops].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  )
  const tz = sorted[0].timeZone || DISPLAY_TIME_ZONE
  const first = formatWorkshopDisplay(sorted[0].startsAt, tz)
  const last = formatWorkshopDisplay(sorted[sorted.length - 1].startsAt, tz)
  const a = first.month.slice(0, 3).toUpperCase()
  const b = last.month.slice(0, 3).toUpperCase()
  return a === b ? a : `${a}–${b}`
}

function seriesNumLabel(count: number): string {
  const end = String(count).padStart(2, '0')
  return `01–${end}`
}

/**
 * Full-series pass as an eleventh index row on /workshops.
 * Shares `.workshop-row` grid with session rows — alignment without equivalence.
 */
export function SeriesIndexRow({
  seriesSlug,
  seriesTitle,
  passPrice,
  passPaymentLink,
  workshops,
  settings,
}: SeriesIndexRowProps) {
  const paymentLink = passPaymentLink.trim()
  if (!(passPrice > 0) || !paymentLink || !seriesSlug) return null

  const displayLine = settings?.seriesDisplayLine?.trim()
  if (!displayLine) return null

  const count = workshops.length
  if (count < 1) return null

  const detailsPath = seriesPackagePath(seriesSlug)
  const eyebrow =
    settings?.seriesEyebrow?.trim() || 'The full series'
  const supporting = settings?.seriesSupportingLine?.trim()
  const scheduleLine = settings?.seriesScheduleLine?.trim()
  const ctaLabel =
    settings?.seriesCtaLabel?.trim() || 'Register'
  const sessionPrice = resolveSessionPrice(settings)
  const offerLine = seriesPassIndexOfferLine(passPrice, sessionPrice, count)
  const monthSpan = seriesMonthSpan(workshops)
  const countWord = numberWord(count)
  const headingId = `series-index-${seriesSlug}`

  return (
    <div
      className="workshop-row workshop-row--series"
      aria-labelledby={headingId}
    >
      <span className="num" aria-hidden="true">
        {seriesNumLabel(count)}
      </span>
      {monthSpan ? (
        <span className="d" aria-hidden="true">
          {monthSpan}
        </span>
      ) : (
        <span className="d" aria-hidden="true" />
      )}
      <div className="workshop-row-copy">
        <p className="workshop-row-series-eyebrow">{eyebrow}</p>
        <h2 id={headingId} className="workshop-row-title">
          {displayLine}
        </h2>
        {supporting ? (
          <p className="workshop-row-hook">{supporting}</p>
        ) : null}
        <div className="workshop-row-series-meta">
          {offerLine ? <p>{offerLine}</p> : null}
          {scheduleLine ? <p>{scheduleLine}</p> : null}
        </div>
      </div>
      <Link
        className="btn workshop-row-series-cta"
        href={detailsPath}
        aria-label={`${ctaLabel}: ${displayLine}${
          countWord ? ` — all ${countWord} sessions` : ''
        }${seriesTitle ? ` (${seriesTitle})` : ''}`}
      >
        {ctaLabel} <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
