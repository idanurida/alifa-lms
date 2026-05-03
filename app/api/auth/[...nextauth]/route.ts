import NextAuth from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP } from '@/lib/api/rate-limit-middleware';

const handler = NextAuth(authOptions);

async function withRateLimit(
  req: NextRequest,
  ctx: { params: Record<string, string> }
) {
  // Rate-limit POST (login attempts) — 5 percobaan per menit per IP
  if (req.method === 'POST') {
    const clientIp = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientIp, 'auth');
    if (rateLimitResult) {
      return rateLimitResult.response;
    }
  }
  return handler(req, ctx);
}

export { withRateLimit as GET, withRateLimit as POST };