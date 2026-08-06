'use client'

import { usePathname } from 'next/navigation'
import { EmailSignupForm } from '@/components/EmailSignupForm'
import type { EmailSignup } from '@/lib/types'

/** Design-locked footer band copy — not pulled from CMS labels. */
const FOOTER_COPY = {
  heading: 'Hear about new workshops',
  supporting: 'A short note when a new series opens. Nothing else.',
  emailLabel: 'Email address',
  buttonLabel: 'Subscribe',
  /** Plain text for consent hash + aria; link rendered separately in the form. */
  permissionLine:
    'Unsubscribe anytime. Your address is never shared or sold. See the privacy policy.',
  successMessage:
    "You're on the list. Workshop announcements will come to this address.",
  errorMessage:
    "That didn't go through. Check the email address and try again.",
} as const

type EmailSignupFooterProps = {
  copy: EmailSignup | null
}

function isPolicyPath(pathname: string): boolean {
  if (pathname === '/terms' || pathname === '/privacy') return true
  return pathname === '/policies' || pathname.startsWith('/policies/')
}

/**
 * Footer workshop-announcements band. Hidden on home (band owns that page),
 * workshop detail pages, and policy routes (marketing capture is off-key there).
 */
export function EmailSignupFooter({ copy }: EmailSignupFooterProps) {
  const pathname = usePathname() || '/'

  if (!copy || copy.enabled === false || copy.showInFooter === false) {
    return null
  }
  if (pathname === '/') return null
  if (/^\/workshops\/[^/]+\/?$/.test(pathname)) return null
  if (isPolicyPath(pathname)) return null

  return (
    <div className="email-signup-footer">
      <div className="email-signup-footer-accent" aria-hidden="true" />
      <div className="email-signup-footer-grid">
        <div className="email-signup-footer-copy">
          <h2 className="email-signup-footer-heading">{FOOTER_COPY.heading}</h2>
          <p className="email-signup-footer-supporting">
            {FOOTER_COPY.supporting}
          </p>
        </div>
        <EmailSignupForm
          source="footer"
          variant="footer"
          nameLabel="First name"
          emailLabel={FOOTER_COPY.emailLabel}
          buttonLabel={FOOTER_COPY.buttonLabel}
          permissionLine={FOOTER_COPY.permissionLine}
          successMessage={
            copy.successMessage?.trim() || FOOTER_COPY.successMessage
          }
          errorMessage={copy.errorMessage?.trim() || FOOTER_COPY.errorMessage}
          privacyHref="/privacy"
        />
      </div>
    </div>
  )
}
