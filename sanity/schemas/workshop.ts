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
      name: 'priceUSD',
      title: 'Price (USD)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
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
      title: 'Status',
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
      name: 'registrationUrl',
      title: 'Registration URL',
      type: 'url',
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
      status: 'status',
    },
    prepare({ title, sessionNumber, status }) {
      return {
        title: title || 'Untitled workshop',
        subtitle: `#${sessionNumber ?? '?'} · ${status ?? 'draft'}`,
      }
    },
  },
})
