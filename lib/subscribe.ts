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
  | { status: 'subscribed'; segmentIds: string[] }
  | { status: 'already_subscribed'; segmentIds: string[] }
  // Reserved for Phase 2 double opt-in — not returned yet.
  | { status: 'pending_confirmation'; segmentIds: string[] }

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

/**
 * Create a global contact in one or more segments (single contacts.create call).
 * Already-subscribed is treated as success — never reveal membership.
 * Best-effort segment repair on re-submit; failures still return success.
 */
export async function createContactInSegments(opts: {
  email: string
  firstName?: string
  segmentIds: string[]
  apiKey: string
}): Promise<SubscribeResult> {
  const segmentIds = opts.segmentIds.filter(Boolean)
  if (segmentIds.length === 0) {
    throw new Error('createContactInSegments requires at least one segment id')
  }

  const resend = new Resend(opts.apiKey)
  const { error } = await resend.contacts.create({
    email: opts.email,
    firstName: opts.firstName || undefined,
    unsubscribed: false,
    segments: segmentIds.map((id) => ({ id })),
  })

  if (!error) return { status: 'subscribed', segmentIds }

  if (!isAlreadySubscribedError(error)) {
    throw new Error(error.message || 'Resend contacts.create failed')
  }

  for (const segmentId of segmentIds) {
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
        }),
      )
    }
  }

  return { status: 'already_subscribed', segmentIds }
}
