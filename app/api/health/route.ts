// app/api/health/route.ts
// Public health check — no auth, no database
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    status: 'ok',
    time: new Date().toISOString(),
    hasDbUrl: !!process.env.DATABASE_URL,
    hasAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  });
}
