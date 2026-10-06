export function matchPaymentLinkId(
  url: string | undefined,
  links: Array<{ id: string; url: string }>,
): string | undefined {
  if (!url) return undefined
  return links.find((link) => link.url === url)?.id
}

export type StartedSession = {
  _id: string
  registrationStatus?: string
  stripePaymentLink?: string
  startsAt: string
  slug?: string
  seriesSlug?: string
}
