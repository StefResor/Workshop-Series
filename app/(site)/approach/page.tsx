import type { Metadata } from 'next'
import { HowChangeSection } from '@/components/HowChangeSection'
import { buildPageMetadata } from '@/lib/seo'
import type { PageDoc } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import { pageBySlugQuery } from '@/sanity/queries'

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'approach',
  })
  return buildPageMetadata({
    title: 'Approach',
    description:
      page?.summary ||
      'How change happens in Relational Diplomacy — accountability, honesty, repair, boundaries, and the Wise Adult.',
    path: '/approach',
  })
}

const METHOD = [
  'Accountability',
  'Honesty',
  'Repair',
  'Boundaries',
  'Family-of-origin pattern recognition',
  'From reactivity to the Wise Adult',
]

/** Desktop line break after “reactivity”; mobile stays natural wrap. */
function splitApproachHeadline(headline?: string) {
  const raw = (headline || 'From reactivity to the Wise Adult.').trim()
  const hasPeriod = raw.endsWith('.')
  const text = hasPeriod ? raw.slice(0, -1) : raw
  const match = /^(.*?reactivity)\s+(.+)$/i.exec(text)
  if (!match) {
    return { before: text, after: '', hasPeriod }
  }
  return { before: match[1], after: match[2], hasPeriod }
}

export default async function ApproachPage() {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'approach',
  })
  const { before, after, hasPeriod } = splitApproachHeadline(page?.headline)

  return (
    <>
      <header className="page-hero approach-hero">
        <span className="kicker">{page?.eyebrow || 'How change actually happens'}</span>
        <h1>
          {before}
          {after ? (
            <>
              <br className="approach-title-break" /> {after}
            </>
          ) : null}
          {hasPeriod ? '.' : null}
        </h1>
        <p className="lede">
          {page?.summary ||
            'Structured relational work built on accountability, honesty, repair, boundaries, and family-of-origin pattern recognition.'}
        </p>
      </header>

      <HowChangeSection headingId="how-heading" />

      <section className="section" aria-labelledby="method-heading">
        <h2 id="method-heading" className="section-title">
          The method
        </h2>
        <ol className="how-list" style={{ maxWidth: 720 }}>
          {METHOD.map((item, i) => (
            <li key={item}>
              <span className="n" aria-hidden="true">
                {['I', 'II', 'III', 'IV', 'V', 'VI'][i]}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
