import { createHash } from "node:crypto";
import { createClient } from "next-sanity";

/**
 * Server-only Sanity client with write access.
 *
 * SANITY_API_WRITE_TOKEN must never be exposed to the browser. Nothing in this
 * module may be imported into a client component.
 */
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

export type RegistrationInput = {
  workshopId: string;
  email: string;
  firstName?: string;
  stripeSessionId: string;
  source: "single" | "pass";
  passId?: string;
  /** From `!event.livemode` — required, never defaulted at call sites. */
  testMode: boolean;
};

/**
 * Deterministic document ID: (mode, workshop, email) is the natural key.
 *
 * Mode is a path segment (`live` | `test`) so it is visible in IDs/logs/Studio
 * and so test rows purge with `_id in path("registration.test.**")`. Email is
 * hashed, not embedded.
 *
 * Test and live never collide — the same person can hold both without one
 * overwriting the other via createIfNotExists.
 */
export function registrationId(
  workshopId: string,
  email: string,
  testMode: boolean,
) {
  const mode = testMode ? "test" : "live";
  const hash = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return `registration.${mode}.${workshopId}.${hash}`;
}

/**
 * Idempotent. Safe to call twice for the same (mode, workshop, email) — Stripe
 * does retry webhooks, and someone who bought a single workshop and later
 * upgraded to a pass must not end up with two registrations and two of every
 * email within the same mode.
 *
 * An existing 'single' registration is never downgraded to 'pass': they paid
 * for it directly, and that's the record worth keeping.
 */
export async function createRegistration(input: RegistrationInput) {
  const _id = registrationId(input.workshopId, input.email, input.testMode);

  await writeClient.createIfNotExists({
    _id,
    _type: "registration",
    workshop: { _type: "reference", _ref: input.workshopId },
    email: input.email.trim().toLowerCase(),
    firstName: input.firstName,
    source: input.source,
    passId: input.passId,
    stripeSessionId: input.stripeSessionId,
    status: "active",
    testMode: input.testMode,
    registeredAt: new Date().toISOString(),
  });

  // Reactivate only on a genuinely new purchase after a refund — never when
  // fanOutSeriesPass backfills a workshop onto an already-refunded pass.
  // Test/live IDs cannot collide, so a test retry cannot flip a live row.
  const existing = await writeClient.fetch<{
    status?: string;
    stripeSessionId?: string;
  } | null>(`*[_id == $_id][0]{ status, stripeSessionId }`, { _id });

  if (
    existing?.status === "refunded" &&
    existing.stripeSessionId != null &&
    existing.stripeSessionId !== input.stripeSessionId
  ) {
    await writeClient
      .patch(_id)
      .set({ status: "active" })
      .commit({ autoGenerateArrayKeys: true });
  }

  return _id;
}

/**
 * A series pass writes one registration per workshop in the series.
 *
 * Ten records rather than one membership flag: every send has a single code
 * path, headcount per workshop is a real number, and a refund voids the whole
 * set by passId in one query.
 *
 * Re-runnable. If a workshop is added to the series after passes were sold,
 * calling this again with the same passId backfills only the missing rows.
 */
export async function fanOutSeriesPass(opts: {
  seriesId: string;
  email: string;
  firstName?: string;
  stripeSessionId: string;
  testMode: boolean;
}) {
  const workshops: { _id: string }[] = await writeClient.fetch(
    `*[_type == "workshop" && series._ref == $seriesId]{ _id }`,
    { seriesId: opts.seriesId },
  );

  if (workshops.length === 0) {
    throw new Error(
      `Series pass purchased but series ${opts.seriesId} has no workshops`,
    );
  }

  for (const w of workshops) {
    await createRegistration({
      workshopId: w._id,
      email: opts.email,
      firstName: opts.firstName,
      stripeSessionId: opts.stripeSessionId,
      source: "pass",
      passId: opts.stripeSessionId,
      testMode: opts.testMode,
    });
  }

  return workshops.length;
}

/**
 * Refund handling. Voids by Stripe Checkout Session ID, which covers both a
 * single workshop and an entire pass fan-out — the pass writes its session ID
 * onto all ten rows. Mode-agnostic: test session IDs only exist in test mode.
 *
 * Refunded registrations stay in the dataset rather than being deleted: the
 * record of what happened is worth more than the tidiness, and status is what
 * every send filters on.
 */
export async function voidRegistrations(stripeSessionId: string) {
  const ids: string[] = await writeClient.fetch(
    `*[_type == "registration" && (stripeSessionId == $sid || passId == $sid)]._id`,
    { sid: stripeSessionId },
  );

  if (ids.length === 0) return 0;

  let tx = writeClient.transaction();
  for (const id of ids) {
    tx = tx.patch(id, (p) => p.set({ status: "refunded" }));
  }
  await tx.commit();

  return ids.length;
}
