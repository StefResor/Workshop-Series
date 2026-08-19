import type { Metadata } from 'next'
import Link from 'next/link'
import Stripe from 'stripe'
import { client as sanity } from '@/sanity/lib/client'
import { CREDENTIALS_LEAD_DAYS } from '@/lib/email/theme'
import { workshopIcsPath } from '@/lib/workshop-paths'

export const dynamic = 'force-dynamic'

// A confirmation page has no business in search results.
export const metadata: Metadata = {
  title: "You're registered",
  robots: { index: false, follow: false },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const WORKSHOP_QUERY = `*[
  _type == "workshop" &&
  slug.current == $slug &&
  series->slug.current == $series
][0]{
  sessionNumber, title, startsAt, durationMinutes,
  "slug": slug.current, "seriesSlug": series->slug.current
}`

type Props = {
  params: Promise<{ series: string; slug: string }>
  searchParams: Promise<{ session_id?: string }>
}

/**
 * Three outcomes, deliberately separated:
 *   "paid"       — money confirmed settled. Full confirmation.
 *   "processing" — session complete, payment still clearing (ACH, Klarna,
 *                  some bank redirects). They DID register. Say so.
 *   "unknown"    — no session_id, or Stripe couldn't tell us. Never claims
 *                  they failed; points them at their inbox.
 *
 * unknown is almost always a live/test key mismatch on the host that served
 * this page — not a missing email on checkout (Stripe always collects email).
 */
type Outcome = 'paid' | 'processing' | 'unknown'

export default async function ThankYou({ params, searchParams }: Props) {
  const { series, slug } = await params
  const { session_id } = await searchParams

  // The path is trustworthy: it comes from the success_url WE configured on
  // the Payment Link, not from anything the visitor controls meaningfully.
  // So workshop identity comes from the route, and Stripe is asked exactly
  // one question — did this person pay.
  const workshop = await sanity
    .fetch(WORKSHOP_QUERY, { series, slug })
    .catch((err: unknown) => {
      console.error(
        '[thank-you] Sanity fetch failed for series/slug:',
        series,
        slug,
        err,
      )
      return null
    })

  let outcome: Outcome = 'unknown'
  let firstName: string | undefined
  let email: string | undefined

  if (session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id)

      if (
        s.payment_status === 'paid' ||
        s.payment_status === 'no_payment_required'
      ) {
        outcome = 'paid'
      } else if (s.status === 'complete') {
        outcome = 'processing'
      }

      firstName =
        s.customer_details?.name?.trim().split(/\s+/)[0] || undefined
      email = s.customer_details?.email ?? undefined

      if (s.metadata?.workshop_slug && s.metadata.workshop_slug !== slug) {
        console.warn(
          '[thank-you] workshop_slug mismatch — Payment Link metadata says',
          s.metadata.workshop_slug,
          'but success_url routed to',
          slug,
        )
      }
    } catch (err) {
      // Live/test key mismatch, expired ID, Stripe outage. Log loudly; the
      // visitor still gets a civil page.
      console.error(
        '[thank-you] Could not retrieve Checkout Session:',
        session_id,
        err,
      )
    }
  } else {
    console.warn('[thank-you] No session_id on request for slug:', slug)
  }

  const hasDetails = Boolean(workshop?.startsAt)
  const start = hasDetails ? new Date(workshop.startsAt) : null
  const duration = workshop?.durationMinutes ?? 90
  const end = start ? new Date(start.getTime() + duration * 60_000) : null

  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      ...o,
    }).format(d)
  const clock = (d: Date) => fmt(d, { hour: 'numeric', minute: '2-digit' })
  const tzName = start
    ? (new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      })
        .formatToParts(start)
        .find((p) => p.type === 'timeZoneName')?.value ?? 'ET')
    : 'ET'

  const credsDate = start
    ? fmt(new Date(start.getTime() - CREDENTIALS_LEAD_DAYS * 86_400_000), {
        month: 'long',
        day: 'numeric',
      })
    : null

  const num = workshop?.sessionNumber
    ? String(workshop.sessionNumber).padStart(2, '0')
    : null

  const headline =
    outcome === 'unknown'
      ? 'Check your inbox'
      : firstName
        ? `${firstName}, you're\nregistered.`
        : "You're\nregistered."

  const standfirst =
    outcome === 'unknown' ? (
      <>
        We couldn&rsquo;t read your registration details from this link, which
        usually means the address got trimmed along the way — it doesn&rsquo;t
        mean anything went wrong with your payment. Your confirmation email is
        the reliable record. If it hasn&rsquo;t arrived within a few minutes,
        write to us and we&rsquo;ll sort it out.
      </>
    ) : outcome === 'processing' ? (
      <>
        Your seat is held. Your bank is still clearing the payment, which can
        take a few business days — nothing more is needed from you.{' '}
        {email ? (
          <>
            Your confirmation is on its way to{' '}
            <span className="thank-you-email">{email}</span>.
          </>
        ) : (
          <>Your confirmation is on its way to your inbox.</>
        )}
      </>
    ) : (
      <>
        Thank you for signing up.{' '}
        {email ? (
          <>
            A confirmation is on its way to{' '}
            <span className="thank-you-email">{email}</span>.
          </>
        ) : (
          <>A confirmation is on its way to your inbox.</>
        )}{' '}
        It has everything below, so you can keep it.
      </>
    )

  return (
    <main className="thank-you">
      <span className="thank-you-rule" aria-hidden />

      <h1 className="thank-you-headline">{headline}</h1>

      <p className="thank-you-standfirst">{standfirst}</p>

      {/* Workshop details — shown whenever Sanity has the doc, regardless of
          payment state. Someone who just paid should never see an empty page. */}
      {hasDetails && (
        <section className="thank-you-details">
          {num ? (
            <p className="kicker thank-you-kicker">Workshop {num}</p>
          ) : null}
          <h2 className="thank-you-title">{workshop.title}</h2>

          <dl className="thank-you-meta">
            <div>
              <dt>Date</dt>
              <dd>
                {fmt(start!, { weekday: 'long' })}
                <br />
                {fmt(start!, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>
                {clock(start!)} – {clock(end!)} {tzName}
                <br />
                <span className="thank-you-meta-note">
                  {duration} minutes, live
                </span>
              </dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>
                Zoom
                <br />
                <span className="thank-you-meta-note">Link sent separately</span>
              </dd>
            </div>
          </dl>

          <div className="thank-you-actions">
            <a className="btn" href={workshopIcsPath(series, slug)}>
              Add to calendar
            </a>
            <Link className="btn btn-outline" href="/workshops">
              See the full series
            </Link>
          </div>
        </section>
      )}

      <aside className="thank-you-zoom" aria-label="Zoom credentials timing">
        <p className="kicker thank-you-kicker">Your Zoom link</p>
        <p>
          The Zoom link and passcode aren&rsquo;t in your confirmation. They
          arrive in a separate email{' '}
          {credsDate ? <>on {credsDate}, </> : null}
          about a week before the workshop, with a short reminder on the day
          itself.
        </p>
      </aside>

      {!hasDetails ? (
        <div className="thank-you-actions thank-you-actions--solo">
          <Link className="btn btn-outline" href="/workshops">
            See the full series
          </Link>
        </div>
      ) : null}

      <p className="thank-you-disclaimer">
        <strong>This is education, not therapy.</strong> These workshops are
        educational and do not constitute psychotherapy or create a
        therapist–client relationship. Registration is non-refundable and is
        per participant — partners attending together register separately.
      </p>
    </main>
  )
}
