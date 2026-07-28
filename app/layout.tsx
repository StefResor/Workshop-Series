import { Archivo, Archivo_Black, IBM_Plex_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './styles/globals.css'
import { sanityFetch } from '@/sanity/lib/fetch'
import { siteSettingsQuery } from '@/sanity/queries'
import type { SiteSettings } from '@/lib/types'
import { absoluteUrl, defaultOgImages, siteOrigin } from '@/lib/seo'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F3EFE7',
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SiteSettings | null>(siteSettingsQuery)
  const title =
    settings?.defaultTitle || 'Stefanie Schumacher — Relational Diplomacy'
  const description =
    settings?.defaultDescription ||
    'Structured, direct relationship work for high-responsibility professionals and leaders. Private-pay, online, and discreet.'
  const canonical = siteOrigin()

  return {
    title: {
      default: title,
      template: `%s · Stefanie Schumacher`,
    },
    description,
    metadataBase: new URL(canonical),
    applicationName: settings?.siteName || 'Stefanie Schumacher',
    authors: [{ name: settings?.siteName || 'Stefanie Schumacher' }],
    creator: settings?.siteName || 'Stefanie Schumacher',
    keywords: [
      'Stefanie Schumacher',
      'Relational Diplomacy',
      'couples therapy',
      'relationship workshops',
      'EMDR',
      'LPC',
      'online therapy',
    ],
    alternates: {
      canonical,
      types: {
        'application/json': absoluteUrl('/events.json'),
        'text/calendar': absoluteUrl('/events.ics'),
      },
    },
    openGraph: {
      title: settings?.ogTitle || title,
      description,
      url: canonical,
      siteName: settings?.siteName || 'Stefanie Schumacher',
      locale: 'en_US',
      type: 'website',
      images: defaultOgImages(),
    },
    twitter: {
      card: 'summary_large_image',
      title: settings?.twitterTitle || title,
      description,
      images: [absoluteUrl('/stefanie-schumacher.jpg')],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
