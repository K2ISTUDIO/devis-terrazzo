import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protection admin
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminKey = request.cookies.get('admin_key')?.value
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protection dashboard artisan
  if (pathname.startsWith('/artisans/dashboard') || pathname.startsWith('/artisans/recharger')) {
    const token = request.cookies.get('artisan_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/artisans/connexion', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/artisans/dashboard/:path*', '/artisans/recharger/:path*'],
}
