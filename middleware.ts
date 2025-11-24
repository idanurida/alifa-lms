// middleware.ts - VERSI DIPERBAIKI
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Definisikan path mana yang dilindungi
const protectedPaths = [
  '/akademik',
  '/keuangan',
  '/superadmin',
  '/super-admin', 
  '/pengaturan',
  '/forum',
  '/mahasiswa',
  '/dosen',
  '/staff-keuangan',
];

// Definisikan role mana yang bisa mengakses path mana
const roleAccessMap: Record<string, string[]> = {
  super_admin: [
    // Super admin bisa akses SEMUA path
    '/superadmin', '/super-admin', '/akademik', '/keuangan', '/pengaturan', '/forum',
    '/mahasiswa', '/dosen', '/staff-keuangan',
    
    // Semua path akademik lengkap
    '/akademik/dosen', '/akademik/kalender-akademik', '/akademik/kelas', '/akademik/kurikulum',
    '/akademik/mahasiswa', '/akademik/mata-kuliah', '/akademik/program-studi', '/akademik/skala-nilai',
    '/akademik/dosen/tambah', '/akademik/dosen/[id]', '/akademik/kelas/tambah', '/akademik/kelas/[id]',
    '/akademik/kurikulum/tambah', '/akademik/kurikulum/[id]', '/akademik/mahasiswa/tambah', '/akademik/mahasiswa/[id]',
    '/akademik/mata-kuliah/tambah', '/akademik/program-studi/tambah', '/akademik/skala-nilai/[kurikulumId]',
    '/akademik/kelas/[id]/dosen', '/akademik/kelas/[id]/dosen/tambah', '/akademik/kurikulum/[id]/edit',
    '/akademik/mahasiswa/[id]/edit', '/akademik/mahasiswa/[id]/krs',
    
    // Route dosen yang baru dibuat
    '/akademik/dosen/kelas', '/akademik/dosen/kelas/[id]',
    '/akademik/dosen/penilaian', '/akademik/dosen/materi', '/akademik/dosen/presensi',
    
    // API Routes baru
    '/api/akademik/krs', '/api/akademik/krs/pending', '/api/akademik/krs/approve',
    '/api/akademik/mata-kuliah/tersedia', '/api/akademik/mahasiswa/profil', '/api/akademik/mahasiswa',
    
    // Semua path keuangan lengkap
    '/keuangan/bukti-transfer', '/keuangan/verifikasi', '/keuangan/bukti-transfer/tambah',
    
    // Semua path forum lengkap
    '/forum', '/forum/[category]', '/forum/thread/[id]', '/forum/buat-thread',
    
    // Semua path pengaturan lengkap
    '/pengaturan', '/pengaturan/identitas', '/pengaturan/keamanan', '/pengaturan/profil', '/pengaturan/identitas/upload',
    
    // Dashboard semua role
    '/mahasiswa/dashboard', '/dosen/dashboard', '/staff-keuangan/dashboard', '/super-admin/dashboard',
    '/superadmin/pengaturan-sistem',
  ],

  staff_akademik: [
    // Path akademik utama
    '/akademik', '/akademik/program-studi', '/akademik/kurikulum', '/akademik/mata-kuliah',
    '/akademik/kelas', '/akademik/mahasiswa', '/akademik/dosen', '/akademik/kalender-akademik', '/akademik/skala-nilai',
    
    // CRUD operations lengkap
    '/akademik/dosen/tambah', '/akademik/dosen/[id]', '/akademik/kelas/tambah', '/akademik/kelas/[id]',
    '/akademik/kurikulum/tambah', '/akademik/kurikulum/[id]', '/akademik/mahasiswa/tambah', '/akademik/mahasiswa/[id]',
    '/akademik/mata-kuliah/tambah', '/akademik/program-studi/tambah', '/akademik/skala-nilai/[kurikulumId]',
    '/akademik/kelas/[id]/dosen', '/akademik/kelas/[id]/dosen/tambah', '/akademik/kurikulum/[id]/edit',
    '/akademik/mahasiswa/[id]/edit', '/akademik/mahasiswa/[id]/krs',
    
    // Route dosen untuk monitoring
    '/akademik/dosen/kelas', '/akademik/dosen/kelas/[id]',
    '/akademik/dosen/penilaian', '/akademik/dosen/materi', '/akademik/dosen/presensi',
    
    // API Routes baru untuk monitoring
    '/api/akademik/krs', '/api/akademik/krs/pending', '/api/akademik/krs/approve',
    '/api/akademik/mata-kuliah/tersedia', '/api/akademik/mahasiswa/profil', '/api/akademik/mahasiswa',
    
    // Akses ke fitur mahasiswa untuk monitoring
    '/mahasiswa/dashboard', '/akademik/mahasiswa/krs', '/akademik/mahasiswa/nilai', '/akademik/mahasiswa/kelas',
    
    // Forum & pengaturan
    '/pengaturan', '/forum', '/pengaturan/identitas', '/pengaturan/keamanan', '/pengaturan/profil',
  ],

  staff_keuangan: [
    // Path keuangan utama
    '/keuangan', '/keuangan/bukti-transfer', '/keuangan/verifikasi',
    '/keuangan/bukti-transfer/tambah',
    
    // Butuh akses ke data mahasiswa untuk pembayaran
    '/akademik/mahasiswa', '/akademik/mahasiswa/[id]',
    
    // Pengaturan
    '/pengaturan', '/pengaturan/identitas', '/pengaturan/keamanan', '/pengaturan/profil',
    
    // Dashboard
    '/staff-keuangan/dashboard',
  ],

  dosen: [
    // PERBAIKAN: Hapus '/akademik/dosen' karena ini untuk staff akademik
    // Dashboard dosen
    '/dosen/dashboard',
    
    // Path dosen utama
    '/akademik/dosen/kelas', '/akademik/dosen/kelas/[id]',
    '/akademik/dosen/penilaian', '/akademik/dosen/materi', '/akademik/dosen/presensi',
    
    // Akses ke kelas yang diampu
    '/akademik/kelas/[id]', '/akademik/kelas/[id]/dosen',
    
    // Akses ke data mahasiswa di kelasnya
    '/akademik/mahasiswa/[id]', '/akademik/mahasiswa/[id]/krs',
    
    // Kalender akademik
    '/akademik/kalender-akademik',
    
    // Forum & pengaturan
    '/pengaturan', '/forum', '/pengaturan/profil', '/pengaturan/keamanan',
    '/forum/[category]', '/forum/thread/[id]', '/forum/buat-thread',
  ],

  mahasiswa: [
    // Dashboard mahasiswa
    '/mahasiswa/dashboard',
    
    // Path akademik mahasiswa
    '/akademik/mahasiswa', '/akademik/mahasiswa/kelas', '/akademik/mahasiswa/krs', '/akademik/mahasiswa/nilai',
    '/akademik/mahasiswa/kelas/[id]',
    
    // API Routes baru untuk KRS
    '/api/akademik/krs',
    '/api/akademik/mata-kuliah/tersedia',
    '/api/akademik/mahasiswa/profil',
    
    // Dynamic routes untuk data sendiri
    '/akademik/mahasiswa/[id]', '/akademik/mahasiswa/[id]/krs',
    
    // Kalender akademik
    '/akademik/kalender-akademik',
    
    // Keuangan
    '/keuangan/bukti-transfer', '/keuangan/bukti-transfer/tambah',
    
    // Pengaturan
    '/pengaturan', '/pengaturan/profil', '/pengaturan/keamanan', '/pengaturan/identitas',
    '/pengaturan/identitas/upload',
    
    // Forum
    '/forum', '/forum/[category]', '/forum/thread/[id]', '/forum/buat-thread',
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Cek apakah path adalah publik (termasuk root '/')
  const isPublicPath = pathname === '/' || 
                       pathname.startsWith('/login') || 
                       pathname.startsWith('/api/auth') ||
                       pathname.startsWith('/auth') ||
                       pathname.startsWith('/public') ||
                       pathname.startsWith('/_next') ||
                       pathname.startsWith('/images') ||
                       pathname.endsWith('.ico') ||
                       pathname.endsWith('.png') ||
                       pathname.endsWith('.jpg') ||
                       pathname.endsWith('.jpeg') ||
                       pathname.endsWith('.svg') ||
                       false;

  if (isPublicPath) {
    return NextResponse.next();
  }

  // PERBAIKAN: Handle redirect untuk dosen yang akses /akademik/dosen
  if (pathname === '/akademik/dosen') {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (token && token.role === 'dosen') {
      console.log(`[MIDDLEWARE] Redirecting dosen from /akademik/dosen to /dosen/dashboard`);
      return NextResponse.redirect(new URL('/dosen/dashboard', req.url));
    }
  }

  // Handle redirect untuk root path berdasarkan role
  if (pathname === '/') {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (token) {
      const userRole = token.role as string;
      
      // Redirect berdasarkan role
      let redirectPath = '/akademik'; // Default untuk staff akademik
      
      switch (userRole) {
        case 'super_admin':
          redirectPath = '/super-admin/dashboard';
          break;
        case 'staff_akademik':
          redirectPath = '/akademik';
          break;
        case 'staff_keuangan':
          redirectPath = '/keuangan';
          break;
        case 'dosen':
          redirectPath = '/dosen/dashboard'; // PERBAIKAN: Redirect ke dashboard dosen
          break;
        case 'mahasiswa':
          redirectPath = '/mahasiswa/dashboard';
          break;
        default:
          redirectPath = '/akademik';
      }

      console.log(`[MIDDLEWARE] Redirecting ${userRole} from root to ${redirectPath}`);
      return NextResponse.redirect(new URL(redirectPath, req.url));
    } else {
      // Jika tidak ada token, redirect ke login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Handle jika ada yang akses route staff-akademik yang sudah dihapus
  if (pathname.startsWith('/staff-akademik')) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (token && token.role === 'staff_akademik') {
      console.log(`[MIDDLEWARE] Redirecting staff_akademik from deleted route ${pathname} to /akademik`);
      return NextResponse.redirect(new URL('/akademik', req.url));
    } else {
      // Untuk role lain, redirect ke unauthorized
      return NextResponse.redirect(new URL('/tidak-diizinkan', req.url));
    }
  }

  // Cek apakah path dilindungi
  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtectedPath) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (!token) {
      console.log(`[MIDDLEWARE] No token found for protected path: ${pathname}, redirecting to login.`);
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    const userRole = token.role as string;

    // PERBAIKAN: Handle khusus untuk dosen yang akses route staff akademik
    if (userRole === 'dosen' && pathname.startsWith('/akademik/dosen') && !pathname.includes('/kelas') && !pathname.includes('/penilaian') && !pathname.includes('/materi') && !pathname.includes('/presensi')) {
      console.log(`[MIDDLEWARE] Redirecting dosen from staff akademik route ${pathname} to /dosen/dashboard`);
      return NextResponse.redirect(new URL('/dosen/dashboard', req.url));
    }

    // Cek apakah role diizinkan mengakses path ini
    const allowedPaths = roleAccessMap[userRole] || [];
    const isAllowed = allowedPaths.some(allowedPath => {
      // Untuk path dengan parameter dinamis
      if (allowedPath.includes('[') && allowedPath.includes(']')) {
        const basePath = allowedPath.split('/[')[0];
        return pathname.startsWith(basePath);
      }
      // Untuk path statis
      return pathname.startsWith(allowedPath);
    });

    if (isAllowed) {
      return NextResponse.next();
    } else {
      console.warn(`[MIDDLEWARE] Access denied for role '${userRole}' to path '${pathname}'`);

      // Redirect ke halaman unauthorized jika tidak diizinkan
      const url = req.nextUrl.clone();
      url.pathname = '/tidak-diizinkan';
      return NextResponse.redirect(url);
    }
  }

  // Jika path bukan dilindungi dan bukan publik, izinkan
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login page
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};