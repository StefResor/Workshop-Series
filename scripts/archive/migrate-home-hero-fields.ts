/**
 * Populate home page heroSolid / heroOutline / heroJoin from approved values.
 * Does not clear legacy `headline` (hidden in Studio for home); home renderer
 * ignores it.
 *
 * Usage:
 *   npx tsx scripts/migrate-home-hero-fields.ts --dry-run
 *   npx tsx scripts/migrate-home-hero-fields.ts
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
  heroSolid: 'Notice',
  heroOutline: '*',
  heroJoin: 'none' as const,
}

async function main() {
  const doc = await client.fetch<{
    _id: string
    headline?: string
    heroSolid?: string
    heroOutline?: string
    heroJoin?: string
  } | null>(`*[_type == "page" && slug.current == "home"][0]{
    _id, headline, heroSolid, heroOutline, heroJoin
  }`)

  if (!doc?._id) {
    throw new Error('Home page document not found')
  }

  console.log('Current:', {
    _id: doc._id,
    headline: doc.headline ?? null,
    heroSolid: doc.heroSolid ?? null,
    heroOutline: doc.heroOutline ?? null,
    heroJoin: doc.heroJoin ?? null,
  })
  console.log(dryRun ? 'Would set:' : 'Setting:', PATCH)

  if (dryRun) return

  await client.patch(doc._id).set(PATCH).commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
