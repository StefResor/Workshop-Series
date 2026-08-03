import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required').max(100),
  lastName: z.string().trim().min(1, 'lastName is required').max(100),
  email: z.string().trim().email('valid email is required').max(254),
  message: z.string().trim().min(1, 'message is required').max(5000),
  /** Workshop inquire CTA context — admin email only. */
  workshopTitle: z.string().trim().max(200).optional(),
  /** Honeypot — must be empty. */
  website: z.string().optional(),
})

function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  const ip = clientIp(req)
  const limited = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
  if (!limited.ok) {
    console.info(
      JSON.stringify({
        event: 'contact_rate_limited',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json(
      { error: 'Too many requests' },
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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const data = parsed.data

  // Honeypot tripped — pretend success, do not send.
  if (data.website && data.website.trim() !== '') {
    console.info(
      JSON.stringify({
        event: 'contact_honeypot',
        ok: true,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ ok: true })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !to || !from) {
    console.info(
      JSON.stringify({
        event: 'contact_misconfigured',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Contact form unavailable' }, { status: 503 })
  }

  const resend = new Resend(apiKey)

  const workshopTitle =
    data.workshopTitle && data.workshopTitle.length > 0
      ? data.workshopTitle
      : null

  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: data.email,
      subject: workshopTitle
        ? `Workshop inquiry — ${workshopTitle} — ${data.firstName} ${data.lastName}`
        : `Consultation request — ${data.firstName} ${data.lastName}`,
      text: [
        `Name: ${data.firstName} ${data.lastName}`,
        `Email: ${data.email}`,
        ...(workshopTitle ? [`Workshop: ${workshopTitle}`] : []),
        '',
        'Message:',
        data.message,
        '',
        '—',
        'Please do not include health details in form replies. This message was not stored in a database.',
      ].join('\n'),
    })


    if (result.error) {
      console.info(
        JSON.stringify({
          event: 'contact_send_failed',
          ok: false,
          at: new Date().toISOString(),
        }),
      )
      return NextResponse.json({ error: 'Failed to send' }, { status: 502 })
    }

    console.info(
      JSON.stringify({
        event: 'contact_send_ok',
        ok: true,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ ok: true })
  } catch {
    console.info(
      JSON.stringify({
        event: 'contact_send_failed',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Failed to send' }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
