export function SiteFooter({
  siteName,
  credentials,
  practiceLine,
}: {
  siteName: string
  credentials?: string
  practiceLine?: string
}) {
  return (
    <footer className="site-footer" role="contentinfo">
      <p>
        <span>
          © {new Date().getFullYear()} {siteName}
          {credentials ? ` · ${credentials}` : ''}
        </span>
      </p>
      <p>
        <span>{practiceLine || 'Relational Diplomacy'}</span>
      </p>
    </footer>
  )
}
