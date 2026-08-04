import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import {
  createContactInSegment,
  permissionLineVersion,
} from '@/lib/subscribe'

export const dynamic = 'force-dynamic'

const subscribeSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  email: z.string().trim().email('valid email is required').max(254),
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
    return NextResponse.json(
      { ok: false },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec) },
      },
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const parsed = subscribeSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 })
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
  const segmentId = process.env.RESEND_SEGMENT_ID
  const topicWorkshopAnnouncements =
    process.env.RESEND_TOPIC_WORKSHOP_ANNOUNCEMENTS_ID?.trim() || ''
  const topicPracticeNews =
    process.env.RESEND_TOPIC_PRACTICE_NEWS_ID?.trim() || ''

  if (!apiKey || !segmentId) {
    console.info(
      JSON.stringify({
        event: 'subscribe_misconfigured',
        ok: false,
        at: new Date().toISOString(),
        missing: {
          apiKey: !apiKey,
          segmentId: !segmentId,
        },
      }),
    )
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  const topicIds = [topicWorkshopAnnouncements, topicPracticeNews].filter(
    Boolean,
  )
  if (topicIds.length < 2) {
    console.warn(
      JSON.stringify({
        event: 'subscribe_topics_incomplete',
        ok: true,
        at: new Date().toISOString(),
        missing: {
          workshopAnnouncements: !topicWorkshopAnnouncements,
          practiceNews: !topicPracticeNews,
        },
      }),
    )
  }

  const firstName =
    data.firstName && data.firstName.length > 0 ? data.firstName : undefined
  const version = permissionLineVersion(data.permissionLine)
  const userAgent = req.headers.get('user-agent') || ''

  try {
    // Single opt-in today. Double opt-in would insert a confirmation send here
    // and only call createContactInSegment after /subscribe/confirmed.
    const result = await createContactInSegment({
      email: data.email,
      firstName,
      segmentId,
      topicIds: topicIds.length > 0 ? topicIds : undefined,
      apiKey,
    })

    console.info(
      JSON.stringify({
        event: 'subscribe_consent',
        ok: true,
        at: new Date().toISOString(),
        email: data.email,
        firstName: firstName || null,
        source: data.source,
        timestamp: new Date().toISOString(),
        permissionLineVersion: version,
        userAgent,
        status: result.status,
        topicsApplied: topicIds.length,
      }),
    )

    return NextResponse.json({ ok: true })
  } catch {
    console.info(
      JSON.stringify({
        event: 'subscribe_failed',
        ok: false,
        at: new Date().toISOString(),
        source: data.source,
      }),
    )
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: false }, { status: 405 })
}
