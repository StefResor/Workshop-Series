import type { StructureResolver } from 'sanity/structure'

const SINGLETONS = new Set(['siteSettings', 'emailSignup'])
/**
 * Hide auto-generated duplicates of types that have custom desk items.
 * Keep `workshop` visible until Fall docs are workshopSession — hiding it
 * before that migration leaves Stef unable to edit Fall. Hide `workshop` in
 * the same deploy that runs the type change.
 */
const HIDDEN_TYPES = new Set(['workshopTopic', 'workshopSession', ...SINGLETONS])

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
      S.listItem()
        .title('Workshop topics')
        .schemaType('workshopTopic')
        .child(
          S.documentTypeList('workshopTopic')
            .title('Workshop topics')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Sessions')
        .child(
          S.documentTypeList('series')
            .title('Sessions by series')
            .child((seriesId) =>
              S.documentList()
                .title('Sessions')
                .schemaType('workshopSession')
                .filter('_type == "workshopSession" && series._ref == $seriesId')
                .params({ seriesId })
                .defaultOrdering([{ field: 'startsAt', direction: 'asc' }]),
            ),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return !id || !HIDDEN_TYPES.has(id)
      }),
    ])
