import type { ReactNode } from 'react'

export function SiteFooter({
  siteName,
  credentials,
  practiceLine,
  signup,
}: {
  siteName: string
  credentials?: string
  practiceLine?: string
  signup?: ReactNode
}) {
  return (
    <footer className="site-footer" role="contentinfo">
      {signup}
      <div className="site-footer-meta">
        <p>
          <span>
            © {new Date().getFullYear()} {siteName}
            {credentials ? ` · ${credentials}` : ''}
          </span>
        </p>
        <p>
          <span>{practiceLine || 'Relational Diplomacy'}</span>
        </p>
      </div>
    </footer>
  )
}
