import type { SiteSettings, Workshop } from '@/lib/types'

/**
 * Canonical per-session default from site settings.
 * Prefer sessionPrice; fall back to legacy defaultWorkshopPrice.
 * Never invent a JSX fallback — return null when unset.
 */
export function resolveSessionPrice(
  settings: Pick<SiteSettings, 'sessionPrice' | 'defaultWorkshopPrice'> | null | undefined,
): number | null {
  if (settings?.sessionPrice != null) return settings.sessionPrice
  if (settings?.defaultWorkshopPrice != null) return settings.defaultWorkshopPrice
  return null
}

/**
 * Per-session override wins; otherwise site session default.
 * Never invent a JSX fallback — return null when neither is set.
 */
export function resolveWorkshopPrice(
  workshop: Pick<Workshop, 'price'>,
  settings:
    | Pick<SiteSettings, 'sessionPrice' | 'defaultWorkshopPrice'>
    | null
    | undefined,
): number | null {
  if (workshop.price != null) return workshop.price
  return resolveSessionPrice(settings)
}

/**
 * Subhead price clause. Full dual pricing only when both figures exist;
 * otherwise session-only, or empty (never hardcode).
 */
export function workshopSeriesPriceClause(
  settings:
    | Pick<SiteSettings, 'sessionPrice' | 'defaultWorkshopPrice' | 'seriesPrice'>
    | null
    | undefined,
): string {
  const session = resolveSessionPrice(settings)
  const series = settings?.seriesPrice
  if (session != null && series != null) {
    return ` · $${session} per session, or $${series} for the full series`
  }
  if (session != null) {
    return ` · $${session} per session`
  }
  return ''
}
