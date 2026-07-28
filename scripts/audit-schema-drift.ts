/**
 * Read-only audit: compare Sanity document fields against local schema types.
 *
 * Reports:
 * - fields present in data but not defined on the schema type
 * - required schema fields missing from a document
 *
 * No writes, no patches.
 *
 * Usage: npx tsx scripts/audit-schema-drift.ts
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import { schemaTypes } from '../sanity/schemas'

loadEnv({ path: '.env.local' })
loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-27'
const token =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!token) throw new Error('Missing SANITY_API_READ_TOKEN or SANITY_API_WRITE_TOKEN')

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const SYSTEM_KEYS = new Set([
  '_id',
  '_type',
  '_rev',
  '_createdAt',
  '_updatedAt',
  '_system',
])

type SchemaField = {
  name: string
  type?: string
  validation?: (rule: unknown) => unknown
}

type SchemaType = {
  name: string
  type?: string
  fields?: SchemaField[]
}

function fieldIsRequired(field: SchemaField): boolean {
  if (typeof field.validation !== 'function') return false
  let required = false
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'required') {
        return () => {
          required = true
          return new Proxy({}, handler)
        }
      }
      // Any other Rule method: return a chainable stub.
      return () => new Proxy({}, handler)
    },
  }
  try {
    field.validation(new Proxy({}, handler))
  } catch {
    // ignore
  }
  return required
}

function schemaFieldMap(type: SchemaType) {
  const fields = type.fields || []
  const names = new Set(fields.map((f) => f.name))
  const required = fields.filter(fieldIsRequired).map((f) => f.name)
  return { names, required }
}

type DriftUnknown = {
  _id: string
  _type: string
  fields: string[]
}

type DriftMissingRequired = {
  _id: string
  _type: string
  fields: string[]
}

async function main() {
  const documentTypes = (schemaTypes as SchemaType[]).filter(
    (t) => t.type === 'document' || (!t.type && t.fields),
  )

  // Sanity defineType for documents typically has type: 'document'
  const byName = new Map(
    documentTypes.map((t) => [t.name, schemaFieldMap(t)] as const),
  )

  console.log('Schema document types:', [...byName.keys()].join(', '))
  console.log('')

  const unknownReports: DriftUnknown[] = []
  const missingReports: DriftMissingRequired[] = []
  const typeCounts: Record<string, number> = {}

  for (const [typeName, { names, required }] of byName) {
    const docs = await client.fetch<Record<string, unknown>[]>(
      `*[_type == $type]`,
      { type: typeName },
    )
    typeCounts[typeName] = docs.length

    for (const doc of docs) {
      const id = String(doc._id)
      const dataKeys = Object.keys(doc).filter((k) => !SYSTEM_KEYS.has(k))

      const unknown = dataKeys.filter((k) => !names.has(k))
      if (unknown.length) {
        unknownReports.push({ _id: id, _type: typeName, fields: unknown.sort() })
      }

      const missing = required.filter((k) => {
        const v = doc[k]
        return v === undefined || v === null || v === ''
      })
      if (missing.length) {
        missingReports.push({ _id: id, _type: typeName, fields: missing.sort() })
      }
    }
  }

  // Orphan document types in the dataset that aren't in local schema
  const allTypes = await client.fetch<string[]>(
    `array::unique(*[]._type)`,
  )
  const orphanTypes = allTypes
    .filter((t) => !byName.has(t) && !t.startsWith('system.'))
    .sort()

  console.log('Document counts by type:')
  for (const [t, n] of Object.entries(typeCounts).sort()) {
    console.log(`  ${t}: ${n}`)
  }
  if (orphanTypes.length) {
    console.log('\nOrphan _type values in dataset (no local schema):')
    for (const t of orphanTypes) console.log(`  ${t}`)
  }

  console.log('\n--- Fields in DATA but not in SCHEMA ---')
  if (!unknownReports.length) {
    console.log('(none)')
  } else {
    for (const r of unknownReports) {
      console.log(`  ${r._type} ${r._id}: ${r.fields.join(', ')}`)
    }
  }

  console.log('\n--- Required SCHEMA fields missing from DATA ---')
  if (!missingReports.length) {
    console.log('(none)')
  } else {
    for (const r of missingReports) {
      console.log(`  ${r._type} ${r._id}: ${r.fields.join(', ')}`)
    }
  }

  const ok = unknownReports.length === 0 && orphanTypes.length === 0
  // Missing required is informational (e.g. new optional-until-filled fields
  // that are marked required with initialValue but not yet on old docs).
  console.log(
    `\nSummary: ${unknownReports.length} doc(s) with unknown fields, ${missingReports.length} doc(s) missing required, ${orphanTypes.length} orphan type(s).`,
  )
  if (!ok) {
    console.log(
      'Note: unknown fields against LOCAL schema usually mean data ahead of schema (need deploy) OR leftover keys.',
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
