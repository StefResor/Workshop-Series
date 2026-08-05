import { defineType, defineField } from 'sanity'

export const policy = defineType({
  name: 'policy',
  title: 'Policy',
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
      description:
        'Public URL is /{slug} (rewritten to /policies/{slug}). Use terms, privacy, etc.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 12,
      validation: (rule) => rule.required(),
      description:
        'Plain text with ## headings. Optional first line: "Effective date: …". Supports **bold**, [links](url), and - lists.',
    }),
    defineField({
      name: 'showInFooter',
      title: 'Show in footer',
      type: 'boolean',
      initialValue: false,
      description: 'When true, linked in the site footer and included in static generation.',
    }),
    defineField({
      name: 'footerOrder',
      title: 'Footer order',
      type: 'number',
      description: 'Lower numbers appear first among footer policy links.',
      hidden: ({ parent }) => !parent?.showInFooter,
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const parent = ctx.parent as { showInFooter?: boolean } | undefined
          if (parent?.showInFooter && (value == null || Number.isNaN(value))) {
            return 'Required when Show in footer is on'
          }
          return true
        }),
    }),
    defineField({
      name: 'footerLabel',
      title: 'Footer label',
      type: 'string',
      description: 'Short link text (e.g. “Terms”). Defaults to title.',
      hidden: ({ parent }) => !parent?.showInFooter,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      showInFooter: 'showInFooter',
    },
    prepare({ title, slug, showInFooter }) {
      return {
        title: title || 'Untitled policy',
        subtitle: showInFooter ? `${slug} · footer` : slug,
      }
    },
  },
})
