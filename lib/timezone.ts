/**
 * Workshop display helpers for America/New_York.
 * Never format workshop calendar dates in UTC — sessions 9–10 fall on the next UTC day.
 */

export const DISPLAY_TIME_ZONE = 'America/New_York'

export type LocalWorkshopParts = {
  hour12: number
  minute: number
  dayPeriod: string
  timeZoneName: string
  weekday: string
  month: string
  day: number
  year: number
  /** e.g. "7:00 PM" */
  timeLabel: string
  /** e.g. "Wednesday, November 11, 2026" */
  dateLabel: string
}

export function getLocalWorkshopParts(
  utcIso: string,
  timeZone: string = DISPLAY_TIME_ZONE,
): LocalWorkshopParts {
  const date = new Date(utcIso)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid UTC datetime: ${utcIso}`)
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value

  const hour12 = Number(get('hour'))
  const minute = Number(get('minute'))
  const dayPeriod = get('dayPeriod') || ''
  const timeZoneName = get('timeZoneName') || ''
  const weekday = get('weekday') || ''
  const month = get('month') || ''
  const day = Number(get('day'))
  const year = Number(get('year'))

  return {
    hour12,
    minute,
    dayPeriod,
    timeZoneName,
    weekday,
    month,
    day,
    year,
    timeLabel: `${hour12}:${String(minute).padStart(2, '0')} ${dayPeriod}`,
    dateLabel: `${weekday}, ${month} ${day}, ${year}`,
  }
}
