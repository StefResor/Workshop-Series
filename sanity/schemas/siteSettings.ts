import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site / person name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'practiceLine',
      title: 'Practice line',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'string',
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'locationLabel',
      title: 'Location label',
      type: 'string',
      description: 'Online · Ohio — never invent a city or use transferred-account leftovers.',
    }),
    defineField({
      name: 'defaultTitle',
      title: 'Default meta title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultDescription',
      title: 'Default meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'twitterTitle',
      title: 'Twitter / X title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ogTitle',
      title: 'Open Graph title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mailingAddress',
      title: 'Mailing address',
      type: 'text',
      rows: 3,
      description:
        'Physical mailing address for CAN-SPAM compliance on commercial email. Optional until a final address is decided — leave empty rather than inventing one.',
    }),
    defineField({
      name: 'notificationsEnabled',
      title: 'Notifications enabled',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'defaultWorkshopPrice',
      title: 'Default workshop price (legacy)',
      type: 'number',
      description:
        'Legacy alias for Session price. Prefer Session price below; kept so older documents keep resolving.',
      validation: (rule) => rule.min(0),
      hidden: ({ document }) => document?.sessionPrice != null,
    }),
    defineField({
      name: 'sessionPrice',
      title: 'Session price',
      type: 'number',
      description:
        'Per-participant USD for a single workshop when the session has no price override.',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'seriesPrice',
      title: 'Full series price',
      type: 'number',
      description:
        'USD for the full 10-session package (homepage + /workshops offer band). Leave empty to hide the band.',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'seriesEyebrow',
      title: 'Series band eyebrow',
      type: 'string',
      description: 'e.g. The Full Series',
    }),
    defineField({
      name: 'seriesDisplayLine',
      title: 'Series band display line',
      type: 'string',
      description: 'Hero line under the eyebrow — e.g. All Ten Sessions',
    }),
    defineField({
      name: 'seriesSupportingLine',
      title: 'Series band supporting line',
      type: 'text',
      rows: 3,
      description:
        'One sentence about the arc (left column). Draft until client review.',
    }),
    defineField({
      name: 'seriesOfferLine',
      title: 'Series meta — offer phrase',
      type: 'string',
      description:
        'Phrase after the price in the meta line (no dollar amounts). e.g. ten sessions, one free → “$423 · ten sessions, one free”',
    }),
    defineField({
      name: 'seriesScheduleLine',
      title: 'Series meta — schedule',
      type: 'string',
      description: 'e.g. Wednesdays · 7:00–8:30 PM ET · Zoom',
    }),
    defineField({
      name: 'seriesInclusions',
      title: 'Series inclusions (unused in band)',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Retained for Studio; the band no longer lists inclusions. Do not mention recordings (Phase 2).',
      hidden: true,
    }),
    defineField({
      name: 'seriesCtaLabel',
      title: 'Series CTA label',
      type: 'string',
    }),
    defineField({
      name: 'seriesPaymentLink',
      title: 'Series payment link',
      type: 'url',
      description:
        'Stripe Payment Link for the full-series pass. Required for the band CTA.',
    }),
    defineField({
      name: 'workshopDisclaimer',
      title: 'Workshop disclaimer',
      type: 'text',
      rows: 5,
      description:
        'Educational, not psychotherapy; no therapist-client relationship. Shown on workshop pages and at checkout.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site settings' }
    },
  },
})
