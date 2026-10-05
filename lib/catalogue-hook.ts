/** Spec cap on workshopTopic.hook. shortDescription is longer (up to 124). */

export const CATALOGUE_HOOK_MAX = 90

/**
 * Catalogue one-liner. Prefer hook; shortDescription only until Stef fills hooks.
 */
export function catalogueHook(input: {
  hook?: string | null
  shortDescription?: string | null
}): string | undefined {
  const hook = input.hook?.trim()
  if (hook) return hook.slice(0, CATALOGUE_HOOK_MAX)
  const fallback = input.shortDescription?.trim()
  if (fallback) return fallback
  return undefined
}
