import type { Metadata } from 'next'
import Link from 'next/link'
import { SeriesPackageBand } from '@/components/SeriesPackageBand'
import { WorkshopDateLabel } from '@/components/WorkshopWhen'
import { formatWorkshopDisplay } from '@/lib/datetime'
import { buildPageMetadata } from '@/lib/seo'
import type { SiteSettings, Workshop } from '@/lib/types'
import { workshopSeriesPriceClause } from '@/lib/workshop-price'
import { sanityFetch } from '@/sanity/lib/fetch'
import { siteSettingsQuery, workshopsQuery } from '@/sanity/queries'

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: 'Workshops',
    description:
      'Relational Diplomacy workshop series — live online Wednesdays, 7:00–8:30 PM ET. Join any session, in any order.',
    path: '/workshops',
  })
}

export default async function WorkshopsPage() {
  const [workshops, settings] = await Promise.all([
    sanityFetch<Workshop[]>(workshopsQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ])

  const priceClause = workshopSeriesPriceClause(settings)

  return (
    <>
      <header className="page-hero">
        <span className="kicker">Relational Diplomacy</span>
        <h1>Workshop Series</h1>
        <p className="lede">
          {`Relational Diplomacy · Live · Wednesdays 7:00–8:30 PM ET · Zoom${priceClause} · Join any session, in any order · 18+. Educational in nature — not psychotherapy.`}
        </p>
      </header>

      <section
        className="section workshops-index-section"
        aria-labelledby="workshop-list-heading"
      >
        <h2 id="workshop-list-heading" className="visually-hidden">
          Upcoming workshops
        </h2>
        <div className="workshop-list">
          {(workshops || []).map((w) => {
            const d = formatWorkshopDisplay(w.startsAt, w.timeZone)
            const hook = w.hook || w.shortDescription
            return (
              <Link
                key={w._id}
                href={`/workshops/${w.slug}`}
                className="workshop-row"
                aria-label={`Register: ${w.title}, ${d.month} ${d.day}`}
              >
                <span className="num" aria-hidden="true">
                  {String(w.sessionNumber).padStart(2, '0')}
                </span>
                <WorkshopDateLabel
                  startsAt={w.startsAt}
                  timeZone={w.timeZone}
                />
                <span className="workshop-row-copy">
                  <span className="workshop-row-title">{w.title}</span>
                  {hook ? (
                    <span className="workshop-row-hook">{hook}</span>
                  ) : null}
                </span>
                <span className="workshop-row-cta">
                  Register <span aria-hidden="true">→</span>
                </span>
              </Link>
            )
          })}
          <SeriesPackageBand settings={settings} embedded />
        </div>
      </section>

      <section className="section workshops-index-footer">
        <a className="btn" href="/events.ics">
          Subscribe · Calendar (.ics)
        </a>
      </section>
    </>
  )
}
