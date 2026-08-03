import { formatWorkshopDisplay } from '@/lib/datetime'
import { DEFAULT_WORKSHOP_DISCLAIMER } from '@/lib/workshop-disclaimer'
import type { WorkshopRegistrationPrivate } from '@/lib/workshop-registration-private'

/** Campaign-kit tokens for transactional HTML (inline only). */
const BONE = '#F3EFE7'
const INK = '#14110E'
const VERMILLION = '#FF4A17'
const MUTED = '#44403A'

const FONT_BODY =
  "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONT_DISPLAY =
  "'Archivo Black', Archivo, 'Arial Black', Impact, sans-serif"

export type EmailSessionLine = {
  title: string
  startsAt: string
  timeZone?: string
  zoomLink?: string
  zoomPasscode?: string
  /** When true, inline join link + passcode for this session. */
  includeCredentials: boolean
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Calendar date via America/New_York; wall clock always "7:00–8:30 PM ET". */
export function formatSessionWhen(startsAt: string, timeZone?: string): string {
  const d = formatWorkshopDisplay(startsAt, timeZone || 'America/New_York')
  return `${d.date}, 7:00–8:30 PM ET`
}

function sessionLabel(session: EmailSessionLine): string {
  return `${session.title} — ${formatSessionWhen(session.startsAt, session.timeZone)}`
}

function wrapEmail(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Stefanie Schumacher</title>
</head>
<body style="margin:0;padding:0;background-color:${BONE};color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BONE};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${BONE};">
        <tr>
          <td style="padding:0 0 20px 0;font-family:${FONT_DISPLAY};font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${VERMILLION};">
            Stefanie Schumacher
          </td>
        </tr>
        ${inner}
        <tr>
          <td style="padding:28px 0 0 0;border-top:1px solid ${INK};font-family:${FONT_BODY};font-size:13px;line-height:1.5;color:${MUTED};">
            ${escapeHtml(DEFAULT_WORKSHOP_DISCLAIMER)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function headingRow(text: string): string {
  return `<tr>
    <td style="padding:0 0 16px 0;font-family:${FONT_DISPLAY};font-size:28px;line-height:1.15;color:${INK};text-transform:uppercase;">
      ${escapeHtml(text)}
    </td>
  </tr>`
}

function bodyRow(html: string): string {
  return `<tr>
    <td style="padding:0 0 14px 0;font-family:${FONT_BODY};font-size:16px;line-height:1.55;color:${INK};">
      ${html}
    </td>
  </tr>`
}

function credentialsBlock(session: EmailSessionLine): string {
  const link = session.zoomLink?.trim() || ''
  const pass = session.zoomPasscode?.trim() || ''
  const parts: string[] = []

  parts.push(
    `<p style="margin:0 0 8px 0;font-family:${FONT_DISPLAY};font-size:14px;letter-spacing:0.06em;text-transform:uppercase;color:${VERMILLION};">Zoom access</p>`,
  )
  parts.push(
    `<p style="margin:0 0 12px 0;font-family:${FONT_BODY};font-size:16px;line-height:1.45;color:${INK};"><strong>${escapeHtml(session.title)}</strong><br />${escapeHtml(formatSessionWhen(session.startsAt, session.timeZone))}</p>`,
  )

  if (link) {
    parts.push(
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;">
        <tr>
          <td bgcolor="${VERMILLION}" style="background-color:${VERMILLION};">
            <a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 22px;font-family:${FONT_BODY};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Join Zoom session</a>
          </td>
        </tr>
      </table>`,
    )
    parts.push(
      `<p style="margin:0 0 12px 0;font-family:${FONT_BODY};font-size:14px;line-height:1.5;color:${INK};word-break:break-all;">Or paste this link:<br /><a href="${escapeHtml(link)}" style="color:${VERMILLION};">${escapeHtml(link)}</a></p>`,
    )
  } else {
    parts.push(
      `<p style="margin:0 0 12px 0;font-family:${FONT_BODY};font-size:14px;color:${MUTED};">Join link will follow separately if not listed here.</p>`,
    )
  }

  if (pass) {
    parts.push(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;">
        <tr>
          <td style="border:2px solid ${INK};padding:14px 16px;font-family:${FONT_BODY};font-size:16px;color:${INK};">
            <strong>Passcode:</strong> ${escapeHtml(pass)}
          </td>
        </tr>
      </table>`,
    )
  }

  parts.push(
    `<p style="margin:0;font-family:${FONT_BODY};font-size:14px;line-height:1.5;color:${MUTED};">Keep this email — the join link is not available elsewhere on the site.</p>`,
  )

  return `<tr>
    <td style="padding:18px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid ${INK};">
        <tr>
          <td style="padding:18px 20px;">
            ${parts.join('')}
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

function scheduleListHtml(sessions: EmailSessionLine[]): string {
  const items = sessions
    .map(
      (s) =>
        `<li style="margin:0 0 8px 0;">${escapeHtml(sessionLabel(s))}${s.includeCredentials ? ' <span style="color:' + VERMILLION + ';">(Zoom details below)</span>' : ''}</li>`,
    )
    .join('')
  return `<ul style="margin:0;padding:0 0 0 20px;font-family:${FONT_BODY};font-size:16px;line-height:1.5;color:${INK};">${items}</ul>`
}

function scheduleListText(sessions: EmailSessionLine[]): string {
  return sessions
    .map((s) => {
      const base = `• ${sessionLabel(s)}`
      return s.includeCredentials ? `${base} (Zoom details below)` : base
    })
    .join('\n')
}

function credentialsText(session: EmailSessionLine): string {
  const lines = [
    'Zoom access',
    session.title,
    formatSessionWhen(session.startsAt, session.timeZone),
  ]
  if (session.zoomLink) {
    lines.push(`Join link: ${session.zoomLink}`)
  }
  if (session.zoomPasscode) {
    lines.push(`Passcode: ${session.zoomPasscode}`)
  }
  lines.push(
    'Keep this email — the join link is not available elsewhere on the site.',
  )
  return lines.join('\n')
}

const CREDENTIALS_TIMING =
  'Your Zoom join link and passcode will arrive by email 8 days before each session.'

export type BuiltEmail = {
  subject: string
  html: string
  text: string
}

/** (a) Welcome — purchase confirmed, no Zoom credentials. */
export function buildWelcomeEmail(opts: {
  purchaseLabel: string
  sessions: EmailSessionLine[]
}): BuiltEmail {
  const { purchaseLabel, sessions } = opts
  const subject = `You're registered — ${purchaseLabel}`

  const html = wrapEmail(
    [
      headingRow("You're registered"),
      bodyRow(
        `Thanks for registering for <strong>${escapeHtml(purchaseLabel)}</strong>.`,
      ),
      bodyRow('<strong>Your session schedule</strong>'),
      bodyRow(scheduleListHtml(sessions.map((s) => ({ ...s, includeCredentials: false })))),
      bodyRow(escapeHtml(CREDENTIALS_TIMING)),
    ].join('\n'),
  )

  const text = [
    "You're registered",
    '',
    `Thanks for registering for ${purchaseLabel}.`,
    '',
    'Your session schedule:',
    scheduleListText(sessions.map((s) => ({ ...s, includeCredentials: false }))),
    '',
    CREDENTIALS_TIMING,
    '',
    DEFAULT_WORKSHOP_DISCLAIMER,
  ].join('\n')

  return { subject, html, text }
}

/**
 * (b) Confirmation with credentials — schedule plus inlined Zoom details
 * for each session marked includeCredentials.
 */
export function buildConfirmationWithCredentialsEmail(opts: {
  purchaseLabel: string
  sessions: EmailSessionLine[]
}): BuiltEmail {
  const { purchaseLabel, sessions } = opts
  const withCreds = sessions.filter((s) => s.includeCredentials)
  const subject = `You're registered — ${purchaseLabel}`

  const credBlocks = withCreds.map((s) => credentialsBlock(s)).join('\n')

  const html = wrapEmail(
    [
      headingRow("You're registered"),
      bodyRow(
        `Thanks for registering for <strong>${escapeHtml(purchaseLabel)}</strong>.`,
      ),
      bodyRow('<strong>Your session schedule</strong>'),
      bodyRow(scheduleListHtml(sessions)),
      bodyRow(
        escapeHtml(
          withCreds.length < sessions.length
            ? 'Zoom details for sessions more than 8 days away will arrive by email 8 days before each of those sessions.'
            : 'Zoom access for your upcoming session(s) is below.',
        ),
      ),
      credBlocks,
    ].join('\n'),
  )

  const textParts = [
    "You're registered",
    '',
    `Thanks for registering for ${purchaseLabel}.`,
    '',
    'Your session schedule:',
    scheduleListText(sessions),
    '',
    withCreds.length < sessions.length
      ? 'Zoom details for sessions more than 8 days away will arrive by email 8 days before each of those sessions.'
      : 'Zoom access for your upcoming session(s) is below.',
    '',
    ...withCreds.flatMap((s) => [credentialsText(s), '']),
    DEFAULT_WORKSHOP_DISCLAIMER,
  ]

  return { subject, html, text: textParts.join('\n') }
}

/** (c) Session credentials — standalone single-session email (admin tool). */
export function buildSessionCredentialsEmail(
  workshop: WorkshopRegistrationPrivate,
): BuiltEmail {
  const session: EmailSessionLine = {
    title: workshop.title,
    startsAt: workshop.startsAt,
    timeZone: workshop.timeZone,
    zoomLink: workshop.zoomLink,
    zoomPasscode: workshop.zoomPasscode,
    includeCredentials: true,
  }
  const when = formatSessionWhen(workshop.startsAt, workshop.timeZone)
  const subject = `Zoom details — ${workshop.title}`

  const html = wrapEmail(
    [
      headingRow('Your Zoom details'),
      bodyRow(
        `Here are your join credentials for <strong>${escapeHtml(workshop.title)}</strong>.`,
      ),
      bodyRow(escapeHtml(when)),
      credentialsBlock(session),
    ].join('\n'),
  )

  const text = [
    'Your Zoom details',
    '',
    `Here are your join credentials for ${workshop.title}.`,
    when,
    '',
    credentialsText(session),
    '',
    DEFAULT_WORKSHOP_DISCLAIMER,
  ].join('\n')

  return { subject, html, text }
}

export function toEmailSession(
  workshop: WorkshopRegistrationPrivate,
  includeCredentials: boolean,
): EmailSessionLine {
  return {
    title: workshop.title,
    startsAt: workshop.startsAt,
    timeZone: workshop.timeZone,
    zoomLink: workshop.zoomLink,
    zoomPasscode: workshop.zoomPasscode,
    includeCredentials,
  }
}
