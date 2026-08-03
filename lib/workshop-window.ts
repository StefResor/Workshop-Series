/**
 * Credential-delivery window relative to a workshop's stored UTC start.
 * Compare against Date.now() in UTC — never derive the calendar date from
 * startsAt.slice(0,10) (sessions 9–10 cross midnight UTC after DST ends).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Fractional days from `nowMs` until `startsAt` (UTC ISO). Negative if past. */
export function daysUntilStartsAt(
  startsAtUtc: string,
  nowMs: number = Date.now(),
): number {
  const startMs = new Date(startsAtUtc).getTime()
  if (Number.isNaN(startMs)) {
    throw new Error(`Invalid UTC datetime: ${startsAtUtc}`)
  }
  return (startMs - nowMs) / MS_PER_DAY
}

/**
 * Credentials are due when the session is 8 days away or fewer
 * (including already-started / past sessions).
 */
export function credentialsDueWithinWindow(
  startsAtUtc: string,
  nowMs: number = Date.now(),
): boolean {
  return daysUntilStartsAt(startsAtUtc, nowMs) <= 8
}
