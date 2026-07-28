import type { Metadata } from 'next'
import Link from 'next/link'
import { WorkshopDateLabel } from '@/components/WorkshopWhen'
import { buildPageMetadata } from '@/lib/seo'
import type { PageDoc, Service, SiteSettings, Workshop } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  pageBySlugQuery,
  servicesQuery,
  siteSettingsQuery,
  workshopsQuery,
} from '@/sanity/queries'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery)
  const meta = buildPageMetadata({
    title:
      settings?.defaultTitle || 'Stefanie Schumacher — Relational Diplomacy',
    description:
      settings?.defaultDescription ||
      'Structured, direct relationship work for high-responsibility professionals and leaders. Private-pay, online, and discreet.',
    path: '/',
    ogTitle: settings?.ogTitle,
  })
  return {
    ...meta,
    title: {
      absolute:
        settings?.defaultTitle || 'Stefanie Schumacher — Relational Diplomacy',
    },
  }
}

const METHOD = [
  'Accountability',
  'Honesty',
  'Repair',
  'Boundaries',
  'Pattern Recognition',
  'The Wise Adult',
]

const HOW = [
  'Clarify the problem, precisely',
  'Understand its origins, with compassion',
  'Build new skills, deliberately',
  'Practice until it shows up in daily life',
]

function splitHeadline(headline?: string) {
  const text = (headline || 'Say the hard thing skillfully.').replace(/\.$/, '')
  const parts = text.split(/\s+/)
  if (parts.length < 2) {
    return { lines: [text], outline: '' }
  }
  const outline = parts[parts.length - 1]
  const rest = parts.slice(0, -1)
  // Prototype breaks: Say the / hard thing / skillfully.
  if (rest.length >= 4) {
    return {
      lines: [rest.slice(0, 2).join(' '), rest.slice(2).join(' ')],
      outline,
    }
  }
  return { lines: [rest.join(' ')], outline }
}

export default async function HomePage() {
  const [home, services, workshops] = await Promise.all([
    sanityFetch<PageDoc | null>(pageBySlugQuery, { slug: 'home' }),
    sanityFetch<Service[]>(servicesQuery),
    sanityFetch<Workshop[]>(workshopsQuery),
  ])

  const { lines, outline } = splitHeadline(home?.headline)
  const couples = services?.find((s) => s.slug.includes('couples') && s.order === 1)
  const individuals = services?.find((s) => s.slug.includes('individual'))

  return (
    <>
      <section className="home-hero">
        <span className="kicker">
          {home?.eyebrow || 'Relational Diplomacy · For Individuals & Couples'}
        </span>
        <h1>
          {lines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
          {outline ? <span className="outline">{outline}.</span> : null}
        </h1>
        <div className="hero-row">
          <p>
            {home?.summary ||
              'Structured, direct relationship work for high-responsibility professionals and leaders. Deliberately small caseload. Private-pay, online, and discreet — all adults welcome.'}
          </p>
          <Link className="btn" href="/contact">
            {home?.ctaLabel || 'Request a Consultation'}
          </Link>
        </div>
      </section>

      <div className="bigband" aria-hidden="true">
        <div className="marquee-inner">
          {[...METHOD, ...METHOD].map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="service-grid" aria-label="The work">
        {(services || []).map((service, i) => (
          <article key={service._id} className="service-panel">
            <span className="num" aria-hidden="true">
              {String(service.order || i + 1).padStart(2, '0')}
            </span>
            <h2>{service.title}</h2>
            <p>{service.shortDescription}</p>
          </article>
        ))}
      </section>

      <section className="how" aria-labelledby="home-how-heading">
        <h2 id="home-how-heading">
          How change <span>actually</span> happens
        </h2>
        <ol className="how-list">
          {HOW.map((item, i) => (
            <li key={item}>
              <span className="n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section className="section" id="workshops" aria-labelledby="home-workshops-heading">
        <h2 id="home-workshops-heading" className="section-title">
          Workshop Series
        </h2>
        <p className="section-sub">
          Relational Diplomacy · Live · Wednesdays 7:00–8:30 PM ET · Zoom · Join any
          session, in any order · 18+
        </p>
        <div className="sched-grid">
          {(workshops || []).map((w) => (
            <Link key={w._id} href={`/workshops/${w.slug}`} className="sev">
              <WorkshopDateLabel startsAt={w.startsAt} timeZone={w.timeZone} />
              <span className="t">{w.title}</span>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 28 }}>
          <Link href="/workshops" className="btn">
            All workshops
          </Link>
        </p>
      </section>

      <section className="fees-strip" aria-label="Fees">
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
      </section>
    </>
  )
}
