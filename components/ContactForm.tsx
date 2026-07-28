'use client'

import { FormEvent, useId, useState } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [error, setError] = useState('')
  const statusId = useId()
  const disclaimerId = useId()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      firstName: String(data.get('firstName') || ''),
      lastName: String(data.get('lastName') || ''),
      email: String(data.get('email') || ''),
      message: String(data.get('message') || ''),
      website: String(data.get('website') || ''),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error || 'Something went wrong')
      }
      setStatus('ok')
      form.reset()
    } catch (err) {
      setStatus('err')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={disclaimerId}
    >
      <div className="field-row">
        <div className="field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            aria-required="true"
          />
        </div>
        <div className="field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            required
            autoComplete="family-name"
            aria-required="true"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          aria-required="true"
        />
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-required="true"
          aria-describedby={disclaimerId}
        />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p className="form-disclaimer" id={disclaimerId}>
        Please do not include health details, diagnoses, or other sensitive clinical
        information. Share only what we need to schedule a confidential consultation.
        Submissions are emailed and not stored in a database.
      </p>
      <button className="btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Request a Consultation'}
      </button>
      <div id={statusId} role="status" aria-live="polite" aria-atomic="true">
        {status === 'ok' ? (
          <p className="form-status" data-tone="ok">
            Sent. Stef will be in touch.
          </p>
        ) : null}
        {status === 'err' ? (
          <p className="form-status" data-tone="err" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
