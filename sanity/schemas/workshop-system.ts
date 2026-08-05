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
      description: "Uncheck when the series has finished. Hides it from the site.",
    }),
  ],
  preview: { select: { title: "title", subtitle: "passPrice" } },
});

/* ------------------------------------------------------------------ */
/* workshop                                                            */
/* ------------------------------------------------------------------ */

export const workshop = defineType({
  name: "workshop",
  title: "Workshop",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "logistics", title: "Logistics" },
    { name: "commerce", title: "Commerce" },
  ],
  fields: [
    defineField({
      name: "series",
      type: "reference",
      to: [{ type: "series" }],
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sessionNumber",
      title: "Workshop number",
      type: "number",
      description:
        'Position in the series, 1–10. Displays everywhere as "Workshop 01". ' +
        "Field name is legacy — do not rename without a content migration.",
      group: "content",
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      title: "One-line hook",
      type: "text",
      rows: 2,
      group: "content",
    }),
    defineField({ name: "description", type: "array", of: [{ type: "block" }], group: "content" }),

    defineField({
      name: "startsAt",
      title: "Starts at (UTC)",
      type: "datetime",
      description:
        "Canonical UTC instant. See docs/workshop-schedule.md — workshops 9 and 10 " +
        "cross the DST boundary, so do not derive these by adding 7 days.",
      group: "logistics",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "durationMinutes",
      type: "number",
      initialValue: 90,
      group: "logistics",
    }),
    defineField({
      name: "zoomLink",
      title: "Zoom join URL",
      type: "url",
      description: "Sent 8 days before the workshop. Never published on the site.",
      group: "logistics",
    }),
    defineField({
      name: "zoomPasscode",
      title: "Zoom passcode",
      type: "string",
      description: "Sent with the join link. Never published on the site.",
      group: "logistics",
    }),

    defineField({
      name: "price",
      title: "Price (USD)",
      type: "number",
      description: "Display only. The charged amount lives in the Stripe Payment Link.",
      group: "commerce",
    }),
    defineField({
      name: "paymentLink",
      title: "Stripe Payment Link",
      type: "url",
      group: "commerce",
    }),
    defineField({
      name: "registrationOpen",
      type: "boolean",
      initialValue: true,
      group: "commerce",
    }),
  ],
  orderings: [
    {
      name: "byNumber",
      title: "Workshop number",
      by: [{ field: "sessionNumber", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", number: "sessionNumber", date: "startsAt" },
    prepare: ({ title, number, date }) => ({
      title: `Workshop ${String(number ?? "?").padStart(2, "0")} — ${title}`,
      subtitle: date
        ? new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            dateStyle: "full",
            timeStyle: "short",
          }).format(new Date(date))
        : "No date set",
    }),
  },
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
    defineField({ name: "registeredAt", type: "datetime" }),
    defineField({
      name: "credentialsSentAt",
      type: "datetime",
      description: "Set by the cron. Presence of a value is what prevents a duplicate send.",
    }),
    defineField({ name: "reminderSentAt", type: "datetime" }),
  ],
  preview: {
    select: { email: "email", workshop: "workshop.title", status: "status", source: "source" },
    prepare: ({ email, workshop, status, source }) => ({
      title: email,
      subtitle: `${workshop ?? "—"} · ${source ?? "?"}${status === "refunded" ? " · REFUNDED" : ""}`,
    }),
  },
});
