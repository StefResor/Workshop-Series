const HOW = [
  'Clarify the problem, precisely',
  'Understand its origins, with compassion',
  'Build new skills, deliberately',
  'Practice until it shows up in daily life',
] as const

type HowChangeSectionProps = {
  headingId: string
}

/** Shared “How change actually happens” band — home and Approach. */
export function HowChangeSection({ headingId }: HowChangeSectionProps) {
  return (
    <section className="how" aria-labelledby={headingId}>
      <h2 id={headingId} className="section-heading">
        How change <span>actually</span> happens
      </h2>
      <ol className="how-list">
        {HOW.map((item, i) => (
          <li key={item}>
            <span className="n" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </section>
  )
}
