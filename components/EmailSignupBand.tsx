import { EmailSignupForm } from '@/components/EmailSignupForm'
import type { EmailSignup } from '@/lib/types'

const DEFAULTS = {
  eyebrow: 'Stay in touch',
  heading: 'Workshop updates',
  body: 'Announcements for the workshop series — dates, topics, and when registration opens.',
  nameLabel: 'First name',
  emailLabel: 'Email',
  checkboxLabel: 'Also send me blog posts and practice updates',
  buttonLabel: 'Subscribe',
  permissionLine:
    "A few emails a month. Unsubscribe anytime. This list isn't a way to reach Stefanie about therapy — use the consultation form for that.",
  successMessage:
    "You're on the list. Workshop announcements will come to this address.",
  errorMessage:
    "That didn't go through. Check the email address and try again.",
} as const

type EmailSignupBandProps = {
  copy: EmailSignup
}

export function EmailSignupBand({ copy }: EmailSignupBandProps) {
  if (copy.enabled === false) return null
  if (!copy.heading || !copy.permissionLine) return null

  const eyebrow = copy.eyebrow?.trim() || DEFAULTS.eyebrow
  const heading = copy.heading.trim()
  const body = copy.body?.trim() || DEFAULTS.body

  return (
    <section
      className="email-signup-band"
      aria-labelledby="email-signup-band-heading"
    >
      <div className="email-signup-band-inner">
        <div className="email-signup-band-copy">
          {eyebrow ? (
            <p className="email-signup-band-eyebrow">{eyebrow}</p>
          ) : null}
          <h2 id="email-signup-band-heading">{heading}</h2>
          {body ? <p className="email-signup-band-body">{body}</p> : null}
        </div>
        <div className="email-signup-band-form">
          <EmailSignupForm
            source="home_band"
            variant="band"
            showName
            showBlogCheckbox
            nameLabel={copy.nameLabel?.trim() || DEFAULTS.nameLabel}
            emailLabel={copy.emailLabel?.trim() || DEFAULTS.emailLabel}
            checkboxLabel={
              copy.checkboxLabel?.trim() || DEFAULTS.checkboxLabel
            }
            buttonLabel={copy.buttonLabel?.trim() || DEFAULTS.buttonLabel}
            permissionLine={
              copy.permissionLine.trim() || DEFAULTS.permissionLine
            }
            successMessage={
              copy.successMessage?.trim() || DEFAULTS.successMessage
            }
            errorMessage={copy.errorMessage?.trim() || DEFAULTS.errorMessage}
          />
        </div>
      </div>
    </section>
  )
}
