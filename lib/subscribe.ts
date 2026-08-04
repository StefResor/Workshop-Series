import { createHash } from 'node:crypto'
import { Resend } from 'resend'

/**
 * Public mailing-list subscribe helpers (Website Signups segment + topics).
 *
 * Structured so double opt-in can be added later without rewriting the route:
 * createContactInSegment() is the single side-effect that adds a contact.
 * A future confirmation flow would gate that call behind a token verify step
 * and return status: 'pending_confirmation' instead of 'subscribed'.
 */

export type SubscribeSource = string

export type SubscribeResult =
  | { status: 'subscribed' }
  | { status: 'already_subscribed' }
  // Reserved for Phase 2 double opt-in — not returned yet.
  | { status: 'pending_confirmation' }

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

type TopicOptIn = { id: string; subscription: 'opt_in' }

/**
 * Create a global contact in the Website Signups segment.
 * When topicIds are provided, opt into those topics at creation.
 * Already-subscribed is treated as success — never reveal membership.
 * Best-effort segment/topic repair on re-submit; failures still return success.
 */
export async function createContactInSegment(opts: {
  email: string
  firstName?: string
  segmentId: string
  topicIds?: string[]
  apiKey: string
}): Promise<SubscribeResult> {
  const resend = new Resend(opts.apiKey)
  const topics: TopicOptIn[] = (opts.topicIds || []).map((id) => ({
    id,
    subscription: 'opt_in' as const,
  }))

  const { error } = await resend.contacts.create({
    email: opts.email,
    firstName: opts.firstName || undefined,
    unsubscribed: false,
    segments: [{ id: opts.segmentId }],
    ...(topics.length > 0 ? { topics } : {}),
  })

  if (!error) return { status: 'subscribed' }

  if (!isAlreadySubscribedError(error)) {
    throw new Error(error.message || 'Resend contacts.create failed')
  }

  // Re-submitter: ensure segment membership + topic opt-ins without disclosing status.
  const segmentRepair = await resend.contacts.segments.add({
    email: opts.email,
    segmentId: opts.segmentId,
  })
  if (segmentRepair.error) {
    console.info(
      JSON.stringify({
        event: 'subscribe_segment_repair_failed',
        ok: true,
        at: new Date().toISOString(),
      }),
    )
  }

  if (topics.length > 0) {
    const topicsRepair = await resend.contacts.topics.update({
      email: opts.email,
      topics,
    })
    if (topicsRepair.error) {
      console.info(
        JSON.stringify({
          event: 'subscribe_topics_repair_failed',
          ok: true,
          at: new Date().toISOString(),
        }),
      )
    }
  }

  return { status: 'already_subscribed' }
}
