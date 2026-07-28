/** Canonical site origin helpers for SEO metadata, feeds, and JSON-LD. */

export function siteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://stefanie-schumacher.com'
  const trimmed = raw.replace(/\/$/, '')
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
}

export function absoluteUrl(path = '/'): string {
  const origin = siteOrigin()
  if (!path || path === '/') return origin
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
