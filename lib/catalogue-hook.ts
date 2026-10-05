/** Spec cap on workshopTopic.hook. shortDescription is longer (up to 124). */

export const CATALOGUE_HOOK_MAX = 90

/**
 * Catalogue one-liner. Hook only — shortDescription is not a fallback.
 *
 * Phase 1 homepage/archive still use `hook || shortDescription` so cards do
 * not go blank (hooks are empty today). Phase 2 must call this instead, and
 * Stef needs real hooks for the two topics whose short descriptions exceed 90
 * characters (workshop 03 and 08).
 */
export function catalogueHook(input: {
  hook?: string | null
  shortDescription?: string | null
}): string | undefined {
  const hook = input.hook?.trim()
  if (hook) return hook.slice(0, CATALOGUE_HOOK_MAX)
  return undefined
}
