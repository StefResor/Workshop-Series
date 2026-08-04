import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import {
  createContactInSegments,
  permissionLineVersion,
} from '@/lib/subscribe'

export const dynamic = 'force-dynamic'

const subscribeSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  email: z.string().trim().email('valid email is required').max(254),
  blogOptIn: z.boolean().optional().default(false),
  source: z.string().trim().min(1).max(64),
  /** Hash/version of the permission copy shown at submit time. */
  permissionLine: z.string().trim().min(1).max(180),
  /** Honeypot — must be empty. */
  website: z.string().optional(),
})

function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Rate limit: 5 requests / 10 min / IP.
 * In-memory Map in lib/rate-limit.ts — resets on cold start (acceptable at launch volume).
 */
export async function POST(req: Request) {
  const ip = clientIp(req)
  const limited = rateLimit(`subscribe:${ip}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.ok) {
    console.info(
      JSON.stringify({
        event: 'subscribe_rate_limited',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
    // 200 so the browser does not log a failed network request for a handled rejection.
    return NextResponse.json({ ok: false })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false })
  }

  const parsed = subscribeSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false })
  }

  const data = parsed.data

  // Honeypot tripped — pretend success, do not create a contact.
  if (data.website && data.website.trim() !== '') {
    console.info(
      JSON.stringify({
        event: 'subscribe_honeypot',
        ok: true,
        at: new Date().toISOString(),
        source: data.source,
      }),
    )
    return NextResponse.json({ ok: true })
  }

  const apiKey = process.env.RESEND_API_KEY
  const workshopsId = process.env.RESEND_SEGMENT_WORKSHOPS_ID?.trim() || ''
  const blogPracticeId =
    process.env.RESEND_SEGMENT_BLOG_PRACTICE_ID?.trim() || ''

  if (!apiKey || !workshopsId) {
    console.info(
      JSON.stringify({
        event: 'subscribe_misconfigured',
        ok: false,
        at: new Date().toISOString(),
        missing: {
          apiKey: !apiKey,
          workshopsId: !workshopsId,
        },
      }),
    )
    return NextResponse.json({ ok: false })
  }

  const blogOptIn = Boolean(data.blogOptIn)
  const segmentIds = [workshopsId]
  if (blogOptIn) {
    if (blogPracticeId) {
      segmentIds.push(blogPracticeId)
    } else {
      console.warn(
        JSON.stringify({
          event: 'subscribe_blog_segment_missing',
          ok: true,
          at: new Date().toISOString(),
          source: data.source,
        }),
      )
    }
  }

  const firstName =
    data.firstName && data.firstName.length > 0 ? data.firstName : undefined
  const version = permissionLineVersion(data.permissionLine)
  const userAgent = req.headers.get('user-agent') || ''

  // Single opt-in today. Double opt-in would insert a confirmation send here
  // and only call createContactInSegments after /subscribe/confirmed.
  // Resend failures never throw — always { ok: true|false } at HTTP 200.
  const result = await createContactInSegments({
    email: data.email,
    firstName,
    segmentIds,
    apiKey,
  })

  if (!result.ok) {
    console.info(
      JSON.stringify({
        event: 'subscribe_failed',
        ok: false,
        at: new Date().toISOString(),
        source: data.source,
        resendStatus: result.resendStatus,
        resendMessage: result.resendMessage,
        resendName: result.resendName,
      }),
    )
    return NextResponse.json({ ok: false })
  }

  console.info(
    JSON.stringify({
      event: 'subscribe_consent',
      ok: true,
      at: new Date().toISOString(),
      email: data.email,
      firstName: firstName || null,
      source: data.source,
      blogOptIn,
      segmentIds: result.segmentIds,
      timestamp: new Date().toISOString(),
      permissionLineVersion: version,
      userAgent,
      status: result.status,
    }),
  )

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: false })
}
