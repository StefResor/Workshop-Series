/**
 * Sync Stripe Payment Link metadata + checkout collection settings.
 *
 * Matches live links by legacy metadata.workshop ("01"…"10") / kind=series_pass.
 * Adds workshop_slug + series_slug (both required for singles); leaves legacy keys.
 * Also requires individual name collection and terms-of-service agreement,
 * and clears custom_fields (Dashboard can't edit API-created links).
 * Clearing uses rawRequest with custom_fields='' — stripe-node drops [].
 *
 * Live key: put STRIPE_SECRET_KEY=sk_live_… in gitignored `.env.stripe.live`
 * (overrides .env.local for this script only). Do not inline the key on the CLI.
 *
 * Usage:
 *   node scripts/sync-payment-link-metadata.mjs           # dry-run
 *   node scripts/sync-payment-link-metadata.mjs --commit  # write (live key only)
 */
import { existsSync } from 'node:fs'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import Stripe from 'stripe'

// Prefer a gitignored live key file so .env.local can stay on test and the
// secret never lands in shell history via STRIPE_SECRET_KEY=sk_live_… inline.
loadEnv({ path: '.env.local', override: false })
if (existsSync('.env.stripe.live')) {
  loadEnv({ path: '.env.stripe.live', override: true })
}
loadEnv({ override: false })

const SERIES_META = 'relational-diplomacy-2026'
const SERIES_SLUG = 'fall-2026'
const commit = process.argv.includes('--commit')

/** Target checkout settings on every matched Payment Link. */
const DESIRED_NAME_COLLECTION = {
  individual: { enabled: true, optional: false },
}
const DESIRED_CONSENT_COLLECTION = {
  terms_of_service: 'required',
}

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

/** Compact custom_fields for dry-run (key / type / optional / label). */
function customFieldsSnapshot(fields) {
  if (!Array.isArray(fields) || fields.length === 0) return []
  return fields.map((f) => ({
    key: f.key ?? null,
    type: f.type ?? null,
    optional: Boolean(f.optional),
    label: f.label?.custom ?? f.label?.type ?? null,
  }))
}

/** Snapshot of fields this script manages (for dry-run diffs). */
function checkoutSnapshot(link) {
  const individual = link.name_collection?.individual
  return {
    name_collection: {
      individual: individual
        ? {
            enabled: Boolean(individual.enabled),
            optional: Boolean(individual.optional),
          }
        : null,
    },
    consent_collection: {
      terms_of_service: link.consent_collection?.terms_of_service ?? null,
    },
    custom_fields: customFieldsSnapshot(link.custom_fields),
  }
}

function desiredCheckoutSnapshot() {
  return {
    name_collection: {
      individual: { ...DESIRED_NAME_COLLECTION.individual },
    },
    consent_collection: { ...DESIRED_CONSENT_COLLECTION },
    custom_fields: [],
  }
}

function metadataChanged(current, proposed) {
  return JSON.stringify(current) !== JSON.stringify(proposed)
}

function checkoutChanged(current, proposed) {
  return JSON.stringify(current) !== JSON.stringify(proposed)
}

/**
 * Build the paymentLinks.update payload.
 * Preserve unrelated consent/name keys Stripe may already have set.
 *
 * custom_fields: stripe-node silently drops `[]`, so clearing must use the
 * empty-string unset form via rawRequest (see applyUpdate).
 */
function updateParams(link, proposedMetadata) {
  return {
    metadata: proposedMetadata,
    name_collection: {
      ...(link.name_collection?.business
        ? { business: link.name_collection.business }
        : {}),
      individual: { ...DESIRED_NAME_COLLECTION.individual },
    },
    consent_collection: {
      ...(link.consent_collection?.promotions
        ? { promotions: link.consent_collection.promotions }
        : {}),
      ...DESIRED_CONSENT_COLLECTION,
    },
  }
}

async function applyUpdate(stripe, linkId, link, proposedMetadata) {
  const params = updateParams(link, proposedMetadata)
  // Empty string = unset array. `custom_fields: []` never leaves the SDK.
  return stripe.rawRequest('POST', `/v1/payment_links/${linkId}`, {
    ...params,
    custom_fields: '',
  })
}

async function main() {
  const stripeKey = requireEnv('STRIPE_SECRET_KEY')
  // Prefix is the source of truth — restricted keys (rk_*) are not sk_*.
  const mode = stripeKey.startsWith('sk_live_') || stripeKey.startsWith('rk_live_')
    ? 'live'
    : stripeKey.startsWith('sk_test_') || stripeKey.startsWith('rk_test_')
      ? 'test'
      : 'other'

  console.log(
    commit
      ? 'MODE: --commit (will update Payment Links)'
      : 'MODE: dry-run (pass --commit to write)',
  )
  console.log(`Stripe mode: ${mode}`)
  console.log(
    'Also enforcing: name_collection.individual required, ' +
      'consent_collection.terms_of_service=required, custom_fields=[]',
  )

  if (commit && mode !== 'live') {
    throw new Error(
      `--commit refuses a ${mode} key (prefix must be sk_live_ or rk_live_). ` +
        `Put the live key in .env.stripe.live so .env.local can stay on test.`,
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

  /** @type {Array<{ id: string, kind: string, link: import('stripe').Stripe.PaymentLink, currentMeta: Record<string,string>, proposedMeta: Record<string,string>, currentCheckout: ReturnType<typeof checkoutSnapshot>, proposedCheckout: ReturnType<typeof desiredCheckoutSnapshot> }>} */
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
    const currentMeta = { ...link.metadata }
    const proposedMeta = {
      ...currentMeta,
      workshop_slug: w.slug,
      series_slug: SERIES_SLUG,
    }
    rows.push({
      id: link.id,
      kind: `workshop ${nn}`,
      link,
      currentMeta,
      proposedMeta,
      currentCheckout: checkoutSnapshot(link),
      proposedCheckout: desiredCheckoutSnapshot(),
    })
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
    const currentMeta = { ...link.metadata }
    const proposedMeta = {
      ...currentMeta,
      series_slug: SERIES_SLUG,
    }
    rows.push({
      id: link.id,
      kind: 'SERIES pass',
      link,
      currentMeta,
      proposedMeta,
      currentCheckout: checkoutSnapshot(link),
      proposedCheckout: desiredCheckoutSnapshot(),
    })
  }

  const missingWorkshops = workshops.filter(
    (w) => !matchedNn.has(pad(w.sessionNumber)),
  )

  console.log('')
  console.log(
    'link ID                         kind            meta / name / tos / custom_fields',
  )
  console.log('-'.repeat(100))
  for (const row of rows) {
    const metaDirty = metadataChanged(row.currentMeta, row.proposedMeta)
    const checkoutDirty = checkoutChanged(
      row.currentCheckout,
      row.proposedCheckout,
    )
    const flag = metaDirty || checkoutDirty ? 'UPDATE' : 'ok'
    console.log(`${row.id}  ${row.kind.padEnd(14)}  ${flag}`)
    console.log(`  metadata current:  ${JSON.stringify(row.currentMeta)}`)
    console.log(`  metadata proposed: ${JSON.stringify(row.proposedMeta)}`)
    console.log(
      `  name_collection.individual current:  ${JSON.stringify(row.currentCheckout.name_collection.individual)}`,
    )
    console.log(
      `  name_collection.individual proposed: ${JSON.stringify(row.proposedCheckout.name_collection.individual)}`,
    )
    console.log(
      `  consent_collection.terms_of_service current:  ${JSON.stringify(row.currentCheckout.consent_collection.terms_of_service)}`,
    )
    console.log(
      `  consent_collection.terms_of_service proposed: ${JSON.stringify(row.proposedCheckout.consent_collection.terms_of_service)}`,
    )
    console.log(
      `  custom_fields current:  ${JSON.stringify(row.currentCheckout.custom_fields)}`,
    )
    console.log(
      `  custom_fields proposed: ${JSON.stringify(row.proposedCheckout.custom_fields)}`,
    )
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

  const toWrite = rows.filter(
    (row) =>
      metadataChanged(row.currentMeta, row.proposedMeta) ||
      checkoutChanged(row.currentCheckout, row.proposedCheckout),
  )

  if (!commit) {
    console.log('')
    console.log(
      `dry-run complete — ${toWrite.length} of ${rows.length} link(s) would change; no Stripe writes`,
    )
    return
  }

  for (const row of toWrite) {
    await applyUpdate(stripe, row.id, row.link, row.proposedMeta)
    console.log(`updated ${row.id}`)
  }
  console.log(
    `done — ${toWrite.length} Payment Link(s) updated` +
      (toWrite.length < rows.length
        ? ` (${rows.length - toWrite.length} already compliant)`
        : ''),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
