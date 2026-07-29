import { defineType, defineField } from 'sanity'

export const workshop = defineType({
  name: 'workshop',
  title: 'Workshop',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sessionNumber',
      title: 'Session number',
      type: 'number',
      validation: (rule) => rule.required().min(1).max(10),
    }),
    defineField({
      name: 'startsAt',
      title: 'Starts at (UTC)',
      type: 'datetime',
      description: 'Store UTC from docs/workshop-schedule.md. Do not enter local wall time here.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endsAt',
      title: 'Ends at (UTC)',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'timeZone',
      title: 'Display time zone',
      type: 'string',
      initialValue: 'America/New_York',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hook',
      title: 'Hook',
      type: 'string',
      description: 'One-line summary for cards and social captions.',
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: 'price',
      title: 'Price override',
      type: 'number',
      description:
        'Optional per-participant USD override. Leave empty to use Site settings → Default workshop price.',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'stripePaymentLink',
      title: 'Stripe Payment Link',
      type: 'url',
      description: 'External Stripe Payment Link for this session.',
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity',
      type: 'number',
      description: 'Leave empty for unlimited.',
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: 'registrationStatus',
      title: 'Registration status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Open', value: 'open' },
          { title: 'Sold out', value: 'sold-out' },
          { title: 'Past', value: 'past' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Full description',
      type: 'text',
      rows: 12,
    }),
    defineField({
      name: 'status',
      title: 'Publish status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'zoomRegistrationUrl',
      title: 'Zoom registration URL',
      type: 'url',
      description:
        "Zoom's public registration page for this session. Do not store join links — those are per-registrant secrets issued by Zoom.",
    }),
    defineField({
      name: 'locationLabel',
      title: 'Location label',
      type: 'string',
      initialValue: 'Zoom',
    }),
  ],
  orderings: [
    {
      title: 'Session number',
      name: 'sessionNumberAsc',
      by: [{ field: 'sessionNumber', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      sessionNumber: 'sessionNumber',
      registrationStatus: 'registrationStatus',
      status: 'status',
    },
    prepare({ title, sessionNumber, registrationStatus, status }) {
      return {
        title: title || 'Untitled workshop',
        subtitle: `#${sessionNumber ?? '?'} · ${registrationStatus ?? 'draft'} · ${status ?? 'draft'}`,
      }
    },
  },
})
