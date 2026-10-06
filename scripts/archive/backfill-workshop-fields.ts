/**
 * Backfill new workshop registration fields on existing seeded documents.
 *
 * Sets registrationStatus: 'draft' on all workshops. Leaves price,
 * stripePaymentLink, hook, and capacity unset for manual entry.
 *
 * Patches published docs and drafts.<id> when a draft exists.
 *
 * Usage:
 *   npx tsx scripts/backfill-workshop-fields.ts --dry-run
 *   npx tsx scripts/backfill-workshop-fields.ts
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

type WorkshopHit = {
  _id: string
  title?: string
  sessionNumber?: number
  registrationStatus?: string
}

function publishedId(id: string) {
  return id.startsWith('drafts.') ? id.slice('drafts.'.length) : id
}

function draftId(id: string) {
  const pub = publishedId(id)
  return `drafts.${pub}`
}

async function main() {
  // Include drafts — token + non-CDN returns drafts.* documents too.
  const workshops = await client.fetch<WorkshopHit[]>(
    `*[_type == "workshop"] | order(sessionNumber asc) {
      _id,
      title,
      sessionNumber,
      registrationStatus
    }`,
  )

  if (!workshops.length) {
    console.log('No workshop documents found.')
    return
  }

  // Also ensure we cover draft counterparts that might not appear if only
  // published IDs were returned — fetch drafts explicitly by published id.
  const ids = new Set(workshops.map((w) => w._id))
  const publishedIds = [...new Set(workshops.map((w) => publishedId(w._id)))]

  for (const pub of publishedIds) {
    const dId = draftId(pub)
    if (!ids.has(dId)) {
      const draft = await client.fetch<WorkshopHit | null>(
        `*[_id == $id][0]{ _id, title, sessionNumber, registrationStatus }`,
        { id: dId },
      )
      if (draft) {
        workshops.push(draft)
        ids.add(draft._id)
      }
    }
  }

  workshops.sort((a, b) => {
    const sn = (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0)
    if (sn !== 0) return sn
    // Published before draft for the same session
    const aDraft = a._id.startsWith('drafts.') ? 1 : 0
    const bDraft = b._id.startsWith('drafts.') ? 1 : 0
    return aDraft - bDraft
  })

  console.log(
    dryRun
      ? `DRY RUN — would patch ${workshops.length} workshop document(s):\n`
      : `Patching ${workshops.length} workshop document(s):\n`,
  )

  let patched = 0
  let skipped = 0

  for (const doc of workshops) {
    const current = doc.registrationStatus
    const already = current === 'draft'
    const line = `#${doc.sessionNumber ?? '?'} ${doc._id} — "${doc.title ?? 'untitled'}" · registrationStatus: ${current ?? '(unset)'} → draft`

    if (already) {
      console.log(`  skip (already draft): ${line}`)
      skipped += 1
      continue
    }

    console.log(`  ${dryRun ? 'would patch' : 'patch'}: ${line}`)

    if (!dryRun) {
      await client.patch(doc._id).set({ registrationStatus: 'draft' }).commit()
    }
    patched += 1
  }

  console.log(
    `\n${dryRun ? 'Dry run complete' : 'Backfill complete'}: ${patched} ${dryRun ? 'would be patched' : 'patched'}, ${skipped} skipped (already draft).`,
  )
  console.log(
    'Left unset for manual entry: hook, price, stripePaymentLink, capacity.',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
