import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import type { PageDoc, Service } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import { pageBySlugQuery, servicesQuery } from '@/sanity/queries'

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
  const [page, services] = await Promise.all([
    sanityFetch<PageDoc | null>(pageBySlugQuery, { slug: 'fees' }),
    sanityFetch<Service[]>(servicesQuery),
  ])

  const couples = services?.find((s) => s.order === 1)
  const individuals = services?.find((s) => s.slug.includes('individual'))

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

      <section className="fees-strip" aria-label="Session fees">
        <div className="fee">
          <span className="k">Couples</span>
          <div className="amt">
            ${couples?.priceUSD ?? 300}{' '}
            <span>/ {couples?.durationMinutes ?? 75} min</span>
          </div>
          <p>Private pay · online · discreet</p>
        </div>
        <div className="fee">
          <span className="k">Individuals</span>
          <div className="amt">
            ${individuals?.priceUSD ?? 150}{' '}
            <span>/ {individuals?.durationMinutes ?? 50} min</span>
          </div>
          <p>Private pay · online · discreet</p>
        </div>
      </section>

      <section className="section" aria-labelledby="workshop-fees-heading">
        <h2 id="workshop-fees-heading" className="section-title">
          Workshops
        </h2>
        <p className="section-sub">
          Relational Diplomacy Workshop Series — $35 per participant · live on Zoom ·
          90 minutes. Non-refundable. Educational — not psychotherapy.
        </p>
        <Link className="btn" href="/contact">
          Request a Consultation
        </Link>
      </section>
    </>
  )
}
