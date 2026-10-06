import type { ReactNode } from 'react'
import Link from 'next/link'
import { catalogueHook } from '@/lib/catalogue-hook'
import { sessionRegisterHref } from '@/lib/catalogue'
import {
  formatCatalogueRegisterLabel,
  formatWorkshopDisplay,
} from '@/lib/datetime'
import { resolveSessionPrice, resolveWorkshopPrice } from '@/lib/workshop-price'
import { topicPath } from '@/lib/workshop-paths'
import type { SiteSettings, Workshop } from '@/lib/types'

export function HomeWorkshopCard({
  workshop,
  settings,
  showSeriesLabel = false,
}: {
  workshop: Workshop
  settings: SiteSettings | null
  showSeriesLabel?: boolean
}) {
  const d = formatWorkshopDisplay(workshop.startsAt, workshop.timeZone)
  const hook = catalogueHook(workshop)
  const topicHref = topicPath(workshop.topicSlug || workshop.slug)
  const registerHref = sessionRegisterHref(workshop)
  const dateLabel = formatCatalogueRegisterLabel(
    workshop.startsAt,
    workshop.timeZone,
  )
  const price = resolveWorkshopPrice(workshop, settings)
  const defaultPrice = resolveSessionPrice(settings)
  const showPrice =
    price != null && (defaultPrice == null || price !== defaultPrice)

  let cta: ReactNode
  if (registerHref) {
    cta = (
      <a
        className="cta"
        href={registerHref}
        aria-label={`Register: ${workshop.title}, ${d.month} ${d.day}`}
      >
        Register · {dateLabel}
        {showPrice ? ` · $${price}` : ''}{' '}
        <span aria-hidden="true">→</span>
      </a>
    )
  } else if (workshop.registrationStatus === 'closed') {
    cta = <span className="cta cta--muted">Registration closed</span>
  } else if (workshop.registrationStatus === 'sold-out') {
    cta = <span className="cta cta--muted">Sold out</span>
  } else {
    cta = (
      <Link
        className="cta"
        href={topicHref}
        aria-label={`Details: ${workshop.title}, ${d.month} ${d.day}`}
      >
        Register · {dateLabel} <span aria-hidden="true">→</span>
      </Link>
    )
  }

  return (
    <article className="workshop-led">
      <span className="num" aria-hidden="true">
        {String(workshop.sessionNumber).padStart(2, '0')}
      </span>
      {showSeriesLabel && workshop.seriesTitle ? (
        <p className="workshop-led-series">{workshop.seriesTitle}</p>
      ) : null}
      <h2>
        <Link href={topicHref}>{workshop.title}</Link>
      </h2>
      <p className="hook">{hook || null}</p>
      <div className="workshop-led-foot">{cta}</div>
    </article>
  )
}
