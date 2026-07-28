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

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: process.env.SANITY_API_READ_TOKEN,
    // Published content via API CDN — feeds are polled by calendar clients;
    // pair with /api/revalidate so publishes still show up promptly.
    useCdn: true,
  })
}
