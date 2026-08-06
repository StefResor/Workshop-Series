import type { ReactNode } from 'react'
import type { HeroJoin } from '@/lib/types'

type HomeHeroHeadlineProps = {
  solid?: string
  outline?: string
  join?: HeroJoin | null
}

function accessibleName(solid: string, outline: string, join: HeroJoin): string {
  if (!solid && !outline) return ''
  if (!solid) return outline
  if (!outline) return solid
  if (join === 'none') return `${solid}${outline}`
  return `${solid} ${outline}`
}

/**
 * Home hero wordmark from authored solid + outline fields.
 * Never falls back to legacy `headline` — empty fields mean an empty hero.
 */
export function HomeHeroHeadline({
  solid,
  outline,
  join,
}: HomeHeroHeadlineProps) {
  const solidText = solid?.trim() ?? ''
  const outlineText = outline?.trim() ?? ''
  const mode: HeroJoin =
    join === 'space' || join === 'none' || join === 'break' ? join : 'break'

  if (!solidText && !outlineText) return null

  const label = accessibleName(solidText, outlineText, mode)
  const outlineClass =
    mode === 'none'
      ? 'outline home-hero-outline home-hero-outline--mark'
      : 'outline home-hero-outline'

  const solidEl = solidText ? (
    <span key="solid" aria-hidden="true" className="home-hero-solid">
      {solidText}
    </span>
  ) : null

  const outlineEl = outlineText ? (
    <span key="outline" aria-hidden="true" className={outlineClass}>
      {outlineText}
    </span>
  ) : null

  let children: ReactNode
  if (mode === 'break') {
    children = (
      <>
        {solidEl}
        {solidEl ? <br key="br" aria-hidden="true" /> : null}
        {outlineEl}
      </>
    )
  } else if (mode === 'space') {
    // Explicit space node — never rely on CMS trailing whitespace.
    children = [solidEl, solidEl && outlineEl ? ' ' : null, outlineEl]
  } else {
    // none — array children, no interstitial JSX whitespace text nodes.
    children = [solidEl, outlineEl]
  }

  return <h1 aria-label={label}>{children}</h1>
}
