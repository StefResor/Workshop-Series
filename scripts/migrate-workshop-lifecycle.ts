/**
 * Workshop lifecycle cleanup (production dataset).
 *
 * 1. durationMinutes ← endsAt − startsAt (report if ≠ 90)
 * 2. registrationStatus → "open" on all Fall workshops (preserves pre-gate buyability)
 * 3. Unset deprecated fields: summary, paymentLink, registrationOpen, status, endsAt
 *
 * Patches published docs and drafts.<id> when present.
 *
 * Usage:
 *   npx tsx scripts/migrate-workshop-lifecycle.ts --dry-run
 *   npx tsx scripts/migrate-workshop-lifecycle.ts
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

type Doc = {
  _id: string
  title?: string
  sessionNumber?: number
  startsAt?: string
  endsAt?: string
  durationMinutes?: number | null
  registrationStatus?: string | null
  seriesSlug?: string
}

const UNSET = [
  'summary',
  'paymentLink',
  'registrationOpen',
  'status',
  'endsAt',
] as const

function derivedMinutes(startsAt: string, endsAt: string): number {
  return Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000,
  )
}

async function patchBoth(id: string, set: Record<string, unknown>, unset: string[]) {
  const published = id.replace(/^drafts\./, '')
  const draft = `drafts.${published}`
  const ids = [published]
  const draftExists = await client.fetch<string | null>(
    `*[_id == $id][0]._id`,
    { id: draft },
  )
  if (draftExists) ids.push(draft)

  for (const target of ids) {
    let p = client.patch(target)
    if (Object.keys(set).length) p = p.set(set)
    if (unset.length) p = p.unset(unset)
    await p.commit()
  }
  return ids
}

async function main() {
  const docs = await client.fetch<Doc[]>(
    `*[_type == "workshop"] | order(sessionNumber asc) {
      _id,
      title,
      sessionNumber,
      startsAt,
      endsAt,
      durationMinutes,
      registrationStatus,
      "seriesSlug": series->slug.current
    }`,
  )

  console.log(
    dryRun
      ? `DRY RUN — ${docs.length} workshop(s) on ${dataset}\n`
      : `Migrating ${docs.length} workshop(s) on ${dataset}\n`,
  )

  let nonNinety = 0
  let opened = 0
  let durationSet = 0

  for (const doc of docs) {
    if (!doc.startsAt || !doc.endsAt) {
      throw new Error(
        `${doc._id} missing startsAt or endsAt — refuse to migrate without both`,
      )
    }
    const minutes = derivedMinutes(doc.startsAt, doc.endsAt)
    if (minutes !== 90) {
      nonNinety += 1
      console.warn(
        `⚠ #${doc.sessionNumber} ${doc._id} derived ${minutes} min (not 90) ` +
          `${doc.startsAt} → ${doc.endsAt}`,
      )
    }

    const set: Record<string, unknown> = {
      durationMinutes: minutes,
    }
    if (doc.registrationStatus !== 'open') {
      set.registrationStatus = 'open'
      opened += 1
    }
    durationSet += 1

    const line = [
      `#${String(doc.sessionNumber).padStart(2, '0')}`,
      doc.seriesSlug || '?',
      `derived=${minutes}`,
      `durWas=${doc.durationMinutes ?? 'null'}`,
      `regWas=${doc.registrationStatus ?? 'null'}`,
      doc.registrationStatus !== 'open' ? '→ open' : 'reg=open',
      `unset=[${UNSET.join(',')}]`,
    ].join(' · ')
    console.log(line)

    if (!dryRun) {
      const ids = await patchBoth(doc._id, set, [...UNSET])
      console.log(`   patched: ${ids.join(', ')}`)
    }
  }

  console.log(
    `\n${dryRun ? 'Would set' : 'Set'} durationMinutes on ${durationSet}; ` +
      `open registration on ${opened}; ` +
      `non-90 derived: ${nonNinety}`,
  )

  if (nonNinety > 0) {
    console.warn(
      '\nNon-90 durations were written as derived (not normalized to 90). ' +
        'Check docs/workshop-schedule.md.',
    )
  }

  if (dryRun) console.log('\nRe-run without --dry-run to commit.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
