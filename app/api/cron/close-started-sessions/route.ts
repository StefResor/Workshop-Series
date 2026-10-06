import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { matchPaymentLinkId, type StartedSession } from '@/lib/close-started-sessions'
import { registrationOpenAfter } from '@/lib/catalogue'
import { getWriteClient } from '@/sanity/lib/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const STARTED = `*[
  _type == "workshopSession" &&
  startsAt <= $registrationOpenAfter &&
  (registrationStatus == "open" || defined(stripePaymentLink)) &&
  !(_id in path("drafts.**"))
]{
  _id,
  registrationStatus,
  stripePaymentLink,
  startsAt,
  "slug": slug.current,
  "seriesSlug": series->slug.current
}`

async function listActivePaymentLinks(stripe: Stripe) {
  const out: Array<{ id: string; url: string }> = []
  let startingAfter: string | undefined
  for (;;) {
    const page = await stripe.paymentLinks.list({
      limit: 100,
      active: true,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    out.push(...page.data.map((link) => ({ id: link.id, url: link.url })))
    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1]?.id
    if (!startingAfter) break
  }
  return out
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1'
  const sanity = getWriteClient()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const sessions = await sanity.fetch<StartedSession[]>(STARTED, {
    registrationOpenAfter: registrationOpenAfter().toISOString(),
  })
  const links = sessions.some((s) => s.stripePaymentLink)
    ? await listActivePaymentLinks(stripe)
    : []

  const closed: Array<{
    id: string
    slug?: string
    seriesSlug?: string
    linkId?: string
    stripe?: string
    sanity?: string
  }> = []

  for (const session of sessions) {
    const linkId = matchPaymentLinkId(session.stripePaymentLink, links)
    const row = {
      id: session._id,
      slug: session.slug,
      seriesSlug: session.seriesSlug,
      linkId,
    }
    if (dryRun) {
      closed.push({ ...row, stripe: linkId ? 'would-deactivate' : 'no-active-link', sanity: 'would-close' })
      continue
    }

    if (linkId) {
      await stripe.paymentLinks.update(linkId, { active: false })
    }
    if (session.registrationStatus === 'open') {
      await sanity.patch(session._id).set({ registrationStatus: 'closed' }).commit()
    }
    closed.push({
      ...row,
      stripe: linkId ? 'deactivated' : 'no-active-link',
      sanity:
        session.registrationStatus === 'open' ? 'closed' : session.registrationStatus,
    })
  }

  const report = { dryRun, count: closed.length, closed }
  console.info('[cron] close-started-sessions', JSON.stringify(report))
  return NextResponse.json(report)
}
