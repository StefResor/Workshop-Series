import type { Metadata } from 'next'
import Image from 'next/image'
import { buildPageMetadata } from '@/lib/seo'
import type { PageDoc } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import { pageBySlugQuery } from '@/sanity/queries'

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'about',
  })
  return buildPageMetadata({
    title: 'About',
    description:
      page?.summary ||
      'Licensed psychotherapist Stefanie Schumacher — Relational Diplomacy for individuals and couples. Private practice since 2015.',
    path: '/about',
  })
}

function paragraphs(body?: string) {
  return (body || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default async function AboutPage() {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'about',
  })

  const paras = paragraphs(page?.body)
  const bioParas = paras.filter(
    (p) =>
      !p.startsWith('Training:') &&
      !p.startsWith('Practice:') &&
      !p.startsWith('Discipline:'),
  )
  const facts = paras.filter(
    (p) =>
      p.startsWith('Training:') ||
      p.startsWith('Practice:') ||
      p.startsWith('Discipline:'),
  )

  return (
    <div className="about-grid">
      <aside>
        <figure>
          <div className="about-portrait">
            <Image
              src="/stefanie-schumacher.jpg"
              alt="Portrait of Stefanie Schumacher, MS, LPC, EMDR"
              width={760}
              height={1140}
              sizes="(max-width: 860px) 100vw, 380px"
              priority
            />
          </div>
          <figcaption className="about-caption">
            Stefanie Schumacher — MS, LPC, EMDR. Private practice since 2015.
          </figcaption>
        </figure>
      </aside>
      <div className="about-bio">
        <span className="kicker">{page?.eyebrow || 'About Stefanie'}</span>
        <h1>
          {page?.headline ||
            'Steadiness, learned the hard way — and taught deliberately.'}
        </h1>
        {page?.summary ? <p>{page.summary}</p> : null}
        {bioParas.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
        {facts.length ? (
          <dl className="about-facts">
            {facts.map((line) => {
              const [label, ...rest] = line.split(':')
              return (
                <div key={line}>
                  <dt>{label}</dt>
                  <dd>{rest.join(':').trim()}</dd>
                </div>
              )
            })}
          </dl>
        ) : null}
      </div>
    </div>
  )
}
