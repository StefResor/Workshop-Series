/**
 * One-off Sanity content patch for docs/content-corrections.md §§1–2.
 *
 * Usage:
 *   npx tsx scripts/fix-typos.ts --dry-run   # print intended changes only
 *   npx tsx scripts/fix-typos.ts             # write (after confirmation)
 *
 * Never regenerates fields wholesale. Does not touch fee values.
 * Patches published docs and drafts.<id> when a draft exists.
 */
import { config as loadEnv } from 'dotenv'
import { createClient, type SanityClient } from '@sanity/client'

loadEnv({ path: '.env.local' })
loadEnv()

const dryRun = process.argv.includes('--dry-run')

type PatchTarget = {
  label: string
  query: string
  queryParams?: Record<string, unknown>
  fields: string[]
  replacements: { find: string; replace: string }[]
}

/** Exact pairs from docs/content-corrections.md sections 1 and 2. */
const TARGETS: PatchTarget[] = [
  {
    label: '§1 homepage spelling',
    query: `*[_type == "page" && slug.current == "home"][0]{ _id, body, summary, headline }`,
    fields: ['body', 'summary', 'headline'],
    replacements: [
      { find: 'curiosty', replace: 'curiosity' },
      { find: 'noticable', replace: 'noticeable' },
    ],
  },
  {
    label: '§2 workshop 1 body',
    query: `*[_type == "workshop" && sessionNumber == 1][0]{ _id, body, shortDescription }`,
    fields: ['body', 'shortDescription'],
    replacements: [
      { find: 'loose sight', replace: 'lose sight' },
      { find: 'thay', replace: 'they' },
      { find: 'curiosty', replace: 'curiosity' },
      { find: 'noticable', replace: 'noticeable' },
      { find: 'largely / irrelevant', replace: 'largely irrelevant' },
      { find: 'largely\nirrelevant', replace: 'largely irrelevant' },
    ],
  },
]

type DocHit = {
  _id: string
  [field: string]: string | undefined
}

type Change = {
  docId: string
  field: string
  find: string
  replace: string
  occurrences: number
}

type Missing = {
  label: string
  docId: string | null
  find: string
  fieldsChecked: string[]
}

function applyReplacements(
  value: string,
  replacements: { find: string; replace: string }[],
): { next: string; changes: Omit<Change, 'docId' | 'field'>[] } {
  let next = value
  const changes: Omit<Change, 'docId' | 'field'>[] = []

  for (const { find, replace } of replacements) {
    if (!find) continue
    let count = 0
    let idx = next.indexOf(find)
    while (idx !== -1) {
      count += 1
      idx = next.indexOf(find, idx + find.length)
    }
    if (count > 0) {
      next = next.split(find).join(replace)
      changes.push({ find, replace, occurrences: count })
    }
  }

  return { next, changes }
}

async function fetchDraft(
  client: SanityClient,
  publishedId: string,
): Promise<DocHit | null> {
  if (publishedId.startsWith('drafts.')) return null
  const draftId = `drafts.${publishedId}`
  return client.fetch<DocHit | null>(`*[_id == $id][0]`, { id: draftId })
}

async function main() {
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

  const allChanges: Change[] = []
  const missing: Missing[] = []
  const docsTouched = new Set<string>()

  console.log(dryRun ? '=== DRY RUN (no writes) ===' : '=== WRITING PATCHES ===')

  for (const target of TARGETS) {
    const doc = await client.fetch<DocHit | null>(
      target.query,
      target.queryParams || {},
    )

    if (!doc?._id) {
      for (const { find } of target.replacements) {
        missing.push({
          label: target.label,
          docId: null,
          find,
          fieldsChecked: target.fields,
        })
      }
      console.log(`\n[${target.label}] document not found`)
      continue
    }

    const docs: DocHit[] = [doc]
    const draft = await fetchDraft(client, doc._id)
    if (draft?._id) {
      docs.push(draft)
      console.log(`\n[${target.label}] found draft ${draft._id}`)
    } else {
      console.log(`\n[${target.label}] no draft for ${doc._id}`)
    }

    for (const d of docs) {
      const patch: Record<string, string> = {}

      for (const field of target.fields) {
        const current = d[field]
        if (typeof current !== 'string') continue

        const { next, changes } = applyReplacements(current, target.replacements)
        for (const c of changes) {
          allChanges.push({
            docId: d._id,
            field,
            find: c.find,
            replace: c.replace,
            occurrences: c.occurrences,
          })
          console.log(
            `  ${d._id}.${field}: ${JSON.stringify(c.find)} → ${JSON.stringify(c.replace)} (×${c.occurrences})`,
          )
        }
        if (next !== current) {
          patch[field] = next
        }
      }

      // Track which find strings never appeared in any checked field on this doc
      for (const { find } of target.replacements) {
        const foundOnThisDoc = allChanges.some(
          (c) => c.docId === d._id && c.find === find,
        )
        if (!foundOnThisDoc) {
          // Only report missing once per published+draft pair for readability —
          // report against published id primarily; still note draft id in log.
          missing.push({
            label: target.label,
            docId: d._id,
            find,
            fieldsChecked: target.fields,
          })
        }
      }

      if (Object.keys(patch).length === 0) {
        console.log(`  ${d._id}: no field changes`)
        continue
      }

      docsTouched.add(d._id)

      if (dryRun) {
        console.log(`  ${d._id}: would patch fields ${Object.keys(patch).join(', ')}`)
      } else {
        await client.patch(d._id).set(patch).commit()
        console.log(`  ${d._id}: patched fields ${Object.keys(patch).join(', ')}`)
      }
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(
    dryRun
      ? `Documents that would change: ${docsTouched.size ? [...docsTouched].join(', ') : '(none)'}`
      : `Documents changed: ${docsTouched.size ? [...docsTouched].join(', ') : '(none)'}`,
  )

  const uniqueMissing = new Map<string, Missing>()
  for (const m of missing) {
    const key = `${m.label}|${m.find}|${m.docId ?? 'null'}`
    uniqueMissing.set(key, m)
  }

  // Only report finds that never matched on ANY doc for that target
  const findsMatched = new Set(allChanges.map((c) => `${c.find}`))
  const trulyMissing = [...uniqueMissing.values()].filter(
    (m) => !findsMatched.has(m.find),
  )
  // Dedupe by find+label
  const missingByFind = new Map<string, Missing>()
  for (const m of trulyMissing) {
    missingByFind.set(`${m.label}|${m.find}`, m)
  }

  if (missingByFind.size === 0) {
    console.log('All target strings were found and replaced (or would be).')
  } else {
    console.log('Target strings not found (seed may already be corrected, or text differs from audit):')
    for (const m of missingByFind.values()) {
      console.log(
        `  - [${m.label}] ${JSON.stringify(m.find)} not in ${m.docId ?? '(missing doc)'} fields ${m.fieldsChecked.join(', ')}`,
      )
    }
  }

  if (dryRun) {
    console.log('\nDry run complete. Re-run without --dry-run after confirmation to write.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
