import { defineField, defineType } from "sanity";

/* ------------------------------------------------------------------ */
/* series — a cohort of workshops sold as a season                     */
/* ------------------------------------------------------------------ */

export const series = defineType({
  name: "series",
  title: "Workshop series",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: 'e.g. "Fall 2026"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "passPrice",
      title: "Full-series pass price (USD)",
      type: "number",
      description: "Display only. The charged amount lives in the Stripe Payment Link.",
    }),
    defineField({
      name: "passPaymentLink",
      title: "Stripe Payment Link — full series pass",
      type: "url",
    }),
    defineField({
      name: "active",
      type: "boolean",
      initialValue: true,
      description:
        "When false, workshops in this series are excluded from the homepage upcoming strip. The /workshops archive still lists them.",
    }),
  ],
  preview: { select: { title: "title", subtitle: "passPrice" } },
});

/* ------------------------------------------------------------------ */
/* registration — written by the Stripe webhook, never by hand         */
/* ------------------------------------------------------------------ */

export const registration = defineType({
  name: "registration",
  title: "Registration",
  type: "document",
  readOnly: true, // written by the webhook; editing by hand desynchronizes it from Stripe
  fields: [
    defineField({ name: "workshop", type: "reference", to: [{ type: "workshop" }] }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "firstName", type: "string" }),
    defineField({
      name: "source",
      type: "string",
      options: { list: ["single", "pass"], layout: "radio" },
      description: '"single" = bought this workshop alone. "pass" = covered by a series pass.',
    }),
    defineField({
      name: "passId",
      type: "string",
      description: "Stripe Checkout Session ID of the pass purchase. Groups a fan-out.",
    }),
    defineField({ name: "stripeSessionId", type: "string" }),
    defineField({
      name: "status",
      type: "string",
      options: { list: ["active", "refunded"], layout: "radio" },
      initialValue: "active",
      description: "Refunded registrations are excluded from every send.",
    }),
    defineField({
      name: "testMode",
      type: "boolean",
      initialValue: false,
      description:
        "Written by a Stripe test-mode purchase. Excluded from all sends and from headcount. Safe to delete.",
    }),
    defineField({ name: "registeredAt", type: "datetime" }),
    defineField({
      name: "credentialsSentAt",
      type: "datetime",
      description: "Set by the cron. Presence of a value is what prevents a duplicate send.",
    }),
    defineField({ name: "reminderSentAt", type: "datetime" }),
  ],
  preview: {
    select: {
      email: "email",
      workshop: "workshop.title",
      status: "status",
      source: "source",
      testMode: "testMode",
    },
    prepare: ({ email, workshop, status, source, testMode }) => {
      const base = `${workshop ?? "—"} · ${source ?? "?"}${status === "refunded" ? " · REFUNDED" : ""}`
      return {
        title: email,
        subtitle: testMode ? `TEST · ${base}` : base,
      }
    },
  },
});
