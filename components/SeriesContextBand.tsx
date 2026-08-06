import Link from 'next/link'
import {
  numberWord,
  seriesContextBodyPast,
  seriesContextBodyUpcoming,
} from '@/lib/series-pass-copy'
import { seriesPackagePath } from '@/lib/workshop-paths'

type SeriesContextBandProps = {
  sessionNumber: number
  seriesCount: number
  seriesTitle: string
  seriesSlug: string
  passPrice: number
  /** Required for the savings clause; omit clause when null. */
  sessionPrice: number | null
  isPast?: boolean
}

/**
 * Series membership + pass offer under the Register CTA on workshop detail.
 * Caller must only mount when series has passPaymentLink and passPrice.
 */
export function SeriesContextBand({
  sessionNumber,
  seriesCount,
  seriesTitle,
  seriesSlug,
  passPrice,
  sessionPrice,
  isPast = false,
}: SeriesContextBandProps) {
  if (!(passPrice > 0) || !(seriesCount > 0) || !seriesSlug || !seriesTitle) {
    return null
  }

  const sessionLabel = String(sessionNumber).padStart(2, '0')
  const countLabel = String(seriesCount).padStart(2, '0')
  const eyebrow = `Workshop ${sessionLabel} of ${countLabel} · ${seriesTitle}`

  const body = isPast
    ? seriesContextBodyPast({ seriesTitle, passPrice })
    : seriesContextBodyUpcoming({
        seriesCount,
        passPrice,
        sessionPrice,
      })

  // Emphasize $passPrice in the body without wrapping the whole sentence.
  const priceToken = `$${passPrice}`
  const priceIndex = body.indexOf(priceToken)
  const before = priceIndex >= 0 ? body.slice(0, priceIndex) : body
  const after = priceIndex >= 0 ? body.slice(priceIndex + priceToken.length) : ''

  const countWord = numberWord(seriesCount)
  const ariaLabel = `See the full ${seriesTitle} series${
    countWord ? ` — all ${countWord} sessions` : ''
  }`

  return (
    <aside className="ev-series-band" aria-label="Series package">
      <div className="ev-series-band-accent" aria-hidden="true" />
      <p className="ev-series-band-eyebrow">{eyebrow}</p>
      <p className="ev-series-band-body">
        {before}
        {priceIndex >= 0 ? (
          <span className="ev-series-band-price">{priceToken}</span>
        ) : null}
        {after}
      </p>
      <Link
        className="ev-series-band-link"
        href={seriesPackagePath(seriesSlug)}
        aria-label={ariaLabel}
      >
        See the full series <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}
