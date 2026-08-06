import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

export const dynamic = 'force-dynamic'

type WebhookBody = {
  _type?: string
  slug?: { current?: string } | string
  /** Series slug projection — required for series-scoped workshop paths. */
  seriesSlug?: string
  operation?: string
}

type RevalidateTarget =
  | { kind: 'path'; path: string }
  | { kind: 'layout'; path: string }

function slugValue(slug: WebhookBody['slug']): string | undefined {
  if (!slug) return undefined
  // Accept native Sanity slug objects and a flattened string projection.
  if (typeof slug === 'string') return slug
  return slug.current
}

/**
 * Map a Sanity webhook document to cache invalidation targets.
 * Public JSON feed lives at /events.json (alongside /events.ics), not /api/.
 */
export function targetsForDoc(body: WebhookBody): RevalidateTarget[] {
  const type = body._type
  const slug = slugValue(body.slug)

  switch (type) {
    case 'registration':
      // Transactional records — not published marketing content.
      return []

    case 'siteSettings':
    case 'emailSignup':
      // Header/footer/metadata (and email signup) flow through the root layout
      // into every page, including /workshops/[slug]. Series package copy too.
      return [
        { kind: 'layout', path: '/' },
        { kind: 'path', path: '/workshops/series' },
      ]

    case 'policy': {
      const paths = new Set<string>(['/'])
      if (slug) paths.add(`/${slug}`)
      // Disclaimer snippets on workshop surfaces + footer link target.
      paths.add('/workshops/series')
      return [
        { kind: 'layout', path: '/' },
        ...[...paths].map((path) => ({ kind: 'path' as const, path })),
      ]
    }

    case 'workshop': {
      const paths = new Set<string>([
        '/',
        '/workshops',
        '/workshops/series',
        '/events.json',
        '/events.ics',
        '/sitemap.xml',
      ])
      // Flat slug still revalidated for the 301 redirect page.
      if (slug) paths.add(`/workshops/${slug}`)
      if (body.seriesSlug && slug) {
        paths.add(`/workshops/${body.seriesSlug}/${slug}`)
      }
      return [...paths].map((path) => ({ kind: 'path' as const, path }))
    }

    case 'series': {
      const paths = new Set<string>(['/', '/workshops', '/workshops/series'])
      // Future: package page at /workshops/[series]; keep series slug path warm.
      if (slug) paths.add(`/workshops/${slug}`)
      return [...paths].map((path) => ({ kind: 'path' as const, path }))
    }

    case 'page': {
      if (slug === 'home' || !slug) return [{ kind: 'path', path: '/' }]
      return [
        { kind: 'path', path: '/' },
        { kind: 'path', path: `/${slug}` },
      ]
    }

    case 'service':
      return ['/', '/approach', '/fees'].map((path) => ({
        kind: 'path' as const,
        path,
      }))

    default:
      // Unknown types (and future ones) — do not cascade into workshops/feeds.
      return [{ kind: 'path', path: '/' }]
  }
}

export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    console.info(
      JSON.stringify({
        event: 'revalidate_misconfigured',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  }

  const signature = req.headers.get(SIGNATURE_HEADER_NAME) || ''
  const rawBody = await req.text()

  const valid = await isValidSignature(rawBody, signature, secret)
  if (!valid) {
    console.info(
      JSON.stringify({
        event: 'revalidate_invalid_signature',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: WebhookBody = {}
  try {
    body = JSON.parse(rawBody) as WebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const targets = targetsForDoc(body)
  for (const target of targets) {
    if (target.kind === 'layout') {
      revalidatePath(target.path, 'layout')
    } else {
      revalidatePath(target.path)
    }
  }

  const summary = targets.map((t) =>
    t.kind === 'layout' ? `${t.path} (layout)` : t.path,
  )

  console.info(
    JSON.stringify({
      event: 'revalidate_ok',
      ok: true,
      at: new Date().toISOString(),
      paths: summary,
      type: body._type ?? null,
    }),
  )

  return NextResponse.json({ revalidated: true, paths: summary })
}
