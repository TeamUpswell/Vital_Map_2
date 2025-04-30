import { NextResponse } from 'next/server';

export function middleware(request) {
  // When accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for authentication cookie or localStorage
    const authCookie = request.cookies.get('adminAuthenticated')?.value;

    // If this is the first visit to admin, allow it to show the login page
    const url = new URL('/admin', request.url);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
