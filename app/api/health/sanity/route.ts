import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export const dynamic = 'force-dynamic'

/** Lightweight sanity check — does not expose token values. */
export async function GET() {
  const hasReadToken = Boolean(process.env.SANITY_API_READ_TOKEN)
  const hasWriteToken = Boolean(process.env.SANITY_API_WRITE_TOKEN)
  const token =
    process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN

  if (!projectId) {
    return NextResponse.json(
      { ok: false, hasReadToken, hasWriteToken, error: 'missing projectId' },
      { status: 500 },
    )
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })

  try {
    const workshopCount = await client.fetch<number>(
      `count(*[_type == "workshop"])`,
    )
    const hasSettings = Boolean(
      await client.fetch(`*[_type == "siteSettings"][0]._id`),
    )
    return NextResponse.json({
      ok: true,
      hasReadToken,
      hasWriteToken,
      dataset,
      workshopCount,
      hasSettings,
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        hasReadToken,
        hasWriteToken,
        dataset,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
