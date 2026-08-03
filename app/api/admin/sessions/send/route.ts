import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import Stripe from 'stripe'
import { buildSessionCredentialsEmail } from '@/lib/emails/workshop-registration'
import { emailsForStripeProductIds } from '@/lib/stripe-buyers'
import {
  workshopPrivateByIdQuery,
  type WorkshopRegistrationPrivate,
} from '@/lib/workshop-registration-private'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  workshopId: z.string().trim().min(1),
})

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const sanityToken = process.env.SANITY_API_READ_TOKEN
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const seriesProductId = process.env.STRIPE_SERIES_PRODUCT_ID?.trim()

  if (!stripeSecret || !sanityToken || !resendKey || !from || !projectId) {
    return NextResponse.json({ error: 'Admin send unavailable' }, { status: 503 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'workshopId required' }, { status: 400 })
  }

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion,
    token: sanityToken,
    useCdn: false,
  })

  const workshop = await sanity.fetch<WorkshopRegistrationPrivate | null>(
    workshopPrivateByIdQuery,
    { id: parsed.data.workshopId },
  )

  if (!workshop) {
    return NextResponse.json({ error: 'Workshop not found' }, { status: 404 })
  }

  if (!workshop.stripeProductId) {
    return NextResponse.json(
      { error: 'Workshop has no Stripe product ID' },
      { status: 400 },
    )
  }

  if (!workshop.zoomLink && !workshop.zoomPasscode) {
    return NextResponse.json(
      { error: 'Workshop has no Zoom credentials in Studio' },
      { status: 400 },
    )
  }

  const productIds = [workshop.stripeProductId]
  if (seriesProductId) productIds.push(seriesProductId)

  const stripe = new Stripe(stripeSecret)
  const emails = await emailsForStripeProductIds(stripe, productIds)

  const email = buildSessionCredentialsEmail(workshop)
  const resend = new Resend(resendKey)

  let sent = 0
  let failed = 0

  for (const to of emails) {
    try {
      const result = await resend.emails.send({
        from,
        to: [to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      })
      if (result.error) {
        failed += 1
      } else {
        sent += 1
      }
    } catch {
      failed += 1
    }
  }

  console.info(
    JSON.stringify({
      event: 'admin_session_credentials_sent',
      ok: true,
      workshopId: workshop._id,
      sent,
      failed,
      at: new Date().toISOString(),
    }),
  )

  return NextResponse.json({ sent, failed, count: emails.length })
}
