import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EmailSignupBand } from '@/components/EmailSignupBand'
import { HomeHeroHeadline } from '@/components/HomeHeroHeadline'
import { HomeWorkshopCard } from '@/components/HomeWorkshopCard'
import { HowChangeSection } from '@/components/HowChangeSection'
import { SeeAllDatesCell } from '@/components/SeeAllDatesCell'
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
import { sessionRegisterHref, HOME_SESSION_CAP } from '@/lib/catalogue'
import { topicPath } from '@/lib/workshop-paths'
import {
  emailSignupQuery,
  homeUpcomingWorkshopsQuery,
  pageBySlugQuery,
  servicesQuery,
  siteSettingsQuery,
  upcomingPublicWorkshopsQuery,
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
  'Mindfulness',
]

export default async function HomePage() {
  const [home, services, currentUpcoming, settings, emailSignup] =
    await Promise.all([
      sanityFetch<PageDoc | null>(pageBySlugQuery, { slug: 'home' }),
      sanityFetch<Service[]>(servicesQuery),
      sanityFetch<Workshop[]>(homeUpcomingWorkshopsQuery),
      sanityFetch<SiteSettings | null>(siteSettingsQuery),
      sanityFetch<EmailSignup | null>(emailSignupQuery),
    ])

  let workshops = (currentUpcoming || []).slice(0, HOME_SESSION_CAP)
  let betweenSeries = false
  if (workshops.length === 0) {
    const across = await sanityFetch<Workshop[]>(upcomingPublicWorkshopsQuery)
    workshops = (across || []).slice(0, HOME_SESSION_CAP)
    betweenSeries = workshops.length > 0
  }

  const couples = services?.find((s) => s.slug.includes('couples'))
  const individuals = services?.find((s) => s.slug.includes('individual'))
  const workshopDefault = resolveSessionPrice(settings)
  const workshopsSpecLine =
    home?.workshopsSpec?.trim() ||
    composeWorkshopSeriesSpecLine({
      sessionPrice: workshopDefault,
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

  // Marquee keywords from CMS with fallback to hardcoded defaults
  const marqueeKeywords =
    settings?.marqueeKeywords?.length ? settings.marqueeKeywords : METHOD
  const nextWorkshop = workshops.find(
    (w) => Boolean(w.topicSlug || w.slug),
  )

  return (
    <>
      <div className="home-hero-stage">
        <span className="home-hero-asterisk" aria-hidden="true">
          *
        </span>
        <section className="home-hero">
          <div className="home-hero-lockup">
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
              <div className="hero-ctas">
                {nextWorkshop ? (
                  sessionRegisterHref(nextWorkshop) ? (
                    <a
                      className="btn"
                      href={sessionRegisterHref(nextWorkshop)!}
                    >
                      Register for {nextWorkshop.title}
                    </a>
                  ) : (
                    <Link
                      className="btn"
                      href={topicPath(
                        nextWorkshop.topicSlug || nextWorkshop.slug,
                      )}
                    >
                      Register for {nextWorkshop.title}
                    </Link>
                  )
                ) : null}
                <Link className="btn btn-outline" href="/workshops">
                  Check out our upcoming workshops
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="bigband" aria-hidden="true">
          <div className="marquee-inner">
            {[...marqueeKeywords, ...marqueeKeywords].map((item, i) => (
              <span key={`${item}-${i}`}>{item}</span>
            ))}
          </div>
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
          {workshops.length === 0 ? (
            <div className="workshops-empty">
              <p className="workshops-empty-heading">New dates coming soon</p>
              <p className="workshops-empty-body">
                Leave your email below and you&rsquo;ll hear when registration
                opens — nothing else.
              </p>
            </div>
          ) : (
            <>
              {workshops.map((w) => (
                <HomeWorkshopCard
                  key={w._id}
                  workshop={w}
                  settings={settings}
                  showSeriesLabel={betweenSeries}
                />
              ))}
              {workshops.length === HOME_SESSION_CAP ? (
                <SeeAllDatesCell />
              ) : null}
            </>
          )}
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
                {service.lede ? (
                  <p className="expertise-band-lede">{service.lede}</p>
                ) : null}
                {(service.body || []).map((para) => (
                  <p key={para} className="expertise-band-body">
                    {para}
                  </p>
                ))}
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
