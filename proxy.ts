// proxy.ts — Minimal proxy (Next.js 16)
// Auth handling delegated to each page via getServerSession (Node.js runtime)
// Proxy hanya redirect unauthenticated users dari path dilindungi ke /login
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC = ['/login', '/api/auth', '/_next', '/images', '/favicon.ico',
  '/home', '/public', '/api/setup', '/api/init-data', '/auth'];

const PROTECTED = ['/akademik', '/keuangan', '/superadmin', '/laporan',
  '/pengaturan', '/forum', '/chat', '/mahasiswa', '/dosen', '/staff-keuangan'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.headers.get('cookie') || '';

  // Public paths (termasuk root /) → always allow
  if (pathname === '/' || PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protected paths → redirect to login ONLY if no auth cookie at all
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    if (!cookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Cookie exists → allow (auth checked by page itself)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
