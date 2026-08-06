import type { SlugValidationContext } from 'sanity'

/**
 * Workshop slugs are unique within a series — Fall and Winter may reuse the
 * same title/slug. They must also never collide with a series slug, because
 * `/workshops/[x]` resolves series package pages before workshop redirects.
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
  const collision = await client.fetch<{
    workshopDup: number
    seriesHit: number
  }>(
    `{
      "workshopDup": count(*[
        _type == "workshop" &&
        slug.current == $slug &&
        series._ref == $series &&
        !(_id in [$published, $draft])
      ]),
      "seriesHit": count(*[_type == "series" && slug.current == $slug])
    }`,
    {
      slug,
      series: seriesRef,
      published: id,
      draft: `drafts.${id}`,
    },
  )
  return collision.workshopDup === 0 && collision.seriesHit === 0
}

/**
 * Series slugs are globally unique among series docs, and must not match any
 * workshop slug (same `/workshops/[x]` collision).
 */
export async function isUniqueSeriesSlug(
  slug: string | undefined,
  context: SlugValidationContext,
) {
  const { document, getClient } = context
  if (!slug || !document?._id) return true

  const client = getClient({ apiVersion: '2026-07-27' })
  const id = document._id.replace(/^drafts\./, '')
  const collision = await client.fetch<{
    seriesDup: number
    workshopHit: number
  }>(
    `{
      "seriesDup": count(*[
        _type == "series" &&
        slug.current == $slug &&
        !(_id in [$published, $draft])
      ]),
      "workshopHit": count(*[_type == "workshop" && slug.current == $slug])
    }`,
    {
      slug,
      published: id,
      draft: `drafts.${id}`,
    },
  )
  return collision.seriesDup === 0 && collision.workshopHit === 0
}
