import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/sign-in', '/sign-up', '/api/auth/sign-in', '/api/auth/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session_id');

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Redirect authenticated users away from auth pages
    if (sessionCookie && (pathname === '/sign-in' || pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
