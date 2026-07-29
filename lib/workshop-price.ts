import type { SiteSettings, Workshop } from '@/lib/types'

/**
 * Per-session override wins; otherwise Site settings default.
 * Never invent a JSX fallback — return null when neither is set.
 */
export function resolveWorkshopPrice(
  workshop: Pick<Workshop, 'price'>,
  settings: Pick<SiteSettings, 'defaultWorkshopPrice'> | null | undefined,
): number | null {
  if (workshop.price != null) return workshop.price
  if (settings?.defaultWorkshopPrice != null) return settings.defaultWorkshopPrice
  return null
}
