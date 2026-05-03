// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    // Cek apakah email ada di database
    const [user] = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (!user) {
      // Jangan bocorkan apakah email ada — tetap kirim sukses
      return NextResponse.json({ success: true, message: 'Jika email terdaftar, link reset akan dikirim.' });
    }

    // Generate token reset (simulasi — production harus kirim email beneran)
    // const token = crypto.randomUUID();
    // Simpan token ke database dengan expiry
    // Kirim email dengan link: /auth/reset-password?token=xxx

    return NextResponse.json({ success: true, message: 'Link reset password telah dikirim ke email Anda.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Gagal memproses permintaan' }, { status: 500 });
  }
}
