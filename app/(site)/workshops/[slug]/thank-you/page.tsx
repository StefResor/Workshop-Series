import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { client as sanity } from "@/sanity/lib/client";
import { CREDENTIALS_LEAD_DAYS } from "@/lib/email/theme";

export const dynamic = "force-dynamic";

// A confirmation page has no business in search results.
export const metadata: Metadata = {
  title: "You're registered",
  robots: { index: false, follow: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const WORKSHOP_QUERY = `*[_type == "workshop" && slug.current == $slug][0]{
  sessionNumber, title, startsAt, durationMinutes, "slug": slug.current
}`;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

/**
 * Three outcomes, deliberately separated:
 *   "paid"       — money confirmed settled. Full confirmation.
 *   "processing" — session complete, payment still clearing (ACH, Klarna,
 *                  some bank redirects). They DID register. Say so.
 *   "unknown"    — no session_id, or Stripe couldn't tell us. Never claims
 *                  they failed; points them at their inbox.
 */
type Outcome = "paid" | "processing" | "unknown";

export default async function ThankYou({ params, searchParams }: Props) {
  const { slug } = await params;
  const { session_id } = await searchParams;

  // The slug is trustworthy: it comes from the success_url WE configured on
  // the Payment Link, not from anything the visitor controls meaningfully.
  // So workshop identity comes from the route, and Stripe is asked exactly
  // one question — did this person pay. Conflating the two was what created
  // false negatives in the first version.
  const workshop = await sanity.fetch(WORKSHOP_QUERY, { slug }).catch((err: unknown) => {
    console.error("[thank-you] Sanity fetch failed for slug:", slug, err);
    return null;
  });

  let outcome: Outcome = "unknown";
  let firstName: string | undefined;
  let email: string | undefined;

  if (session_id) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id);

      if (s.payment_status === "paid" || s.payment_status === "no_payment_required") {
        outcome = "paid";
      } else if (s.status === "complete") {
        // Checkout finished; funds still clearing.
        outcome = "processing";
      }

      firstName = s.customer_details?.name?.trim().split(/\s+/)[0] || undefined;
      email = s.customer_details?.email ?? undefined;

      // Soft cross-check only. A metadata mismatch is a config problem on the
      // Payment Link, not a reason to withhold someone's confirmation.
      if (s.metadata?.workshop_slug && s.metadata.workshop_slug !== slug) {
        console.warn(
          "[thank-you] workshop_slug mismatch — Payment Link metadata says",
          s.metadata.workshop_slug,
          "but success_url routed to",
          slug,
        );
      }
    } catch (err) {
      // Live/test key mismatch, expired ID, Stripe outage. Log loudly; the
      // visitor still gets a civil page.
      console.error("[thank-you] Could not retrieve Checkout Session:", session_id, err);
    }
  } else {
    console.warn("[thank-you] No session_id on request for slug:", slug);
  }

  // ---------- derived display values ----------
  const hasDetails = Boolean(workshop?.startsAt);
  const start = hasDetails ? new Date(workshop.startsAt) : null;
  const duration = workshop?.durationMinutes ?? 90;
  const end = start ? new Date(start.getTime() + duration * 60_000) : null;

  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", ...o }).format(d);
  const clock = (d: Date) => fmt(d, { hour: "numeric", minute: "2-digit" });
  const tzName = start
    ? (new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        timeZoneName: "short",
      })
        .formatToParts(start)
        .find((p) => p.type === "timeZoneName")?.value ?? "ET")
    : "ET";

  const credsDate = start
    ? fmt(new Date(start.getTime() - CREDENTIALS_LEAD_DAYS * 86_400_000), {
        month: "long",
        day: "numeric",
      })
    : null;

  const num = workshop?.sessionNumber
    ? String(workshop.sessionNumber).padStart(2, "0")
    : null;

  const headline =
    outcome === "unknown"
      ? "Check your inbox"
      : firstName
        ? `${firstName}, you're\nregistered.`
        : "You're\nregistered.";

  const standfirst =
    outcome === "unknown" ? (
      <>
        We couldn&rsquo;t read your registration details from this link, which usually
        means the address got trimmed along the way — it doesn&rsquo;t mean anything went
        wrong with your payment. Your confirmation email is the reliable record. If it
        hasn&rsquo;t arrived within a few minutes, write to us and we&rsquo;ll sort it out.
      </>
    ) : outcome === "processing" ? (
      <>
        Your seat is held. Your bank is still clearing the payment, which can take a few
        business days — nothing more is needed from you.{" "}
        {email ? (
          <>
            Your confirmation is on its way to <span className="text-ink">{email}</span>.
          </>
        ) : (
          <>Your confirmation is on its way to your inbox.</>
        )}
      </>
    ) : (
      <>
        Thank you for signing up.{" "}
        {email ? (
          <>
            A confirmation is on its way to <span className="text-ink">{email}</span>.
          </>
        ) : (
          <>A confirmation is on its way to your inbox.</>
        )}{" "}
        It has everything below, so you can keep it.
      </>
    );

  return (
    <main className="mx-auto max-w-3xl px-6 py-32">
      <span className="block h-[3px] w-12 bg-vermillion" aria-hidden />

      <h1 className="mt-6 whitespace-pre-line font-display text-5xl uppercase leading-[0.94] tracking-tight text-ink sm:text-6xl">
        {headline}
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/60">{standfirst}</p>

      {/* Workshop details — shown whenever Sanity has the doc, regardless of
          payment state. Someone who just paid should never see an empty page. */}
      {hasDetails && (
        <div className="mt-16 border-t border-ink/15 pt-10">
          {num && (
            <p className="text-[11px] uppercase tracking-[0.14em] text-vermillion">
              Workshop {num}
            </p>
          )}
          <h2 className="mt-2 font-display text-2xl leading-tight text-ink">
            {workshop.title}
          </h2>

          <dl className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-ink/50">Date</dt>
              <dd className="mt-1.5 text-lg text-ink">
                {fmt(start!, { weekday: "long" })}
                <br />
                {fmt(start!, { month: "long", day: "numeric", year: "numeric" })}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-ink/50">Time</dt>
              <dd className="mt-1.5 text-lg text-ink">
                {clock(start!)} – {clock(end!)} {tzName}
                <br />
                <span className="text-sm text-ink/50">{duration} minutes, live</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.14em] text-ink/50">Where</dt>
              <dd className="mt-1.5 text-lg text-ink">
                Zoom
                <br />
                <span className="text-sm text-ink/50">Link sent separately</span>
              </dd>
            </div>
          </dl>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <a
              href={`/workshops/${slug}/event.ics`}
              className="inline-block bg-ink px-7 py-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-bone transition-opacity hover:opacity-85"
            >
              Add to calendar
            </a>
            <Link
              href="/workshops"
              className="inline-block border border-ink px-7 py-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-bone"
            >
              See the full series
            </Link>
          </div>
        </div>
      )}

      {/* The expectation this whole flow depends on. */}
      <div className="mt-16 border-l-[3px] border-vermillion pl-6">
        <p className="text-[11px] uppercase tracking-[0.14em] text-vermillion">
          Your Zoom link
        </p>
        <p className="mt-2 max-w-xl text-lg leading-relaxed text-ink/70">
          The Zoom link and passcode aren&rsquo;t in your confirmation. They arrive in a
          separate email {credsDate ? <>on {credsDate}, </> : null}about a week before the
          workshop, with a short reminder on the day itself.
        </p>
      </div>

      {!hasDetails && (
        <div className="mt-16 border-t border-ink/15 pt-10">
          <Link
            href="/workshops"
            className="inline-block border border-ink px-7 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            See the full series
          </Link>
        </div>
      )}

      <div className="mt-20 border-t border-ink/15 pt-8">
        <p className="max-w-2xl text-sm leading-relaxed text-ink/55">
          <span className="font-semibold text-ink">This is education, not therapy.</span>{" "}
          These workshops are educational and do not constitute psychotherapy or create a
          therapist–client relationship. Registration is non-refundable and is per
          participant — partners attending together register separately.
        </p>
      </div>
    </main>
  );
}
