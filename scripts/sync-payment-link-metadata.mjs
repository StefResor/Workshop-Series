/**
 * Sync Stripe Payment Link metadata from Sanity workshop/series slugs.
 *
 * Matches live links by legacy metadata.workshop ("01"…"10") / kind=series_pass.
 * Adds workshop_slug + series_slug; leaves legacy keys in place.
 *
 * Usage:
 *   node scripts/sync-payment-link-metadata.mjs           # dry-run
 *   node scripts/sync-payment-link-metadata.mjs --commit  # write (live key only)
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import Stripe from 'stripe'

loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

const SERIES_META = 'relational-diplomacy-2026'
const SERIES_SLUG = 'fall-2026'
const commit = process.argv.includes('--commit')

function requireEnv(name) {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`Missing ${name}`)
  return v
}

function pad(n) {
  return String(n).padStart(2, '0')
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

async function main() {
  const stripeKey = requireEnv('STRIPE_SECRET_KEY')
  const mode = stripeKey.startsWith('sk_live_')
    ? 'live'
    : stripeKey.startsWith('sk_test_')
      ? 'test'
      : 'other'

  console.log(
    commit
      ? 'MODE: --commit (will update Payment Link metadata)'
      : 'MODE: dry-run (pass --commit to write)',
  )
  console.log(`Stripe mode: ${mode}`)

  if (commit && mode !== 'live') {
    throw new Error(
      `--commit refuses a ${mode} STRIPE_SECRET_KEY. Live Payment Links need a live key (inline is fine; .env.local can stay on test).`,
    )
  }

  const sanityToken =
    process.env.SANITY_API_READ_TOKEN?.trim() ||
    process.env.SANITY_API_WRITE_TOKEN?.trim()
  if (!sanityToken) throw new Error('Missing SANITY_API_READ_TOKEN or SANITY_API_WRITE_TOKEN')

  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dx57inng',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-07-27',
    token: sanityToken,
    useCdn: false,
  })

  const series = await sanity.fetch(
    `*[_type == "series" && slug.current == $slug][0]{ _id, title, "slug": slug.current }`,
    { slug: SERIES_SLUG },
  )
  if (!series?._id) {
    throw new Error(`No series with slug "${SERIES_SLUG}" in Sanity`)
  }

  const workshops = await sanity.fetch(
    `*[_type == "workshop"] | order(sessionNumber asc){
      _id, sessionNumber, title, "slug": slug.current
    }`,
  )
  if (workshops.length === 0) throw new Error('No workshops in Sanity')

  for (const w of workshops) {
    if (!w.slug) throw new Error(`Workshop ${w._id} missing slug`)
  }

  const byNn = new Map(workshops.map((w) => [pad(w.sessionNumber), w]))

  const stripe = new Stripe(stripeKey)
  const links = await listAllPaymentLinks(stripe)

  const workshopLinks = links.filter(
    (l) =>
      l.metadata?.series === SERIES_META &&
      l.metadata?.workshop &&
      l.metadata?.kind !== 'series_pass',
  )
  const passLinks = links.filter(
    (l) =>
      l.metadata?.series === SERIES_META &&
      l.metadata?.kind === 'series_pass',
  )

  /** @type {Array<{ id: string, kind: string, current: Record<string,string>, proposed: Record<string,string> }>} */
  const rows = []
  const unmatchedLinks = []
  const matchedNn = new Set()

  for (const link of workshopLinks) {
    const nn = link.metadata.workshop
    const w = byNn.get(nn)
    if (!w) {
      unmatchedLinks.push({
        id: link.id,
        reason: `metadata.workshop=${nn} has no Sanity workshop`,
      })
      continue
    }
    matchedNn.add(nn)
    const current = { ...link.metadata }
    const proposed = {
      ...current,
      workshop_slug: w.slug,
      series_slug: SERIES_SLUG,
    }
    rows.push({ id: link.id, kind: `workshop ${nn}`, current, proposed })
  }

  if (passLinks.length === 0) {
    unmatchedLinks.push({
      id: '(none)',
      reason: 'no Payment Link with kind=series_pass',
    })
  } else if (passLinks.length > 1) {
    for (const link of passLinks) {
      unmatchedLinks.push({
        id: link.id,
        reason: 'multiple series_pass links — refuse to guess',
      })
    }
  } else {
    const link = passLinks[0]
    const current = { ...link.metadata }
    const proposed = {
      ...current,
      series_slug: SERIES_SLUG,
    }
    rows.push({ id: link.id, kind: 'SERIES pass', current, proposed })
  }

  const missingWorkshops = workshops.filter(
    (w) => !matchedNn.has(pad(w.sessionNumber)),
  )

  console.log('')
  console.log('link ID                         kind            current → proposed')
  console.log('-'.repeat(100))
  for (const row of rows) {
    const cur = JSON.stringify(row.current)
    const prop = JSON.stringify(row.proposed)
    const changed = cur !== prop
    console.log(`${row.id}  ${row.kind.padEnd(14)}  ${changed ? 'UPDATE' : 'ok'}`)
    console.log(`  current:  ${cur}`)
    console.log(`  proposed: ${prop}`)
  }

  if (unmatchedLinks.length) {
    console.log('')
    console.log('UNMATCHED LINKS:')
    for (const u of unmatchedLinks) {
      console.log(`  ${u.id} — ${u.reason}`)
    }
  }

  if (missingWorkshops.length) {
    console.log('')
    console.log('WORKSHOPS WITH NO MATCHING LINK:')
    for (const w of missingWorkshops) {
      console.log(
        `  #${pad(w.sessionNumber)}  ${w._id}  ${w.slug}  ${w.title}`,
      )
    }
  }

  if (unmatchedLinks.length || missingWorkshops.length) {
    console.log('')
    console.log(
      'Refusing to write — fix unmatched links / missing workshops first.',
    )
    if (commit) process.exit(2)
  }

  if (!commit) {
    console.log('')
    console.log(
      `dry-run complete — ${rows.length} link(s) would be updated; no Stripe writes`,
    )
    return
  }

  for (const row of rows) {
    await stripe.paymentLinks.update(row.id, { metadata: row.proposed })
    console.log(`updated ${row.id}`)
  }
  console.log(`done — ${rows.length} Payment Link(s) updated`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
