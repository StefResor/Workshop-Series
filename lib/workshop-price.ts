import type { SiteSettings, Workshop } from '@/lib/types'

/**
 * Canonical per-session default from site settings.
 * Never invent a JSX fallback — return null when unset.
 */
export function resolveSessionPrice(
  settings: Pick<SiteSettings, 'sessionPrice'> | null | undefined,
): number | null {
  if (settings?.sessionPrice != null) return settings.sessionPrice
  return null
}

/**
 * Per-session override wins; otherwise site session default.
 * Never invent a JSX fallback — return null when neither is set.
 */
export function resolveWorkshopPrice(
  workshop: Pick<Workshop, 'price'>,
  settings: Pick<SiteSettings, 'sessionPrice'> | null | undefined,
): number | null {
  if (workshop.price != null) return workshop.price
  return resolveSessionPrice(settings)
}

/**
 * Subhead price clause. Session-only; never invent a dollar amount.
 */
export function workshopSeriesPriceClause(
  settings: Pick<SiteSettings, 'sessionPrice'> | null | undefined,
): string {
  const session = resolveSessionPrice(settings)
  if (session != null) return ` · $${session} per session`
  return ''
}

/**
 * Homepage / archive workshop-section spec line.
 * Prices and schedule come from Sanity display fields — never invent dollar amounts.
 * `editorialTail` is the only free-text segment (e.g. join rules · age).
 */
export function composeWorkshopSeriesSpecLine(opts: {
  sessionPrice: number | null
  scheduleLine?: string | null
  editorialTail?: string | null
}): string {
  const parts: string[] = ['Relational Diplomacy', 'Live']
  const schedule = opts.scheduleLine?.trim()
  if (schedule) parts.push(schedule)

  if (opts.sessionPrice != null) {
    parts.push(`$${opts.sessionPrice} per session`)
  }

  const tail = opts.editorialTail?.trim()
  if (tail) parts.push(tail)

  return parts.join(' · ')
}
