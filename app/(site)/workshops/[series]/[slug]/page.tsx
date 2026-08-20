import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SeriesContextBand } from '@/components/SeriesContextBand'
import { WorkshopWhen } from '@/components/WorkshopWhen'
import { breadcrumbJsonLd, workshopEventJsonLd } from '@/lib/schema'
import { buildPageMetadata } from '@/lib/seo'
import type { SiteSettings, Workshop } from '@/lib/types'
import { DEFAULT_WORKSHOP_DISCLAIMER } from '@/lib/workshop-disclaimer'
import { resolveWorkshopPrice } from '@/lib/workshop-price'
import { workshopPath } from '@/lib/workshop-paths'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  siteSettingsQuery,
  workshopBySeriesAndSlugQuery,
  workshopsForStaticParamsQuery,
} from '@/sanity/queries'

type Props = { params: Promise<{ series: string; slug: string }> }

export async function generateStaticParams() {
  const rows = await sanityFetch<{ series: string; slug: string }[]>(
    workshopsForStaticParamsQuery,
  ).catch(() => [])
  return (rows || []).map((r) => ({ series: r.series, slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series, slug } = await params
  const workshop = await sanityFetch<Workshop | null>(
    workshopBySeriesAndSlugQuery,
    { series, slug },
  )
  if (!workshop) return { title: 'Workshop' }
  return buildPageMetadata({
    title: workshop.title,
    description:
      workshop.shortDescription ||
      'Live Relational Diplomacy workshop with Stefanie Schumacher.',
    path: workshopPath(series, slug),
  })
}

function paragraphs(body?: string) {
  return (body || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default async function WorkshopDetailPage({ params }: Props) {
  const { series, slug } = await params
  const [workshop, settings] = await Promise.all([
    sanityFetch<Workshop | null>(workshopBySeriesAndSlugQuery, {
      series,
      slug,
    }),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ])
  if (!workshop?.seriesSlug) notFound()

  const path = workshopPath(workshop.seriesSlug, workshop.slug)
  const policyNote =
    settings?.workshopDisclaimer?.trim() || DEFAULT_WORKSHOP_DISCLAIMER

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Workshops', path: '/workshops' },
    { name: workshop.title, path },
  ])

  const price = resolveWorkshopPrice(workshop, settings)
  const priceLabel =
    price != null ? `$${price}` : 'Contact for current fees'
  const duration = workshop.durationMinutes ?? 90
  const canRegister =
    workshop.registrationStatus === 'open' &&
    !workshop.isPast &&
    Boolean(workshop.stripePaymentLink)
  const registerHref = canRegister ? workshop.stripePaymentLink : null

  let cta: ReactNode
  if (registerHref) {
    cta = (
      <a className="btn" href={registerHref}>
        Register — {priceLabel}
      </a>
    )
  } else if (workshop.isPast) {
    cta = <span className="btn" aria-disabled="true">Past</span>
  } else if (workshop.registrationStatus === 'sold-out') {
    cta = <span className="btn" aria-disabled="true">Sold out</span>
  } else if (workshop.registrationStatus === 'closed') {
    cta = (
      <span className="btn" aria-disabled="true">
        Registration closed
      </span>
    )
  } else {
    cta = (
      <Link
        className="btn"
        href={`/contact?workshop=${encodeURIComponent(workshop.title)}`}
      >
        Inquire to register — {priceLabel}
      </Link>
    )
  }

  const seriesCount = workshop.seriesWorkshopCount ?? 0
  const seriesSlug = workshop.seriesSlug
  const seriesTitle = workshop.seriesTitle
  const seriesPassPrice = workshop.seriesPassPrice
  const showSeriesBand = Boolean(
    workshop.seriesPassPaymentLink &&
      seriesPassPrice != null &&
      seriesSlug &&
      seriesTitle &&
      seriesCount > 0,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            workshopEventJsonLd(
              workshop,
              settings?.siteName || 'Stefanie Schumacher',
              price,
            ),
          ),
        }}
      />
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
          <span className="kicker">The Connection Workshop</span>
          <h1>{workshop.title}</h1>
          <div className="ev-meta">
            <div>
              <span className="k">When</span>
              <WorkshopWhen
                startsAt={workshop.startsAt}
                timeZone={workshop.timeZone}
              />
            </div>
            <div>
              <span className="k">Format</span>
              Live on Zoom · {duration} min
            </div>
            <div>
              <span className="k">Price</span>
              {price != null
                ? `$${price} per participant`
                : 'Contact for current fees'}
            </div>
          </div>
          <div className="ev-body">
            {paragraphs(workshop.body || workshop.shortDescription).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <div className="ev-cta">{cta}</div>
          {showSeriesBand &&
          seriesSlug &&
          seriesTitle &&
          seriesPassPrice != null ? (
            <SeriesContextBand
              sessionNumber={workshop.sessionNumber}
              seriesCount={seriesCount}
              seriesTitle={seriesTitle}
              seriesSlug={seriesSlug}
              passPrice={seriesPassPrice}
              sessionPrice={price}
              isPast={Boolean(workshop.isPast)}
            />
          ) : null}
          <p className="ev-note">{policyNote}</p>
        </article>
      </div>
    </>
  )
}
