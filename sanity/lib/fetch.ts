import { getReadClient } from './client'

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return getReadClient().fetch<T>(query, params, {
    next: { revalidate: 60 },
  })
}
