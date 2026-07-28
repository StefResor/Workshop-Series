/**
 * Back-compat wrapper around lib/datetime.ts for earlier seed/test code.
 * Prefer importing from lib/datetime.ts in new code.
 */
import {
  DISPLAY_TIME_ZONE,
  formatWorkshopDisplay,
  type DisplayDateTime,
} from './datetime'

export { DISPLAY_TIME_ZONE }

export type LocalWorkshopParts = {
  hour12: number
  minute: number
  dayPeriod: string
  timeZoneName: string
  weekday: string
  month: string
  day: number
  year: number
  timeLabel: string
  dateLabel: string
}

export function getLocalWorkshopParts(
  utcIso: string,
  timeZone: string = DISPLAY_TIME_ZONE,
): LocalWorkshopParts {
  const d: DisplayDateTime = formatWorkshopDisplay(utcIso, timeZone)
  const [timePart, dayPeriod] = d.time.split(' ')
  const [hourStr, minuteStr] = timePart.split(':')
  return {
    hour12: Number(hourStr),
    minute: Number(minuteStr),
    dayPeriod: dayPeriod || '',
    timeZoneName: d.timeZoneName,
    weekday: d.weekday,
    month: d.month,
    day: d.day,
    year: d.year,
    timeLabel: d.time,
    dateLabel: d.date,
  }
}
