import type { StructureResolver } from 'sanity/structure'

type StructureBuilder = Parameters<StructureResolver>[0]

const SINGLETONS = new Set(['siteSettings', 'emailSignup'])
/**
 * Hide auto-generated duplicates of types that have custom desk items.
 * `workshop` is retired — Fall docs are workshopSession.
 * `series` lives under Schedule, not as its own sidebar item.
 */
const HIDDEN_TYPES = new Set([
  'workshopTopic',
  'workshopSession',
  'workshop',
  'series',
  'registration',
  ...SINGLETONS,
])

function topicPane(S: StructureBuilder, topicId: string) {
  return S.list()
    .title('Workshop')
    .items([
      S.listItem()
        .title('Topic')
        .id('topic')
        .child(S.document().schemaType('workshopTopic').documentId(topicId)),
      S.listItem()
        .title('Dates')
        .id('dates')
        .child(
          S.documentList()
            .title('Dates')
            .schemaType('workshopSession')
            .filter('_type == "workshopSession" && topic._ref == $topicId')
            .params({ topicId })
            .defaultOrdering([{ field: 'startsAt', direction: 'asc' }]),
        ),
    ])
}

function seriesPane(S: StructureBuilder, seriesId: string) {
  return S.list()
    .title('Season')
    .items([
      S.listItem()
        .title('Season')
        .id('season')
        .child(S.document().schemaType('series').documentId(seriesId)),
      S.listItem()
        .title('Dates')
        .id('dates')
        .child(
          S.documentList()
            .title('Dates')
            .schemaType('workshopSession')
            .filter('_type == "workshopSession" && series._ref == $seriesId')
            .params({ seriesId })
            .defaultOrdering([{ field: 'startsAt', direction: 'asc' }]),
        ),
    ])
}

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
        .title('Workshops')
        .id('workshops')
        .schemaType('workshopTopic')
        .child(
          S.documentTypeList('workshopTopic')
            .title('Workshops')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
            .child((topicId) => topicPane(S, topicId)),
        ),
      S.listItem()
        .title('Schedule')
        .id('schedule')
        .child(
          S.documentTypeList('series')
            .title('Schedule')
            .defaultOrdering([{ field: 'startsOn', direction: 'asc' }])
            .child((seriesId) => seriesPane(S, seriesId)),
        ),
      S.listItem()
        .title('Registrations')
        .child(
          S.list()
            .title('Registrations')
            .items([
              S.listItem()
                .title('Live')
                .id('registrations-live')
                .child(
                  S.documentList()
                    .title('Live')
                    .schemaType('registration')
                    .filter('_type == "registration" && testMode != true')
                    .defaultOrdering([
                      { field: 'registeredAt', direction: 'desc' },
                    ]),
                ),
              S.listItem()
                .title('Test')
                .id('registrations-test')
                .child(
                  S.documentList()
                    .title('Test')
                    .schemaType('registration')
                    .filter('_type == "registration" && testMode == true')
                    .defaultOrdering([
                      { field: 'registeredAt', direction: 'desc' },
                    ]),
                ),
            ]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return !id || !HIDDEN_TYPES.has(id)
      }),
    ])
