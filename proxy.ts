// proxy.ts — Route protection berbasis role + JWT (Next.js 16)
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mapping: prefix path → role yang diizinkan (array kosong = semua role terautentikasi)
const ROLE_PATH_MAP: Record<string, string[]> = {
  '/akademik':       ['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'],
  '/keuangan':       ['super_admin', 'staff_keuangan', 'mahasiswa'],
  '/superadmin':     ['super_admin'],
  '/super-admin':    ['super_admin'],
  '/laporan':        ['super_admin', 'staff_akademik', 'staff_keuangan'],
  '/pengaturan':     ['super_admin', 'staff_akademik', 'staff_keuangan', 'dosen', 'mahasiswa'],
  '/forum':          ['super_admin', 'staff_akademik', 'staff_keuangan', 'dosen', 'mahasiswa'],
  '/mahasiswa':      ['super_admin', 'staff_akademik', 'mahasiswa'],
  '/dosen':          ['super_admin', 'staff_akademik', 'dosen'],
  '/staff-keuangan': ['super_admin', 'staff_keuangan'],
};

// Role-based redirect setelah login
const ROLE_HOME: Record<string, string> = {
  super_admin:     '/superadmin',
  staff_akademik:  '/akademik',
  staff_keuangan:  '/keuangan',
  dosen:           '/dosen/dashboard',
  mahasiswa:       '/mahasiswa/dashboard',
};

// Path publik (tidak perlu login)
const PUBLIC_PREFIXES = [
  '/login', '/api/auth', '/_next', '/images', '/favicon.ico',
  '/home', '/public', '/api/setup', '/api/health', '/api/me',
];

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) ||
    /\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/i.test(pathname);
}

function isProtected(pathname: string): boolean {
  return Object.keys(ROLE_PATH_MAP).some(prefix => pathname.startsWith(prefix));
}

function hasAccess(role: string, pathname: string): boolean {
  for (const [prefix, allowedRoles] of Object.entries(ROLE_PATH_MAP)) {
    if (pathname.startsWith(prefix)) {
      return allowedRoles.includes(role);
    }
  }
  return true; // path tidak dikenal → izinkan (API routes akan handle sendiri)
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Root path → cek token dulu, redirect ke dashboard jika login
  if (pathname === '/') {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });
    if (token?.role) {
      const home = ROLE_HOME[token.role as string] || '/akademik';
      return NextResponse.redirect(new URL(home, req.url));
    }
    // Belum login → tampilkan landing page
    return NextResponse.next();
  }

  // 2. Path publik (login, auth, static, api/setup, api/health) → lanjutkan
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 3. Cek token JWT
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // 4. Tidak ada token → redirect ke login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // 5. Path dilindungi → cek role
  if (isProtected(pathname)) {
    if (!hasAccess(role, pathname)) {
      const home = ROLE_HOME[role] || '/akademik';
      return NextResponse.redirect(new URL(home, req.url));
    }
  }

  // 6. Path lainnya → lanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
