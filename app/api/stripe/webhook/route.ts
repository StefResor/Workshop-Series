import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Stripe from 'stripe'
import {
  buildConfirmationWithCredentialsEmail,
  buildWelcomeEmail,
  toEmailSession,
} from '@/lib/emails/workshop-registration'
import { productIdFromLineItem } from '@/lib/stripe-line-item'
import {
  publishedWorkshopsPrivateQuery,
  workshopByStripeProductIdQuery,
  type WorkshopRegistrationPrivate,
} from '@/lib/workshop-registration-private'
import { credentialsDueWithinWindow } from '@/lib/workshop-window'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SERIES_PURCHASE_LABEL = 'Relational Diplomacy Workshop Series'

function seriesProductId(): string | undefined {
  const id = process.env.STRIPE_SERIES_PRODUCT_ID?.trim()
  return id || undefined
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

  const buyerEmail =
    session.customer_details?.email || session.customer_email || null
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

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion,
    token: sanityToken,
    useCdn: false,
  })

  const nowMs = Date.now()
  const seriesId = seriesProductId()
  const isSeries = Boolean(seriesId && productId === seriesId)

  let email:
    | ReturnType<typeof buildWelcomeEmail>
    | ReturnType<typeof buildConfirmationWithCredentialsEmail>
  let logKind: 'welcome' | 'credentials' | 'series'

  try {
    if (isSeries) {
      const workshops = await sanity.fetch<WorkshopRegistrationPrivate[]>(
        publishedWorkshopsPrivateQuery,
      )

      if (!workshops.length) {
        console.info(
          JSON.stringify({
            event: 'stripe_webhook_series_no_workshops',
            ok: true,
            productId,
            sessionId: session.id,
            stripeEventId: event.id,
            at: new Date().toISOString(),
          }),
        )
        return NextResponse.json({ received: true })
      }

      const sessions = workshops.map((w) =>
        toEmailSession(w, credentialsDueWithinWindow(w.startsAt, nowMs)),
      )
      const anyCreds = sessions.some((s) => s.includeCredentials)
      email = anyCreds
        ? buildConfirmationWithCredentialsEmail({
            purchaseLabel: SERIES_PURCHASE_LABEL,
            sessions,
          })
        : buildWelcomeEmail({
            purchaseLabel: SERIES_PURCHASE_LABEL,
            sessions,
          })
      logKind = 'series'
    } else {
      const workshop = await sanity.fetch<WorkshopRegistrationPrivate | null>(
        workshopByStripeProductIdQuery,
        { productId },
      )

      if (!workshop) {
        console.info(
          JSON.stringify({
            event: 'stripe_webhook_unmatched_product',
            ok: true,
            productId,
            sessionId: session.id,
            stripeEventId: event.id,
            at: new Date().toISOString(),
          }),
        )
        return NextResponse.json({ received: true })
      }

      const due = credentialsDueWithinWindow(workshop.startsAt, nowMs)
      const sessionLine = toEmailSession(workshop, due)
      email = due
        ? buildConfirmationWithCredentialsEmail({
            purchaseLabel: workshop.title,
            sessions: [sessionLine],
          })
        : buildWelcomeEmail({
            purchaseLabel: workshop.title,
            sessions: [sessionLine],
          })
      logKind = due ? 'credentials' : 'welcome'
    }
  } catch (err) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_sanity_failed',
        ok: false,
        productId,
        sessionId: session.id,
        stripeEventId: event.id,
        error: err instanceof Error ? err.message : String(err),
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }

  const resend = new Resend(resendKey)

  try {
    const result = await resend.emails.send({
      from,
      to: [buyerEmail],
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    console.info(
      JSON.stringify({
        event: 'stripe_webhook_email_sent',
        ok: true,
        kind: logKind,
        productId,
        sessionId: session.id,
        stripeEventId: event.id,
        at: new Date().toISOString(),
      }),
    )

    return NextResponse.json({ received: true })
  } catch (err) {
    console.info(
      JSON.stringify({
        event: 'stripe_webhook_resend_failed',
        ok: false,
        kind: logKind,
        productId,
        sessionId: session.id,
        stripeEventId: event.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        error: err instanceof Error ? err.message : String(err),
        at: new Date().toISOString(),
      }),
    )
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 })
  }
}
