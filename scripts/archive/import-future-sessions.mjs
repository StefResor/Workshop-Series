#!/usr/bin/env node
/**
 * Phase 1: import Winter / Spring / Summer from workshops-seed-2027.ndjson.
 *
 * The seed has no Fall series or Fall sessions. Sessions arrive published
 * with registrationStatus "draft" (Zoom, duration, timeZone, location filled).
 * Public GROQ excludes registrationStatus == "draft", so they stay invisible.
 *
 * Deletes the homemade draft session IDs from the earlier schedule import
 * (those IDs do not match the seed), then:
 *
 *   npx sanity dataset import scripts/data/workshops-seed-2027.ndjson production --missing
 *
 * Dry run (default): node --env-file=.env.local scripts/import-future-sessions.mjs
 * Apply:             node --env-file=.env.local scripts/import-future-sessions.mjs --commit
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

const COMMIT = process.argv.includes('--commit')
const SEED = join('scripts', 'data', 'workshops-seed-2027.ndjson')

const HOMEMADE_DRAFTS = ['winter-2027', 'spring-2027', 'summer-2027'].flatMap(
  (season) =>
    Array.from(
      { length: 10 },
      (_, i) => `drafts.workshopSession.${season}.${String(i + 1).padStart(2, '0')}`,
    ),
)
const LEGACY_TOPICS = Array.from({ length: 10 }, (_, i) => `workshopTopic-${i + 1}`)

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  'dx57inng'
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('Missing SANITY_API_WRITE_TOKEN')
  process.exit(1)
}
if (!existsSync(SEED)) {
  console.error(`Missing ${SEED}`)
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-07-27',
  useCdn: false,
  perspective: 'raw',
})

async function main() {
  const existing = await client.fetch(`*[_id in $ids]{ _id }`, {
    ids: HOMEMADE_DRAFTS,
  })
  console.log(
    `${COMMIT ? 'COMMIT' : 'DRY-RUN'}: ${existing.length} homemade draft session(s) to delete, then import ${SEED} --missing`,
  )
  if (existing.length) console.table(existing)

  if (!COMMIT) {
    console.log('Dry run. Re-run with --commit to write.')
    return
  }

  for (const doc of existing) {
    await client.delete(doc._id)
    console.log(`  deleted ${doc._id}`)
  }

  for (const id of LEGACY_TOPICS) {
    try {
      await client.delete(id)
      console.log(`  deleted ${id}`)
    } catch (err) {
      console.warn(`  skip ${id}: ${err.message}`)
    }
  }

  const env = {
    ...process.env,
    SANITY_AUTH_TOKEN: process.env.SANITY_AUTH_TOKEN || token,
  }
  const result = spawnSync(
    'npx',
    [
      'sanity',
      'dataset',
      'import',
      SEED,
      dataset,
      '--missing',
    ],
    { stdio: 'inherit', env, cwd: process.cwd() },
  )
  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
