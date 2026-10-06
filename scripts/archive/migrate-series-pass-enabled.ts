/**
 * Hide the full-series pass until Studio turns it back on.
 *
 * Usage:
 *   npx tsx scripts/migrate-series-pass-enabled.ts --dry-run
 *   npx tsx scripts/migrate-series-pass-enabled.ts
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

const SPEC =
  'The Connection Workshop · Live · Wednesdays · 7:00–8:30 PM ET · Zoom · $47 per session · Join any session, in any order · 18+'

async function main() {
  const settings = await client.fetch<{ _id: string; seriesPassEnabled?: boolean } | null>(
    `*[_type == "siteSettings"][0]{ _id, seriesPassEnabled }`,
  )
  if (!settings?._id) throw new Error('siteSettings document not found')

  const home = await client.fetch<{ _id: string; workshopsSpec?: string } | null>(
    `*[_type == "page" && slug.current == "home"][0]{ _id, workshopsSpec }`,
  )

  console.log('Current siteSettings:', settings)
  console.log('Current home workshopsSpec:', home?.workshopsSpec ?? null)

  if (dryRun) {
    console.log('Would set seriesPassEnabled: false')
    if (home?._id && /\bfull series\b/i.test(home.workshopsSpec || '')) {
      console.log('Would set home workshopsSpec to session-only copy')
    }
    return
  }

  await client.patch(settings._id).set({ seriesPassEnabled: false }).commit()
  console.log('Set seriesPassEnabled: false')

  if (home?._id && /\bfull series\b/i.test(home.workshopsSpec || '')) {
    await client.patch(home._id).set({ workshopsSpec: SPEC }).commit()
    console.log('Updated home workshopsSpec (session-only)')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
