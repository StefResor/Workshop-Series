/**
 * Seed homepage workshop-intro fields (heading, spec tail, note).
 *
 * Usage:
 *   npx tsx scripts/migrate-home-workshops-intro.ts --dry-run
 *   npx tsx scripts/migrate-home-workshops-intro.ts
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

const PATCH = {
  workshopsHeading: 'The Notice* Workshop Series.',
  workshopsSpecTail: 'Join any session, in any order · 18+',
  workshopsNote:
    'Separate from the series, I see a small number of couples and individuals privately.',
}

async function main() {
  const doc = await client.fetch<{
    _id: string
    workshopsHeading?: string
    workshopsSpecTail?: string
    workshopsNote?: string
  } | null>(`*[_type == "page" && slug.current == "home"][0]{
    _id, workshopsHeading, workshopsSpecTail, workshopsNote
  }`)

  if (!doc?._id) throw new Error('Home page document not found')

  console.log('Current:', doc)
  console.log(dryRun ? 'Would set:' : 'Setting:', PATCH)

  if (dryRun) return

  await client.patch(doc._id).set(PATCH).commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
