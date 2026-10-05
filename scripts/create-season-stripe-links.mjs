/**
 * Create a live Stripe product + Payment Link for every open session in the
 * given series that has no stripePaymentLink yet, and write the link to Sanity.
 * Default series: winter-2027, spring-2027, summer-2027 (30 sessions).
 *
 * Per session: product "Workshop NN: <topic title> (<Series label>)" with a
 * dated description and a $47 default price (or the session's price override);
 * Payment Link with metadata workshop_slug + session_slug + series_slug (what
 * the webhook resolves on), required name + ToS, redirect to the site
 * thank-you page. Idempotent: reuses a product already tagged with the same
 * session_slug, and skips sessions that already have a link in Sanity.
 *
 * Live key: rk_live_ with Products + Payment Links write, in .env.stripe.live.
 * Site for redirects: NEXT_PUBLIC_SITE_URL, else --site=https://…
 *
 * Usage:
 *   node scripts/create-season-stripe-links.mjs                    # dry run
 *   node scripts/create-season-stripe-links.mjs --commit
 *   node scripts/create-season-stripe-links.mjs --series=winter-2027 --commit
 *   node scripts/create-season-stripe-links.mjs --series=fall-2027 --commit
 */
import { existsSync } from 'node:fs'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@sanity/client'
import Stripe from 'stripe'

loadEnv({ path: '.env.local', override: false })
if (existsSync('.env.stripe.live')) loadEnv({ path: '.env.stripe.live', override: true })

const TZ = 'America/New_York'
const DEFAULT_PRICE_USD = 47
const commit = process.argv.includes('--commit')
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const SERIES = (arg('series') || 'winter-2027,spring-2027,summer-2027').split(',').map((s) => s.trim()).filter(Boolean)
const SITE = (arg('site') || process.env.NEXT_PUBLIC_SITE_URL || 'https://stefanie-schumacher-com.vercel.app').replace(/\/$/, '')

const pad = (n) => String(n).padStart(2, '0')
const need = (k) => {
  const v = process.env[k]?.trim()
  if (!v) throw new Error(`Missing ${k}`)
  return v
}
function describe(startsAt, minutes = 90) {
  const start = new Date(startsAt)
  const end = new Date(start.getTime() + minutes * 60000)
  const day = start.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const t = (d) => d.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })
  return `${day} · ${t(start).replace(/ [AP]M$/, '')}–${t(end)} ET · Zoom`
}
const etDate = (startsAt) => new Date(startsAt).toLocaleDateString('en-CA', { timeZone: TZ })

async function listAll(fn, params = {}) {
  const out = []
  let starting_after
  for (;;) {
    const page = await fn({ limit: 100, ...params, ...(starting_after ? { starting_after } : {}) })
    out.push(...page.data)
    if (!page.has_more || !page.data.length) return out
    starting_after = page.data[page.data.length - 1].id
  }
}

async function main() {
  const key = need('STRIPE_SECRET_KEY')
  const mode = /^(sk|rk)_live_/.test(key) ? 'live' : /^(sk|rk)_test_/.test(key) ? 'test' : 'other'
  console.log(commit ? 'MODE: --commit' : 'MODE: dry run (pass --commit to write)')
  console.log(`Stripe mode: ${mode} · series: ${SERIES.join(', ')} · redirect host: ${SITE}`)
  if (commit && mode !== 'live') throw new Error(`--commit refuses a ${mode} key; put the live key in .env.stripe.live`)

  const stripe = new Stripe(key)
  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dx57inng',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-07-27',
    token: commit ? need('SANITY_API_WRITE_TOKEN') : process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  })

  const sessions = await sanity.fetch(
    `*[_type == "workshopSession" && series->slug.current in $series && !(_id in path("drafts.**"))]
      | order(startsAt asc){
        _id, "slug": slug.current, startsAt, durationMinutes, price, registrationStatus, stripePaymentLink,
        "num": coalesce(sessionNumber, topic->order), "title": topic->title,
        "seriesSlug": series->slug.current, "seriesLabel": coalesce(series->label, series->title)
      }`,
    { series: SERIES },
  )
  console.log(`Found ${sessions.length} sessions`)

  const products = await listAll((p) => stripe.products.list(p), { active: true })
  const productBySession = new Map(products.filter((p) => p.metadata?.session_slug).map((p) => [`${p.metadata.series_slug}/${p.metadata.session_slug}`, p]))

  let problems = 0
  const todo = []
  for (const s of sessions) {
    const label = `${s.seriesSlug} ${pad(s.num)} ${etDate(s.startsAt)}`
    if (!s.title || !s.slug || !s.startsAt || !s.num) {
      console.error(`✗ ${s._id}: missing title/slug/startsAt/number`)
      problems++
      continue
    }
    if (s.stripePaymentLink) {
      console.log(`· ${label} already has a link (${s.stripePaymentLink}) — skip`)
      continue
    }
    if (s.registrationStatus !== 'open') console.log(`! ${label} status is ${s.registrationStatus} — link still created`)
    const price = Number.isFinite(s.price) && s.price > 0 ? s.price : DEFAULT_PRICE_USD
    const row = {
      s,
      label,
      existing: productBySession.get(`${s.seriesSlug}/${s.slug}`),
      name: `Workshop ${pad(s.num)}: ${s.title} (${s.seriesLabel})`,
      description: describe(s.startsAt, s.durationMinutes || 90),
      price,
      meta: { workshop: pad(s.num), workshop_slug: s.slug, session_slug: s.slug, series_slug: s.seriesSlug, date: etDate(s.startsAt) },
      redirect: `${SITE}/workshops/${s.seriesSlug}/${s.slug}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    }
    todo.push(row)
    console.log(`+ ${label}  ${row.name}`)
    console.log(`    ${row.description} · $${price}${row.existing ? ` · reuse ${row.existing.id}` : ''}`)
    console.log(`    redirect ${row.redirect}`)
  }

  console.log(`\n${todo.length} link(s) to create.`)
  if (problems) {
    console.error(`${problems} problem(s); nothing written.`)
    process.exit(1)
  }
  if (!commit) {
    console.log('Dry run. Re-run with --commit.')
    return
  }

  for (const r of todo) {
    let product = r.existing
    if (!product) {
      product = await stripe.products.create({
        name: r.name,
        description: r.description,
        metadata: r.meta,
        default_price_data: { currency: 'usd', unit_amount: Math.round(r.price * 100) },
      })
    }
    const priceId = typeof product.default_price === 'string' ? product.default_price : product.default_price?.id
    if (!priceId) throw new Error(`${r.label}: product ${product.id} has no default price`)
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: r.meta,
      name_collection: { individual: { enabled: true, optional: false } },
      consent_collection: { terms_of_service: 'required' },
      after_completion: { type: 'redirect', redirect: { url: r.redirect } },
    })
    await sanity.patch(r.s._id).set({ stripePaymentLink: link.url }).commit()
    console.log(`✓ ${r.label}  ${product.id}  ${link.url}`)
  }
  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
