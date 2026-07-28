import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WorkshopWhen } from '@/components/WorkshopWhen'
import { breadcrumbJsonLd, workshopEventJsonLd } from '@/lib/schema'
import { buildPageMetadata } from '@/lib/seo'
import type { SiteSettings, Workshop } from '@/lib/types'
import { DEFAULT_WORKSHOP_DISCLAIMER } from '@/lib/workshop-disclaimer'
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
    settings?.workshopDisclaimer?.trim() || DEFAULT_WORKSHOP_DISCLAIMER

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Workshops', path: '/workshops' },
    { name: workshop.title, path: `/workshops/${workshop.slug}` },
  ])

  const priceLabel =
    workshop.price != null ? `$${workshop.price}` : 'Contact for current fees'
  const registerHref = workshop.stripePaymentLink

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
            <span className="k">Price</span>
            {workshop.price != null
              ? `$${workshop.price} per participant`
              : 'Contact for current fees'}
          </div>
        </div>
        <div className="ev-body">
          {paragraphs(workshop.body || workshop.shortDescription).map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <div style={{ marginTop: 38 }}>
          {registerHref ? (
            <a className="btn" href={registerHref}>
              Register — {priceLabel}
            </a>
          ) : (
            <Link className="btn" href="/contact">
              Inquire to register — {priceLabel}
            </Link>
          )}
        </div>
        <p className="ev-note">{policyNote}</p>
      </article>
    </>
  )
}
