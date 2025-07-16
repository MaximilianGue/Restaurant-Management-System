// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname.startsWith('/access') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.png') ||
    pathname.startsWith('/_next');

  if (isPublic) return NextResponse.next();

  const cookie = request.cookies.get('goluma-access');
  if (cookie?.value === '1') {
    return NextResponse.next(); // Zugang erlaubt
  }

  const url = request.nextUrl.clone();
  url.pathname = '/access';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|logo.png|access|api).*)'],
};
