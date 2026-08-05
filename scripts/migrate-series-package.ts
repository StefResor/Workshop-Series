/**
 * Seed / refresh series-package fields on siteSettings.
 * Does not invent a Stripe payment link — paste seriesPaymentLink in Studio.
 *
 * Usage:
 *   npx tsx scripts/migrate-series-package.ts --dry-run
 *   npx tsx scripts/migrate-series-package.ts
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

const SESSION = 47 // CONFIRM WITH STEF
const SERIES = 423 // CONFIRM WITH STEF

const SERIES_FIELDS = {
  sessionPrice: SESSION,
  seriesPrice: SERIES,
  defaultWorkshopPrice: SESSION,
  seriesEyebrow: 'The Full Series',
  seriesDisplayLine: 'All Ten Sessions',
  // CONFIRM WITH STEF — draft pending client review
  seriesSupportingLine:
    'From the fight that never ends through listening, acceptance, and repair — the full Relational Diplomacy arc.',
  seriesOfferLine: 'ten sessions, one free',
  seriesScheduleLine: 'Wednesdays · 7:00–8:30 PM ET · Zoom',
  seriesCtaLabel: 'Register for the series',
} as const

async function main() {
  const settings = await client.fetch<{
    _id: string
    sessionPrice?: number
    defaultWorkshopPrice?: number
    seriesPaymentLink?: string
  } | null>(
    `*[_type == "siteSettings"][0]{
      _id,
      sessionPrice,
      defaultWorkshopPrice,
      seriesPaymentLink
    }`,
  )
  if (!settings?._id) throw new Error('No siteSettings document found')

  const sessionPrice =
    settings.sessionPrice ?? settings.defaultWorkshopPrice ?? SESSION

  const patch = {
    ...SERIES_FIELDS,
    sessionPrice,
    defaultWorkshopPrice: sessionPrice,
  }

  console.log(dryRun ? '[dry-run]' : '[write]', `siteSettings ${settings._id}`)
  console.log(JSON.stringify(patch, null, 2))
  if (!settings.seriesPaymentLink) {
    console.log(
      'note: seriesPaymentLink unset — paste the Stripe Payment Link in Studio for the band CTA',
    )
  }

  if (!dryRun) {
    await client.patch(settings._id).set(patch).commit()
    const draftId = `drafts.${settings._id}`
    const draft = await client.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{ _id }`,
      { id: draftId },
    )
    if (draft) {
      await client.patch(draftId).set(patch).commit()
    }
  }

  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
