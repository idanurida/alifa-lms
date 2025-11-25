import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Block all requests to this endpoint
  return NextResponse.json(
    { error: 'Endpoint temporarily disabled for build' },
    { status: 503 }
  )
}

export const config = {
  matcher: '/api/admin/update-passwords/:path*',
}