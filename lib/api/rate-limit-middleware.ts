// lib/api/rate-limit-middleware.ts
// Middleware wrapper untuk API route rate limiting

import { NextResponse } from 'next/server';
import { authRateLimit, apiRateLimit } from '@/lib/rate-limit';

type RateLimitType = 'auth' | 'api';

interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

/**
 * Cek rate limit untuk request API.
 * Return NextResponse error jika limit tercapai, null jika ok.
 */
export function checkRateLimit(
  ip: string,
  type: RateLimitType = 'api'
): { response: NextResponse; headers: RateLimitHeaders } | null {
  const limiter = type === 'auth' ? authRateLimit : apiRateLimit;
  const result = limiter(ip);

  const headers: RateLimitHeaders = {
    'X-RateLimit-Limit': type === 'auth' ? '5' : '60',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };

  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil(result.resetIn / 1000).toString();
    return {
      response: NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
        { status: 429, headers }
      ),
      headers,
    };
  }

  return null;
}

/**
 * Ekstrak IP dari request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}
