/**
 * One-shot local verification of /api/revalidate against a live Sanity patch.
 * Usage (secret must match the running Next process):
 *   SANITY_REVALIDATE_SECRET=... npx tsx scripts/verify-revalidate.ts
 *
 * Asserts flat /workshops/[slug] (301 target) is in the revalidate set
 * for both native `{ current }` and flattened string slug payloads.
 * Also checks series-scoped path when seriesSlug is present on the webhook body.
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

async function workshopPageHasMarker(series: string, slug: string) {
  const res = await fetch(`${base}/workshops/${series}/${slug}`, {
    cache: 'no-store',
  })
  const html = await res.text()
  return { status: res.status, hit: html.includes(marker) }
}

function legacyPath(slug: string) {
  return `/workshops/${slug}`
}

function seriesPath(series: string, slug: string) {
  return `/workshops/${series}/${slug}`
}

function assertSlugShapes(slug: string, seriesSlug: string) {
  const asObject = targetsForDoc({
    _type: 'workshop',
    slug: { current: slug },
    seriesSlug,
  })
  const asString = targetsForDoc({
    _type: 'workshop',
    slug,
    seriesSlug,
  })
  const flat = legacyPath(slug)
  const scoped = seriesPath(seriesSlug, slug)
  const objHasFlat = asObject.some((t) => t.kind === 'path' && t.path === flat)
  const strHasFlat = asString.some((t) => t.kind === 'path' && t.path === flat)
  const objHasScoped = asObject.some(
    (t) => t.kind === 'path' && t.path === scoped,
  )
  const strHasScoped = asString.some(
    (t) => t.kind === 'path' && t.path === scoped,
  )
  console.log('   slug object → flat path:', objHasFlat)
  console.log('   slug string → flat path:', strHasFlat)
  console.log('   slug object → series path:', objHasScoped)
  console.log('   slug string → series path:', strHasScoped)
  if (!objHasFlat || !strHasFlat || !objHasScoped || !strHasScoped) {
    throw new Error(
      'slugValue shape trap: workshop paths missing for one slug shape',
    )
  }
}

async function main() {
  const before = await client.fetch<{
    shortDescription?: string
    slug?: string
    seriesSlug?: string
  } | null>(
    `*[_id == $id][0]{
      shortDescription,
      "slug": slug.current,
      "seriesSlug": series->slug.current
    }`,
    { id: workshopId },
  )
  if (!before?.slug || !before.seriesSlug) {
    throw new Error(`Missing ${workshopId}, slug, or series slug`)
  }

  const slug = before.slug
  const seriesSlug = before.seriesSlug
  const flatPath = legacyPath(slug)
  const scopedPath = seriesPath(seriesSlug, slug)

  console.log('0) slugValue shape check…')
  assertSlugShapes(slug, seriesSlug)

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
    seriesSlug,
  })
  console.log('   revalidate:', reval)
  const paths: string[] = reval.json?.paths || []
  const flatInPaths = paths.includes(flatPath)
  const scopedInPaths = paths.includes(scopedPath)
  console.log('   flat path in response:', flatInPaths, flatPath)
  console.log('   series path in response:', scopedInPaths, scopedPath)

  console.log('4) Fetching feeds + workshop page AFTER revalidate…')
  const postFeed = await feedHasMarker()
  const postIcs = await icsHasMarker()
  const postMap = await sitemapOk()
  const postPage = await workshopPageHasMarker(seriesSlug, slug)
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
    seriesSlug,
  })

  const ok =
    reval.status === 200 &&
    flatInPaths &&
    scopedInPaths &&
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
