import type { SlugValidationContext } from 'sanity'

/**
 * Workshop slugs are unique within a series, not globally — Fall and Winter
 * may reuse the same title/slug.
 */
export async function isUniqueWorkshopSlug(
  slug: string | undefined,
  context: SlugValidationContext,
) {
  const { document, getClient } = context
  const seriesRef = (document?.series as { _ref?: string } | undefined)?._ref
  if (!slug || !seriesRef || !document?._id) return true

  const client = getClient({ apiVersion: '2026-07-27' })
  const id = document._id.replace(/^drafts\./, '')
  const count = await client.fetch<number>(
    `count(*[
      _type == "workshop" &&
      slug.current == $slug &&
      series._ref == $series &&
      !(_id in [$published, $draft])
    ])`,
    {
      slug,
      series: seriesRef,
      published: id,
      draft: `drafts.${id}`,
    },
  )
  return count === 0
}
