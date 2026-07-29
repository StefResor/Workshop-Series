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
      title: 'Default workshop price',
      type: 'number',
      description:
        'Default per-participant USD for workshops when a session has no override.',
      validation: (rule) => rule.required().min(0),
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
