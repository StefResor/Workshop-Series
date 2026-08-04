import { createHash } from 'node:crypto'
import { Resend } from 'resend'

/**
 * Public mailing-list subscribe helpers (Workshop Announcements ± Blog & Practice).
 *
 * Structured so double opt-in can be added later without rewriting the route:
 * createContactInSegments() is the single side-effect that adds a contact.
 * A future confirmation flow would gate that call behind a token verify step
 * and return status: 'pending_confirmation' instead of 'subscribed'.
 */

export type SubscribeResult =
  | { ok: true; status: 'subscribed' | 'already_subscribed'; segmentIds: string[] }
  | {
      ok: false
      resendStatus: number | null
      resendMessage: string
      resendName: string | null
    }

export function permissionLineVersion(permissionLine: string): string {
  return createHash('sha256')
    .update(permissionLine.trim())
    .digest('hex')
    .slice(0, 12)
}

function isAlreadySubscribedError(error: {
  name?: string
  message?: string
} | null): boolean {
  if (!error) return false
  const blob = `${error.name || ''} ${error.message || ''}`.toLowerCase()
  return (
    blob.includes('already') ||
    blob.includes('exists') ||
    blob.includes('duplicate') ||
    error.name === 'contact_already_exists'
  )
}

function resendFailure(error: {
  name?: string
  message?: string
  statusCode?: number | null
}): SubscribeResult {
  return {
    ok: false,
    resendStatus: error.statusCode ?? null,
    resendMessage: error.message || 'Resend contacts.create failed',
    resendName: error.name || null,
  }
}

/**
 * Create a global contact in one or more segments (single contacts.create call).
 * Already-subscribed is treated as success — never reveal membership.
 * Never throws for Resend API errors — returns { ok: false } with loggable detail.
 */
export async function createContactInSegments(opts: {
  email: string
  firstName?: string
  segmentIds: string[]
  apiKey: string
}): Promise<SubscribeResult> {
  const segmentIds = opts.segmentIds.filter(Boolean)
  if (segmentIds.length === 0) {
    return {
      ok: false,
      resendStatus: null,
      resendMessage: 'createContactInSegments requires at least one segment id',
      resendName: 'misconfigured',
    }
  }

  try {
    const resend = new Resend(opts.apiKey)
    const { error } = await resend.contacts.create({
      email: opts.email,
      firstName: opts.firstName || undefined,
      unsubscribed: false,
      segments: segmentIds.map((id) => ({ id })),
    })

    if (!error) return { ok: true, status: 'subscribed', segmentIds }

    if (!isAlreadySubscribedError(error)) {
      return resendFailure(error)
    }

    for (const segmentId of segmentIds) {
      try {
        const repair = await resend.contacts.segments.add({
          email: opts.email,
          segmentId,
        })
        if (repair.error) {
          console.info(
            JSON.stringify({
              event: 'subscribe_segment_repair_failed',
              ok: true,
              at: new Date().toISOString(),
              segmentId,
              resendStatus: repair.error.statusCode ?? null,
              resendMessage: repair.error.message || null,
            }),
          )
        }
      } catch (repairErr) {
        console.info(
          JSON.stringify({
            event: 'subscribe_segment_repair_failed',
            ok: true,
            at: new Date().toISOString(),
            segmentId,
            resendMessage:
              repairErr instanceof Error ? repairErr.message : 'unknown',
          }),
        )
      }
    }

    return { ok: true, status: 'already_subscribed', segmentIds }
  } catch (err) {
    return {
      ok: false,
      resendStatus: null,
      resendMessage: err instanceof Error ? err.message : 'unknown Resend error',
      resendName: 'exception',
    }
  }
}
