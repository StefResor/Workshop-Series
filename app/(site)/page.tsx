import type { Metadata } from 'next'
import Link from 'next/link'
import { formatWorkshopDisplay } from '@/lib/datetime'
import { buildPageMetadata } from '@/lib/seo'
import type { PageDoc, Service, SiteSettings, Workshop } from '@/lib/types'
import { resolveWorkshopPrice } from '@/lib/workshop-price'
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
  const text = (headline || 'Connect Better.').replace(/\.$/, '')
  const parts = text.split(/\s+/)
  if (parts.length < 2) {
    return { lines: [text], outline: '' }
  }
  const outline = parts[parts.length - 1]
  const rest = parts.slice(0, -1)
  // Longer headlines: break mid-phrase (e.g. Say the / hard thing / skillfully.)
  if (rest.length >= 4) {
    return {
      lines: [rest.slice(0, 2).join(' '), rest.slice(2).join(' ')],
      outline,
    }
  }
  return { lines: [rest.join(' ')], outline }
}

export default async function HomePage() {
  const [home, services, workshops, settings] = await Promise.all([
    sanityFetch<PageDoc | null>(pageBySlugQuery, { slug: 'home' }),
    sanityFetch<Service[]>(servicesQuery),
    sanityFetch<Workshop[]>(workshopsQuery),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ])

  const { lines, outline } = splitHeadline(home?.headline)
  const couples = services?.find((s) => s.slug.includes('couples'))
  const individuals = services?.find((s) => s.slug.includes('individual'))
  const workshopDefault = settings?.defaultWorkshopPrice ?? null
  const practice = (services || [])
    .filter((s) => {
      const slug = s.slug || ''
      return slug.includes('couples') || slug.includes('individual')
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 2)

  return (
    <>
      <section className="home-hero">
        <span className="kicker">
          {home?.eyebrow || 'The People Lab'}
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

      <section
        className="section workshops-led-section"
        id="workshops"
        aria-labelledby="home-workshops-heading"
      >
        <h2 id="home-workshops-heading" className="section-title">
          Workshop Series
        </h2>
        <p className="section-sub">
          Relational Diplomacy · Live · Wednesdays 7:00–8:30 PM ET · Zoom · Join any
          session, in any order · 18+
        </p>
        <p className="section-note">
          Separate from the series, I see a small number of couples and individuals
          privately.
        </p>
        <div className="workshop-led-grid">
          {(workshops || []).map((w) => {
            const d = formatWorkshopDisplay(w.startsAt, w.timeZone)
            const mon = d.month.slice(0, 3).toUpperCase()
            const price = resolveWorkshopPrice(w, settings)
            const hook = w.hook || w.shortDescription
            return (
              <article key={w._id} className="workshop-led">
                <span className="num" aria-hidden="true">
                  {String(w.sessionNumber).padStart(2, '0')}
                </span>
                <h2>{w.title}</h2>
                {hook ? <p className="hook">{hook}</p> : null}
                <div className="workshop-led-foot">
                  <div className="accent-bar" aria-hidden="true" />
                  <div className="meta">
                    {d.timeWithZone}
                    {price != null ? ` · $${price}` : null}
                  </div>
                  <Link className="cta" href={`/workshops/${w.slug}`}>
                    {mon} {d.day} · Details{' '}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className="expertise-band"
        aria-labelledby="home-practice-heading"
      >
        <div className="expertise-band-inner">
          <h2 id="home-practice-heading" className="expertise-band-title">
            The Practice
          </h2>
          <div className="expertise-band-list">
            {practice.map((service) => (
              <div key={service._id} className="expertise-band-item">
                <span className="rule" aria-hidden="true" />
                <h3>{service.title}</h3>
                {service.shortDescription ? (
                  <p>{service.shortDescription}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
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

      <section className="fees-strip fees-strip--3" aria-label="Fees">
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
    </>
  )
}
