import assert from 'node:assert/strict'
import {
  credentialsDueWithinWindow,
  daysUntilStartsAt,
} from '../lib/workshop-window'

// Verbatim from docs/workshop-schedule.md — session 10 starts at midnight UTC
// after DST ends; local display date is Wed Nov 11, not Thu Nov 12.
const SESSION_10_START = '2026-11-12T00:00:00.000Z'
const SESSION_1_START = '2026-09-09T23:00:00.000Z'

// Exactly 8 days before session 10 → credentials due.
const eightDaysBefore = new Date(SESSION_10_START).getTime() - 8 * 24 * 60 * 60 * 1000
assert.equal(credentialsDueWithinWindow(SESSION_10_START, eightDaysBefore), true)
assert.ok(Math.abs(daysUntilStartsAt(SESSION_10_START, eightDaysBefore) - 8) < 1e-9)

// Just over 8 days → welcome (no credentials).
const eightDaysPlusHour =
  new Date(SESSION_10_START).getTime() - 8 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000
assert.equal(
  credentialsDueWithinWindow(SESSION_10_START, eightDaysPlusHour),
  false,
)

// DST trap: comparison uses the UTC instant, not startsAt.slice(0,10).
assert.equal(SESSION_10_START.slice(0, 10), '2026-11-12')
const naiveUtcDateMs = Date.parse('2026-11-12T00:00:00.000Z')
assert.equal(new Date(SESSION_10_START).getTime(), naiveUtcDateMs)

// Session 1 EDT instant still compares correctly across the series.
const nineDaysBeforeS1 =
  new Date(SESSION_1_START).getTime() - 9 * 24 * 60 * 60 * 1000
assert.equal(credentialsDueWithinWindow(SESSION_1_START, nineDaysBeforeS1), false)

console.log('workshop-window assertion passed')
console.log(
  `  session 10 @ T-8d → credentials; @ T-8d-1h → welcome (UTC instant math)`,
)
