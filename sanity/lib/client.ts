import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '../env'

export function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  if (!token) throw new Error('Missing SANITY_API_WRITE_TOKEN')

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })
}

export function getReadClient() {
  if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')

  // Private datasets reject unauthenticated queries. Prefer a Viewer read
  // token; fall back to write token so a single Vercel secret still works.
  const token =
    process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  if (!token) {
    console.error(
      JSON.stringify({
        event: 'sanity_read_token_missing',
        ok: false,
        at: new Date().toISOString(),
      }),
    )
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    // Private datasets: prefer the live API over API CDN so authenticated
    // reads don't fail silently after visibility flips to private.
    useCdn: false,
  })
}
