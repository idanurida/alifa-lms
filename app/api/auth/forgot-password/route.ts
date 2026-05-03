// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';
import { z } from 'zod';
import { sendEmail, resetPasswordEmail } from '@/lib/email';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    // Cari user
    const [user] = await sql`SELECT id, email FROM users WHERE email = ${email}`;

    if (!user) {
      // Jangan bocorkan apakah email ada
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link reset akan muncul di bawah.',
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 jam

    // Simpan token (pakai table users atau buat table reset_tokens)
    // Simpan langsung di user untuk simplicity
    await sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expires})
    `;

    // Kirim email reset password
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    const { sent } = await sendEmail({
      to: email,
      subject: 'Reset Password - ALIFA LMS',
      html: resetPasswordEmail(resetUrl),
    });

    return NextResponse.json({
      success: true,
      message: sent
        ? 'Link reset password telah dikirim ke email Anda. Cek inbox.'
        : 'Link reset password berhasil dibuat. Silakan cek halaman Log Email superadmin.',
      resetUrl: sent ? undefined : resetUrl,
      expiresIn: '1 jam',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Gagal memproses permintaan' }, { status: 500 });
  }
}
