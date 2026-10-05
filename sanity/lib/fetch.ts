import { getReadClient } from './client'
import { etCalendarDate } from '@/lib/datetime'

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return getReadClient().fetch<T>(
    query,
    { today: etCalendarDate(), ...params },
    {
      next: { revalidate: 60 },
    },
  )
}
