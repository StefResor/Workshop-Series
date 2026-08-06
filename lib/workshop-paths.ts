/** Canonical public paths for workshop surfaces (series-scoped). */

export function workshopPath(seriesSlug: string, workshopSlug: string) {
  return `/workshops/${seriesSlug}/${workshopSlug}`
}

export function workshopThankYouPath(seriesSlug: string, workshopSlug: string) {
  return `${workshopPath(seriesSlug, workshopSlug)}/thank-you`
}

export function workshopIcsPath(seriesSlug: string, workshopSlug: string) {
  return `${workshopPath(seriesSlug, workshopSlug)}/event.ics`
}
