import type { Metadata } from 'next'
import Link from 'next/link'
import { SeriesPackageBand } from '@/components/SeriesPackageBand'
import { WorkshopDateLabel } from '@/components/WorkshopWhen'
import { formatWorkshopDisplay } from '@/lib/datetime'
import { buildPageMetadata } from '@/lib/seo'
import type { SiteSettings, Workshop } from '@/lib/types'
import { workshopPath } from '@/lib/workshop-paths'
import { workshopSeriesPriceClause } from '@/lib/workshop-price'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  siteSettingsQuery,
  workshopSeriesListQuery,
  workshopsQuery,
} from '@/sanity/queries'

type SeriesRow = {
  _id: string
  title: string
  slug: string
  active?: boolean
}

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: 'Workshops',
    description:
      'Relational Diplomacy workshop series — live online Wednesdays, 7:00–8:30 PM ET. Join any session, in any order.',
    path: '/workshops',
  })
}

function sortWithinSeries(a: Workshop, b: Workshop) {
  const aPast = Boolean(a.isPast)
  const bPast = Boolean(b.isPast)
  if (aPast !== bPast) return aPast ? 1 : -1
  return a.startsAt.localeCompare(b.startsAt)
}

export default async function WorkshopsPage() {
  const [workshops, seriesList, settings] = await Promise.all([
    sanityFetch<Workshop[]>(workshopsQuery),
    sanityFetch<SeriesRow[]>(workshopSeriesListQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ])

  const priceClause = workshopSeriesPriceClause(settings)
  const bySeries = new Map<string, Workshop[]>()
  for (const w of workshops || []) {
    const key = w.seriesSlug || 'unknown'
    const list = bySeries.get(key) || []
    list.push(w)
    bySeries.set(key, list)
  }
  for (const list of bySeries.values()) list.sort(sortWithinSeries)

  const orderedSeries = (seriesList || []).filter((s) => bySeries.has(s.slug))
  const hasAny = orderedSeries.some((s) => (bySeries.get(s.slug) || []).length > 0)

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
          Workshops by series
        </h2>

        {!hasAny ? (
          <div className="workshops-empty workshops-empty--index">
            <p className="workshops-empty-heading">
              This series has finished.
            </p>
            <p className="workshops-empty-body">
              New dates are announced soon. Use the signup below — a short note
              when the next series opens. Nothing else.
            </p>
          </div>
        ) : (
          orderedSeries.map((series) => {
            const rows = bySeries.get(series.slug) || []
            return (
              <div key={series._id} className="workshop-series-group">
                <h3 className="workshop-series-group-title">{series.title}</h3>
                <div className="workshop-list">
                  {rows.map((w) => {
                    const d = formatWorkshopDisplay(w.startsAt, w.timeZone)
                    const hook = w.hook || w.shortDescription
                    const href = workshopPath(series.slug, w.slug)
                    const past = Boolean(w.isPast)
                    return (
                      <Link
                        key={w._id}
                        href={href}
                        className={`workshop-row${past ? ' workshop-row--past' : ''}`}
                        aria-label={`${past ? 'Past: ' : 'Register: '}${w.title}, ${d.month} ${d.day}`}
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
                          {past ? (
                            <>Past</>
                          ) : (
                            <>
                              Register <span aria-hidden="true">→</span>
                            </>
                          )}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        <div className="workshop-list">
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
