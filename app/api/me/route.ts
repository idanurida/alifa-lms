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

  return NextResponse.json({
    hasToken: !!token,
    role: token?.role || null,
    name: token?.name || null,
    cookieHeader: req.headers.get('cookie') ? 'present' : 'missing',
  });
}
