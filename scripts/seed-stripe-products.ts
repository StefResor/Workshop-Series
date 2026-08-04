/**
 * One-off: create Stripe Products / Prices / Payment Links for workshops
 * missing stripeProductId, plus the series pass.
 *
 * Does NOT write back to Sanity — prints a paste table to stdout.
 *
 * Usage:
 *   npm run seed:stripe -- --dry-run
 *   npm run seed:stripe
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import Stripe from 'stripe'
import { formatWorkshopDisplay } from '../lib/datetime'

loadEnv({ path: '.env.local' })
loadEnv()

const dryRun = process.argv.includes('--dry-run')

const SERIES_META_KIND = 'series_pass'
const WORKSHOP_PRICE_CENTS = 4700
const SERIES_PRICE_CENTS = 42300

type SeedWorkshop = {
  _id: string
  title: string
  sessionNumber?: number
  startsAt: string
  timeZone?: string
  stripeProductId?: string
}

type Row = {
  session: string
  title: string
  productId: string
  paymentLinkUrl: string
  note: string
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`Missing ${name}`)
  return v
}

function stripeMode(secret: string): 'test' | 'live' | 'unknown' {
  if (secret.startsWith('sk_test_')) return 'test'
  if (secret.startsWith('sk_live_')) return 'live'
  return 'unknown'
}

function padSession(n: number): string {
  return String(n).padStart(2, '0')
}

function workshopDescription(w: SeedWorkshop): string {
  const when = formatWorkshopDisplay(w.startsAt, w.timeZone || 'America/New_York')
  return `${when.date} · 7:00–8:30 PM ET · Live on Zoom`
}

async function listAllProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const out: Stripe.Product[] = []
  let startingAfter: string | undefined
  for (;;) {
    const page = await stripe.products.list({
      limit: 100,
      active: true,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    out.push(...page.data)
    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1]?.id
    if (!startingAfter) break
  }
  return out
}

async function listAllPaymentLinks(
  stripe: Stripe,
): Promise<Stripe.PaymentLink[]> {
  const out: Stripe.PaymentLink[] = []
  let startingAfter: string | undefined
  for (;;) {
    const page = await stripe.paymentLinks.list({
      limit: 100,
      active: true,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    out.push(...page.data)
    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1]?.id
    if (!startingAfter) break
  }
  return out
}

function paymentLinkParams(
  priceId: string,
  redirectUrl: string,
  metadata: Record<string, string>,
): Stripe.PaymentLinkCreateParams {
  return {
    line_items: [{ price: priceId, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: { url: redirectUrl },
    },
    name_collection: {
      individual: { enabled: true },
    },
    metadata,
  }
}

async function ensurePriceAndLink(
  stripe: Stripe,
  productId: string,
  unitAmount: number,
  redirectUrl: string,
  metadata: Record<string, string>,
  existingLinks: Stripe.PaymentLink[],
  dry: boolean,
): Promise<{ priceId: string; url: string }> {
  const metaKey = metadata.workshopId || metadata.kind || ''
  const existingLink = existingLinks.find(
    (l) =>
      (metadata.workshopId && l.metadata?.workshopId === metadata.workshopId) ||
      (metadata.kind && l.metadata?.kind === metadata.kind),
  )
  if (existingLink?.url) {
    return { priceId: '(existing)', url: existingLink.url }
  }

  if (dry) {
    console.log(
      `  [dry-run] would create Price $${(unitAmount / 100).toFixed(2)} + Payment Link for ${productId} (${metaKey})`,
    )
    return {
      priceId: 'price_dry_run',
      url: 'https://buy.stripe.com/dry_run',
    }
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency: 'usd',
  })

  const link = await stripe.paymentLinks.create(
    paymentLinkParams(price.id, redirectUrl, metadata),
  )

  return { priceId: price.id, url: link.url }
}

function printTable(rows: Row[]): void {
  const headers = ['session', 'title', 'product ID', 'payment link URL', 'note']
  const cols = [
    rows.map((r) => r.session),
    rows.map((r) => r.title),
    rows.map((r) => r.productId),
    rows.map((r) => r.paymentLinkUrl),
    rows.map((r) => r.note),
  ]
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...cols[i]!.map((c) => c.length)),
  )
  const line = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i]!)).join(' | ')
  console.log('')
  console.log(line(headers))
  console.log(widths.map((w) => '-'.repeat(w)).join('-+-'))
  for (const r of rows) {
    console.log(
      line([r.session, r.title, r.productId, r.paymentLinkUrl, r.note]),
    )
  }
  console.log('')
}

async function main(): Promise<void> {
  const stripeSecret = requireEnv('STRIPE_SECRET_KEY')
  const sanityToken = requireEnv('SANITY_API_READ_TOKEN')
  const projectId = requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID')
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-27'
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://stefanie-schumacher-com.vercel.app'
  ).replace(/\/$/, '')
  const redirectUrl = `${siteUrl}/workshops/thank-you`
  const seriesEnvId = process.env.STRIPE_SERIES_PRODUCT_ID?.trim() || ''

  const mode = stripeMode(stripeSecret)
  console.log(
    `WARNING: Stripe key mode = ${mode.toUpperCase()} (${dryRun ? 'DRY-RUN — no writes' : 'LIVE WRITES ENABLED'})`,
  )
  if (mode === 'unknown') {
    console.log('WARNING: key does not start with sk_test_ or sk_live_')
  }

  const stripe = new Stripe(stripeSecret)
  const sanity = createClient({
    projectId,
    dataset,
    apiVersion,
    token: sanityToken,
    useCdn: false,
  })

  const workshops = await sanity.fetch<SeedWorkshop[]>(
    `*[
      _type == "workshop" &&
      status == "published" &&
      !(_id in path("drafts.**"))
    ] | order(startsAt asc) {
      _id,
      title,
      sessionNumber,
      startsAt,
      timeZone,
      stripeProductId
    }`,
  )

  if (workshops.length === 0) {
    throw new Error('No published workshops found in Sanity')
  }

  console.log(`Loaded ${workshops.length} published workshops from Sanity`)

  const products = await listAllProducts(stripe)
  const links = await listAllPaymentLinks(stripe)

  const productByWorkshopId = new Map<string, Stripe.Product>()
  let seriesProduct: Stripe.Product | undefined

  for (const p of products) {
    const wid = p.metadata?.workshopId
    if (wid) productByWorkshopId.set(wid, p)
    if (p.metadata?.kind === SERIES_META_KIND) seriesProduct = p
  }

  if (seriesEnvId && !seriesProduct) {
    try {
      const retrieved = await stripe.products.retrieve(seriesEnvId)
      if (!retrieved.deleted) seriesProduct = retrieved
    } catch {
      console.log(
        `STRIPE_SERIES_PRODUCT_ID=${seriesEnvId} not found in this Stripe account`,
      )
    }
  }

  const rows: Row[] = []

  for (let i = 0; i < workshops.length; i++) {
    const w = workshops[i]!
    const sessionNum = w.sessionNumber ?? i + 1
    const nn = padSession(sessionNum)
    const title = w.title
    const sanityProductId = w.stripeProductId?.trim()

    if (sanityProductId) {
      console.log(`SKIP session ${nn} (${w._id}) — Sanity stripeProductId already set`)
      const link =
        links.find((l) => l.metadata?.workshopId === w._id)?.url ||
        links.find((l) => l.metadata?.workshopId === sanityProductId)?.url ||
        '—'
      rows.push({
        session: nn,
        title,
        productId: sanityProductId,
        paymentLinkUrl: link,
        note: 'skipped (Sanity already has product id)',
      })
      continue
    }

    const existing = productByWorkshopId.get(w._id)
    let productId: string
    let note: string

    if (existing) {
      productId = existing.id
      note = 'reused (Stripe metadata.workshopId)'
      console.log(`REUSE session ${nn} → ${productId}`)
    } else if (dryRun) {
      productId = `prod_dry_run_${nn}`
      note = 'dry-run create'
      console.log(
        `[dry-run] would create Product "Workshop ${nn} — ${title}" for ${w._id}`,
      )
    } else {
      const product = await stripe.products.create({
        name: `Workshop ${nn} — ${title}`,
        description: workshopDescription(w),
        metadata: {
          workshopId: w._id,
          sessionNumber: nn,
        },
      })
      productId = product.id
      note = 'created'
      productByWorkshopId.set(w._id, product)
      console.log(`CREATE session ${nn} → ${productId}`)
    }

    const { url } = await ensurePriceAndLink(
      stripe,
      productId,
      WORKSHOP_PRICE_CENTS,
      redirectUrl,
      { workshopId: w._id, sessionNumber: nn },
      links,
      dryRun,
    )

    rows.push({
      session: nn,
      title,
      productId,
      paymentLinkUrl: url,
      note,
    })
  }

  // Series pass
  let seriesRow: Row
  if (seriesProduct) {
    console.log(`REUSE series pass → ${seriesProduct.id}`)
    const { url } = await ensurePriceAndLink(
      stripe,
      seriesProduct.id,
      SERIES_PRICE_CENTS,
      redirectUrl,
      { kind: SERIES_META_KIND },
      links,
      dryRun,
    )
    seriesRow = {
      session: 'SERIES',
      title: 'Full Series Pass — All 10 Workshops',
      productId: seriesProduct.id,
      paymentLinkUrl: url,
      note: seriesEnvId
        ? 'reused (STRIPE_SERIES_PRODUCT_ID / metadata)'
        : 'reused (Stripe metadata.kind)',
    }
  } else if (dryRun) {
    console.log('[dry-run] would create series pass Product + Price + Payment Link')
    seriesRow = {
      session: 'SERIES',
      title: 'Full Series Pass — All 10 Workshops',
      productId: 'prod_dry_run_series',
      paymentLinkUrl: 'https://buy.stripe.com/dry_run',
      note: 'dry-run create',
    }
  } else {
    const product = await stripe.products.create({
      name: 'Full Series Pass — All 10 Workshops',
      description:
        'All ten sessions · Wednesdays, Sep 9 – Nov 11, 2026 · 7:00–8:30 PM ET · Live on Zoom',
      metadata: { kind: SERIES_META_KIND },
    })
    console.log(`CREATE series pass → ${product.id}`)
    const { url } = await ensurePriceAndLink(
      stripe,
      product.id,
      SERIES_PRICE_CENTS,
      redirectUrl,
      { kind: SERIES_META_KIND },
      links,
      false,
    )
    seriesRow = {
      session: 'SERIES',
      title: 'Full Series Pass — All 10 Workshops',
      productId: product.id,
      paymentLinkUrl: url,
      note: 'created — set STRIPE_SERIES_PRODUCT_ID to this product id',
    }
  }

  printTable(rows)
  console.log('Series pass:')
  printTable([seriesRow])
  console.log(
    'Paste product IDs into Studio (Registration private → stripeProductId)',
  )
  console.log(
    'Paste Payment Link URLs into Studio (Stripe Payment Link field).',
  )
  console.log(
    `Redirect after checkout: ${redirectUrl}`,
  )
  if (!dryRun && seriesRow.note.includes('created')) {
    console.log(
      `Remember: STRIPE_SERIES_PRODUCT_ID=${seriesRow.productId}`,
    )
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
