import Link from 'next/link'

/** Homepage sixth cell when five sessions fill the two-column grid. */
export function SeeAllDatesCell() {
  return (
    <aside className="see-all-dates-cell">
      <p className="see-all-dates-kicker">Can&rsquo;t make these dates?</p>
      <h2 className="see-all-dates-heading">
        Every workshop returns in Winter, Spring and Summer.
      </h2>
      <Link className="see-all-dates-cta" href="/workshops#all-workshops">
        See all workshops <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}
