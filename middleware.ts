import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function unauthorized(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  })
}

/** Constant-time-ish string compare for Edge (no Node crypto). */
function timingSafeEqualString(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  const len = Math.max(aBytes.length, bBytes.length)
  let diff = aBytes.length ^ bBytes.length
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0)
  }
  return diff === 0
}

export function middleware(req: NextRequest) {
  // Trim so Vercel empty string or whitespace-only values fail closed (503),
  // never compare against "" / "   ".
  const user = process.env.ADMIN_USER?.trim() ?? ''
  const pass = process.env.ADMIN_PASSWORD?.trim() ?? ''

  if (!user || !pass) {
    return new NextResponse('Admin auth not configured', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const header = req.headers.get('authorization')
  if (!header?.startsWith('Basic ')) {
    return unauthorized()
  }

  let decoded: string
  try {
    decoded = atob(header.slice('Basic '.length).trim())
  } catch {
    return unauthorized()
  }

  const colon = decoded.indexOf(':')
  if (colon < 0) return unauthorized()

  const providedUser = decoded.slice(0, colon)
  const providedPass = decoded.slice(colon + 1)

  if (
    !timingSafeEqualString(providedUser, user) ||
    !timingSafeEqualString(providedPass, pass)
  ) {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin', '/api/admin/:path*'],
}
