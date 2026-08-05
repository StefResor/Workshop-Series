import { EmailSignupFooter } from '@/components/EmailSignupFooter'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { personJsonLd, websiteJsonLd } from '@/lib/schema'
import type { EmailSignup, Policy, SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  emailSignupQuery,
  footerPoliciesQuery,
  siteSettingsQuery,
} from '@/sanity/queries'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, emailSignup, footerPolicies] = await Promise.all([
    sanityFetch<SiteSettings | null>(siteSettingsQuery),
    sanityFetch<EmailSignup | null>(emailSignupQuery),
    sanityFetch<Pick<Policy, 'slug' | 'title' | 'footerLabel'>[]>(
      footerPoliciesQuery,
    ).catch(() => []),
  ])
  const siteName = settings?.siteName || 'Stefanie Schumacher'

  const jsonLd = settings
    ? [personJsonLd(settings), websiteJsonLd(settings)]
    : []

  return (
    <div className="site">
      {jsonLd.map((node, i) => (
        <script
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader siteName={siteName} />
      <main id="main-content" className="site-main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter
        siteName={siteName}
        credentials={settings?.credentials}
        practiceLine={settings?.practiceLine}
        signup={<EmailSignupFooter copy={emailSignup} />}
        policies={footerPolicies || []}
      />
    </div>
  )
}
