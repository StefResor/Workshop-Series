import type Stripe from 'stripe'
import { productIdFromLineItem } from '@/lib/stripe-line-item'

/** Warn (do not stop) once the scan exceeds this many Checkout Session pages. */
const LARGE_SCAN_PAGE_WARN = 50

/**
 * Collect unique buyer emails from paid Checkout Sessions whose line items
 * include any of the given Stripe Product IDs.
 * Paginates with `starting_after` until Stripe reports `has_more: false`.
 */
export async function emailsForStripeProductIds(
  stripe: Stripe,
  productIds: string[],
): Promise<string[]> {
  const wanted = new Set(productIds.filter(Boolean))
  if (wanted.size === 0) return []

  const emails = new Set<string>()
  let startingAfter: string | undefined
  let pageCount = 0

  for (;;) {
    const page: Stripe.ApiList<Stripe.Checkout.Session> =
      await stripe.checkout.sessions.list({
        limit: 100,
        status: 'complete',
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      })

    pageCount += 1
    if (pageCount === LARGE_SCAN_PAGE_WARN) {
      console.info(
        JSON.stringify({
          event: 'stripe_buyers_scan_large',
          ok: true,
          pages: pageCount,
          pageSize: 100,
          at: new Date().toISOString(),
        }),
      )
    }

    for (const session of page.data) {
      if (session.payment_status !== 'paid') continue

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product'],
      })

      const matches = lineItems.data.some((item) => {
        const pid = productIdFromLineItem(item)
        return pid != null && wanted.has(pid)
      })
      if (!matches) continue

      const email =
        session.customer_details?.email || session.customer_email || null
      if (email) emails.add(email.trim().toLowerCase())
    }

    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1]?.id
    if (!startingAfter) break
  }

  return [...emails].sort()
}
