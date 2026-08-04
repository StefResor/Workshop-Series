import type { StructureResolver } from 'sanity/structure'

const SINGLETONS = new Set(['siteSettings', 'emailSignup'])

/**
 * Site Settings group — singletons use fixed document IDs (no "Create new").
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('site-settings-group')
        .child(
          S.list()
            .title('Site Settings')
            .items([
              S.listItem()
                .title('Site settings')
                .id('siteSettings')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings'),
                ),
              S.listItem()
                .title('Email List Signup')
                .id('emailSignup')
                .child(
                  S.document()
                    .schemaType('emailSignup')
                    .documentId('emailSignup'),
                ),
            ]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return !id || !SINGLETONS.has(id)
      }),
    ])
