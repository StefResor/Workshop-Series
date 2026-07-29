/**
 * Set siteSettings.defaultWorkshopPrice = 45 and clear stale per-workshop
 * price overrides that equal 35 (old Wix multi-event plan confusion).
 *
 * Usage:
 *   npx tsx scripts/migrate-default-workshop-price.ts --dry-run
 *   npx tsx scripts/migrate-default-workshop-price.ts
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

const DEFAULT = 45 // CONFIRM WITH STEF
const STALE = 35

async function main() {
  const settings = await client.fetch<{ _id: string; defaultWorkshopPrice?: number } | null>(
    `*[_type == "siteSettings"][0]{ _id, defaultWorkshopPrice }`,
  )
  if (!settings?._id) throw new Error('No siteSettings document found')

  const workshops = await client.fetch<{ _id: string; price?: number; title?: string }[]>(
    `*[_type == "workshop" && defined(price)]{ _id, price, title }`,
  )

  console.log(
    dryRun ? '[dry-run]' : '[write]',
    `siteSettings ${settings._id}: defaultWorkshopPrice → ${DEFAULT} (was ${settings.defaultWorkshopPrice ?? 'unset'})`,
  )

  if (!dryRun) {
    await client.patch(settings._id).set({ defaultWorkshopPrice: DEFAULT }).commit()
  }

  for (const w of workshops) {
    if (w.price !== STALE) {
      console.log(`keep override $${w.price} on ${w._id} (${w.title || ''})`)
      continue
    }
    console.log(`unset stale price $${STALE} on ${w._id} (${w.title || ''})`)
    if (!dryRun) {
      await client.patch(w._id).unset(['price']).commit()
      const draftId = `drafts.${w._id}`
      const draft = await client.fetch<{ _id: string } | null>(
        `*[_id == $id][0]{ _id }`,
        { id: draftId },
      )
      if (draft) {
        await client.patch(draftId).unset(['price']).commit()
      }
    }
  }

  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
