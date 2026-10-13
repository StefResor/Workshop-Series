import Link from 'next/link'

/** Homepage band under the current-series cards — later-season dates live on the catalogue. */
export function AlternateDatesCallout() {
  return (
    <aside className="alternate-dates-callout">
      <div className="alternate-dates-copy">
        <p className="alternate-dates-kicker">Can&rsquo;t make these dates?</p>
        <p className="alternate-dates-line">
          Every workshop returns in Winter, Spring and Summer.
        </p>
      </div>
      <Link className="alternate-dates-cta" href="/workshops#all-workshops">
        View all workshop dates <span aria-hidden="true">→</span>
      </Link>
    </aside>
  )
}
