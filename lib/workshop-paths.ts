/** Canonical public paths for workshop surfaces (series-scoped).
 *
 * Phase 2 URL decision: the topic page owns `/workshops/[topic-slug]`.
 * Fall sessions keep the legacy slug (same as the topic slug) at
 * `/workshops/fall-2026/[slug]`. Today's flat `/workshops/[slug]` 301s to that
 * Fall session — Phase 2 must stop that 301 for topic slugs and serve the
 * topic page instead. Do not put a topic route at `/workshops/[series]/[slug]`.
 */

export function seriesPackagePath(seriesSlug: string) {
  return `/workshops/${seriesSlug}`
}

export function workshopPath(seriesSlug: string, workshopSlug: string) {
  return `/workshops/${seriesSlug}/${workshopSlug}`
}

export function workshopThankYouPath(seriesSlug: string, workshopSlug: string) {
  return `${workshopPath(seriesSlug, workshopSlug)}/thank-you`
}

export function workshopIcsPath(seriesSlug: string, workshopSlug: string) {
  return `${workshopPath(seriesSlug, workshopSlug)}/event.ics`
}
