import type { Metadata } from 'next'
import Link from 'next/link'
import { WorkshopDateLabel, WorkshopWhen } from '@/components/WorkshopWhen'
import { buildPageMetadata } from '@/lib/seo'
import type { Workshop } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import { workshopsQuery } from '@/sanity/queries'

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: 'Workshops',
    description:
      'Relational Diplomacy workshop series — live online Wednesdays, 7:00–8:30 PM ET. Join any session, in any order.',
    path: '/workshops',
  })
}

export default async function WorkshopsPage() {
  const workshops = await sanityFetch<Workshop[]>(workshopsQuery)

  return (
    <>
      <header className="page-hero">
        <span className="kicker">Relational Diplomacy</span>
        <h1>Workshop Series</h1>
        <p className="lede">
          Live · Wednesdays 7:00–8:30 PM ET · Zoom · Join any session, in any order ·
          18+. Educational in nature — not psychotherapy.
        </p>
      </header>

      <section className="section" aria-labelledby="workshop-list-heading">
        <h2 id="workshop-list-heading" className="visually-hidden">
          Upcoming workshops
        </h2>
        <div className="workshop-list">
          {(workshops || []).map((w) => (
            <Link
              key={w._id}
              href={`/workshops/${w.slug}`}
              className="workshop-row"
              aria-label={
                w.price != null
                  ? `${w.title}, ${w.price} dollars`
                  : `${w.title}, contact for current fees`
              }
            >
              <WorkshopDateLabel startsAt={w.startsAt} timeZone={w.timeZone} />
              <span>
                <span style={{ fontWeight: 600 }}>{w.title}</span>
                <br />
                <span className="meta">
                  <WorkshopWhen startsAt={w.startsAt} timeZone={w.timeZone} />
                </span>
              </span>
              <span className="meta">
                {w.price != null ? `$${w.price}` : 'Contact for fees'}
              </span>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 36 }}>
          <a className="btn" href="/events.ics">
            Subscribe · Calendar (.ics)
          </a>
        </p>
      </section>
    </>
  )
}
