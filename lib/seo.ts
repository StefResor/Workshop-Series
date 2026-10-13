import type { Metadata } from 'next'
import type { SanityImageSource } from '@sanity/image-url'
import { urlForImage } from '@/lib/image'
import { absoluteUrl, siteOrigin } from '@/lib/site-url'
import type { SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import { siteSettingsQuery } from '@/sanity/queries'

type PageMetaInput = {
  title: string
  description: string
  path: string
  ogTitle?: string
  noIndex?: boolean
}

export const DEFAULT_SHARE_IMAGE = {
  url: '/og/og-default-2026-10.png',
  width: 1200,
  height: 630,
  alt: 'The Connection Workshop — Stefanie Schumacher, MS, LPC, EMDR',
} as const

export function defaultShareImage() {
  return {
    url: DEFAULT_SHARE_IMAGE.url,
    width: DEFAULT_SHARE_IMAGE.width,
    height: DEFAULT_SHARE_IMAGE.height,
    alt: DEFAULT_SHARE_IMAGE.alt,
  }
}

export function defaultShareImages() {
  return [defaultShareImage()]
}

export function shareImagesFromSettings(
  settings: Pick<SiteSettings, 'shareImage'> | null | undefined,
) {
  try {
    const img = settings?.shareImage
    if (!img?.asset) return defaultShareImages()
    const url = urlForImage(img as SanityImageSource, {
      width: 1200,
      height: 630,
      quality: 90,
      format: 'jpg',
      fit: 'crop',
    }).url()
    if (!url) return defaultShareImages()
    return [
      {
        url,
        width: 1200,
        height: 630,
        alt: img.alt?.trim() || DEFAULT_SHARE_IMAGE.alt,
      },
    ]
  } catch {
    return defaultShareImages()
  }
}

/** Fetch share images for metadata. Never throws. */
export async function shareOgImages() {
  try {
    const settings = await sanityFetch<Pick<SiteSettings, 'shareImage'> | null>(
      siteSettingsQuery,
    )
    return shareImagesFromSettings(settings)
  } catch {
    return defaultShareImages()
  }
}

export async function buildPageMetadata({
  title,
  description,
  path,
  ogTitle,
  noIndex,
}: PageMetaInput): Promise<Metadata> {
  const url = absoluteUrl(path)
  const og = ogTitle || title
  const images = await shareOgImages()

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: og,
      description,
      url,
      type: 'website',
      locale: 'en_US',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: og,
      description,
      images: [images[0]?.url ?? DEFAULT_SHARE_IMAGE.url],
    },
    // Only force noindex here. Otherwise omit robots so the root layout's
    // host-based allowSearchIndexing decision applies (blocks *.vercel.app).
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    other: {
      'geo.region': 'US-OH',
    },
  }
}

export { siteOrigin, absoluteUrl }
