import { defineType, defineField, defineArrayMember } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
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
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'lede',
      title: 'Lede',
      type: 'text',
      rows: 3,
      description:
        'Opening recognition line for The Practice — shown larger and in full ink.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body paragraphs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'paragraph',
          title: 'Paragraph',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'text' },
          },
        }),
      ],
      description: 'Supporting paragraphs under the lede. One item = one paragraph.',
      validation: (rule) => rule.min(1).max(4),
    }),
    defineField({
      name: 'priceUSD',
      title: 'Price (USD)',
      type: 'number',
      description: 'CONFIRM WITH STEF — homepage canonical until Bookings conflicts resolved.',
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', order: 'order', priceUSD: 'priceUSD' },
    prepare({ title, order, priceUSD }) {
      return {
        title: title || 'Untitled service',
        subtitle: `#${order ?? '?'} · ${priceUSD != null ? `$${priceUSD}` : 'no price'}`,
      }
    },
  },
})
