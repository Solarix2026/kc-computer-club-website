/* eslint-disable prettier/prettier */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication (public routes)
const publicRoutes = [
  '/auth/login', 
  '/auth/signup', 
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/change-password',
  '/auth/verify-email',
  '/admin/login',
  '/api',  // All API routes are public (they handle their own auth)
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname || '/';

  // Ensure pathname is a string before calling startsWith
  if (!pathname || typeof pathname !== 'string') {
    return NextResponse.next();
  }

  // Allow API routes to pass through (they handle their own auth)
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow public auth routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For all other routes, allow them through
  // Client-side AuthContext will handle redirects if user is not authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
