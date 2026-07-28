import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

export const dynamic = 'force-dynamic'

type WebhookBody = {
  _type?: string
  slug?: { current?: string } | string
  operation?: string
}

function slugValue(slug: WebhookBody['slug']): string | undefined {
  if (!slug) return undefined
  if (typeof slug === 'string') return slug
  return slug.current
}

function pathsForDoc(body: WebhookBody): string[] {
  const type = body._type
  const slug = slugValue(body.slug)
  const paths = new Set<string>(['/'])

  switch (type) {
    case 'workshop':
      paths.add('/workshops')
      paths.add('/events.json')
      paths.add('/events.ics')
      if (slug) paths.add(`/workshops/${slug}`)
      break
    case 'page':
      if (slug === 'home' || !slug) paths.add('/')
      else paths.add(`/${slug}`)
      break
    case 'service':
      paths.add('/')
      paths.add('/approach')
      paths.add('/fees')
      break
    case 'siteSettings':
    case 'policy':
      paths.add('/')
      paths.add('/about')
      paths.add('/approach')
      paths.add('/workshops')
      paths.add('/fees')
      paths.add('/contact')
      break
    default:
      paths.add('/workshops')
      paths.add('/events.json')
      paths.add('/events.ics')
  }

  return [...paths]
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

  const paths = pathsForDoc(body)
  for (const path of paths) {
    revalidatePath(path)
  }

  console.info(
    JSON.stringify({
      event: 'revalidate_ok',
      ok: true,
      at: new Date().toISOString(),
      paths,
      type: body._type ?? null,
    }),
  )

  return NextResponse.json({ revalidated: true, paths })
}
