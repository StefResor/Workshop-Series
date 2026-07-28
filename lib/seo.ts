import type { Metadata } from 'next'
import { absoluteUrl, siteOrigin } from '@/lib/site-url'

type PageMetaInput = {
  title: string
  description: string
  path: string
  ogTitle?: string
  noIndex?: boolean
}

export function buildPageMetadata({
  title,
  description,
  path,
  ogTitle,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path)
  const og = ogTitle || title

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
      images: [
        {
          url: absoluteUrl('/stefanie-schumacher.jpg'),
          width: 1200,
          height: 1800,
          alt: 'Stefanie Schumacher, MS, LPC, EMDR',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: og,
      description,
      images: [absoluteUrl('/stefanie-schumacher.jpg')],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    other: {
      'geo.region': 'US-OH',
    },
  }
}

export function defaultOgImages() {
  return [
    {
      url: absoluteUrl('/stefanie-schumacher.jpg'),
      width: 1200,
      height: 1800,
      alt: 'Stefanie Schumacher, MS, LPC, EMDR',
    },
  ]
}

export { siteOrigin, absoluteUrl }
