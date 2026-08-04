import { defineField, defineType } from 'sanity'

export const emailSignup = defineType({
  name: 'emailSignup',
  title: 'Email List Signup',
  type: 'document',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show signup on site',
      type: 'boolean',
      initialValue: true,
    }),

    // Band (home page)
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'Stay in touch',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Workshop updates',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'body',
      title: 'Body copy',
      type: 'text',
      rows: 2,
      initialValue:
        'Announcements for the workshop series — dates, topics, and when registration opens.',
      validation: (rule) => rule.max(160),
    }),

    // Form chrome
    defineField({
      name: 'nameLabel',
      title: 'First name field label',
      type: 'string',
      initialValue: 'First name',
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: 'emailLabel',
      title: 'Email field label',
      type: 'string',
      initialValue: 'Email',
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: 'checkboxLabel',
      title: 'Opt-in checkbox label',
      type: 'string',
      initialValue: 'Also send me blog posts and practice updates',
      description:
        'Secondary opt-in to the Blog & Practice Updates list. Unchecked by default.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button label',
      type: 'string',
      initialValue: 'Subscribe',
      validation: (rule) => rule.max(24),
    }),
    defineField({
      name: 'permissionLine',
      title: 'Permission line',
      type: 'text',
      rows: 2,
      description:
        'Shown below the button. Must state what subscribers receive and that they can unsubscribe.',
      initialValue:
        "A few emails a month. Unsubscribe anytime. This list isn't a way to reach Stefanie about therapy — use the consultation form for that.",
      validation: (rule) => rule.required().max(180),
    }),

    // States
    defineField({
      name: 'successMessage',
      title: 'Success message',
      type: 'text',
      rows: 2,
      initialValue:
        "You're on the list. Workshop announcements will come to this address.",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error message',
      type: 'text',
      rows: 2,
      initialValue:
        "That didn't go through. Check the email address and try again.",
      validation: (rule) => rule.required().max(160),
    }),

    // Footer variant
    defineField({
      name: 'showInFooter',
      title: 'Show compact version in footer',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'footerHeading',
      title: 'Footer heading',
      type: 'string',
      initialValue: 'Workshop announcements',
      validation: (rule) => rule.max(48),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: 'Email List Signup',
      subtitle: title,
    }),
  },
})
