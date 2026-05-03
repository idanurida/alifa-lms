// app/api/me/route.ts
// Debug: cek session di server-side
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // Parse cookies manually for debug
  const rawCookie = req.headers.get('cookie') || '';
  const cookieNames = rawCookie.split(';').map(c => c.trim().split('=')[0]);
  const sessionCookies = cookieNames.filter(c => c.includes('session') || c.includes('token') || c.includes('auth'));

  return NextResponse.json({
    hasToken: !!token,
    role: token?.role || null,
    name: token?.name || null,
    secretSet: !!process.env.NEXTAUTH_SECRET,
    secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    sessionCookies,
    allCookieNames: cookieNames,
  });
}
