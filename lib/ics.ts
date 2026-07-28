/** iCalendar helpers — CRLF endings, 75-octet folding, UTC Z timestamps. */

const CRLF = '\r\n'

/** Fold a content line to ≤75 octets (RFC 5545). */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line

  let result = ''
  let current = ''
  for (const char of line) {
    const trial = current + char
    if (encoder.encode(trial).length > 75) {
      result += current + CRLF + ' '
      current = char
    } else {
      current = trial
    }
  }
  return result + current
}

export function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n')
}

export type IcsEvent = {
  uid: string
  dtStamp: string
  dtStart: string
  dtEnd: string
  summary: string
  description?: string
  location?: string
  url?: string
}

export function buildIcsCalendar(events: IcsEvent[], prodId: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const event of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${event.uid}`)
    lines.push(`DTSTAMP:${event.dtStamp}`)
    lines.push(`DTSTART:${event.dtStart}`)
    lines.push(`DTEND:${event.dtEnd}`)
    lines.push(`SUMMARY:${icsEscape(event.summary)}`)
    if (event.description) {
      lines.push(`DESCRIPTION:${icsEscape(event.description)}`)
    }
    if (event.location) {
      lines.push(`LOCATION:${icsEscape(event.location)}`)
    }
    if (event.url) {
      lines.push(`URL:${event.url}`)
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  return lines.map(foldIcsLine).join(CRLF) + CRLF
}
