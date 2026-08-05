import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { client as sanity } from "@/sanity/lib/client";
import { createRegistration, fanOutSeriesPass, voidRegistrations } from "@/lib/registrations";
import { renderConfirmation } from "@/lib/email/workshop-confirmation";

export const runtime = "nodejs"; // Stripe signature verification needs Node crypto
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stefanie-schumacher.com";
const FROM =
  process.env.WORKSHOP_FROM_EMAIL?.trim() ||
  "Stefanie Schumacher <workshops@mail.stefanie-schumacher.com>";
const REPLY_TO = process.env.WORKSHOP_REPLY_TO!;

// zoomLink and zoomPasscode are deliberately NOT selected here. They ship 8 days out.
const WORKSHOP_BY_SLUG = `*[_type == "workshop" && slug.current == $slug][0]{
  _id, sessionNumber, title, startsAt, durationMinutes,
  "slug": slug.current, "seriesTitle": series->title
}`;

const SERIES_BY_SLUG = `*[_type == "series" && slug.current == $slug][0]{ _id, title }`;

const WORKSHOPS_IN_SERIES = `*[_type == "workshop" && series._ref == $seriesId] | order(sessionNumber asc){
  _id, sessionNumber, title, startsAt, durationMinutes,
  "slug": slug.current, "seriesTitle": series->title
}`;

type WorkshopDoc = {
  _id: string;
  sessionNumber: number;
  title: string;
  startsAt: string;
  durationMinutes?: number;
  slug: string;
  seriesTitle?: string;
};

async function sendConfirmation(
  w: WorkshopDoc,
  email: string,
  firstName: string | undefined,
  amountPaid: string,
  opts: { fromPass: boolean; idempotencyRef: string },
) {
  const { subject, html, text } = renderConfirmation(
    {
      workshopNumber: w.sessionNumber,
      title: w.title,
      startsAt: w.startsAt,
      durationMinutes: w.durationMinutes ?? 90,
      calendarUrl: `${SITE}/workshops/${w.slug}/event.ics`,
      detailsUrl: `${SITE}/workshops/${w.slug}`,
      amountPaid,
      fromPass: opts.fromPass,
      seriesTitle: w.seriesTitle,
    },
    firstName,
  );

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject,
    html,
    text,
    // Collapses duplicates if Stripe redelivers the event.
    headers: { "X-Entity-Ref-ID": opts.idempotencyRef },
    tags: [{ name: "type", value: "workshop_confirmation" }],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body — never req.json() here
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("[stripe] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      /* ---------------- purchase ---------------- */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Delayed methods (ACH, Klarna) complete before funds settle. Wait for
        // checkout.session.async_payment_succeeded rather than registering now.
        if (session.payment_status === "unpaid") {
          console.info("[stripe] Session complete, payment pending:", session.id);
          return NextResponse.json({ received: true });
        }
        await handlePurchase(session, !event.livemode);
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        await handlePurchase(
          event.data.object as Stripe.Checkout.Session,
          !event.livemode,
        );
        break;
      }

      /* ---------------- refund ---------------- */
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!pi) break;

        // Map the payment intent back to its Checkout Session.
        const sessions = await stripe.checkout.sessions.list({ payment_intent: pi, limit: 1 });
        const sid = sessions.data[0]?.id;
        if (!sid) {
          console.warn("[stripe] Refund with no matching Checkout Session:", pi);
          break;
        }
        const n = await voidRegistrations(sid);
        console.info(`[stripe] Refund voided ${n} registration(s) for session ${sid}`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe] Handler failed for", event.type, err);
    // 500 makes Stripe retry. Every write in here is idempotent, so a retry
    // is safe and is preferable to silently losing a registration.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/* ------------------------------------------------------------------ */

async function handlePurchase(
  session: Stripe.Checkout.Session,
  testMode: boolean,
) {
  const email = session.customer_details?.email;
  if (!email) {
    console.error("[stripe] No email on session", session.id);
    return; // 200 — retrying won't produce an email
  }

  const firstName = session.customer_details?.name?.trim().split(/\s+/)[0] || undefined;
  const amountPaid = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (session.currency ?? "usd").toUpperCase(),
  }).format((session.amount_total ?? 0) / 100);

  // Metadata is set on each Payment Link. Exactly one of these is present.
  const workshopSlug = session.metadata?.workshop_slug;
  const seriesSlug = session.metadata?.series_slug;

  /* ---- full-series pass ---- */
  if (seriesSlug) {
    const series = await sanity.fetch(SERIES_BY_SLUG, { slug: seriesSlug });
    if (!series) {
      throw new Error(`No series in Sanity for slug "${seriesSlug}" (session ${session.id})`);
    }

    const count = await fanOutSeriesPass({
      seriesId: series._id,
      email,
      firstName,
      stripeSessionId: session.id,
      testMode,
    });
    console.info(
      `[stripe] Pass fanned out to ${count} workshops for ${session.id}` +
        (testMode ? " (testMode)" : ""),
    );

    // One confirmation per workshop, so each is findable on its own terms and
    // each carries its own calendar file. Sent oldest first so the inbox reads
    // in series order.
    const workshops: WorkshopDoc[] = await sanity.fetch(WORKSHOPS_IN_SERIES, {
      seriesId: series._id,
    });
    for (const w of workshops) {
      await sendConfirmation(w, email, firstName, amountPaid, {
        fromPass: true,
        idempotencyRef: `${session.id}:${w._id}`,
      });
    }
    return;
  }

  /* ---- single workshop ---- */
  if (!workshopSlug) {
    throw new Error(
      `Session ${session.id} has neither workshop_slug nor series_slug metadata. ` +
        `Check the Payment Link configuration.`,
    );
  }

  const workshop: WorkshopDoc | null = await sanity.fetch(WORKSHOP_BY_SLUG, {
    slug: workshopSlug,
  });
  if (!workshop) {
    throw new Error(`No workshop in Sanity for slug "${workshopSlug}" (session ${session.id})`);
  }

  await createRegistration({
    workshopId: workshop._id,
    email,
    firstName,
    stripeSessionId: session.id,
    source: "single",
    testMode,
  });

  await sendConfirmation(workshop, email, firstName, amountPaid, {
    fromPass: false,
    idempotencyRef: session.id,
  });
}
