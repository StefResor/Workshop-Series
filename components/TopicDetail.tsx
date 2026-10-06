import Link from 'next/link'
import { catalogueHook } from '@/lib/catalogue-hook'
import { openUpcoming, sessionRegisterHref } from '@/lib/catalogue'
import { formatCatalogueRegisterLabel } from '@/lib/datetime'
import { breadcrumbJsonLd, workshopEventJsonLd } from '@/lib/schema'
import { DEFAULT_WORKSHOP_DISCLAIMER } from '@/lib/workshop-disclaimer'
import { resolveWorkshopPrice } from '@/lib/workshop-price'
import { topicPath } from '@/lib/workshop-paths'
import { WorkshopWhen } from '@/components/WorkshopWhen'
import type { CatalogueTopic, SiteSettings, Workshop } from '@/lib/types'

function paragraphs(body?: string) {
  return (body || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function TopicDetail({
  topic,
  settings,
}: {
  topic: CatalogueTopic
  settings: SiteSettings | null
}) {
  const path = topicPath(topic.slug)
  const hook = catalogueHook(topic)
  const body = paragraphs(topic.description || topic.shortDescription)
  const policyNote =
    settings?.workshopDisclaimer?.trim() || DEFAULT_WORKSHOP_DISCLAIMER
  const organizer = settings?.siteName || 'Stefanie Schumacher'

  const openSessions = openUpcoming(topic.sessions)

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Workshops', path: '/workshops' },
    { name: topic.title, path },
  ])

  return (
    <>
      {openSessions.map((session) => {
        const asWorkshop = session as Workshop
        const price = resolveWorkshopPrice(asWorkshop, settings)
        return (
          <script
            key={session._id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                workshopEventJsonLd(
                  { ...asWorkshop, pagePath: path },
                  organizer,
                  price,
                ),
              ),
            }}
          />
        )
      })}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="ev-band" aria-hidden="true" />
      <div className="ev-shell">
        <nav aria-label="Breadcrumb" className="ev-back-nav">
          <Link href="/workshops" className="ev-back">
            ← All workshops
          </Link>
        </nav>
        <article className="ev-wrap">
          <span className="kicker">
            Workshop {String(topic.order).padStart(2, '0')}
          </span>
          <h1>{topic.title}</h1>
          {hook ? <p className="ev-hook">{hook}</p> : null}
          <div className="ev-body">
            {body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <h2 className="ev-dates-heading">Upcoming dates</h2>
          {openSessions.length === 0 ? (
            <p className="catalogue-row-empty">
              New dates coming soon.{' '}
              <Link href="/workshops#hear-about-workshops">
                Workshop announcements
              </Link>
            </p>
          ) : (
            <ul className="topic-session-list">
              {openSessions.map((session) => {
                const pay = sessionRegisterHref(session)
                const price = resolveWorkshopPrice(session as Workshop, settings)
                const dateLabel = formatCatalogueRegisterLabel(
                  session.startsAt,
                  session.timeZone,
                )
                return (
                  <li key={session._id} className="topic-session-row">
                    <div className="topic-session-when">
                      {session.seriesTitle ? (
                        <span className="topic-session-series">
                          {session.seriesTitle}
                        </span>
                      ) : null}
                      <WorkshopWhen
                        startsAt={session.startsAt}
                        timeZone={session.timeZone}
                      />
                    </div>
                    <div className="topic-session-cta">
                      {pay ? (
                        <a className="btn" href={pay}>
                          Register · {dateLabel}
                          {price != null ? ` · $${price}` : ''}
                        </a>
                      ) : (
                        <Link
                          className="btn"
                          href={`/contact?workshop=${encodeURIComponent(topic.title)}`}
                        >
                          Inquire to register
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="ev-note">{policyNote}</p>
        </article>
      </div>
    </>
  )
}
