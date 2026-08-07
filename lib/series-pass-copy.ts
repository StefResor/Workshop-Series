/** Small integers → English for series/pass marketing copy. */
const NUMBER_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
}

export function numberWord(n: number): string | null {
  return NUMBER_WORDS[n] ?? null
}

function indefiniteArticle(word: string): 'a' | 'an' {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

/**
 * When passPrice ÷ sessionPrice is a clean integer of paid sessions,
 * return the savings clause ("the price of nine, with one session free").
 * Otherwise null — caller omits the em-dash clause rather than inventing math.
 */
export function seriesPassSavingsClause(
  passPrice: number,
  sessionPrice: number,
  seriesCount: number,
): string | null {
  if (!(passPrice > 0) || !(sessionPrice > 0) || !(seriesCount > 0)) {
    return null
  }
  const ratio = passPrice / sessionPrice
  const paid = Math.round(ratio)
  if (Math.abs(ratio - paid) > 1e-9) return null
  const free = seriesCount - paid
  if (paid < 1 || free < 1) return null

  const paidWord = numberWord(paid)
  if (!paidWord) return null

  if (free === 1) {
    return `the price of ${paidWord}, with one session free`
  }

  const freeWord = numberWord(free)
  if (!freeWord) return null
  return `the price of ${paidWord}, with ${freeWord} sessions free`
}

/**
 * Index-row price meta: "$423 · ten sessions, one free".
 * Drops the ", one free" clause when passPrice ÷ sessionPrice is not clean.
 * Uppercasing is CSS (`text-transform`) — return lowercase words.
 */
export function seriesPassIndexOfferLine(
  passPrice: number,
  sessionPrice: number | null,
  seriesCount: number,
): string {
  if (!(passPrice > 0) || !(seriesCount > 0)) return ''

  const countWord = numberWord(seriesCount)
  const sessionsPart = countWord
    ? `${countWord} sessions`
    : `${seriesCount} sessions`

  if (sessionPrice == null || !(sessionPrice > 0)) {
    return `$${passPrice} · ${sessionsPart}`
  }

  const ratio = passPrice / sessionPrice
  const paid = Math.round(ratio)
  if (Math.abs(ratio - paid) > 1e-9) {
    return `$${passPrice} · ${sessionsPart}`
  }
  const free = seriesCount - paid
  if (free < 1) return `$${passPrice} · ${sessionsPart}`
  if (free === 1) return `$${passPrice} · ${sessionsPart}, one free`

  const freeWord = numberWord(free)
  if (!freeWord) return `$${passPrice} · ${sessionsPart}`
  return `$${passPrice} · ${sessionsPart}, ${freeWord} free`
}

/** Upcoming workshop: series membership + pass offer. */
export function seriesContextBodyUpcoming(opts: {
  seriesCount: number
  passPrice: number
  sessionPrice: number | null
}): string {
  const countWord = numberWord(opts.seriesCount)
  const countPhrase = countWord ?? String(opts.seriesCount)
  const article = countWord
    ? indefiniteArticle(countWord)
    : 'a'
  const weekPhrase = `${article} ${countPhrase}-week series`

  const base = `This workshop is part of ${weekPhrase}. Register for all ${countPhrase} for $${opts.passPrice}`

  if (opts.sessionPrice == null) return `${base}.`

  const savings = seriesPassSavingsClause(
    opts.passPrice,
    opts.sessionPrice,
    opts.seriesCount,
  )
  if (!savings) return `${base}.`
  return `${base} — ${savings}.`
}

/** Past workshop: session gone; series pass still the offer. */
export function seriesContextBodyPast(opts: {
  seriesTitle: string
  passPrice: number
}): string {
  return `This workshop has passed. The full ${opts.seriesTitle} series is available for $${opts.passPrice}.`
}
