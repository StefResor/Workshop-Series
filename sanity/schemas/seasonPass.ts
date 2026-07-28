import { defineType, defineField } from 'sanity'

export const seasonPass = defineType({
  name: 'seasonPass',
  title: 'Season pass',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in USD.',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'stripePaymentLink',
      title: 'Stripe Payment Link',
      type: 'url',
    }),
    defineField({
      name: 'includedWorkshops',
      title: 'Included workshops',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'workshop' }] }],
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      active: 'active',
    },
    prepare({ title, price, active }) {
      return {
        title: title || 'Untitled season pass',
        subtitle: `${price != null ? `$${price}` : 'no price'} · ${active === false ? 'inactive' : 'active'}`,
      }
    },
  },
})
