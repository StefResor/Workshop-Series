import type { Metadata } from 'next'

// Temporary root shell so Next can boot. Marketing pages are out of scope
// until schemas + seed are done and design-decision.md is finalized.

export const metadata: Metadata = {
  title: 'Stefanie Schumacher',
  description:
    'Structured, direct relationship work for high-responsibility professionals and leaders. Private-pay, online, and discreet.',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
