'use client'

import { FormEvent, useId, useState } from 'react'
import Link from 'next/link'

export type EmailSignupFormCopy = {
  nameLabel: string
  emailLabel: string
  buttonLabel: string
  permissionLine: string
  successMessage: string
  errorMessage: string
  checkboxLabel?: string
}

type EmailSignupFormProps = EmailSignupFormCopy & {
  source: string
  variant: 'band' | 'footer'
  /** Band collects first name + optional blog checkbox; footer does not. */
  showName?: boolean
  showBlogCheckbox?: boolean
  /** Footer: privacy policy href inside the visible reassurance line. */
  privacyHref?: string
}

type FormStatus = 'idle' | 'sending' | 'ok' | 'err'

export function EmailSignupForm({
  source,
  variant,
  showName = false,
  showBlogCheckbox = false,
  privacyHref = '/privacy',
  nameLabel,
  emailLabel,
  buttonLabel,
  permissionLine,
  successMessage,
  errorMessage,
  checkboxLabel = 'Also send me blog posts and practice updates',
}: EmailSignupFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const statusId = useId()
  const nameId = useId()
  const emailId = useId()
  const checkboxId = useId()
  const permissionId = useId()
  const hpId = useId()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return

    const form = e.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') || '').trim()

    // Validate on submit only — button stays enabled.
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('err')
      return
    }

    setStatus('sending')

    const payload = {
      firstName: showName ? String(data.get('firstName') || '').trim() : '',
      email,
      blogOptIn: showBlogCheckbox ? data.get('blogOptIn') === 'on' : false,
      source,
      permissionLine,
      website: String(data.get('website') || ''),
    }

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // Route always returns 200 + { ok }; ignore HTTP status for UX / console noise.
      // Already-subscribed is also { ok: true } — same success UI (no membership probe).
      const body = (await res.json().catch(() => null)) as { ok?: boolean } | null
      if (!body?.ok) {
        setStatus('err')
        return
      }
      form.reset()
      setStatus('ok')
    } catch {
      setStatus('err')
    }
  }

  if (variant === 'footer') {
    return (
      <form
        className="email-signup-form email-signup-form--footer"
        onSubmit={onSubmit}
        noValidate
        aria-describedby={statusId}
      >
        <div className="email-signup-footer-field">
          <label className="email-signup-footer-label" htmlFor={emailId}>
            {emailLabel}
          </label>
          <div className="email-signup-footer-controls">
            <input
              id={emailId}
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              aria-required="true"
              aria-invalid={status === 'err' || undefined}
              aria-describedby={statusId}
            />
            <button
              className="email-signup-submit email-signup-submit--footer"
              type="submit"
            >
              {status === 'sending' ? 'Subscribing…' : buttonLabel}
            </button>
          </div>
        </div>

        <div className="hp" aria-hidden="true">
          <label htmlFor={hpId}>Website</label>
          <input id={hpId} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div
          className="email-signup-footer-status"
          id={statusId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status === 'ok' ? (
            <p className="email-signup-result email-signup-result--footer">
              {successMessage}
            </p>
          ) : status === 'err' ? (
            <p className="email-signup-error">{errorMessage}</p>
          ) : (
            <p className="email-signup-permission" id={permissionId}>
              Unsubscribe anytime. Your address is never shared or sold. See
              the{' '}
              <Link href={privacyHref} className="email-signup-privacy-link">
                privacy policy
              </Link>
              .
            </p>
          )}
        </div>
      </form>
    )
  }

  if (status === 'ok') {
    return (
      <div
        className="email-signup-result email-signup-result--band"
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p>{successMessage}</p>
      </div>
    )
  }

  return (
    <form
      className={`email-signup-form email-signup-form--${variant}`}
      onSubmit={onSubmit}
      noValidate
      aria-describedby={permissionId}
    >
      {showName ? (
        <div className="email-signup-field">
          <label className="visually-hidden" htmlFor={nameId}>
            {nameLabel}
          </label>
          <input
            id={nameId}
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder={nameLabel}
          />
        </div>
      ) : null}

      <div className="email-signup-field">
        <label className="visually-hidden" htmlFor={emailId}>
          {emailLabel}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          aria-required="true"
          placeholder={emailLabel}
        />
      </div>

      {showBlogCheckbox ? (
        <div className="email-signup-check">
          <input
            id={checkboxId}
            name="blogOptIn"
            type="checkbox"
            className="email-signup-check-input"
          />
          <label htmlFor={checkboxId} className="email-signup-check-label">
            {checkboxLabel}
          </label>
        </div>
      ) : null}

      <div className="hp" aria-hidden="true">
        <label htmlFor={hpId}>Website</label>
        <input id={hpId} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        className={`email-signup-submit email-signup-submit--${variant}`}
        type="submit"
      >
        {status === 'sending' ? 'Subscribing…' : buttonLabel}
      </button>

      <p className="email-signup-permission" id={permissionId}>
        {permissionLine}
      </p>

      <div id={statusId} role="status" aria-live="polite" aria-atomic="true">
        {status === 'err' ? (
          <p className="email-signup-error">{errorMessage}</p>
        ) : null}
      </div>
    </form>
  )
}
