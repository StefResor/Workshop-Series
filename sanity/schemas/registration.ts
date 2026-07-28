import { defineType, defineField } from 'sanity'

export const registration = defineType({
  name: 'registration',
  title: 'Registration',
  type: 'document',
  fields: [
    defineField({
      name: 'workshop',
      title: 'Workshop',
      type: 'reference',
      to: [{ type: 'workshop' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'firstName',
      title: 'First name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Last name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe session ID',
      type: 'string',
    }),
    defineField({
      name: 'amountPaid',
      title: 'Amount paid (USD)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'purchasedAt',
      title: 'Purchased at',
      type: 'datetime',
    }),
    defineField({
      name: 'approvedInZoom',
      title: 'Approved in Zoom',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 4,
    }),
  ],
  orderings: [
    {
      title: 'Purchased at, newest',
      name: 'purchasedAtDesc',
      by: [{ field: 'purchasedAt', direction: 'desc' }],
    },
    {
      title: 'Purchased at, oldest',
      name: 'purchasedAtAsc',
      by: [{ field: 'purchasedAt', direction: 'asc' }],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [
        { field: 'lastName', direction: 'asc' },
        { field: 'firstName', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      workshopTitle: 'workshop->title',
      purchasedAt: 'purchasedAt',
      approvedInZoom: 'approvedInZoom',
    },
    prepare({ firstName, lastName, workshopTitle, purchasedAt, approvedInZoom }) {
      const name =
        [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed registrant'
      const when = purchasedAt
        ? new Date(purchasedAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : 'no purchase date'
      const zoom = approvedInZoom ? 'Zoom ✓' : 'Zoom pending'
      return {
        title: name,
        subtitle: `${workshopTitle || 'No workshop'} · ${when} · ${zoom}`,
      }
    },
  },
})
