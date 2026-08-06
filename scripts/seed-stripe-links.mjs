/**
 * Seed Stripe Payment Links for the Relational Diplomacy workshop series.
 *
 * Source of truth: docs/workshop-schedule.md (titles + local dates from the table).
 * Also creates the full-series pass (SERIES).
 * Does not write to Sanity or workshop.config.json — only out/stripe-links.json.
 *
 * Output shape per key:
 *   { "url": "...", "productId": "prod_...", "priceId": "price_..." }
 *
 * Usage:
 *   node scripts/seed-stripe-links.mjs              # dry-run (default)
 *   node scripts/seed-stripe-links.mjs --commit     # create in Stripe
 *   node scripts/seed-stripe-links.mjs --backfill   # rewrite JSON from live Stripe (read-only)
 */
import { config as loadEnv } from 'dotenv'
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'

// Never override a key already set in the process env (e.g. inline
// STRIPE_SECRET_KEY=sk_live_… for --backfill while .env.local stays on test).
loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

/** Workshop numbers (zero-padded) to skip. Easy to edit. */
const SKIP = []

const SERIES = 'relational-diplomacy-2026'
/** Sanity `series.slug.current` the webhook looks up (create that doc separately). */
const SERIES_SLUG = 'fall-2026'
const UNIT_AMOUNT = 4700
const SERIES_UNIT_AMOUNT = 42300
const CURRENCY = 'usd'

/** Match scripts/seed.ts so Payment Link metadata aligns with workshop slugs. */
function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[\u201C\u201D"']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SCHEDULE_PATH = join(ROOT, 'docs', 'workshop-schedule.md')
const OUT_PATH = join(ROOT, 'out', 'stripe-links.json')

const commit = process.argv.includes('--commit')
const backfill = process.argv.includes('--backfill')

function requireEnv(name) {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`Missing ${name}`)
  return v
}

function pad(n) {
  return String(n).padStart(2, '0')
}

/**
 * Format a calendar YYYY-MM-DD from the schedule table as a date label.
 * Uses UTC noon so we never apply America/New_York offset math.
 */
function dateLabelFromLocalDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utc)
}

/**
 * Parse workshop number, local date, and title from docs/workshop-schedule.md.
 */
function parseSchedule(md) {
  const byNumber = new Map()

  // Table rows: | 1 | 2026-09-09 | 7:00 PM | EDT | `2026-09-09T23:00:00.000Z` | ...
  const tableRe =
    /^\|\s*(\d+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*7:00 PM\s*\|/gm
  for (const match of md.matchAll(tableRe)) {
    const num = Number(match[1])
    const localDate = match[2]
    byNumber.set(num, {
      number: num,
      nn: pad(num),
      localDate,
      title: null,
    })
  }

  // Titles section: 1. Title here
  const titlesStart = md.indexOf('## Titles (seed)')
  if (titlesStart === -1) {
    throw new Error('Could not find "## Titles (seed)" in workshop-schedule.md')
  }
  const titlesBlock = md.slice(titlesStart, md.indexOf('\n## ', titlesStart + 1))
  const titleRe = /^(\d+)\.\s+(.+?)\s*$/gm
  for (const match of titlesBlock.matchAll(titleRe)) {
    const num = Number(match[1])
    const title = match[2].trim()
    const row = byNumber.get(num)
    if (!row) {
      throw new Error(`Title for workshop ${num} has no matching schedule row`)
    }
    row.title = title
  }

  const workshops = [...byNumber.values()].sort((a, b) => a.number - b.number)
  if (workshops.length === 0) {
    throw new Error('No workshops parsed from workshop-schedule.md')
  }
  for (const w of workshops) {
    if (!w.title) {
      throw new Error(`Missing title for workshop ${w.nn}`)
    }
  }
  return workshops
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

async function listAllPaymentLinks(stripe) {
  const out = []
  let startingAfter
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

/** Catalog key for a product in this series (workshop nn or SERIES). */
function catalogKey(product) {
  if (product.metadata?.series !== SERIES) return null
  if (product.metadata?.kind === 'series_pass') return 'SERIES'
  if (product.metadata?.workshop) return product.metadata.workshop
  return null
}

function findExistingLink(links, key, workshopSlug) {
  return (
    links.find((l) => {
      if (l.metadata?.series !== SERIES || l.active === false || !l.url) {
        return false
      }
      if (key === 'SERIES') return l.metadata?.kind === 'series_pass'
      return (
        l.metadata?.workshop === key ||
        (workshopSlug && l.metadata?.workshop_slug === workshopSlug)
      )
    }) ?? null
  )
}

/** @returns {{ url: string | null, productId: string | null, priceId: string | null } | null} */
function normalizeEntry(entry) {
  if (!entry) return null
  if (typeof entry === 'string') {
    return { url: entry, productId: null, priceId: null }
  }
  if (typeof entry === 'object') {
    return {
      url: typeof entry.url === 'string' ? entry.url : null,
      productId: typeof entry.productId === 'string' ? entry.productId : null,
      priceId: typeof entry.priceId === 'string' ? entry.priceId : null,
    }
  }
  return null
}

function linkRecord({ url, productId, priceId }) {
  return {
    url: url || null,
    productId: productId || null,
    priceId: priceId || null,
  }
}

function loadExistingOutput() {
  if (!existsSync(OUT_PATH)) return {}
  try {
    return JSON.parse(readFileSync(OUT_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function writeOutput(map) {
  mkdirSync(dirname(OUT_PATH), { recursive: true })
  const ordered = {}
  for (const key of Object.keys(map).sort()) {
    ordered[key] = map[key]
  }
  writeFileSync(OUT_PATH, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8')
  console.log(`wrote ${OUT_PATH}`)
}

async function resolvePriceId(stripe, product) {
  const def = product.default_price
  if (typeof def === 'string' && def) return def
  if (def && typeof def === 'object' && def.id) return def.id

  const page = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 10,
  })
  return page.data[0]?.id ?? null
}

function buildCatalog(workshops) {
  const items = workshops.map((w) => {
    const dateLabel = dateLabelFromLocalDate(w.localDate)
    const workshopSlug = slugify(w.title)
    return {
      key: w.nn,
      workshopSlug,
      productName: `Workshop ${w.nn}: ${w.title}`,
      description: `${dateLabel} · 7:00–8:30 PM ET · Zoom`,
      unitAmount: UNIT_AMOUNT,
      metadata: {
        // workshop / series = legacy catalog keys. Webhook requires
        // workshop_slug + series_slug as a pair.
        workshop: w.nn,
        workshop_slug: workshopSlug,
        series_slug: SERIES_SLUG,
        date: w.localDate,
        series: SERIES,
      },
    }
  })

  items.push({
    key: 'SERIES',
    workshopSlug: null,
    productName: 'Relational Diplomacy — All Ten Sessions',
    description: 'All ten sessions · Sep 9 – Nov 11 · one session free',
    unitAmount: SERIES_UNIT_AMOUNT,
    metadata: {
      kind: 'series_pass',
      series: SERIES,
      series_slug: SERIES_SLUG,
    },
  })

  return items
}

async function runBackfill(stripe) {
  console.log('MODE: --backfill (Stripe read-only; rewrite out/stripe-links.json)')
  const mode = requireEnv('STRIPE_SECRET_KEY').startsWith('sk_live_')
    ? 'live'
    : requireEnv('STRIPE_SECRET_KEY').startsWith('sk_test_')
      ? 'test'
      : 'other'
  console.log(`Stripe mode: ${mode}`)
  if (mode !== 'live') {
    throw new Error(
      `--backfill expects a live STRIPE_SECRET_KEY (got ${mode}). Products were created in live.`,
    )
  }

  const existing = loadExistingOutput()
  const keys = Object.keys(existing)
  if (keys.length === 0) {
    throw new Error(`No keys in ${OUT_PATH} — nothing to backfill`)
  }

  const products = await listAllProducts(stripe)
  const links = await listAllPaymentLinks(stripe)
  const byKey = new Map()
  for (const p of products) {
    const key = catalogKey(p)
    if (key) byKey.set(key, p)
  }

  /** @type {Record<string, { url: string | null, productId: string | null, priceId: string | null }>} */
  const next = {}
  let complete = 0
  let incomplete = 0

  for (const key of keys.sort()) {
    const prev = normalizeEntry(existing[key])
    const product = byKey.get(key)
    if (!product) {
      console.log(`missing product for key ${key} — keeping URL only`)
      next[key] = linkRecord({
        url: prev?.url || null,
        productId: null,
        priceId: null,
      })
      incomplete += 1
      continue
    }

    const priceId = await resolvePriceId(stripe, product)
    const stripeLink = findExistingLink(links, key, null)
    const url = prev?.url || stripeLink?.url || null
    const record = linkRecord({
      url,
      productId: product.id,
      priceId,
    })
    next[key] = record
    if (record.url && record.productId && record.priceId) {
      complete += 1
      console.log(
        `backfill ${key} → ${record.productId} · ${record.priceId} · ${record.url}`,
      )
    } else {
      incomplete += 1
      console.log(
        `partial ${key} → product=${record.productId} price=${record.priceId} url=${record.url}`,
      )
    }
  }

  writeOutput(next)
  console.log(`backfill done: ${complete} complete, ${incomplete} incomplete`)
}

async function main() {
  if (commit && backfill) {
    throw new Error('Pass only one of --commit or --backfill')
  }

  const secret = requireEnv('STRIPE_SECRET_KEY')
  const stripe = new Stripe(secret)

  if (backfill) {
    await runBackfill(stripe)
    return
  }

  const md = readFileSync(SCHEDULE_PATH, 'utf8')
  const workshops = parseSchedule(md).filter((w) => !SKIP.includes(w.nn))
  const catalog = buildCatalog(workshops)

  console.log(
    commit
      ? 'MODE: --commit (will create products / prices / payment links)'
      : 'MODE: dry-run (pass --commit to create)',
  )
  console.log(`SKIP = ${JSON.stringify(SKIP)}`)
  console.log(
    `Items to process: ${catalog.map((i) => i.key).join(', ')} (${catalog.length})`,
  )

  const products = await listAllProducts(stripe)
  const existingByKey = new Map()
  for (const p of products) {
    const key = catalogKey(p)
    if (key) existingByKey.set(key, p)
  }
  const links = await listAllPaymentLinks(stripe)

  /** @type {Record<string, { url: string | null, productId: string | null, priceId: string | null }>} */
  const results = {}
  const prior = loadExistingOutput()
  for (const [key, value] of Object.entries(prior)) {
    const n = normalizeEntry(value)
    if (n) results[key] = linkRecord(n)
  }

  for (const item of catalog) {
    const existingProduct = existingByKey.get(item.key)
    if (existingProduct) {
      const priorEntry = normalizeEntry(results[item.key])
      const stripeLink = findExistingLink(links, item.key, item.workshopSlug)
      const url = priorEntry?.url || stripeLink?.url || null
      const priceId =
        (await resolvePriceId(stripe, existingProduct)) ||
        priorEntry?.priceId ||
        null
      const record = linkRecord({
        url,
        productId: existingProduct.id,
        priceId,
      })
      console.log(
        `skip ${item.key} — product already exists (${existingProduct.id})${
          url ? ` · ${url}` : ' · no payment link URL found'
        }`,
      )
      results[item.key] = record
      if (commit) writeOutput(results)
      continue
    }

    if (!commit) {
      console.log(
        `[dry-run] would create ${item.productName} · ${item.description} · $${(item.unitAmount / 100).toFixed(0)} + Payment Link (attendee_name)`,
      )
      continue
    }

    console.log(`creating product ${item.key}: ${item.productName}`)
    const product = await stripe.products.create({
      name: item.productName,
      description: item.description,
      metadata: item.metadata,
    })
    console.log(`  product ${product.id}`)

    console.log(`creating price ${item.key}: ${item.unitAmount} ${CURRENCY}`)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: item.unitAmount,
      currency: CURRENCY,
    })
    console.log(`  price ${price.id}`)

    console.log(`creating payment link ${item.key}`)
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      custom_fields: [
        {
          key: 'attendee_name',
          label: { type: 'custom', custom: 'Attendee name' },
          type: 'text',
          optional: false,
        },
      ],
      metadata: item.metadata,
    })
    console.log(`  link ${link.id} · ${link.url}`)

    results[item.key] = linkRecord({
      url: link.url,
      productId: product.id,
      priceId: price.id,
    })
    writeOutput(results)
  }

  if (!commit) {
    console.log('dry-run complete — no Stripe writes, no JSON written for new links')
  } else {
    writeOutput(results)
    console.log('done')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
