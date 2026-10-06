import type { Workshop } from '@/lib/types'

export const HOME_SESSION_CAP = 5

/** Minutes after startsAt when registration closes. 0 = at start time. */
export function registrationCutoffMinutes(): number {
  const raw = process.env.REGISTRATION_CUTOFF_MINUTES
  if (raw == null || raw.trim() === '') return 0
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function registrationClosesAt(startsAt: string): Date {
  return new Date(
    new Date(startsAt).getTime() + registrationCutoffMinutes() * 60_000,
  )
}

/** GROQ bound: sessions with startsAt after this instant are still open on time. */
export function registrationOpenAfter(now: Date = new Date()): Date {
  return new Date(now.getTime() - registrationCutoffMinutes() * 60_000)
}

export function sessionHasClosed(
  startsAt: string,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= registrationClosesAt(startsAt).getTime()
}

type OpenFields = Pick<
  Workshop,
  'registrationStatus' | 'stripePaymentLink' | 'startsAt' | 'isPast'
>

export function sessionIsOpen(
  session: OpenFields,
  now: Date = new Date(),
): boolean {
  const closedByTime =
    session.startsAt != null
      ? sessionHasClosed(session.startsAt, now)
      : Boolean(session.isPast)
  return (
    session.registrationStatus === 'open' &&
    !closedByTime &&
    Boolean(session.stripePaymentLink)
  )
}

export function sessionRegisterHref(
  session: OpenFields,
  now: Date = new Date(),
): string | null {
  return sessionIsOpen(session, now) ? session.stripePaymentLink || null : null
}

export function openUpcoming<T extends OpenFields & { startsAt: string }>(
  sessions: T[] | undefined,
  now: Date = new Date(),
): T[] {
  return (sessions || [])
    .filter((session) => sessionIsOpen(session, now))
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
}
