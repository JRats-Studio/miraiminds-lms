import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Paths that require an authenticated Payload session
const protectedRoutes = [
  '/dashboard',
  '/grades',
  '/subjects',
  '/modules',
  '/lessons',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip non-HTML routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Check if the path is protected
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Payload stores the JWT in a cookie named `payload-token`
  const hasSession = Boolean(request.cookies.get('payload-token')?.value)

  if (!hasSession) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/grades/:path*', '/subjects/:path*', '/modules/:path*', '/lessons/:path*'],
}

