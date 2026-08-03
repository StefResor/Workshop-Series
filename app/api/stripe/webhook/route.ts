import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Stripe from 'stripe'
import { formatWorkshopDisplay } from '@/lib/datetime'
import { DEFAULT_WORKSHOP_DISCLAIMER } from '@/lib/workshop-disclaimer'
import {
  workshopByStripeProductIdQuery,
  type WorkshopRegistrationPrivate,
} from '@/lib/workshop-registration-private'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * In-memory idempotency for Stripe retries within a single instance lifetime.
 * TODO: persist processed event IDs (e.g. Sanity registration or KV) if volume grows.
 */
const processedEventIds = new Set<string>()

function productIdFromLineItem(
  item: Stripe.LineItem | undefined,
): string | null {
  const product = item?.price?.product
  if (!product) return null
  if (typeof product === 'string') return product
  if (typeof product === 'object' && 'id' in product && product.id) {
    return product.id
  }
  return null
}

function buildConfirmationText(workshop: WorkshopRegistrationPrivate): string {
  const when = formatWorkshopDisplay(
    workshop.startsAt,
    workshop.timeZone || 'America/New_York',
  )
  const lines = [
    `You're registered for: ${workshop.title}`,
    '',
    `When: ${when.date} · ${when.timeWithZone}`,
    '',
  ]
  if (workshop.zoomLink) {
    lines.push(`Zoom join link: ${workshop.zoomLink}`)
  }
  if (workshop.zoomPasscode) {
    lines.push(`Zoom passcode: ${workshop.zoomPasscode}`)
  }
  if (!workshop.zoomLink && !workshop.zoomPasscode) {
    lines.push(
      'Zoom details will follow separately — contact Stefanie if you need them sooner.',
    )
  }
  lines.push('', DEFAULT_WORKSHOP_DISCLAIMER)
  return lines.join('\n')
}

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const sanityToken = process.env.SANITY_API_READ_TOKEN

  if (!stripeSecret || !webhookSecret || !resendKey || !from || !sanityToken) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_misconfigured',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Webhook unavailable' }, { status: 503 })
  }

  const stripe = new Stripe(stripeSecret)
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_invalid_signature',
        ok: false,
        at: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      }),
    )
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  if (processedEventIds.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid') {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_unpaid',
        ok: true,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ received: true })
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  })
  const productId = productIdFromLineItem(lineItems.data[0])

  if (!productId) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_no_product',
        ok: true,
        sessionId: session.id,
        stripeEventId: event.id,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ received: true })
  }

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion,
    token: sanityToken,
    useCdn: false,
  })

  const workshop = await sanity.fetch<WorkshopRegistrationPrivate | null>(
    workshopByStripeProductIdQuery,
    { productId },
  )

  if (!workshop) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_workshop_not_found',
        ok: true,
        productId,
        sessionId: session.id,
        stripeEventId: event.id,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ received: true })
  }

  const buyerEmail = session.customer_details?.email
  if (!buyerEmail) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_missing_email',
        ok: true,
        productId,
        sessionId: session.id,
        stripeEventId: event.id,
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ received: true })
  }

  const resend = new Resend(resendKey)

  try {
    const result = await resend.emails.send({
      from,
      to: [buyerEmail],
      subject: `You're registered — ${workshop.title}`,
      text: buildConfirmationText(workshop),
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    processedEventIds.add(event.id)

    console.info(
      JSON.stringify({
        event: 'stripe_webhook_confirmation_sent',
        ok: true,
        productId,
        sessionId: session.id,
        stripeEventId: event.id,
        workshopId: workshop._id,
        at: new Date().toISOString(),
      }),
    )

    return NextResponse.json({ received: true })
  } catch (err) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_resend_failed',
        ok: false,
        productId,
        sessionId: session.id,
        stripeEventId: event.id,
        workshopId: workshop._id,
        paymentStatus: session.payment_status,
        customerEmail: buyerEmail,
        amountTotal: session.amount_total,
        currency: session.currency,
        error: err instanceof Error ? err.message : String(err),
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
  }
}
