/**
 * Bring the 10 live Fall 2026 Stripe products in line with Sanity:
 * new dates (Oct 28 – Jan 20), titles and metadata. Optionally creates a
 * live Payment Link for any workshop that has none (e.g. Workshop 01) and
 * points each Sanity workshop at its live link.
 *
 * Source of truth: Sanity workshops in series `fall-2026` (startsAt, title, slug).
 * Matches Stripe products by legacy metadata.workshop ("01"…"10") with
 * metadata.series = relational-diplomacy-2026, or by metadata.workshop_slug.
 * Never touches the series-pass product or prices.
 *
 * Live key: STRIPE_SECRET_KEY=sk_live_… (or rk_live_ with Products + Payment
 * Links write) in gitignored `.env.stripe.live`, same as sync-payment-link-metadata.
 *
 * Usage:
 *   node scripts/update-fall-stripe-products.mjs                         # dry run
 *   node scripts/update-fall-stripe-products.mjs --commit                # products + Sanity links
 *   node scripts/update-fall-stripe-products.mjs --commit --create-links # also create missing live links
 */
import { existsSync } from 'node:fs'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import Stripe from 'stripe'

loadEnv({ path: '.env.local', override: false })
if (existsSync('.env.stripe.live')) loadEnv({ path: '.env.stripe.live', override: true })

const SERIES_META = 'relational-diplomacy-2026'
const SERIES_SLUG = 'fall-2026'
const TZ = 'America/New_York'
const SITE = 'https://stefanie-schumacher-com.vercel.app'
const commit = process.argv.includes('--commit')
const createLinks = process.argv.includes('--create-links')

const pad = (n) => String(n).padStart(2, '0')
const need = (k) => {
  const v = process.env[k]?.trim()
  if (!v) throw new Error(`Missing ${k}`)
  return v
}

/** "Wednesday, October 28, 2026 · 7:00–8:30 PM ET · Zoom" */
function describe(startsAt, minutes = 90) {
  const start = new Date(startsAt)
  const end = new Date(start.getTime() + minutes * 60000)
  const day = start.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const t = (d, withPeriod) =>
    d.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).replace(withPeriod ? /$/ : / [AP]M$/, '')
  return `${day} · ${t(start, false)}–${t(end, true)} ET · Zoom`
}
const etDate = (startsAt) => new Date(startsAt).toLocaleDateString('en-CA', { timeZone: TZ }) // YYYY-MM-DD

async function listAll(fn, params = {}) {
  const out = []
  let starting_after
  for (;;) {
    const page = await fn({ limit: 100, ...params, ...(starting_after ? { starting_after } : {}) })
    out.push(...page.data)
    if (!page.has_more || !page.data.length) return out
    starting_after = page.data[page.data.length - 1].id
  }
}

async function main() {
  const key = need('STRIPE_SECRET_KEY')
  const mode = /^(sk|rk)_live_/.test(key) ? 'live' : /^(sk|rk)_test_/.test(key) ? 'test' : 'other'
  console.log(commit ? `MODE: --commit${createLinks ? ' --create-links' : ''}` : 'MODE: dry run (pass --commit to write)')
  console.log(`Stripe mode: ${mode}`)
  if (commit && mode !== 'live') throw new Error(`--commit refuses a ${mode} key; put the live key in .env.stripe.live`)

  const stripe = new Stripe(key)
  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dx57inng',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-07-27',
    token: commit ? need('SANITY_API_WRITE_TOKEN') : process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  })

  const series = await sanity.fetch(`*[_type == "series" && slug.current == $s && !(_id in path("drafts.**"))][0]{_id}`, { s: SERIES_SLUG })
  if (!series?._id) throw new Error(`No series ${SERIES_SLUG}`)
  const workshops = await sanity.fetch(
    `*[_type in ["workshopSession","workshop"] && series._ref == $id && !(_id in path("drafts.**"))] | order(sessionNumber asc){
      _id, sessionNumber, "slug": slug.current, startsAt, durationMinutes, stripePaymentLink,
      "title": coalesce(topic->title, title)
    }`,
    { id: series._id },
  )
  if (workshops.length !== 10) throw new Error(`Expected 10 Fall workshops in Sanity, found ${workshops.length}`)

  const products = await listAll((p) => stripe.products.list(p), { active: true })
  const links = await listAll((p) => stripe.paymentLinks.list(p), { active: true })
  const linkByProduct = new Map()
  for (const link of links) {
    const items = await stripe.paymentLinks.listLineItems(link.id, { limit: 5 })
    for (const li of items.data) {
      const pid = typeof li.price?.product === 'string' ? li.price.product : li.price?.product?.id
      if (pid && !linkByProduct.has(pid)) linkByProduct.set(pid, link)
    }
  }

  // Template for new links: copy checkout settings from an existing Fall link.
  const template = links.find((l) => l.metadata?.series === SERIES_META && l.metadata?.workshop && l.metadata?.kind !== 'series_pass')

  let problems = 0
  const plan = []
  for (const w of workshops) {
    const nn = pad(w.sessionNumber)
    const matches = products.filter(
      (p) => p.metadata?.kind !== 'series_pass' &&
        ((p.metadata?.series === SERIES_META && p.metadata?.workshop === nn) || p.metadata?.workshop_slug === w.slug),
    )
    if (matches.length !== 1) {
      console.error(`✗ ${nn} ${w.slug}: expected 1 live product, found ${matches.length}${matches.length ? ' (' + matches.map((p) => p.id).join(', ') + ')' : ''}`)
      problems++
      continue
    }
    const p = matches[0]
    const name = `Workshop ${nn}: ${w.title}`
    const description = describe(w.startsAt, w.durationMinutes || 90)
    const metadata = { ...p.metadata, date: etDate(w.startsAt), workshop: nn, series: p.metadata?.series || SERIES_META, workshop_slug: w.slug, series_slug: SERIES_SLUG }
    const productChanges = {}
    if (p.name !== name) productChanges.name = name
    if (p.description !== description) productChanges.description = description
    if (JSON.stringify(p.metadata) !== JSON.stringify(metadata)) productChanges.metadata = metadata

    const link = linkByProduct.get(p.id)
    const sanityLink = w.stripePaymentLink || ''
    plan.push({ w, nn, p, productChanges, link, sanityLink })

    console.log(`\n${nn}  ${w.title}`)
    console.log(`    product ${p.id}`)
    if (productChanges.name) console.log(`    name:  "${p.name}"  →  "${name}"`)
    if (productChanges.description) console.log(`    desc:  "${p.description ?? ''}"  →  "${description}"`)
    if (productChanges.metadata) console.log(`    meta:  ${JSON.stringify(p.metadata)}  →  ${JSON.stringify(metadata)}`)
    if (!Object.keys(productChanges).length) console.log('    product already up to date')
    if (link) {
      console.log(`    live link ${link.url}`)
      if (sanityLink !== link.url) console.log(`    Sanity link "${sanityLink || '(empty)'}"  →  ${link.url}`)
    } else {
      console.log(`    NO live Payment Link${createLinks ? ' → will create one' : ' (re-run with --create-links)'}`)
      if (sanityLink) console.log(`    Sanity currently has: ${sanityLink}${sanityLink.includes('/test_') ? '  ← TEST link' : ''}`)
    }
  }

  if (problems) {
    console.error(`\n${problems} problem(s); nothing written.`)
    process.exit(1)
  }
  if (!commit) {
    console.log('\nDry run. Re-run with --commit (and --create-links if any are missing).')
    return
  }

  for (const row of plan) {
    const { w, nn, p, productChanges } = row
    let link = row.link
    if (Object.keys(productChanges).length) {
      await stripe.products.update(p.id, productChanges)
      console.log(`✓ ${nn} product updated`)
    }
    if (!link && createLinks) {
      const price = typeof p.default_price === 'string' ? p.default_price : p.default_price?.id
      if (!price) throw new Error(`${nn}: product ${p.id} has no default price`)
      link = await stripe.paymentLinks.create({
        line_items: [{ price, quantity: 1 }],
        metadata: { series: SERIES_META, workshop: nn, workshop_slug: w.slug, series_slug: SERIES_SLUG },
        name_collection: { individual: { enabled: true, optional: false } },
        consent_collection: { terms_of_service: 'required' },
        after_completion: {
          type: 'redirect',
          redirect: { url: `${SITE}/workshops/${SERIES_SLUG}/${w.slug}/thank-you?session_id={CHECKOUT_SESSION_ID}` },
        },
        ...(template?.allow_promotion_codes ? { allow_promotion_codes: true } : {}),
      })
      console.log(`✓ ${nn} live link created ${link.url}`)
    }
    if (link && row.sanityLink !== link.url) {
      await sanity.patch(w._id).set({ stripePaymentLink: link.url }).commit()
      console.log(`✓ ${nn} Sanity link set`)
    }
  }
  console.log('\nDone. Run sync-payment-link-metadata.mjs (dry run) to confirm every link carries workshop_slug + series_slug.')
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
