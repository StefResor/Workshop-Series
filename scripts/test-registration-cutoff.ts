import assert from 'node:assert/strict'
import {
  openUpcoming,
  registrationClosesAt,
  registrationCutoffMinutes,
  registrationOpenAfter,
  sessionHasClosed,
  sessionIsOpen,
} from '../lib/catalogue'
import { matchPaymentLinkId } from '../lib/close-started-sessions'
import { formatCatalogueRegisterLabel } from '../lib/datetime'

assert.equal(registrationCutoffMinutes(), 0)

const start = '2026-10-28T23:00:00.000Z'
assert.equal(registrationClosesAt(start).toISOString(), start)

const before = new Date('2026-10-28T22:59:59.000Z')
const after = new Date('2026-10-28T23:00:00.000Z')
assert.equal(sessionHasClosed(start, before), false)
assert.equal(sessionHasClosed(start, after), true)

const open = {
  startsAt: start,
  registrationStatus: 'open' as const,
  stripePaymentLink: 'https://buy.stripe.com/test',
}
const sold = {
  startsAt: '2026-11-04T23:00:00.000Z',
  registrationStatus: 'sold-out' as const,
  stripePaymentLink: 'https://buy.stripe.com/sold',
}
const later = {
  startsAt: '2027-01-27T23:00:00.000Z',
  registrationStatus: 'open' as const,
  stripePaymentLink: 'https://buy.stripe.com/later',
}

assert.equal(sessionIsOpen(open, before), true)
assert.equal(sessionIsOpen(open, after), false)

const rolled = openUpcoming([open, sold, later], after)
assert.equal(rolled.length, 1)
assert.equal(rolled[0].startsAt, later.startsAt)

assert.equal(
  formatCatalogueRegisterLabel(start, 'America/New_York', before),
  'Tonight',
)
assert.equal(
  formatCatalogueRegisterLabel(later.startsAt, 'America/New_York', before),
  'Jan 27',
)

const after15 = new Date(new Date(start).getTime() - 15 * 60_000)
assert.ok(registrationOpenAfter(after).getTime() <= after.getTime())
assert.ok(registrationOpenAfter(after15).getTime() <= after15.getTime())

assert.equal(
  matchPaymentLinkId('https://buy.stripe.com/test', [
    { id: 'plink_1', url: 'https://buy.stripe.com/other' },
    { id: 'plink_2', url: 'https://buy.stripe.com/test' },
  ]),
  'plink_2',
)

console.log('registration cutoff assertion passed')
