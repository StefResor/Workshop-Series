/**
 * Set homepage heroFootnote.
 *
 * Usage:
 *   npx tsx scripts/migrate-home-hero-footnote.ts --dry-run
 *   npx tsx scripts/migrate-home-hero-footnote.ts
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
  heroFootnote: '*Easier said than done.',
}

async function main() {
  const doc = await client.fetch<{ _id: string; heroFootnote?: string } | null>(
    `*[_type == "page" && slug.current == "home"][0]{ _id, heroFootnote }`,
  )
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
