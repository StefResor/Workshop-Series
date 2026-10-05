import type { Metadata } from 'next'
import { CatalogueTopicRow } from '@/components/CatalogueTopicRow'
import { HomeWorkshopCard } from '@/components/HomeWorkshopCard'
import { buildPageMetadata } from '@/lib/seo'
import type { CatalogueTopic, SiteSettings, Workshop } from '@/lib/types'
import { workshopSeriesPriceClause } from '@/lib/workshop-price'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  catalogueTopicsQuery,
  siteSettingsQuery,
  upcomingPublicWorkshopsQuery,
  workshopsQuery,
} from '@/sanity/queries'

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: 'Workshops',
    description:
      'The Connection Workshop — live online Wednesdays, 7:00–8:30 PM ET. Join any session, in any order.',
    path: '/workshops',
  })
}

export default async function WorkshopsPage() {
  const [zone1, fallbackUpcoming, topics, settings] = await Promise.all([
    sanityFetch<Workshop[]>(workshopsQuery),
    sanityFetch<Workshop[]>(upcomingPublicWorkshopsQuery),
    sanityFetch<CatalogueTopic[]>(catalogueTopicsQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ])

  const currentRemaining = zone1 || []
  const betweenSeries = currentRemaining.length === 0
  const nowRunning = betweenSeries
    ? (fallbackUpcoming || []).filter(
        (w) => w.seriesSlug === fallbackUpcoming?.[0]?.seriesSlug,
      )
    : currentRemaining
  const zone1Title = nowRunning[0]?.seriesTitle
    ? betweenSeries
      ? `Next up: ${nowRunning[0].seriesTitle}`
      : `Now running: ${nowRunning[0].seriesTitle}`
    : null

  const priceClause = workshopSeriesPriceClause(settings, null)
  const catalogue = topics || []

  return (
    <>
      <header className="page-hero">
        <span className="kicker">The Connection Workshop</span>
        <h1>Workshop Series</h1>
        <p className="lede">
          {`The Connection Workshop · Live · Wednesdays 7:00–8:30 PM ET · Zoom${priceClause} · Join any session, in any order · 18+. Educational in nature — not psychotherapy.`}
        </p>
      </header>

      {nowRunning.length > 0 && zone1Title ? (
        <section
          className="section workshops-now-section"
          aria-labelledby="workshops-now-heading"
        >
          <h2 id="workshops-now-heading" className="section-heading section-title">
            {zone1Title}
          </h2>
          <div className="workshop-led-grid">
            {nowRunning.map((w) => (
              <HomeWorkshopCard
                key={w._id}
                workshop={w}
                settings={settings}
                showSeriesLabel={false}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="section workshops-catalogue-section"
        id="all-workshops"
        aria-labelledby="all-workshops-heading"
      >
        <h2 id="all-workshops-heading" className="section-heading section-title">
          All workshops
        </h2>
        <p className="section-sub">
          Each workshop stands alone and runs several times a year. Join any
          session, in any order.
        </p>
        <div className="catalogue-list">
          {catalogue.map((topic) => (
            <CatalogueTopicRow key={topic._id} topic={topic} />
          ))}
        </div>
      </section>
    </>
  )
}
