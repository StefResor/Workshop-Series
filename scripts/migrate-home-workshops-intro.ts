/**
 * Seed / refresh homepage workshop-intro fields (heading, full subhead, note).
 *
 * Usage:
 *   npx tsx scripts/migrate-home-workshops-intro.ts --dry-run
 *   npx tsx scripts/migrate-home-workshops-intro.ts
 *
 * With no --force, only sets workshopsSpec when it is currently empty
 * (preserves Studio edits). Always refreshes heading/note only when empty
 * unless --force.
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import { composeWorkshopSeriesSpecLine } from '../lib/workshop-price'

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

const DEFAULTS = {
  workshopsHeading: 'The Notice* Workshop Series.',
  workshopsNote:
    'Separate from the series, I see a small number of couples and individuals privately.',
}

async function main() {
  const home = await client.fetch<{
    _id: string
    workshopsHeading?: string
    workshopsSpec?: string
    workshopsSpecTail?: string
    workshopsNote?: string
  } | null>(`*[_type == "page" && slug.current == "home"][0]{
    _id, workshopsHeading, workshopsSpec, workshopsSpecTail, workshopsNote
  }`)

  if (!home?._id) throw new Error('Home page document not found')

  const settings = await client.fetch<{
    sessionPrice?: number
    defaultWorkshopPrice?: number
    seriesPrice?: number
    seriesScheduleLine?: string
  } | null>(`*[_type == "siteSettings"][0]{
    sessionPrice, defaultWorkshopPrice, seriesPrice, seriesScheduleLine
  }`)

  const activeSeries = await client.fetch<{ passPrice?: number } | null>(
    `*[_type == "workshopSeries" && active == true] | order(_updatedAt desc)[0]{
      passPrice
    }`,
  )

  const sessionPrice =
    settings?.sessionPrice ?? settings?.defaultWorkshopPrice ?? null
  const passPrice =
    activeSeries?.passPrice != null
      ? activeSeries.passPrice
      : (settings?.seriesPrice ?? null)

  const composedSpec = composeWorkshopSeriesSpecLine({
    sessionPrice,
    passPrice,
    scheduleLine: settings?.seriesScheduleLine,
    editorialTail: home.workshopsSpecTail || 'Join any session, in any order · 18+',
  })

  const patch: Record<string, string> = {}
  if (force || !home.workshopsHeading?.trim()) {
    patch.workshopsHeading = home.workshopsHeading?.trim() || DEFAULTS.workshopsHeading
  }
  if (force || !home.workshopsSpec?.trim()) {
    patch.workshopsSpec = composedSpec
  }
  if (force || !home.workshopsNote?.trim()) {
    patch.workshopsNote = home.workshopsNote?.trim() || DEFAULTS.workshopsNote
  }

  console.log('Current:', home)
  console.log(dryRun ? 'Would set:' : 'Setting:', patch)

  if (Object.keys(patch).length === 0) {
    console.log('Nothing to update.')
    return
  }

  if (dryRun) return

  await client.patch(home._id).set(patch).commit()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
