import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
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
  const seriesProductId = process.env.STRIPE_SERIES_PRODUCT_ID?.trim()

  if (!stripeSecret || !sanityToken || !projectId) {
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

  const productIds = [workshop.stripeProductId]
  if (seriesProductId) productIds.push(seriesProductId)

  const stripe = new Stripe(stripeSecret)
  const emails = await emailsForStripeProductIds(stripe, productIds)

  console.info(
    JSON.stringify({
      event: 'admin_session_recipients',
      ok: true,
      workshopId: workshop._id,
      count: emails.length,
      at: new Date().toISOString(),
    }),
  )

  return NextResponse.json({ count: emails.length })
}
