/**
 * Clear homepage heroFootnote (removes the line under the display headline).
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

async function main() {
  const doc = await client.fetch<{ _id: string; heroFootnote?: string } | null>(
    `*[_type == "page" && slug.current == "home"][0]{ _id, heroFootnote }`,
  )
  if (!doc?._id) throw new Error('Home page document not found')

  console.log('Current:', doc)
  if (!doc.heroFootnote) {
    console.log('Already empty — nothing to do.')
    return
  }
  console.log(dryRun ? 'Would unset heroFootnote' : 'Unsetting heroFootnote')
  if (dryRun) return

  await client.patch(doc._id).unset(['heroFootnote']).commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
