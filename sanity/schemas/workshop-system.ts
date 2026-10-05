import { defineField, defineType } from "sanity";
import { isUniqueSeriesSlug } from "../lib/isUniqueWorkshopSlug";

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
      options: { source: "title", isUnique: isUniqueSeriesSlug },
      description:
        "Must not match any workshop slug — /workshops/[x] serves the series package first.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Display label",
      type: "string",
      description: 'Short label for catalogue UI, e.g. "Fall 2026". Defaults to title.',
    }),
    defineField({
      name: "startsOn",
      title: "Starts on",
      type: "date",
      description: "First session date (America/New_York calendar date, not UTC).",
    }),
    defineField({
      name: "endsOn",
      title: "Ends on",
      type: "date",
      description: "Last session date (America/New_York calendar date, not UTC).",
    }),
    defineField({
      name: "passPrice",
      title: "Full-series pass price (USD)",
      type: "number",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "passPaymentLink",
      title: "Stripe Payment Link — full series pass",
      type: "url",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "active",
      type: "boolean",
      initialValue: false,
      hidden: true,
      description:
        "Deprecated. Current series is the one whose endsOn is still ahead and whose startsOn is earliest. Leave future series false so a leftover active-query cannot promote Winter over Fall.",
    }),
  ],
  orderings: [
    {
      title: "Season",
      name: "startsOnAsc",
      by: [{ field: "startsOn", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "label" } },
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
    defineField({
      name: "workshop",
      type: "reference",
      to: [{ type: "workshopSession" }, { type: "workshop" }],
      description:
        "The dated session this registration belongs to. Field name is legacy — do not rename; IDs stay registration.{live|test}.{sessionId}.{hash}.",
    }),
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
      workshopTitle: "workshop.title",
      topicTitle: "workshop.topic.title",
      status: "status",
      source: "source",
      testMode: "testMode",
    },
    prepare: ({ email, workshopTitle, topicTitle, status, source, testMode }) => {
      const workshop = topicTitle || workshopTitle
      const base = `${workshop ?? "—"} · ${source ?? "?"}${status === "refunded" ? " · REFUNDED" : ""}`
      return {
        title: email,
        subtitle: testMode ? `TEST · ${base}` : base,
      }
    },
  },
});
