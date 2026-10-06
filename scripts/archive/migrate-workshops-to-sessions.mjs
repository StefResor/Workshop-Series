#!/usr/bin/env node
/**
 * Phase 1: turn Fall workshop-1…workshop-10 into workshopSession docs
 * under series.fall-2026, and create the 10 evergreen workshopTopic docs.
 *
 * Keeps the same _ids and slugs so URLs, Payment Link metadata (workshop_slug),
 * and registration.{live|test}.{workshopId}.{hash} stay valid.
 *
 * Dry run (default): node --env-file=.env.local scripts/migrate-workshops-to-sessions.mjs
 * Apply:             node --env-file=.env.local scripts/migrate-workshops-to-sessions.mjs --commit
 * Topics only:        node --env-file=.env.local scripts/migrate-workshops-to-sessions.mjs --topics-only --commit
 *
 * Topic IDs match the seed: workshopTopic.{topic-slug}.
 * Do not --commit the type change until the dual-type GROQ (`workshopSession` +
 * `workshop`) is deployed. Production still queries `_type == "workshop"` only.
 *
 * Env: SANITY_API_WRITE_TOKEN (required), NEXT_PUBLIC_SANITY_PROJECT_ID or
 *      SANITY_PROJECT_ID (default dx57inng), SANITY_DATASET / NEXT_PUBLIC_SANITY_DATASET.
 */
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'

loadEnv({ path: '.env.local', override: false })
loadEnv({ override: false })

const COMMIT = process.argv.includes('--commit')
/** Put Fall docs back to `_type: workshop` (production still queries that). */
const REVERT = process.argv.includes('--revert-to-workshop')
/** Write slug-id topics and retarget refs without changing workshop _type. */
const TOPICS_ONLY = process.argv.includes('--topics-only')
const SERIES_SLUG = 'fall-2026'
const WORKSHOP_IDS = Array.from({ length: 10 }, (_, i) => `workshop-${i + 1}`)

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

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-07-27',
  useCdn: false,
})

function topicId(slug) {
  return `workshopTopic.${slug}`
}

function legacyTopicId(sessionNumber) {
  return `workshopTopic-${sessionNumber}`
}

function portableTextToPlain(value) {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return undefined
  const text = value
    .map((block) =>
      Array.isArray(block?.children)
        ? block.children.map((c) => c.text || '').join('')
        : '',
    )
    .filter(Boolean)
    .join('\n\n')
    .trim()
  return text || undefined
}

function asSlug(value) {
  if (typeof value === 'string') return { _type: 'slug', current: value }
  if (value?.current) return { _type: 'slug', current: value.current }
  return undefined
}

function asRef(value) {
  if (!value) return undefined
  const ref = value._ref || value
  if (typeof ref !== 'string') return undefined
  return { _type: 'reference', _ref: ref }
}

/**
 * Sanity forbids changing `_type` and forbids deleting a document that is
 * still referenced. Weaken inbound registration refs, delete, recreate as
 * workshopSession at the same _id, then restore the refs.
 */
async function replaceDocumentType(client, id, nextDoc) {
  const inbound = await client.fetch(`*[references($id)]{ _id, _type }`, { id })
  const unexpected = inbound.filter((d) => d._type !== 'registration')
  if (unexpected.length) {
    throw new Error(
      `${id} is referenced by non-registration docs: ${unexpected.map((d) => d._id).join(', ')}`,
    )
  }

  if (inbound.length) {
    const weaken = client.transaction()
    for (const d of inbound) {
      weaken.patch(d._id, (p) =>
        p.set({
          workshop: { _type: 'reference', _ref: id, _weak: true },
        }),
      )
    }
    await weaken.commit()
  }

  await client.delete(id)
  await client.create(nextDoc)

  if (inbound.length) {
    const restore = client.transaction()
    for (const d of inbound) {
      restore.patch(d._id, (p) =>
        p.set({
          workshop: { _type: 'reference', _ref: id },
        }),
      )
    }
    await restore.commit()
  }
}

async function main() {
  const series = await client.fetch(
    `*[_type == "series" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, startsOn, endsOn, label
    }`,
    { slug: SERIES_SLUG },
  )
  if (!series?._id) {
    throw new Error(`No series with slug "${SERIES_SLUG}"`)
  }
  console.log(
    `Series ${series._id} (${series.slug}) ${COMMIT ? 'COMMIT' : 'DRY-RUN'}${REVERT ? ' REVERT-TO-WORKSHOP' : ''}`,
  )

  const docs = await client.fetch(
    `*[_id in $ids && !(_id in path("drafts.**"))] | order(sessionNumber asc){
      _id, _type, sessionNumber,
      "title": coalesce(title, topic->title),
      slug,
      "hook": coalesce(hook, topic->hook),
      "shortDescription": coalesce(shortDescription, topic->shortDescription),
      "body": coalesce(body, topic->description),
      series, topic, startsAt, durationMinutes, timeZone, price,
      stripePaymentLink, registrationStatus, capacity, stripeProductId,
      zoomLink, zoomPasscode, zoomRegistrationUrl, locationLabel
    }`,
    { ids: WORKSHOP_IDS },
  )

  if (docs.length !== 10) {
    throw new Error(
      `Expected 10 published docs (${WORKSHOP_IDS.join(', ')}); got ${docs.length}: ${docs.map((d) => d._id).join(', ')}`,
    )
  }

  const numbers = docs.map((d) => d.sessionNumber).sort((a, b) => a - b)
  if (numbers.join(',') !== '1,2,3,4,5,6,7,8,9,10') {
    throw new Error(`sessionNumber mismatch: ${numbers.join(', ')}`)
  }

  const tx = client.transaction()
  const rows = []

  for (const w of docs) {
    const n = w.sessionNumber
    const slug = asSlug(w.slug)
    if (!slug?.current) throw new Error(`${w._id} missing slug`)
    if (!w.startsAt) throw new Error(`${w._id} missing startsAt`)

    const title = w.title
    const description = portableTextToPlain(w.body)
    const topicRef = topicId(slug.current)
    const topicDoc = {
      _id: topicRef,
      _type: 'workshopTopic',
      title,
      slug,
      order: n,
      ...(w.hook ? { hook: w.hook } : {}),
      ...(w.shortDescription ? { shortDescription: w.shortDescription } : {}),
      ...(description ? { description } : {}),
    }

    const sessionDoc = {
      _id: w._id,
      _type: 'workshopSession',
      topic: { _type: 'reference', _ref: topicRef },
      series: asRef(w.series) || { _type: 'reference', _ref: series._id },
      slug,
      sessionNumber: n,
      startsAt: w.startsAt,
      durationMinutes: w.durationMinutes ?? 90,
      timeZone: w.timeZone || 'America/New_York',
      registrationStatus: w.registrationStatus || 'open',
      locationLabel: w.locationLabel || 'Zoom',
      ...(w.price != null ? { price: w.price } : {}),
      ...(w.stripePaymentLink ? { stripePaymentLink: w.stripePaymentLink } : {}),
      ...(w.capacity != null ? { capacity: w.capacity } : {}),
      ...(w.stripeProductId ? { stripeProductId: w.stripeProductId } : {}),
      ...(w.zoomLink ? { zoomLink: w.zoomLink } : {}),
      ...(w.zoomPasscode ? { zoomPasscode: w.zoomPasscode } : {}),
      ...(w.zoomRegistrationUrl
        ? { zoomRegistrationUrl: w.zoomRegistrationUrl }
        : {}),
    }

    const workshopDoc = {
      _id: w._id,
      _type: 'workshop',
      title,
      slug,
      sessionNumber: n,
      series: asRef(w.series) || { _type: 'reference', _ref: series._id },
      topic: { _type: 'reference', _ref: topicRef },
      startsAt: w.startsAt,
      durationMinutes: w.durationMinutes ?? 90,
      timeZone: w.timeZone || 'America/New_York',
      registrationStatus: w.registrationStatus || 'open',
      locationLabel: w.locationLabel || 'Zoom',
      ...(w.hook ? { hook: w.hook } : {}),
      ...(w.shortDescription ? { shortDescription: w.shortDescription } : {}),
      ...(description ? { body: description } : {}),
      ...(w.price != null ? { price: w.price } : {}),
      ...(w.stripePaymentLink ? { stripePaymentLink: w.stripePaymentLink } : {}),
      ...(w.capacity != null ? { capacity: w.capacity } : {}),
      ...(w.stripeProductId ? { stripeProductId: w.stripeProductId } : {}),
      ...(w.zoomLink ? { zoomLink: w.zoomLink } : {}),
      ...(w.zoomPasscode ? { zoomPasscode: w.zoomPasscode } : {}),
      ...(w.zoomRegistrationUrl
        ? { zoomRegistrationUrl: w.zoomRegistrationUrl }
        : {}),
    }

    const already = REVERT
      ? w._type === 'workshop'
      : w._type === 'workshopSession' && w.topic?._ref === topicRef

    rows.push({
      id: w._id,
      from: w._type,
      slug: slug.current,
      sessionNumber: n,
      title,
      startsAt: w.startsAt,
      already,
      topicDoc,
      topicRef,
      legacyTopicId: legacyTopicId(n),
      sessionDoc,
      workshopDoc,
      deleteDraft: `drafts.${w._id}`,
    })
  }

  console.table(
    rows.map((r) => ({
      id: r.id,
      from: r.from,
      n: r.sessionNumber,
      slug: r.slug,
      startsAt: r.startsAt,
      skip: r.already ? 'already session' : '',
    })),
  )

  if (!COMMIT) {
    console.log('Dry run. Re-run with --commit to write.')
    return
  }

  tx.patch(series._id, (p) =>
    p.set({
      startsOn: '2026-10-28',
      endsOn: '2027-01-20',
      label: series.label || series.title || 'Fall 2026',
    }),
  )

  for (const r of rows) {
    tx.createOrReplace(r.topicDoc)
  }
  await tx.commit({ visibility: 'async' })
  console.log('Wrote 10 topics and patched series window fields.')

  for (const r of rows) {
    await client
      .patch(r.id)
      .set({ topic: { _type: 'reference', _ref: r.topicRef } })
      .commit()
  }
  console.log('Pointed Fall docs at workshopTopic.{slug}.')

  for (const r of rows) {
    try {
      await client.delete(r.legacyTopicId)
      console.log(`  deleted ${r.legacyTopicId}`)
    } catch {
      // already gone
    }
  }

  if (TOPICS_ONLY) {
    const verifyTopics = await client.fetch(
      `*[_id in $ids && !(_id in path("drafts.**"))] | order(sessionNumber asc){
        _id, "slug": slug.current, "topicId": topic._ref, "topicTitle": topic->title
      }`,
      { ids: WORKSHOP_IDS },
    )
    console.table(verifyTopics)
    for (const v of verifyTopics) {
      if (v.topicId !== topicId(v.slug)) {
        throw new Error(`${v._id} topic is ${v.topicId}`)
      }
    }
    console.log('Topics remapped. Workshop _type unchanged.')
    return
  }

  for (const r of rows) {
    const draftId = r.deleteDraft
    const publishedId = r.sessionDoc._id
    try {
      await client.delete(draftId)
    } catch {
      // no draft — fine
    }

    if (REVERT) {
      if (r.from === 'workshop') {
        await client.createOrReplace(r.workshopDoc)
      } else {
        await replaceDocumentType(client, publishedId, r.workshopDoc)
      }
      console.log(`  ${publishedId} → workshop`)
    } else if (r.from === 'workshop') {
      await replaceDocumentType(client, publishedId, r.sessionDoc)
      console.log(`  ${publishedId} → workshopSession`)
    } else {
      await client.createOrReplace(r.sessionDoc)
      console.log(`  ${publishedId} → workshopSession`)
    }
  }
  console.log(REVERT ? 'Wrote 10 workshops (legacy type).' : 'Wrote 10 sessions.')

  const expectedType = REVERT ? 'workshop' : 'workshopSession'
  const verify = await client.fetch(
    `*[_id in $ids && !(_id in path("drafts.**"))] | order(sessionNumber asc){
      _id, _type, sessionNumber, "slug": slug.current,
      "topicTitle": topic->title, "topicOrder": topic->order,
      "seriesSlug": series->slug.current
    }`,
    { ids: WORKSHOP_IDS },
  )
  for (const v of verify) {
    if (v._type !== expectedType) {
      throw new Error(`${v._id} is still ${v._type}`)
    }
    if (v.seriesSlug !== SERIES_SLUG) {
      throw new Error(`${v._id} series slug is ${v.seriesSlug}`)
    }
    if (v.topicOrder !== v.sessionNumber) {
      throw new Error(`${v._id} topic.order ${v.topicOrder} != sessionNumber ${v.sessionNumber}`)
    }
  }
  console.table(
    verify.map((v) => ({
      id: v._id,
      type: v._type,
      n: v.sessionNumber,
      slug: v.slug,
      topic: v.topicTitle,
    })),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
