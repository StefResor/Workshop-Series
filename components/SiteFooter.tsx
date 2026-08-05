import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Policy } from '@/lib/types'

export function SiteFooter({
  siteName,
  credentials,
  practiceLine,
  signup,
  policies = [],
}: {
  siteName: string
  credentials?: string
  practiceLine?: string
  signup?: ReactNode
  policies?: Pick<Policy, 'slug' | 'title' | 'footerLabel'>[]
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
          {policies.map((p) => (
            <span key={p.slug}>
              <span className="site-footer-sep" aria-hidden="true">
                {' '}
                ·{' '}
              </span>
              <Link href={`/${p.slug}`} className="site-footer-link">
                {p.footerLabel?.trim() || p.title}
              </Link>
            </span>
          ))}
        </p>
        <p>
          <span>{practiceLine || 'Relational Diplomacy'}</span>
        </p>
      </div>
    </footer>
  )
}
