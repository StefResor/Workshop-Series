/**
 * Delete Stripe test-mode registration documents from Sanity.
 *
 * Targets `_id in path("registration.test.**")`, then asserts `testMode == true`
 * before deleting. Never touches live registrations.
 *
 * Usage:
 *   node scripts/purge-test-registrations.mjs           # dry-run
 *   node scripts/purge-test-registrations.mjs --commit  # delete
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'

loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

const commit = process.argv.includes('--commit')

const token = process.env.SANITY_API_WRITE_TOKEN?.trim()
if (!token) {
  console.error('Missing SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dx57inng',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-07-27',
  token,
  useCdn: false,
})

async function main() {
  console.log(
    commit
      ? 'MODE: --commit (will delete test registrations)'
      : 'MODE: dry-run (pass --commit to delete)',
  )

  const candidates = await client.fetch(
    `*[_id in path("registration.test.**")]{ _id, email, testMode, status, source, stripeSessionId }`,
  )

  const safe = []
  const refused = []
  for (const doc of candidates) {
    if (doc.testMode === true) safe.push(doc)
    else refused.push(doc)
  }

  if (refused.length) {
    console.error(
      'Refusing — path matched docs without testMode == true (will not delete):',
    )
    for (const d of refused) {
      console.error(`  ${d._id}  testMode=${d.testMode}`)
    }
    process.exit(2)
  }

  if (safe.length === 0) {
    console.log('No test registrations found')
    return
  }

  for (const d of safe) {
    console.log(
      `${commit ? 'delete' : 'would-delete'}  ${d._id}  ${d.email}  ${d.source}  ${d.status}`,
    )
  }

  if (!commit) {
    console.log(`dry-run complete — ${safe.length} document(s); no deletes`)
    return
  }

  let tx = client.transaction()
  for (const d of safe) {
    tx = tx.delete(d._id)
  }
  await tx.commit()
  console.log(`deleted ${safe.length} test registration(s)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
