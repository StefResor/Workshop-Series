import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F3EFE7',
        color: '#14110E',
        fontFamily:
          "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        padding: '2rem 1.25rem 4rem',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>{children}</div>
    </div>
  )
}
