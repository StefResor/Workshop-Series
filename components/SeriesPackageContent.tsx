import Link from 'next/link'
import { WorkshopDateLabel } from '@/components/WorkshopWhen'
import { breadcrumbJsonLd } from '@/lib/schema'
import type { SiteSettings, Workshop } from '@/lib/types'
import { DEFAULT_WORKSHOP_DISCLAIMER } from '@/lib/workshop-disclaimer'
import { seriesPackagePath, workshopPath } from '@/lib/workshop-paths'
import { resolveSessionPrice } from '@/lib/workshop-price'

type SeriesPackageContentProps = {
  seriesSlug: string
  settings: SiteSettings
  workshops: Workshop[]
}

/** Package marketing surface — copy still from siteSettings (Winter move later). */
export function SeriesPackageContent({
  seriesSlug,
  settings,
  workshops,
}: SeriesPackageContentProps) {
  const seriesPrice = settings.seriesPrice
  const displayLine = settings.seriesDisplayLine?.trim()
  if (seriesPrice == null || !displayLine) return null

  const path = seriesPackagePath(seriesSlug)
  const eyebrow = settings.seriesEyebrow?.trim()
  const supporting = settings.seriesSupportingLine?.trim()
  const offerPhrase = settings.seriesOfferLine?.trim()
  const scheduleLine = settings.seriesScheduleLine?.trim()
  const sessionPrice = resolveSessionPrice(settings)
  const inclusions = (settings.seriesInclusions || [])
    .map((line) => line?.trim())
    .filter(Boolean)
  const ctaLabel = settings.seriesCtaLabel?.trim() || 'Register'
  const ctaHref = settings.seriesPaymentLink?.trim()
  const policyNote =
    settings.workshopDisclaimer?.trim() || DEFAULT_WORKSHOP_DISCLAIMER

  const priceLabel = offerPhrase
    ? `$${seriesPrice} · ${offerPhrase}`
    : `$${seriesPrice}`

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Workshops', path: '/workshops' },
    { name: displayLine, path },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="ev-band" aria-hidden="true" />
      <div className="ev-shell">
        <nav aria-label="Breadcrumb" className="ev-back-nav">
          <Link href="/workshops" className="ev-back">
            ← All workshops
          </Link>
        </nav>
        <article className="ev-wrap">
          <span className="kicker">
            {eyebrow || 'Relational Diplomacy Workshop Series'}
          </span>
          <h1>{displayLine}</h1>
          <div className="ev-meta">
            <div>
              <span className="k">Package</span>
              {priceLabel}
            </div>
            {scheduleLine ? (
              <div>
                <span className="k">When</span>
                {scheduleLine}
              </div>
            ) : null}
            <div>
              <span className="k">Format</span>
              Live on Zoom · 10 sessions
              {sessionPrice != null
                ? ` · $${sessionPrice} per single session`
                : null}
            </div>
          </div>
          {supporting ? (
            <div className="ev-body">
              <p>{supporting}</p>
            </div>
          ) : null}
          {inclusions.length > 0 ? (
            <ul className="series-detail-inclusions">
              {inclusions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}

          <h2 className="series-detail-sessions-heading">The ten sessions</h2>
          <ol className="series-detail-sessions">
            {(workshops || []).map((w) => (
              <li key={w._id}>
                <Link href={workshopPath(seriesSlug, w.slug)}>
                  <span className="series-detail-session-num" aria-hidden="true">
                    {String(w.sessionNumber).padStart(2, '0')}
                  </span>
                  <span className="series-detail-session-copy">
                    <span className="series-detail-session-title">{w.title}</span>
                    <span className="series-detail-session-meta">
                      <WorkshopDateLabel
                        startsAt={w.startsAt}
                        timeZone={w.timeZone}
                      />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <div style={{ marginTop: 38 }}>
            {ctaHref ? (
              <a className="btn" href={ctaHref}>
                {ctaLabel} — ${seriesPrice}
              </a>
            ) : (
              <Link
                className="btn"
                href={`/contact?workshop=${encodeURIComponent(displayLine)}`}
              >
                Inquire to register — ${seriesPrice}
              </Link>
            )}
          </div>
          <p className="ev-note">{policyNote}</p>
        </article>
      </div>
    </>
  )
}
