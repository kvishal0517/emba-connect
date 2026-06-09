import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromToken } from '@/lib/jwt'; // Imports from lib/jwt which is Edge-safe

const COOKIE_NAME = 'emba_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public assets and auth APIs pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/pending-approval' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);

  // 1. Not logged in: Redirect to login page
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Pending approval: Redirect dashboard routes to /pending-approval
  if (session.status === 'PENDING') {
    if (pathname !== '/pending-approval') {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Account pending approval' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    return NextResponse.next();
  }

  // Prevent users from accessing /pending-approval if they are approved
  if (pathname === '/pending-approval' && session.status === 'APPROVED') {
    return NextResponse.redirect(new URL(getDashboardRoute(session.role), request.url));
  }

  // 3. Role-based Routing Protection for /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const role = session.role;
    const allowedPath = getDashboardRoute(role);

    // If the path doesn't start with the allowed sub-dashboard path, redirect them
    if (!pathname.startsWith(allowedPath)) {
      return NextResponse.redirect(new URL(allowedPath, request.url));
    }
  }

  return NextResponse.next();
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    case 'ADMIN':
      return '/dashboard/admin';
    case 'PROFESSOR':
      return '/dashboard/professor';
    case 'STUDENT':
      return '/dashboard/student';
    default:
      return '/login';
  }
}

// Config to specify which paths the middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pending-approval',
    '/api/dashboard/:path*',
    '/api/users/:path*',
    '/api/syllabus/:path*',
    '/api/assignments/:path*',
    '/api/classes/:path*',
    '/api/notifications/:path*',
  ],
};
