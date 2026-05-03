// proxy.ts — Route protection (Next.js 16 Edge Runtime)
// CATATAN: Edge runtime tidak bisa decode JWT next-auth.
// Strategi: cek keberadaan session cookie saja, bukan decode token.
// Autentikasi detail diserahkan ke halaman (getServerSession di Node.js runtime).
import { NextRequest, NextResponse } from 'next/server';

// Path publik (tidak perlu login sama sekali)
const PUBLIC_PREFIXES = [
  '/login', '/api/auth', '/_next', '/images', '/favicon.ico',
  '/home', '/public', '/api/setup', '/api/health', '/api/me',
  '/redirect',
];

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) ||
    /\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/i.test(pathname);
}

// Path yang wajib login (hanya cek cookie exists, bukan decode JWT)
const PROTECTED_PREFIXES = [
  '/akademik', '/keuangan', '/superadmin', '/laporan',
  '/pengaturan', '/forum', '/mahasiswa', '/dosen', '/staff-keuangan',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
}

/**
 * Cek apakah request memiliki session cookie (tanpa decode JWT).
 * Cookie name: __Secure-next-auth.session-token (production HTTPS)
 *              next-auth.session-token (development HTTP)
 */
function hasSessionCookie(req: NextRequest): boolean {
  const cookies = req.cookies;
  // Cek kedua kemungkinan nama cookie
  return cookies.has('__Secure-next-auth.session-token') ||
         cookies.has('next-auth.session-token');
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Path publik → lanjutkan
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2. Path dilindungi → cek cookie
  if (isProtected(pathname)) {
    if (!hasSessionCookie(req)) {
      // Tidak ada cookie → redirect ke login
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Cookie ada → lanjutkan (halaman akan cek auth via getServerSession)
  }

  // 3. Path lainnya → lanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
