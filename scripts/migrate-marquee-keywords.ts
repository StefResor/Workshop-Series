/**
 * Seed siteSettings.marqueeKeywords for the homepage scrolling banner.
 *
 * Usage:
 *   npx tsx scripts/migrate-marquee-keywords.ts --dry-run
 *   npx tsx scripts/migrate-marquee-keywords.ts
 *   npx tsx scripts/migrate-marquee-keywords.ts --force
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'

loadEnv({ path: '.env.local' })
loadEnv()

const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

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

const DEFAULTS = [
  'Accountability',
  'Honesty',
  'Repair',
  'Boundaries',
  'Pattern Recognition',
  'Mindfulness',
]

async function main() {
  const doc = await client.fetch<{
    _id: string
    marqueeKeywords?: string[]
  } | null>(`*[_type == "siteSettings"][0]{ _id, marqueeKeywords }`)

  if (!doc?._id) {
    throw new Error('siteSettings document not found')
  }

  const current = doc.marqueeKeywords ?? []
  console.log('Current:', { _id: doc._id, marqueeKeywords: current })

  if (current.length > 0 && !force) {
    console.log('Already set; pass --force to overwrite.')
    return
  }

  console.log(dryRun ? 'Would set:' : 'Setting:', DEFAULTS)
  if (dryRun) return

  await client.patch(doc._id).set({ marqueeKeywords: DEFAULTS }).commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
