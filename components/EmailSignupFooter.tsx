'use client'

import { usePathname } from 'next/navigation'
import { EmailSignupForm } from '@/components/EmailSignupForm'
import type { EmailSignup } from '@/lib/types'

const DEFAULTS = {
  emailLabel: 'Email',
  buttonLabel: 'Subscribe',
  footerHeading: 'Workshop announcements',
  permissionLine:
    "A few emails a month. Unsubscribe anytime. This list isn't a way to reach Stefanie about therapy — use the consultation form for that.",
  successMessage:
    "You're on the list. Workshop announcements will come to this address.",
  errorMessage:
    "That didn't go through. Check the email address and try again.",
} as const

type EmailSignupFooterProps = {
  copy: EmailSignup | null
}

/**
 * Compact footer signup. Hidden on home (band owns that page) and on
 * workshop detail pages (registration is the only CTA there).
 */
export function EmailSignupFooter({ copy }: EmailSignupFooterProps) {
  const pathname = usePathname() || '/'

  if (!copy || copy.enabled === false || copy.showInFooter === false) {
    return null
  }
  if (!copy.permissionLine) return null
  if (pathname === '/') return null
  // /workshops/[slug] only — keep the index list.
  if (/^\/workshops\/[^/]+\/?$/.test(pathname)) return null

  return (
    <div className="email-signup-footer">
      <p className="email-signup-footer-heading">
        {copy.footerHeading?.trim() || DEFAULTS.footerHeading}
      </p>
      <EmailSignupForm
        source="footer"
        variant="footer"
        nameLabel={copy.nameLabel?.trim() || 'First name'}
        emailLabel={copy.emailLabel?.trim() || DEFAULTS.emailLabel}
        buttonLabel={copy.buttonLabel?.trim() || DEFAULTS.buttonLabel}
        permissionLine={copy.permissionLine.trim() || DEFAULTS.permissionLine}
        successMessage={
          copy.successMessage?.trim() || DEFAULTS.successMessage
        }
        errorMessage={copy.errorMessage?.trim() || DEFAULTS.errorMessage}
      />
    </div>
  )
}