/**
 * Collapse home Practice services to Couples + Individuals, with new copy.
 * Deletes the old Couples-at-a-Crossroads service (and its draft, if any).
 *
 * Usage:
 *   npx tsx scripts/migrate-practice-services.ts --dry-run
 *   npx tsx scripts/migrate-practice-services.ts
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

const COUPLES = {
  _id: 'service-couples-same-fight',
  title: 'Couples',
  slug: 'couples',
  order: 2,
  shortDescription:
    'The argument that repeats on schedule, and the decision underneath it that neither of you will say out loud. Most couples arrive naming the wrong problem — the money, the dishes, the tone. We work the pattern that generates it. If the honest answer turns out to be separation, that happens deliberately and with structure, rather than by exhaustion.',
}

const INDIVIDUALS = {
  _id: 'service-individual-relational',
  title: 'Individuals',
  slug: 'individuals',
  order: 1,
  shortDescription:
    "For people who are precise, effective, and well-regarded at work and cannot reproduce any of it at home. Defensiveness, shame, the reflex to win, the retreat that reads as calm. These patterns were learned early, they predate the relationship you're in, and they outlast it unless something interrupts them.",
}

const DELETE_IDS = [
  'service-couples-crossroads',
  'drafts.service-couples-crossroads',
]

async function main() {
  for (const doc of [COUPLES, INDIVIDUALS]) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{ _id }`,
      { id: doc._id },
    )
    if (!existing) {
      console.log(`missing ${doc._id} — skip (run seed first)`)
      continue
    }
    console.log(
      `${dryRun ? 'would patch' : 'patch'}: ${doc._id} → ${doc.title}`,
    )
    if (!dryRun) {
      await client
        .patch(doc._id)
        .set({
          title: doc.title,
          slug: { _type: 'slug', current: doc.slug },
          order: doc.order,
          shortDescription: doc.shortDescription,
        })
        .commit()
    }
  }

  for (const id of DELETE_IDS) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{ _id }`,
      { id },
    )
    if (!existing) {
      console.log(`absent ${id}`)
      continue
    }
    console.log(`${dryRun ? 'would delete' : 'delete'}: ${id}`)
    if (!dryRun) await client.delete(id)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
