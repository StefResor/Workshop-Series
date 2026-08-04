'use client'

import { FormEvent, useId, useState } from 'react'

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
  /** Footer: short privacy link instead of full permission paragraph. */
  privacyHref?: string
}

export function EmailSignupForm({
  source,
  variant,
  showName = false,
  showBlogCheckbox = false,
  privacyHref = '/contact',
  nameLabel,
  emailLabel,
  buttonLabel,
  permissionLine,
  successMessage,
  errorMessage,
  checkboxLabel = 'Also send me blog posts and practice updates',
}: EmailSignupFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
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

    // Client-side: email format only — do not block on first name.
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
      const body = (await res.json().catch(() => null)) as { ok?: boolean } | null
      if (!res.ok || !body?.ok) {
        setStatus('err')
        return
      }
      setStatus('ok')
      form.reset()
    } catch {
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <div
        className={`email-signup-result email-signup-result--${variant}`}
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
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Subscribing…' : buttonLabel}
      </button>

      {variant === 'band' ? (
        <p className="email-signup-permission" id={permissionId}>
          {permissionLine}
        </p>
      ) : (
        <p
          className="email-signup-permission email-signup-permission--footer"
          id={permissionId}
        >
          <a href={privacyHref} title={permissionLine}>
            Privacy note
          </a>
        </p>
      )}

      <div id={statusId} role="status" aria-live="polite" aria-atomic="true">
        {status === 'err' ? (
          <p className="email-signup-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </form>
  )
}
