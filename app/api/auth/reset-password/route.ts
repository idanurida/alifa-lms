// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    // Cari token yang valid dan belum kadaluarsa
    const [reset] = await sql`
      SELECT id, user_id, expires_at, used 
      FROM password_resets 
      WHERE token = ${token} AND used = false AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!reset) {
      return NextResponse.json({
        success: false,
        error: 'Token tidak valid atau sudah kadaluarsa. Silakan minta link reset baru.',
      }, { status: 400 });
    }

    // Hash password baru
    const hash = await bcrypt.hash(password, 12);

    // Update password
    await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${reset.user_id}`;

    // Tandai token sebagai sudah dipakai
    await sql`UPDATE password_resets SET used = true WHERE id = ${reset.id}`;

    return NextResponse.json({ success: true, message: 'Password berhasil direset!' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Gagal reset password' }, { status: 500 });
  }
}
