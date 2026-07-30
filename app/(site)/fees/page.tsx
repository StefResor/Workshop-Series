import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import type { PageDoc, Service, SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  pageBySlugQuery,
  servicesQuery,
  siteSettingsQuery,
} from '@/sanity/queries'

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'fees',
  })
  return buildPageMetadata({
    title: 'Fees',
    description:
      page?.summary ||
      'Private-pay fees for couples and individual Relational Diplomacy sessions, plus workshop pricing.',
    path: '/fees',
  })
}

export default async function FeesPage() {
  const [page, services, settings] = await Promise.all([
    sanityFetch<PageDoc | null>(pageBySlugQuery, { slug: 'fees' }),
    sanityFetch<Service[]>(servicesQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ])

  const couples = services?.find((s) => s.slug.includes('couples'))
  const individuals = services?.find((s) => s.slug.includes('individual'))
  const workshopDefault = settings?.defaultWorkshopPrice ?? null

  return (
    <>
      <header className="page-hero">
        <span className="kicker">{page?.eyebrow || 'Private pay'}</span>
        <h1>{page?.headline || 'Fees'}</h1>
        <p className="lede">
          {page?.summary ||
            'Private pay for highly motivated clients dedicated to a growth mindset and optimal performance.'}
        </p>
      </header>

      <section className="fees-strip fees-strip--3" aria-label="Session fees">
        <div className="fee">
          <span className="k">Workshops</span>
          <div className="amt">
            {workshopDefault != null ? (
              <>
                ${workshopDefault} <span>/ session</span>
              </>
            ) : (
              <span>Contact for current fees</span>
            )}
          </div>
          <p>Per participant · live on Zoom · 90 min</p>
        </div>
        <div className="fee">
          <span className="k">Individuals</span>
          <div className="amt">
            {individuals?.priceUSD != null ? (
              <>
                ${individuals.priceUSD}{' '}
                {individuals.durationMinutes != null ? (
                  <span>/ {individuals.durationMinutes} min</span>
                ) : null}
              </>
            ) : (
              <span>Contact for current fees</span>
            )}
          </div>
          <p>Private pay · online · discreet</p>
        </div>
        <div className="fee">
          <span className="k">Couples</span>
          <div className="amt">
            {couples?.priceUSD != null ? (
              <>
                ${couples.priceUSD}{' '}
                {couples.durationMinutes != null ? (
                  <span>/ {couples.durationMinutes} min</span>
                ) : null}
              </>
            ) : (
              <span>Contact for current fees</span>
            )}
          </div>
          <p>Private pay · online · discreet</p>
        </div>
      </section>

      <section className="section" aria-labelledby="workshop-fees-heading">
        <h2 id="workshop-fees-heading" className="section-title">
          Workshops
        </h2>
        <p className="section-sub">
          Relational Diplomacy Workshop Series
          {workshopDefault != null
            ? ` — $${workshopDefault} per participant`
            : ''}{' '}
          · live on Zoom · 90 minutes. Non-refundable. Educational — not
          psychotherapy.
        </p>
        <Link className="btn" href="/workshops">
          View workshops
        </Link>
      </section>
    </>
  )
}
