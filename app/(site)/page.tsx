import type { Metadata } from 'next'
import Link from 'next/link'
import { formatWorkshopDisplay } from '@/lib/datetime'
import { buildPageMetadata } from '@/lib/seo'
import { EmailSignupBand } from '@/components/EmailSignupBand'
import { HomeHeroHeadline } from '@/components/HomeHeroHeadline'
import { HowChangeSection } from '@/components/HowChangeSection'
import { SeriesPackageBand } from '@/components/SeriesPackageBand'
import type {
  EmailSignup,
  PageDoc,
  Service,
  SiteSettings,
  Workshop,
} from '@/lib/types'
import {
  composeWorkshopSeriesSpecLine,
  resolveSessionPrice,
} from '@/lib/workshop-price'
import { sanityFetch } from '@/sanity/lib/fetch'
import { workshopPath } from '@/lib/workshop-paths'
import {
  activeSeriesQuery,
  emailSignupQuery,
  homeUpcomingWorkshopsQuery,
  pageBySlugQuery,
  servicesQuery,
  siteSettingsQuery,
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

export default async function HomePage() {
  const [home, services, workshops, settings, emailSignup, activeSeries] =
    await Promise.all([
      sanityFetch<PageDoc | null>(pageBySlugQuery, { slug: 'home' }),
      sanityFetch<Service[]>(servicesQuery),
      sanityFetch<Workshop[]>(homeUpcomingWorkshopsQuery),
      sanityFetch<SiteSettings | null>(siteSettingsQuery),
      sanityFetch<EmailSignup | null>(emailSignupQuery),
      sanityFetch<{
        slug: string
        title?: string
        passPrice?: number
      } | null>(activeSeriesQuery).catch(() => null),
    ])

  const couples = services?.find((s) => s.slug.includes('couples'))
  const individuals = services?.find((s) => s.slug.includes('individual'))
  const workshopDefault = resolveSessionPrice(settings)
  const passPrice =
    activeSeries?.passPrice != null
      ? activeSeries.passPrice
      : (settings?.seriesPrice ?? null)
  const workshopsSpecLine = composeWorkshopSeriesSpecLine({
    sessionPrice: workshopDefault,
    passPrice,
    scheduleLine: settings?.seriesScheduleLine,
    editorialTail: home?.workshopsSpecTail,
  })
  const workshopsHeading =
    home?.workshopsHeading?.trim() || 'The Notice* Workshop Series.'
  const workshopsNote = home?.workshopsNote?.trim()
  const heroFootnote = home?.heroFootnote?.trim()
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
          {home?.eyebrow || 'The Connection Lab'}
        </span>
        <HomeHeroHeadline
          solid={home?.heroSolid}
          outline={home?.heroOutline}
          join={home?.heroJoin}
        />
        {heroFootnote ? (
          <p className="home-hero-footnote">{heroFootnote}</p>
        ) : null}
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
        <h2 id="home-workshops-heading" className="section-heading section-title">
          {workshopsHeading}
        </h2>
        {workshopsSpecLine ? (
          <p className="section-sub">{workshopsSpecLine}</p>
        ) : null}
        {workshopsNote ? (
          <p className="section-note">{workshopsNote}</p>
        ) : null}
        <div className="workshop-led-grid">
          {(workshops || []).length === 0 ? (
            <div className="workshops-empty">
              <p className="workshops-empty-heading">
                This series has finished.
              </p>
              <p className="workshops-empty-body">
                New dates are announced soon. Leave your email below and
                you&rsquo;ll hear when registration opens — nothing else.
              </p>
            </div>
          ) : (
            (workshops || []).map((w) => {
              const d = formatWorkshopDisplay(w.startsAt, w.timeZone)
              const mon = d.month.slice(0, 3).toUpperCase()
              const cardPrice =
                w.price != null &&
                workshopDefault != null &&
                w.price !== workshopDefault
                  ? w.price
                  : null
              const cardZone =
                d.timeZoneName &&
                d.timeZoneName !== 'EDT' &&
                d.timeZoneName !== 'ET'
                  ? d.timeZoneName
                  : null
              const hook = w.hook || w.shortDescription
              const href =
                w.seriesSlug && w.slug
                  ? workshopPath(w.seriesSlug, w.slug)
                  : '/workshops'
              const ctaParts = [
                `${mon} ${d.day}`,
                cardPrice != null ? `$${cardPrice}` : null,
                cardZone,
                'Details',
              ].filter(Boolean)
              return (
                <article key={w._id} className="workshop-led">
                  <span className="num" aria-hidden="true">
                    {String(w.sessionNumber).padStart(2, '0')}
                  </span>
                  <h2>{w.title}</h2>
                  <p className="hook">{hook || null}</p>
                  <div className="workshop-led-foot">
                    <Link
                      className="cta"
                      href={href}
                      aria-label={`Details: ${w.title}, ${d.month} ${d.day}`}
                    >
                      {ctaParts.join(' · ')}{' '}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              )
            })
          )}
          <SeriesPackageBand settings={settings} embedded />
        </div>
      </section>

      <section
        className="practice expertise-band"
        aria-labelledby="home-practice-heading"
      >
        <div className="expertise-band-inner">
          <h2
            id="home-practice-heading"
            className="section-heading expertise-band-title"
          >
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
                <Link
                  className="expertise-band-cta"
                  href="/contact"
                  aria-label={`Request a consultation — ${service.title}`}
                >
                  Request a consultation{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowChangeSection headingId="home-how-heading" />

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

      {emailSignup ? <EmailSignupBand copy={emailSignup} /> : null}
    </>
  )
}
