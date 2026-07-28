import assert from 'node:assert/strict'
import { formatWorkshopDisplay } from '../lib/datetime'

// Verbatim from docs/workshop-schedule.md
const SESSION_1_START = '2026-09-09T23:00:00.000Z'
const SESSION_10_START = '2026-11-12T00:00:00.000Z'

const session1 = formatWorkshopDisplay(SESSION_1_START)
const session10 = formatWorkshopDisplay(SESSION_10_START)

assert.equal(session1.time, '7:00 PM')
assert.equal(session1.weekday, 'Wednesday')
assert.equal(session1.day, 9)
assert.equal(session1.month, 'September')
assert.equal(session1.year, 2026)

assert.equal(session10.time, '7:00 PM')
assert.equal(session10.weekday, 'Wednesday')
assert.equal(session10.day, 11)
assert.equal(session10.month, 'November')
assert.equal(session10.year, 2026)

// Labels must differ (EDT vs EST) and come from Intl — never hardcoded in formatters.
assert.notEqual(session1.timeZoneName, session10.timeZoneName)
assert.match(session1.timeZoneName, /^E[DS]T$/)
assert.match(session10.timeZoneName, /^E[DS]T$/)
assert.equal(session1.timeZoneName, 'EDT')
assert.equal(session10.timeZoneName, 'EST')

// Guard the failure mode: UTC date of session 10 is the following day.
assert.equal(SESSION_10_START.slice(0, 10), '2026-11-12')
assert.notEqual(session10.day, 12)

console.log('timezone assertion passed:')
console.log(
  `  session 1  → ${session1.date} · ${session1.time} ${session1.timeZoneName}`,
)
console.log(
  `  session 10 → ${session10.date} · ${session10.time} ${session10.timeZoneName}`,
)
