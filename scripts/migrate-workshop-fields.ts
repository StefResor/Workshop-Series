/**
 * One-pass workshop field + slug migration (no dual-read left behind).
 *
 * - priceUSD → price, then unset priceUSD
 * - registrationUrl → stripePaymentLink (when set), then unset registrationUrl
 * - slug: strip leading "workshop-N-" prefix
 *
 * Patches published docs and drafts.<id> when present.
 *
 * Usage:
 *   npx tsx scripts/migrate-workshop-fields.ts --dry-run
 *   npx tsx scripts/migrate-workshop-fields.ts
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'

loadEnv({ path: '.env.local' })
loadEnv()

const dryRun = process.argv.includes('--dry-run')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-27'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!token) throw new Error('Missing SANITY_API_WRITE_TOKEN')

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

type Doc = {
  _id: string
  title?: string
  sessionNumber?: number
  priceUSD?: number
  price?: number
  registrationUrl?: string
  stripePaymentLink?: string
  slug?: string
}

const PREFIX = /^workshop-\d+-/

function newSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined
  if (!PREFIX.test(slug)) return undefined
  return slug.replace(PREFIX, '')
}

async function main() {
  const docs = await client.fetch<Doc[]>(
    `*[_type == "workshop"] | order(sessionNumber asc) {
      _id,
      title,
      sessionNumber,
      priceUSD,
      price,
      registrationUrl,
      stripePaymentLink,
      "slug": slug.current
    }`,
  )

  console.log(
    dryRun
      ? `DRY RUN — ${docs.length} workshop doc(s)\n`
      : `Migrating ${docs.length} workshop doc(s)\n`,
  )

  for (const doc of docs) {
    const set: Record<string, unknown> = {}
    const unset: string[] = []
    const notes: string[] = []

    if (doc.price == null && doc.priceUSD != null) {
      set.price = doc.priceUSD
      notes.push(`price ← ${doc.priceUSD}`)
    }
    if (doc.priceUSD != null) {
      unset.push('priceUSD')
      notes.push('unset priceUSD')
    }

    if (!doc.stripePaymentLink && doc.registrationUrl) {
      set.stripePaymentLink = doc.registrationUrl
      notes.push('stripePaymentLink ← registrationUrl')
    }
    if (doc.registrationUrl) {
      unset.push('registrationUrl')
      notes.push('unset registrationUrl')
    }

    const nextSlug = newSlug(doc.slug)
    if (nextSlug) {
      set.slug = { _type: 'slug', current: nextSlug }
      notes.push(`slug ${doc.slug} → ${nextSlug}`)
    }

    if (!notes.length) {
      console.log(`  skip ${doc._id} (already migrated)`)
      continue
    }

    console.log(`  ${dryRun ? 'would' : 'will'} ${doc._id}: ${notes.join('; ')}`)

    if (!dryRun) {
      let patch = client.patch(doc._id)
      if (Object.keys(set).length) patch = patch.set(set)
      if (unset.length) patch = patch.unset(unset)
      await patch.commit()
    }
  }

  console.log(dryRun ? '\nDry run complete.' : '\nMigration complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
