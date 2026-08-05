import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { renderPolicyBody, splitEffectiveDate } from '@/lib/policy-body'
import { buildPageMetadata } from '@/lib/seo'
import { DEFAULT_TERMS_BODY, DEFAULT_TERMS_TITLE } from '@/lib/terms'
import type { Policy } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  policiesForStaticParamsQuery,
  policyBySlugQuery,
} from '@/sanity/queries'

type Props = { params: Promise<{ slug: string }> }

/** Public path stays /{slug}; this file lives under /policies/[slug] via rewrite. */
function publicPath(slug: string) {
  return `/${slug}`
}

/** Null on miss or throw — caller applies terms fail-safe. */
async function fetchPolicy(slug: string): Promise<Policy | null> {
  try {
    return await sanityFetch<Policy | null>(policyBySlugQuery, { slug })
  } catch (err) {
    console.error('[policy] Sanity fetch failed for slug', slug, err)
    return null
  }
}

export async function generateStaticParams() {
  const rows = await sanityFetch<{ slug: string }[]>(
    policiesForStaticParamsQuery,
  ).catch(() => [])
  return (rows || [])
    .map((r) => r.slug)
    .filter(Boolean)
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const policy = await fetchPolicy(slug)

  if (slug === 'terms') {
    return buildPageMetadata({
      title: policy?.title?.trim() || DEFAULT_TERMS_TITLE,
      description:
        'Workshop registration terms, refunds, conduct, and educational scope for Stefanie Schumacher’s Relational Diplomacy series.',
      path: publicPath(slug),
    })
  }

  if (!policy?.title) {
    return buildPageMetadata({
      title: 'Policy',
      path: publicPath(slug),
    })
  }

  return buildPageMetadata({
    title: policy.title,
    description: policy.title,
    path: publicPath(slug),
  })
}

/**
 * Shared policy page (terms, privacy, …).
 *
 * Fail-safe for `terms` only: empty body or Sanity fetch error → hardcoded
 * copy so Stripe’s /terms link still serves a page. Other slugs 404.
 */
export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const policy = await fetchPolicy(slug)

  let title = policy?.title?.trim()
  let rawBody = policy?.body?.trim()

  if (!rawBody) {
    if (slug === 'terms') {
      title = title || DEFAULT_TERMS_TITLE
      rawBody = DEFAULT_TERMS_BODY
    } else {
      notFound()
    }
  }

  const { effectiveDate, body } = splitEffectiveDate(rawBody)

  return (
    <article className="policy-page">
      <header className="page-hero policy-hero">
        {effectiveDate ? (
          <span className="kicker">Effective {effectiveDate}</span>
        ) : null}
        <h1>{title || 'Policy'}</h1>
      </header>
      <div className="policy-body">{renderPolicyBody(body)}</div>
    </article>
  )
}
