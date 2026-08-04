'use client'

import { useState } from 'react'

type Props = {
  workshopId: string
  workshopTitle: string
  /** False when Zoom link or passcode is missing in Studio. */
  canSend: boolean
}

type Phase = 'idle' | 'loading' | 'confirm' | 'sending' | 'done' | 'error'

export function SendCredentialsButton({
  workshopId,
  workshopTitle,
  canSend,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [count, setCount] = useState(0)
  const [sent, setSent] = useState(0)
  const [failed, setFailed] = useState(0)
  const [error, setError] = useState('')

  async function loadRecipients() {
    if (!canSend) return
    setPhase('loading')
    setError('')
    try {
      const res = await fetch('/api/admin/sessions/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId }),
      })
      const body = (await res.json().catch(() => null)) as {
        count?: number
        error?: string
      } | null
      if (!res.ok) {
        throw new Error(body?.error || 'Failed to load recipients')
      }
      setCount(body?.count ?? 0)
      setPhase('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipients')
      setPhase('error')
    }
  }

  async function sendAll() {
    if (!canSend || count === 0) return
    setPhase('sending')
    setError('')
    try {
      const res = await fetch('/api/admin/sessions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId }),
      })
      const body = (await res.json().catch(() => null)) as {
        sent?: number
        failed?: number
        error?: string
      } | null
      if (!res.ok) {
        throw new Error(body?.error || 'Send failed')
      }
      setSent(body?.sent ?? 0)
      setFailed(body?.failed ?? 0)
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed')
      setPhase('error')
    }
  }

  const sendDisabled = !canSend

  return (
    <div style={{ marginTop: 8 }}>
      {phase === 'idle' || phase === 'error' ? (
        <button
          type="button"
          onClick={loadRecipients}
          disabled={sendDisabled}
          style={{
            background: sendDisabled ? '#999' : '#FF4A17',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            fontWeight: 600,
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Send credentials
        </button>
      ) : null}

      {phase === 'loading' ? <p style={{ margin: '8px 0' }}>Looking up buyers…</p> : null}

      {phase === 'confirm' ? (
        <div style={{ marginTop: 8 }}>
          <p style={{ margin: '0 0 8px' }}>
            Send Zoom credentials for <strong>{workshopTitle}</strong> to{' '}
            <strong>{count}</strong> recipient{count === 1 ? '' : 's'}?
          </p>
          <button
            type="button"
            onClick={sendAll}
            disabled={count === 0 || !canSend}
            style={{
              background: count === 0 || !canSend ? '#999' : '#14110E',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              fontWeight: 600,
              cursor: count === 0 || !canSend ? 'not-allowed' : 'pointer',
              marginRight: 8,
            }}
          >
            Confirm send
          </button>
          <button
            type="button"
            onClick={() => setPhase('idle')}
            style={{
              background: 'transparent',
              color: '#14110E',
              border: '1px solid #14110E',
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      ) : null}

      {phase === 'sending' ? <p style={{ margin: '8px 0' }}>Sending…</p> : null}

      {phase === 'done' ? (
        <p style={{ margin: '8px 0' }}>
          Done. Sent: <strong>{sent}</strong>. Failed: <strong>{failed}</strong>.
        </p>
      ) : null}

      {error ? (
        <p style={{ margin: '8px 0', color: '#8B1E00' }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
