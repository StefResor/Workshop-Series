import { createClient } from '@sanity/client'
import { formatWorkshopDisplay } from '@/lib/datetime'
import {
  workshopsAdminListQuery,
  type WorkshopAdminListItem,
} from '@/lib/workshop-registration-private'
import { daysUntilStartsAt } from '@/lib/workshop-window'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { SendCredentialsButton } from './SendCredentialsButton'

export const dynamic = 'force-dynamic'

function formatDaysUntil(days: number): string {
  if (Number.isNaN(days)) return '—'
  if (days < 0) return `${Math.abs(Math.ceil(days))}d ago`
  if (days < 1) return '<1d'
  return `${days.toFixed(1)}d`
}

export default async function AdminSessionsPage() {
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token || !projectId) {
    return (
      <>
        <h1 style={{ fontFamily: "'Archivo Black', Archivo, sans-serif" }}>
          Sessions
        </h1>
        <p>Sanity read token is not configured.</p>
      </>
    )
  }

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })

  const workshops = await sanity.fetch<WorkshopAdminListItem[]>(
    workshopsAdminListQuery,
  )
  const nowMs = Date.now()

  return (
    <>
      <h1
        style={{
          fontFamily: "'Archivo Black', Archivo, sans-serif",
          textTransform: 'uppercase',
          fontSize: '1.75rem',
          margin: '0 0 0.5rem',
        }}
      >
        Sessions
      </h1>
      <p style={{ color: '#44403A', margin: '0 0 1.5rem' }}>
        Send Zoom credentials to buyers of each workshop (includes series-pass
        buyers). Duplicate sends are expected.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {workshops.map((w) => {
          const when = formatWorkshopDisplay(
            w.startsAt,
            w.timeZone || 'America/New_York',
          )
          const days = daysUntilStartsAt(w.startsAt, nowMs)
          const n = w.sessionNumber != null ? `#${w.sessionNumber}` : ''
          return (
            <li
              key={w._id}
              style={{
                borderTop: '1.5px solid #14110E',
                padding: '1rem 0',
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {n ? `${n} · ` : ''}
                {w.title}
              </div>
              <div style={{ color: '#44403A', fontSize: 14, marginTop: 4 }}>
                {when.date} · 7:00–8:30 PM ET · {formatDaysUntil(days)} until
                start
                {!w.stripeProductId ? ' · missing Stripe product ID' : ''}
              </div>
              <SendCredentialsButton
                workshopId={w._id}
                workshopTitle={w.title}
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}
