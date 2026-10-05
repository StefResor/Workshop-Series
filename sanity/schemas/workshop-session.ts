import { defineField, defineType } from 'sanity'
import { isUniqueWorkshopSlug } from '../lib/isUniqueWorkshopSlug'

export const workshopSession = defineType({
  name: 'workshopSession',
  title: 'Workshop session',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'schedule', title: 'Schedule' },
    { name: 'commerce', title: 'Commerce' },
    { name: 'private', title: 'Private' },
  ],
  fields: [
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'reference',
      to: [{ type: 'workshopTopic' }],
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'reference',
      to: [{ type: 'series' }],
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'topic.slug.current',
        maxLength: 96,
        isUnique: isUniqueWorkshopSlug,
      },
      description:
        'Fall keeps the legacy topic slug so URLs stay put. Later seasons use {topic-slug}-{yyyy-mm-dd}. Unique within the series.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sessionNumber',
      title: 'Workshop number',
      type: 'number',
      group: 'content',
      description:
        'Copied from the topic order. Displays as "Workshop 01". Keep in sync with topic.order.',
      validation: (rule) => rule.required().integer().min(1),
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
    }),
    defineField({
      name: 'startsAt',
      title: 'Starts at (UTC)',
      type: 'datetime',
      group: 'schedule',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      group: 'schedule',
      initialValue: 90,
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
      description: 'Display only. Leave empty to use the site default ($47).',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'stripePaymentLink',
      title: 'Stripe Payment Link',
      type: 'url',
      group: 'commerce',
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
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
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
    }),
    defineField({
      name: 'zoomLink',
      title: 'Zoom join URL',
      type: 'url',
      group: 'private',
    }),
    defineField({
      name: 'zoomPasscode',
      title: 'Zoom passcode',
      type: 'string',
      group: 'private',
    }),
  ],
  orderings: [
    {
      title: 'Starts at',
      name: 'startsAtAsc',
      by: [{ field: 'startsAt', direction: 'asc' }],
    },
    {
      title: 'Workshop number',
      name: 'sessionNumberAsc',
      by: [{ field: 'sessionNumber', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      topicTitle: 'topic.title',
      registrationStatus: 'registrationStatus',
      seriesTitle: 'series.title',
      startsAt: 'startsAt',
    },
    prepare({ topicTitle, registrationStatus, seriesTitle, startsAt }) {
      const when = startsAt
        ? new Date(startsAt)
            .toLocaleDateString('en-US', {
              timeZone: 'America/New_York',
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })
            .replace(/,/g, '')
        : 'no date'
      return {
        title: `${when} · ${topicTitle || 'Untitled session'}`,
        subtitle: `${seriesTitle ?? 'No series'} · ${registrationStatus ?? 'draft'}`,
      }
    },
  },
})
