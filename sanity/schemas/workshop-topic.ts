import { defineField, defineType } from 'sanity'

export const workshopTopic = defineType({
  name: 'workshopTopic',
  title: 'Workshop topic',
  type: 'document',
  groups: [{ name: 'content', title: 'Content', default: true }],
  fields: [
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
      options: { source: 'title', maxLength: 96 },
      description: 'Stable across seasons. Reused by every session of this topic.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Curriculum order',
      type: 'number',
      group: 'content',
      description: '1–10. Displays as "Workshop 01".',
      validation: (rule) => rule.required().integer().min(1).max(10),
    }),
    defineField({
      name: 'hook',
      title: 'Hook',
      type: 'string',
      group: 'content',
      description:
        'One-line summary for catalogue rows and cards. Max 90 characters. Short descriptions run longer and must not be used as a fallback.',
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
      name: 'description',
      title: 'Full description',
      type: 'text',
      rows: 12,
      group: 'content',
      description:
        'Plain-text paragraphs (same as the previous workshop body). Portable text can wait; Phase 1 must not change the public page.',
    }),
  ],
  orderings: [
    {
      title: 'Curriculum order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare({ title, order }) {
      const n = order != null ? String(order).padStart(2, '0') : '??'
      return {
        title: title || 'Untitled topic',
        subtitle: `Workshop ${n}`,
      }
    },
  },
})
