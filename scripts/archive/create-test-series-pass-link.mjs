/**
 * Create a TEST-MODE-ONLY Stripe Payment Link for the Fall 2026 series pass.
 *
 * Refuses to run unless STRIPE_SECRET_KEY starts with sk_test_.
 * Does not write to Sanity. Does not create anything in live mode.
 *
 * Usage:
 *   node scripts/create-test-series-pass-link.mjs
 */
import { config as loadEnv } from 'dotenv'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'

loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

const SERIES_SLUG = 'fall-2026'
const UNIT_AMOUNT = 42300
const CURRENCY = 'usd'
/** Real workshop slug for the thank-you redirect (session 03). */
const THANK_YOU_SLUG = 'why-unleashing-on-your-partner-never-gets-you-heard'
const SUCCESS_URL = `http://localhost:3000/workshops/fall-2026/${THANK_YOU_SLUG}/thank-you?session_id={CHECKOUT_SESSION_ID}`

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '..', 'out', 'test-series-pass-link.json')

function requireEnv(name) {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`Missing ${name}`)
  return v
}

async function findExistingTestProduct(stripe) {
  for await (const product of stripe.products.list({ limit: 100, active: true })) {
    if (product.name === 'TEST — Fall 2026 Series Pass') return product
  }
  return null
}

async function ensurePrice(stripe, productId) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 })
  const match = prices.data.find(
    (p) => p.unit_amount === UNIT_AMOUNT && p.currency === CURRENCY,
  )
  if (match) return match
  return stripe.prices.create({
    product: productId,
    unit_amount: UNIT_AMOUNT,
    currency: CURRENCY,
  })
}

async function createPaymentLink(stripe, priceId, { withPromotions }) {
  /** @type {Stripe.PaymentLinkCreateParams} */
  const params = {
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      kind: 'series_pass',
      series_slug: SERIES_SLUG,
    },
    name_collection: {
      individual: { enabled: true, optional: false },
    },
    after_completion: {
      type: 'redirect',
      redirect: { url: SUCCESS_URL },
    },
  }
  if (withPromotions) {
    params.consent_collection = { promotions: 'auto' }
  }
  return stripe.paymentLinks.create(params)
}

async function main() {
  const secret = requireEnv('STRIPE_SECRET_KEY')
  if (!secret.startsWith('sk_test_')) {
    throw new Error(
      `Refusing — STRIPE_SECRET_KEY must start with sk_test_ (got ${secret.slice(0, 8)}…). ` +
        `This script creates test-mode resources only.`,
    )
  }

  const stripe = new Stripe(secret)

  console.log('MODE: test only (sk_test_ asserted)')

  let product = await findExistingTestProduct(stripe)
  if (product) {
    console.log(`Reusing product ${product.id}`)
  } else {
    console.log(`Creating product: TEST — Fall 2026 Series Pass · $${UNIT_AMOUNT / 100}`)
    product = await stripe.products.create({
      name: 'TEST — Fall 2026 Series Pass',
      description: 'TEST MODE ONLY · All ten sessions · Fall 2026 · one session free',
      metadata: {
        kind: 'series_pass',
        series_slug: SERIES_SLUG,
        test: 'true',
      },
    })
    console.log(`  product ${product.id}`)
  }

  const price = await ensurePrice(stripe, product.id)
  console.log(`  price ${price.id}`)

  let link
  let promotionsEnabled = true
  try {
    link = await createPaymentLink(stripe, price.id, { withPromotions: true })
  } catch (err) {
    const msg = err?.raw?.message || err?.message || String(err)
    if (!msg.includes('consent_collection.promotions')) throw err
    console.warn(
      'WARN: promotional consent blocked until Checkout ToS is accepted at\n' +
        '      https://dashboard.stripe.com/settings/checkout\n' +
        '      Creating the link without promotions for now; re-run or update after accepting.',
    )
    promotionsEnabled = false
    link = await createPaymentLink(stripe, price.id, { withPromotions: false })
  }

  console.log(`  link ${link.id}`)
  console.log(`  url  ${link.url}`)
  console.log(`  success_url → ${SUCCESS_URL}`)
  console.log(`  name_collection.individual: required`)
  console.log(`  consent_collection.promotions: ${promotionsEnabled ? 'auto' : 'NOT SET (ToS pending)'}`)

  const record = {
    url: link.url,
    paymentLinkId: link.id,
    productId: product.id,
    priceId: price.id,
    series_slug: SERIES_SLUG,
    thankYouSlug: THANK_YOU_SLUG,
    promotionsEnabled,
    createdAt: new Date().toISOString(),
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, `${JSON.stringify(record, null, 2)}\n`)
  console.log(`wrote ${OUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
