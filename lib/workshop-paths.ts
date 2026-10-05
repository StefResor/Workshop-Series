/** Canonical public paths for workshop surfaces (series-scoped).
 *
 * Topic page owns `/workshops/[topic-slug]`. Fall sessions stay at
 * `/workshops/fall-2026/[slug]` until those docs are workshopSession.
 */

export function seriesPackagePath(seriesSlug: string) {
  return `/workshops/${seriesSlug}`
}

export function topicPath(topicSlug: string) {
  return `/workshops/${topicSlug}`
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
