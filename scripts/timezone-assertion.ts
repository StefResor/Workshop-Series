/**
 * Assertion from docs/workshop-schedule.md — run before any .ics / events feed code.
 *
 * Sessions 1 and 10 both render 7:00 PM local, with different timezone labels (EDT vs EST).
 * Session 10 local calendar date must be Wednesday Nov 11 — not Thursday Nov 12 (UTC date).
 */
import assert from 'node:assert/strict'
import { getLocalWorkshopParts } from '../lib/timezone'

// Verbatim from docs/workshop-schedule.md
const SESSION_1_START = '2026-09-09T23:00:00.000Z'
const SESSION_10_START = '2026-11-12T00:00:00.000Z'

const session1 = getLocalWorkshopParts(SESSION_1_START)
const session10 = getLocalWorkshopParts(SESSION_10_START)

assert.equal(session1.timeLabel, '7:00 PM')
assert.equal(session1.timeZoneName, 'EDT')
assert.equal(session1.weekday, 'Wednesday')
assert.equal(session1.month, 'September')
assert.equal(session1.day, 9)
assert.equal(session1.year, 2026)

assert.equal(session10.timeLabel, '7:00 PM')
assert.equal(session10.timeZoneName, 'EST')
assert.equal(session10.weekday, 'Wednesday')
assert.equal(session10.month, 'November')
assert.equal(session10.day, 11)
assert.equal(session10.year, 2026)

// Guard the exact failure mode: UTC date must not be used as the public date.
assert.notEqual(SESSION_10_START.slice(0, 10), '2026-11-11')
assert.equal(SESSION_10_START.slice(0, 10), '2026-11-12')

console.log('timezone assertion passed:')
console.log(`  session 1  → ${session1.dateLabel} · ${session1.timeLabel} ${session1.timeZoneName}`)
console.log(`  session 10 → ${session10.dateLabel} · ${session10.timeLabel} ${session10.timeZoneName}`)
