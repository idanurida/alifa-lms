// app/api/admin/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, invitationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
    }

    // Cek user exists
    const [user] = await sql`SELECT id, email, username, role FROM users WHERE id = ${parseInt(userId)}`;
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Generate simple readable password
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars[crypto.randomInt(chars.length)];
    }

    const hash = await bcrypt.hash(password, 12);

    await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${user.id}`;

    // Kirim email undangan
    const loginUrl = `${process.env.NEXTAUTH_URL || ''}/login`;
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Akun ALIFA LMS Anda Sudah Siap!',
      html: invitationEmail(loginUrl, user.email, password, user.username),
    });

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Password direset & email terkirim' : 'Password direset (email gagal - SMTP belum di-set)',
      user: { email: user.email, username: user.username, role: user.role },
      newPassword: password,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal reset password' }, { status: 500 });
  }
}

// Batch reset: reset semua user dengan role tertentu
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { role } = await req.json();
    
    let users;
    if (role) {
      users = await sql`SELECT id, email, username FROM users WHERE role = ${role} AND is_active = true`;
    } else {
      return NextResponse.json({ error: 'role diperlukan' }, { status: 400 });
    }

    if (users.length === 0) {
      return NextResponse.json({ error: 'Tidak ada user dengan role tersebut' }, { status: 404 });
    }

    const results: any[] = [];
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';

    for (const user of users) {
      let password = '';
      for (let i = 0; i < 10; i++) password += chars[crypto.randomInt(chars.length)];
      const hash = await bcrypt.hash(password, 12);
      await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${user.id}`;
      results.push({ email: user.email, username: user.username, password });
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} password berhasil direset`,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal batch reset' }, { status: 500 });
  }
}
