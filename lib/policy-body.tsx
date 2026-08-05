import type { ReactNode } from 'react'

export function slugifyHeading(input: string) {
  return input
    .toLowerCase()
    .replace(/[\u201C\u201D"']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}

/** Placeholder / unfinished values must not appear as a public effective date. */
export function isRealEffectiveDate(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  const lower = v.toLowerCase()
  if (/^(tbd|n\/?a|pending|unset|draft)\b/.test(lower)) return false
  if (/pending review|set at publish|to be (set|determined|confirmed)/i.test(v)) {
    return false
  }
  return true
}

/**
 * Pull a leading `Effective date: …` line out of the body for the page eyebrow.
 * Placeholder values are stripped from the body and not returned — no eyebrow
 * until Stef sets a real date.
 */
export function splitEffectiveDate(body: string): {
  effectiveDate?: string
  body: string
} {
  const trimmed = body.replace(/^\uFEFF/, '').trim()
  const match = trimmed.match(/^Effective date:\s*(.+?)(?:\n+|$)/i)
  if (!match) return { body: trimmed }
  const rest = trimmed.slice(match[0].length).trim()
  const raw = match[1].trim()
  if (!isRealEffectiveDate(raw)) return { body: rest }
  return { effectiveDate: raw, body: rest }
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // **bold**, [label](url) — applied left-to-right without nesting.
  const nodes: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index))
    }
    const token = m[0]
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-s-${i}`}>{token.slice(2, -2)}</strong>,
      )
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        const href = link[2]
        const external = /^https?:\/\//i.test(href)
        nodes.push(
          <a
            key={`${keyPrefix}-a-${i}`}
            href={href}
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {link[1]}
          </a>,
        )
      }
    }
    last = m.index + token.length
    i += 1
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function isListBlock(block: string) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l))
}

/**
 * Render policy body: ## → h2 (slug ids), lists, paragraphs; inline **bold**
 * and [links](url). Effective-date line should be stripped via splitEffectiveDate
 * before calling this.
 */
export function renderPolicyBody(body: string): ReactNode[] {
  const blocks = body
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean)

  const usedIds = new Set<string>()

  return blocks.map((block, i) => {
    const heading = block.match(/^##\s+(.+)$/)
    if (heading) {
      const text = heading[1].trim()
      let id = slugifyHeading(text) || `section-${i}`
      if (usedIds.has(id)) id = `${id}-${i}`
      usedIds.add(id)
      return (
        <h2 key={`h-${i}`} id={id} className="policy-h2">
          {renderInline(text, `h${i}`)}
        </h2>
      )
    }

    if (isListBlock(block)) {
      const items = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/^[-*]\s+/, ''))
      return (
        <ul key={`ul-${i}`} className="policy-list">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item, `li${i}-${j}`)}</li>
          ))}
        </ul>
      )
    }

    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    return (
      <p key={`p-${i}`}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 ? <br /> : null}
            {renderInline(line, `p${i}-${j}`)}
          </span>
        ))}
      </p>
    )
  })
}
