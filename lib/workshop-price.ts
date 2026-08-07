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
 * Prefer `passPrice` (active series) over legacy `settings.seriesPrice`.
 */
export function workshopSeriesPriceClause(
  settings:
    | Pick<SiteSettings, 'sessionPrice' | 'defaultWorkshopPrice' | 'seriesPrice'>
    | null
    | undefined,
  passPrice?: number | null,
): string {
  const session = resolveSessionPrice(settings)
  const series = passPrice != null ? passPrice : settings?.seriesPrice
  if (session != null && series != null) {
    return ` · $${session} per session, or $${series} for the full series`
  }
  if (session != null) {
    return ` · $${session} per session`
  }
  if (series != null) {
    return ` · $${series} for the full series`
  }
  return ''
}

/**
 * Homepage / archive workshop-section spec line.
 * Prices and schedule come from Sanity display fields — never invent dollar amounts.
 * `editorialTail` is the only free-text segment (e.g. join rules · age).
 */
export function composeWorkshopSeriesSpecLine(opts: {
  sessionPrice: number | null
  passPrice: number | null
  scheduleLine?: string | null
  editorialTail?: string | null
}): string {
  const parts: string[] = ['Relational Diplomacy', 'Live']
  const schedule = opts.scheduleLine?.trim()
  if (schedule) parts.push(schedule)

  const { sessionPrice, passPrice } = opts
  if (sessionPrice != null && passPrice != null) {
    parts.push(
      `$${sessionPrice} per session, or $${passPrice} for the full series`,
    )
  } else if (sessionPrice != null) {
    parts.push(`$${sessionPrice} per session`)
  } else if (passPrice != null) {
    parts.push(`$${passPrice} for the full series`)
  }

  const tail = opts.editorialTail?.trim()
  if (tail) parts.push(tail)

  return parts.join(' · ')
}
