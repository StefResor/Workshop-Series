import Link from 'next/link'
import { catalogueHook } from '@/lib/catalogue-hook'
import { openUpcoming, sessionRegisterHref } from '@/lib/catalogue'
import { formatCatalogueRegisterLabel } from '@/lib/datetime'
import { topicPath } from '@/lib/workshop-paths'
import type { CatalogueTopic } from '@/lib/types'

export function CatalogueTopicRow({ topic }: { topic: CatalogueTopic }) {
  const open = openUpcoming(topic.sessions)
  const [next, ...later] = open
  const hook = catalogueHook(topic)
  const href = topicPath(topic.slug)
  const nextRegister = next ? sessionRegisterHref(next) : null

  return (
    <article className="catalogue-row" id={topic.slug}>
      <span className="num" aria-hidden="true">
        {String(topic.order).padStart(2, '0')}
      </span>
      <div className="catalogue-row-copy">
        <h3 className="catalogue-row-title">
          <Link href={href}>{topic.title}</Link>
        </h3>
        {hook ? <p className="catalogue-row-hook">{hook}</p> : null}
        {later.length > 0 ? (
          <p className="catalogue-row-also">
            Also:{' '}
            {later.map((session, i) => {
              const label = formatCatalogueRegisterLabel(
                session.startsAt,
                session.timeZone,
              )
              const pay = sessionRegisterHref(session)
              const sep = i < later.length - 1 ? ' · ' : ''
              if (pay) {
                return (
                  <span key={session._id}>
                    <a href={pay}>{label}</a>
                    {sep}
                  </span>
                )
              }
              return (
                <span key={session._id}>
                  {label}
                  {sep}
                </span>
              )
            })}
          </p>
        ) : null}
        {!next ? (
          <p className="catalogue-row-empty">
            New dates coming soon.{' '}
            <Link href="#hear-about-workshops">Workshop announcements</Link>
          </p>
        ) : null}
      </div>
      <div className="catalogue-row-cta">
        {next && nextRegister ? (
          <a
            className="catalogue-register"
            href={nextRegister}
            aria-label={`Register for ${topic.title}, ${formatCatalogueRegisterLabel(next.startsAt, next.timeZone)}`}
          >
            Register · {formatCatalogueRegisterLabel(next.startsAt, next.timeZone)}
          </a>
        ) : next ? (
          <Link className="catalogue-register" href={href}>
            Register · {formatCatalogueRegisterLabel(next.startsAt, next.timeZone)}
          </Link>
        ) : null}
      </div>
    </article>
  )
}
