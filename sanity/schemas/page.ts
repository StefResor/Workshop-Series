import { defineType, defineField } from 'sanity'

function pageSlugCurrent(document: unknown): string | undefined {
  if (!document || typeof document !== 'object') return undefined
  const slug = (document as { slug?: { current?: unknown } }).slug
  return typeof slug?.current === 'string' ? slug.current : undefined
}

function isHomePage(document: unknown): boolean {
  return pageSlugCurrent(document) === 'home'
}

export const page = defineType({
  name: 'page',
  title: 'Page',
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
      name: 'eyebrow',
      title: 'Eyebrow / kicker',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description:
        'Used on About, Approach, Fees, etc. Deprecated on the home page — use Hero solid / outline below.',
      hidden: ({ document }) => isHomePage(document),
    }),
    defineField({
      name: 'heroSolid',
      title: 'Hero solid',
      type: 'string',
      description: 'Home hero — solid ink part (e.g. Notice).',
      hidden: ({ document }) => !isHomePage(document),
    }),
    defineField({
      name: 'heroOutline',
      title: 'Hero outline',
      type: 'string',
      description: 'Home hero — outline treatment (e.g. * or Better.).',
      hidden: ({ document }) => !isHomePage(document),
    }),
    defineField({
      name: 'heroJoin',
      title: 'Hero join',
      type: 'string',
      initialValue: 'break',
      options: {
        list: [
          { title: 'Line break', value: 'break' },
          { title: 'Space', value: 'space' },
          { title: 'None', value: 'none' },
        ],
        layout: 'radio',
      },
      description:
        'How the two parts join. Line break stacks them (current layout). None joins them directly, for marks like Notice*. Space puts them on one line with a space.',
      hidden: ({ document }) => !isHomePage(document),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 16,
      description: 'Plain-text paragraphs separated by blank lines.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA href',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare({ title, slug }) {
      return {
        title: title || 'Untitled page',
        subtitle: slug ? `/${slug}` : undefined,
      }
    },
  },
})
