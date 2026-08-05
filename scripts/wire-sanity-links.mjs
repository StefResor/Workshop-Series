/**
 * Wire Stripe Payment Link URLs from out/stripe-links.json into Sanity.
 *
 * Workshops matched by sessionNumber ("01" → 1). SERIES → siteSettings.seriesPaymentLink.
 * Prefers productId from the JSON; falls back to Stripe metadata lookup only when absent.
 *
 * Expected JSON shape:
 *   { "01": { "url": "...", "productId": "prod_...", "priceId": "price_..." }, … }
 * Legacy bare URL strings are still accepted for url.
 *
 * Usage:
 *   node scripts/wire-sanity-links.mjs           # dry-run (default)
 *   node scripts/wire-sanity-links.mjs --commit  # write to Sanity
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@sanity/client'
import Stripe from 'stripe'

loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

const PROJECT_ID = 'dx57inng'
const DATASET = 'production'
const API_VERSION = '2026-07-27'
const SERIES = 'relational-diplomacy-2026'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LINKS_PATH = join(ROOT, 'out', 'stripe-links.json')

const commit = process.argv.includes('--commit')

function requireEnv(name) {
  const v = process.env[name]?.trim()
  if (!v) {
    console.error(`Missing ${name} — refusing unauthenticated Sanity write.`)
    process.exit(1)
  }
  return v
}

/** @returns {{ url: string | null, productId: string | null }} */
function normalizeEntry(entry) {
  if (typeof entry === 'string') {
    return { url: entry, productId: null }
  }
  if (entry && typeof entry === 'object') {
    return {
      url: typeof entry.url === 'string' ? entry.url : null,
      productId: typeof entry.productId === 'string' ? entry.productId : null,
    }
  }
  return { url: null, productId: null }
}

async function listAllProducts(stripe) {
  const out = []
  let startingAfter
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

/** Stripe fallback — only used when JSON lacks productId for a workshop key. */
async function loadProductIdsFromStripe(missingKeys) {
  if (missingKeys.length === 0) return new Map()

  const secret = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secret) {
    console.warn(
      `STRIPE_SECRET_KEY unset — cannot resolve productId for: ${missingKeys.join(', ')}`,
    )
    return new Map()
  }

  console.log(
    `Stripe fallback for missing productId: ${missingKeys.join(', ')}`,
  )
  const stripe = new Stripe(secret)
  const products = await listAllProducts(stripe)
  const map = new Map()
  for (const p of products) {
    if (p.metadata?.series !== SERIES) continue
    if (p.metadata?.kind === 'series_pass') {
      map.set('SERIES', p.id)
      continue
    }
    if (p.metadata?.workshop) map.set(p.metadata.workshop, p.id)
  }
  return map
}

function fmt(value) {
  if (value === undefined || value === null || value === '') return '(unset)'
  return String(value)
}

async function main() {
  const token = requireEnv('SANITY_API_WRITE_TOKEN')

  if (!existsSync(LINKS_PATH)) {
    throw new Error(
      `Missing ${LINKS_PATH} — run seed:stripe-links --backfill or --commit first`,
    )
  }

  /** @type {Record<string, unknown>} */
  const links = JSON.parse(readFileSync(LINKS_PATH, 'utf8'))
  const numberedKeys = Array.from({ length: 10 }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  )
  const allKeys = [...numberedKeys, 'SERIES']

  /** @type {Record<string, { url: string | null, productId: string | null }>} */
  const entries = {}
  for (const key of allKeys) {
    if (links[key] == null) {
      throw new Error(`out/stripe-links.json missing key "${key}"`)
    }
    entries[key] = normalizeEntry(links[key])
    if (!entries[key].url) {
      throw new Error(`out/stripe-links.json key "${key}" has no url`)
    }
  }

  const missingProductKeys = numberedKeys.filter((k) => !entries[k].productId)
  const stripeIds = await loadProductIdsFromStripe(missingProductKeys)
  for (const key of missingProductKeys) {
    const fromStripe = stripeIds.get(key)
    if (fromStripe) entries[key].productId = fromStripe
  }

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token,
    useCdn: false,
  })

  console.log(
    commit
      ? 'MODE: --commit (will patch published Sanity docs)'
      : 'MODE: dry-run (pass --commit to write)',
  )
  console.log(`Sanity ${PROJECT_ID}/${DATASET}`)

  let patched = 0
  let skipped = 0
  let missing = 0

  for (const key of numberedKeys) {
    const sessionNumber = Number(key)
    const { url, productId } = entries[key]

    const doc = await client.fetch(
      `*[_type == "workshop" && sessionNumber == $n && !(_id in path("drafts.**"))][0]{
        _id, title, sessionNumber, stripePaymentLink, stripeProductId
      }`,
      { n: sessionNumber },
    )

    if (!doc?._id) {
      console.log(
        `missing ${key} — no published workshop with sessionNumber=${sessionNumber}`,
      )
      missing += 1
      continue
    }

    /** @type {Record<string, string>} */
    const next = { stripePaymentLink: url }
    if (productId) next.stripeProductId = productId

    let needsPatch = false
    for (const [field, newVal] of Object.entries(next)) {
      const current = doc[field]
      const changed = current !== newVal
      console.log(
        `${changed ? (commit ? 'patch' : 'would-patch') : 'unchanged'} ${doc._id}  ${field}`,
      )
      console.log(`  current: ${fmt(current)}`)
      console.log(`  new:     ${fmt(newVal)}`)
      if (changed) needsPatch = true
    }
    if (!productId) {
      console.log(
        `note ${doc._id}  stripeProductId — not in JSON and Stripe fallback found nothing for ${key}`,
      )
    }

    if (!needsPatch) {
      skipped += 1
      continue
    }

    if (commit) {
      await client.patch(doc._id).set(next).commit()
    }
    patched += 1
  }

  // SERIES → siteSettings.seriesPaymentLink
  {
    const url = entries.SERIES.url
    const settings = await client.fetch(
      `*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{
        _id, seriesPaymentLink
      }`,
    )

    if (!settings?._id) {
      console.log('missing SERIES — no published siteSettings document')
      missing += 1
    } else {
      const current = settings.seriesPaymentLink
      const changed = current !== url
      console.log(
        `${changed ? (commit ? 'patch' : 'would-patch') : 'unchanged'} ${settings._id}  seriesPaymentLink`,
      )
      console.log(`  current: ${fmt(current)}`)
      console.log(`  new:     ${fmt(url)}`)

      if (!changed) {
        skipped += 1
      } else {
        if (commit) {
          await client
            .patch(settings._id)
            .set({ seriesPaymentLink: url })
            .commit()
        }
        patched += 1
      }
    }
  }

  console.log('')
  console.log(
    `summary: ${patched} patched, ${skipped} skipped, ${missing} missing`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
