/**
 * One-shot local verification of /api/revalidate against a live Sanity patch.
 * Usage (secret must match the running Next process):
 *   SANITY_REVALIDATE_SECRET=... npx tsx scripts/verify-revalidate.ts
 *
 * Asserts the individual /workshops/[slug] page is in the revalidate set
 * for both native `{ current }` and flattened string slug payloads.
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import {
  encodeSignatureHeader,
  SIGNATURE_HEADER_NAME,
} from '@sanity/webhook'
import { targetsForDoc } from '../app/api/revalidate/route'

loadEnv({ path: '.env.local' })
loadEnv()

const secret = process.env.SANITY_REVALIDATE_SECRET
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-27'
const token = process.env.SANITY_API_WRITE_TOKEN
const base = process.env.VERIFY_BASE_URL || 'http://localhost:3000'
const workshopId = 'workshop-1'

if (!secret) throw new Error('Missing SANITY_REVALIDATE_SECRET')
if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!token) throw new Error('Missing SANITY_API_WRITE_TOKEN')

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const marker = `revalidate-probe-${Date.now()}`

async function signedPost(body: unknown) {
  const raw = JSON.stringify(body)
  const signature = await encodeSignatureHeader(raw, Date.now(), secret!)
  const res = await fetch(`${base}/api/revalidate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      [SIGNATURE_HEADER_NAME]: signature,
    },
    body: raw,
  })
  const json = await res.json()
  return { status: res.status, json }
}

async function feedHasMarker() {
  const res = await fetch(`${base}/events.json`, { cache: 'no-store' })
  const feed = (await res.json()) as { items?: { content_text?: string }[] }
  const hit = (feed.items || []).some((i) =>
    (i.content_text || '').includes(marker),
  )
  return { status: res.status, hit }
}

async function icsHasMarker() {
  const res = await fetch(`${base}/events.ics`, { cache: 'no-store' })
  const text = await res.text()
  return { status: res.status, hit: text.includes(marker) }
}

async function sitemapOk() {
  const res = await fetch(`${base}/sitemap.xml`, { cache: 'no-store' })
  const text = await res.text()
  return {
    status: res.status,
    hasWorkshop1: text.includes('workshop-1-im-right'),
  }
}

async function workshopPageHasMarker(slug: string) {
  const res = await fetch(`${base}/workshops/${slug}`, { cache: 'no-store' })
  const html = await res.text()
  return { status: res.status, hit: html.includes(marker) }
}

function detailPath(slug: string) {
  return `/workshops/${slug}`
}

function assertSlugShapes(slug: string) {
  const asObject = targetsForDoc({
    _type: 'workshop',
    slug: { current: slug },
  })
  const asString = targetsForDoc({ _type: 'workshop', slug })
  const path = detailPath(slug)
  const objHas = asObject.some((t) => t.kind === 'path' && t.path === path)
  const strHas = asString.some((t) => t.kind === 'path' && t.path === path)
  console.log('   slug object → detail path:', objHas)
  console.log('   slug string → detail path:', strHas)
  if (!objHas || !strHas) {
    throw new Error(
      'slugValue shape trap: workshop detail path missing for one slug shape',
    )
  }
}

async function main() {
  const before = await client.fetch<{
    shortDescription?: string
    slug?: string
  } | null>(
    `*[_id == $id][0]{ shortDescription, "slug": slug.current }`,
    { id: workshopId },
  )
  if (!before?.slug) throw new Error(`Missing ${workshopId} or slug`)

  const slug = before.slug
  const workshopPath = detailPath(slug)

  console.log('0) slugValue shape check…')
  assertSlugShapes(slug)

  const original = before.shortDescription || ''
  console.log('1) Patching workshop-1 shortDescription with marker…')
  await client.patch(workshopId).set({ shortDescription: marker }).commit()

  console.log('2) Fetching feeds BEFORE revalidate (may still be cached)…')
  const preFeed = await feedHasMarker()
  console.log('   events.json marker before:', preFeed)

  console.log('3) POST /api/revalidate with native slug object…')
  const reval = await signedPost({
    _type: 'workshop',
    slug: { _type: 'slug', current: slug },
  })
  console.log('   revalidate:', reval)
  const paths: string[] = reval.json?.paths || []
  const detailInPaths = paths.includes(workshopPath)
  console.log('   detail path in response:', detailInPaths, workshopPath)

  console.log('4) Fetching feeds + workshop page AFTER revalidate…')
  const postFeed = await feedHasMarker()
  const postIcs = await icsHasMarker()
  const postMap = await sitemapOk()
  const postPage = await workshopPageHasMarker(slug)
  console.log('   events.json marker after:', postFeed)
  console.log('   events.ics marker after:', postIcs)
  console.log('   sitemap:', postMap)
  console.log('   workshop page marker after:', postPage)

  console.log('5) No-op check: registration…')
  const noop = await signedPost({ _type: 'registration' })
  console.log('   registration revalidate:', noop)

  console.log('6) Restoring original shortDescription…')
  await client.patch(workshopId).set({ shortDescription: original }).commit()
  await signedPost({
    _type: 'workshop',
    slug: { _type: 'slug', current: slug },
  })

  const ok =
    reval.status === 200 &&
    detailInPaths &&
    postFeed.hit === true &&
    postPage.hit === true &&
    postMap.hasWorkshop1 === true &&
    Array.isArray(noop.json?.paths) &&
    noop.json.paths.length === 0

  if (!ok) {
    console.error('\nVERIFY FAILED')
    process.exit(1)
  }
  console.log(
    '\nVERIFY PASSED — workshop detail page + feeds updated without redeploy',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
