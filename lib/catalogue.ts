import type { Workshop } from '@/lib/types'

export const HOME_SESSION_CAP = 5

export function sessionIsOpen(
  session: Pick<Workshop, 'registrationStatus' | 'isPast' | 'stripePaymentLink'>,
) {
  return (
    session.registrationStatus === 'open' &&
    !session.isPast &&
    Boolean(session.stripePaymentLink)
  )
}

export function sessionRegisterHref(
  session: Pick<Workshop, 'registrationStatus' | 'isPast' | 'stripePaymentLink'>,
): string | null {
  return sessionIsOpen(session) ? session.stripePaymentLink || null : null
}
