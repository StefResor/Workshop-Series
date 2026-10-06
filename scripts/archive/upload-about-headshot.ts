/**
 * Upload the About page headshot to Sanity and attach it to page-about.
 *
 * Usage:
 *   npx tsx scripts/upload-about-headshot.ts
 */
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'

loadEnv({ path: '.env.local' })
loadEnv()

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

const SOURCE = path.resolve('public/stefanie-schumacher.jpg')
const ALT = 'Portrait of Stefanie Schumacher, MS, LPC, EMDR'

async function main() {
  await stat(SOURCE)

  const asset = await client.assets.upload(
    'image',
    createReadStream(SOURCE),
    { filename: 'stefanie-schumacher-headshot.jpg', contentType: 'image/jpeg' },
  )

  await client
    .patch('page-about')
    .set({
      portrait: {
        _type: 'image',
        alt: ALT,
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
    })
    .commit()

  console.log(`Attached ${asset._id} to page-about.portrait`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
