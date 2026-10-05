import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Strip leftover Topic/Dates pane ids from restored Studio URLs. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/studio/structure/')) {
    return NextResponse.next()
  }
  const cleaned = pathname.replace(/;(topic|dates|season)$/, '')
  if (cleaned === pathname) {
    return NextResponse.next()
  }
  const url = request.nextUrl.clone()
  url.pathname = cleaned
  return NextResponse.redirect(url)
}

export const config = {
  matcher: '/studio/structure/:path*',
}
