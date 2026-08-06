import { defineType, defineField } from 'sanity'
import { isUniqueWorkshopSlug } from '../lib/isUniqueWorkshopSlug'

export const workshop = defineType({
  name: 'workshop',
  title: 'Workshop',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'schedule', title: 'Schedule' },
    { name: 'commerce', title: 'Commerce' },
    { name: 'private', title: 'Private' },
  ],
  fields: [
    defineField({
      name: 'series',
      title: 'Series',
      type: 'reference',
      to: [{ type: 'series' }],
      group: 'content',
      description:
        'The cohort this workshop belongs to. Determines pass eligibility, listing, and URL.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: isUniqueWorkshopSlug,
      },
      description:
        'Unique within its series. Must not match any series slug (/workshops/[x] collision).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sessionNumber',
      title: 'Workshop number',
      type: 'number',
      group: 'content',
      description:
        'Position in the series. Displays everywhere as "Workshop 01". Field name is legacy — do not rename without a content migration.',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'hook',
      title: 'Hook',
      type: 'string',
      group: 'content',
      description: 'One-line summary for cards, ICS, and social captions.',
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Full description',
      type: 'text',
      rows: 12,
      group: 'content',
    }),
    defineField({
      name: 'locationLabel',
      title: 'Location label',
      type: 'string',
      group: 'content',
      initialValue: 'Zoom',
    }),
    defineField({
      name: 'zoomRegistrationUrl',
      title: 'Zoom registration URL',
      type: 'url',
      group: 'content',
      description:
        "Zoom's public registration page for this session (may appear on the site/feeds). Meeting join URL and passcode belong in Private.",
    }),

    defineField({
      name: 'startsAt',
      title: 'Starts at (UTC)',
      type: 'datetime',
      group: 'schedule',
      description: 'Store UTC from docs/workshop-schedule.md. Do not enter local wall time here.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      group: 'schedule',
      initialValue: 90,
      description: 'End time is derived from Starts at + Duration.',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'timeZone',
      title: 'Display time zone',
      type: 'string',
      group: 'schedule',
      initialValue: 'America/New_York',
      options: {
        list: [
          { title: 'Eastern (America/New_York)', value: 'America/New_York' },
          { title: 'Central (America/Chicago)', value: 'America/Chicago' },
          { title: 'Mountain (America/Denver)', value: 'America/Denver' },
          { title: 'Pacific (America/Los_Angeles)', value: 'America/Los_Angeles' },
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'price',
      title: 'Price override',
      type: 'number',
      group: 'commerce',
      description:
        'Display only. The charged amount is set on the Stripe Payment Link.',
      readOnly: true,
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'stripePaymentLink',
      title: 'Stripe Payment Link',
      type: 'url',
      group: 'commerce',
      description: 'External Stripe Payment Link for this session.',
    }),
    defineField({
      name: 'registrationStatus',
      title: 'Registration status',
      type: 'string',
      group: 'commerce',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Open', value: 'open' },
          { title: 'Closed', value: 'closed' },
          { title: 'Sold out', value: 'sold-out' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      description:
        'Can buyers purchase this session. Past/upcoming is derived from Starts at — not set here.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity',
      type: 'number',
      group: 'commerce',
      description: 'Leave empty for unlimited.',
      validation: (rule) => rule.min(1).integer(),
    }),

    defineField({
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      group: 'private',
      hidden: true,
      readOnly: true,
      description: 'Deprecated — superseded by stripePaymentLink.',
    }),
    defineField({
      name: 'zoomLink',
      title: 'Zoom join URL',
      type: 'url',
      group: 'private',
      description:
        'Sent 8 days before the workshop and again on the day. Never published on the site.',
    }),
    defineField({
      name: 'zoomPasscode',
      title: 'Zoom passcode',
      type: 'string',
      group: 'private',
      description:
        'Sent 8 days before the workshop and again on the day. Never published on the site.',
    }),
  ],
  orderings: [
    {
      title: 'Session number',
      name: 'sessionNumberAsc',
      by: [{ field: 'sessionNumber', direction: 'asc' }],
    },
    {
      title: 'Starts at',
      name: 'startsAtAsc',
      by: [{ field: 'startsAt', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      sessionNumber: 'sessionNumber',
      registrationStatus: 'registrationStatus',
      seriesTitle: 'series.title',
    },
    prepare({ title, sessionNumber, registrationStatus, seriesTitle }) {
      return {
        title: title || 'Untitled workshop',
        subtitle: `${seriesTitle ?? 'No series'} · #${sessionNumber ?? '?'} · ${registrationStatus ?? 'draft'}`,
      }
    },
  },
})
