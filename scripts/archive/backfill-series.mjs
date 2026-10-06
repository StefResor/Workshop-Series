/**
 * Point every workshop at the Fall 2026 series document.
 *
 * Usage:
 *   node scripts/backfill-series.mjs           # dry-run (default)
 *   node scripts/backfill-series.mjs --commit  # write series refs
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'

loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

const SERIES_SLUG = 'fall-2026'
const commit = process.argv.includes('--commit')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dx57inng'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN?.trim()

if (!token) {
  console.error('Missing SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-07-27',
  token,
  useCdn: false,
})

async function main() {
  console.log(
    commit
      ? 'MODE: --commit (will patch workshop.series)'
      : 'MODE: dry-run (pass --commit to write)',
  )

  const seriesDocs = await client.fetch(
    `*[_type == "series"]{ _id, title, "slug": slug.current, active }`,
  )

  if (seriesDocs.length === 0) {
    throw new Error(`No series documents found — create slug "${SERIES_SLUG}" first`)
  }
  if (seriesDocs.length > 1) {
    console.error('Multiple series documents — refuse to run:')
    for (const s of seriesDocs) {
      console.error(`  ${s._id}  ${s.slug}  ${s.title}`)
    }
    process.exit(2)
  }

  const series = seriesDocs[0]
  if (series.slug !== SERIES_SLUG) {
    throw new Error(
      `Expected series slug "${SERIES_SLUG}", found "${series.slug}" (${series._id})`,
    )
  }

  console.log(`Target series: ${series._id} (${series.slug})`)

  const workshops = await client.fetch(
    `*[_type == "workshop"] | order(sessionNumber asc){
      _id, sessionNumber, title, "slug": slug.current, "seriesRef": series._ref
    }`,
  )

  if (workshops.length === 0) {
    throw new Error('No workshops found')
  }

  const conflicts = workshops.filter(
    (w) => w.seriesRef && w.seriesRef !== series._id,
  )
  if (conflicts.length > 0) {
    console.error(
      'Workshops already reference a different series — refuse to overwrite:',
    )
    for (const w of conflicts) {
      console.error(
        `  ${w._id}  #${w.sessionNumber}  seriesRef=${w.seriesRef}  ${w.title}`,
      )
    }
    process.exit(2)
  }

  let wouldPatch = 0
  let alreadySet = 0

  for (const w of workshops) {
    const action =
      w.seriesRef === series._id
        ? 'unchanged'
        : commit
          ? 'patch'
          : 'would-patch'
    if (w.seriesRef === series._id) alreadySet += 1
    else wouldPatch += 1

    console.log(
      `${action}  ${w._id}  #${String(w.sessionNumber).padStart(2, '0')}  → ${series._id}`,
    )
    console.log(`         ${w.title}`)

    if (commit && w.seriesRef !== series._id) {
      await client
        .patch(w._id)
        .set({ series: { _type: 'reference', _ref: series._id } })
        .commit()
    }
  }

  console.log('')
  console.log(
    `summary: ${wouldPatch} ${commit ? 'patched' : 'to patch'}, ${alreadySet} already set, 0 conflicts`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
