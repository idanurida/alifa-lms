// app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIP } from '@/lib/api/rate-limit-middleware';

export async function POST(req: NextRequest) {
  // Rate limiting
  const clientIp = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIp, 'auth');
  if (rateLimitResult) {
    return rateLimitResult.response;
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Ambil user data termasuk password hash
    const [user] = await sql`
      SELECT id, password_hash FROM users WHERE id = ${session.user.id}
    `;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verifikasi current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedNewPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.user.id}
    `;

    return NextResponse.json({ message: 'Password updated successfully' });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}