import type { Metadata } from 'next'
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

const HOW = [
  'Clarify the problem, precisely',
  'Understand its origins, with compassion',
  'Build new skills, deliberately',
  'Practice until it shows up in daily life',
]

const METHOD = [
  'Accountability',
  'Honesty',
  'Repair',
  'Boundaries',
  'Family-of-origin pattern recognition',
  'From reactivity to the Wise Adult',
]

export default async function ApproachPage() {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'approach',
  })

  return (
    <>
      <header className="page-hero">
        <span className="kicker">{page?.eyebrow || 'How change actually happens'}</span>
        <h1>{page?.headline || 'From reactivity to the Wise Adult.'}</h1>
        <p className="lede">
          {page?.summary ||
            'Structured relational work built on accountability, honesty, repair, boundaries, and family-of-origin pattern recognition.'}
        </p>
      </header>

      <section className="how" aria-labelledby="how-heading">
        <h2 id="how-heading">
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
