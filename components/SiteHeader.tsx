'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/approach', label: 'Approach' },
  { href: '/workshops', label: 'Workshops' },
  { href: '/fees', label: 'Fees' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader({ siteName }: { siteName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="topbar">
      <Link href="/" className="wordmark" onClick={() => setOpen(false)}>
        {siteName}
      </Link>
      <button
        ref={toggleRef}
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls={navId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id={navId} className={`nav${open ? ' is-open' : ''}`} aria-label="Primary">
        {LINKS.map((link) => {
          const current =
            pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
