/**
 * Workshop datetime formatting.
 * Stored values are UTC ISO. Display uses America/New_York.
 * Public label is always "ET" — never EDT/EST.
 */

export const DISPLAY_TIME_ZONE = 'America/New_York'
export const DISPLAY_TIME_ZONE_LABEL = 'ET'

export type DisplayDateTime = {
  /** e.g. "7:00 PM" */
  time: string
  /** Always "ET" on public surfaces */
  timeZoneName: string
  /** e.g. "Wednesday" */
  weekday: string
  /** e.g. "September" */
  month: string
  /** e.g. "Jan" */
  monthShort: string
  day: number
  year: number
  /** e.g. "Wednesday, September 9, 2026" */
  date: string
  /** e.g. "7:00 PM ET" */
  timeWithZone: string
}

function parseUtc(utcIso: string): Date {
  const date = new Date(utcIso)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid UTC datetime: ${utcIso}`)
  }
  return date
}

/** Format a stored UTC instant for on-site display in America/New_York. */
export function formatWorkshopDisplay(
  utcIso: string,
  timeZone: string = DISPLAY_TIME_ZONE,
): DisplayDateTime {
  const date = parseUtc(utcIso)

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).formatToParts(date)

  const shortMonth = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const hour = get('hour')
  const minute = get('minute')
  const dayPeriod = get('dayPeriod')
  const weekday = get('weekday')
  const month = get('month')
  const monthShort =
    shortMonth.find((p) => p.type === 'month')?.value.replace(/\.$/, '') ??
    month.slice(0, 3)
  const day = Number(get('day'))
  const year = Number(get('year'))
  const time = `${hour}:${minute} ${dayPeriod}`

  return {
    time,
    timeZoneName: DISPLAY_TIME_ZONE_LABEL,
    weekday,
    month,
    monthShort,
    day,
    year,
    date: `${weekday}, ${month} ${day}, ${year}`,
    timeWithZone: `${time} ${DISPLAY_TIME_ZONE_LABEL}`,
  }
}

/** Catalogue / Register label, e.g. "Jan 27". */
export function formatCatalogueDate(
  utcIso: string,
  timeZone: string = DISPLAY_TIME_ZONE,
): string {
  const d = formatWorkshopDisplay(utcIso, timeZone)
  return `${d.monthShort} ${d.day}`
}

/** Register CTA label: "Tonight" when the session is still today in ET. */
export function formatCatalogueRegisterLabel(
  utcIso: string,
  timeZone: string = DISPLAY_TIME_ZONE,
  now: Date = new Date(),
): string {
  if (etCalendarDate(parseUtc(utcIso)) === etCalendarDate(now)) {
    return 'Tonight'
  }
  return formatCatalogueDate(utcIso, timeZone)
}

/**
 * Format a stored UTC instant for iCalendar DTSTART/DTEND.
 * Always emits basic UTC with Z suffix (VALUE=DATE-TIME in UTC).
 * Example: 20260909T230000Z
 */
export function formatWorkshopIcsUtc(utcIso: string): string {
  const date = parseUtc(utcIso)
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mm = String(date.getUTCMinutes()).padStart(2, '0')
  const ss = String(date.getUTCSeconds()).padStart(2, '0')
  return `${y}${m}${d}T${hh}${mm}${ss}Z`
}

/** America/New_York calendar date as YYYY-MM-DD — used for series startsOn/endsOn windows. */
export function etCalendarDate(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(at)
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  if (!year || !month || !day) {
    throw new Error('Could not format America/New_York calendar date')
  }
  return `${year}-${month}-${day}`
}
