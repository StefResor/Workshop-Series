import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WorkshopWhen } from '@/components/WorkshopWhen'
import { breadcrumbJsonLd, workshopEventJsonLd } from '@/lib/schema'
import { buildPageMetadata } from '@/lib/seo'
import type { SiteSettings, Workshop } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  siteSettingsQuery,
  workshopBySlugQuery,
  workshopsQuery,
} from '@/sanity/queries'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const workshops = await sanityFetch<Workshop[]>(workshopsQuery)
  return (workshops || []).map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const workshop = await sanityFetch<Workshop | null>(workshopBySlugQuery, {
    slug,
  })
  if (!workshop) return { title: 'Workshop' }
  return buildPageMetadata({
    title: workshop.title,
    description:
      workshop.shortDescription ||
      'Live Relational Diplomacy workshop with Stefanie Schumacher.',
    path: `/workshops/${workshop.slug}`,
  })
}

function paragraphs(body?: string) {
  return (body || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default async function WorkshopDetailPage({ params }: Props) {
  const { slug } = await params
  const [workshop, settings] = await Promise.all([
    sanityFetch<Workshop | null>(workshopBySlugQuery, { slug }),
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
  ])
  if (!workshop) notFound()

  const policyNote =
    'Relational Diplomacy Workshops are educational in nature and are not psychotherapy, mental health treatment, or crisis services. Participation does not establish a therapist–client relationship. Registration is per participant; workshop registrations are non-refundable.'

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Workshops', path: '/workshops' },
    { name: workshop.title, path: `/workshops/${workshop.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            workshopEventJsonLd(
              workshop,
              settings?.siteName || 'Stefanie Schumacher',
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="ev-band" aria-hidden="true" />
      <article className="ev-wrap">
        <nav aria-label="Breadcrumb" className="ev-back-nav">
          <Link href="/workshops" className="ev-back">
            ← All workshops
          </Link>
        </nav>
        <span className="kicker">Relational Diplomacy Workshop</span>
        <h1>{workshop.title}</h1>
        <div className="ev-meta">
          <div>
            <span className="k">When</span>
            <WorkshopWhen startsAt={workshop.startsAt} timeZone={workshop.timeZone} />
          </div>
          <div>
            <span className="k">Format</span>
            Live on Zoom · 90 min
          </div>
          <div>
            <span className="k">Price</span>${workshop.priceUSD} per participant
          </div>
        </div>
        <div className="ev-body">
          {paragraphs(workshop.body || workshop.shortDescription).map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <div style={{ marginTop: 38 }}>
          {workshop.registrationUrl ? (
            <a className="btn" href={workshop.registrationUrl}>
              Register — ${workshop.priceUSD}
            </a>
          ) : (
            <Link className="btn" href="/contact">
              Inquire to register — ${workshop.priceUSD}
            </Link>
          )}
        </div>
        <p className="ev-note">{policyNote}</p>
      </article>
    </>
  )
}
