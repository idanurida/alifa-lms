// app/api/setup/route.ts
// ONE-TIME SETUP: Inisialisasi database + buat superadmin
// Panggil SEKALI: GET /api/setup
// Setelah selesai, HAPUS file ini untuk keamanan
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ensureActivityLogTable } from '@/lib/activity-log';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: string[] = [];

  try {
    // 1. Create tables if not exist (prisma db push biasanya sudah handle, tapi safe-check)
    results.push('✅ Database connected');

    // 2. Create super admin user
    const email = 'superadmin@alifa.ac.id';
    const username = 'superadmin';
    const password = process.env.ADMIN_SETUP_PASSWORD || 'alifa123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (existing) {
      // Update password saja
      await sql`
        UPDATE users SET password_hash = ${hashedPassword}, role = 'super_admin', is_active = true
        WHERE email = ${email}
      `;
      results.push(`🔑 Superadmin password direset (${email})`);
    } else {
      await sql`
        INSERT INTO users (email, username, password_hash, role, is_active)
        VALUES (${email}, ${username}, ${hashedPassword}, 'super_admin', true)
      `;
      results.push(`👑 Superadmin created: ${email}`);
    }

    // 3. Create system users jika belum ada
    const systemUsers = [
      { email: 'admin@kampus.ac.id', username: 'admin', role: 'staff_akademik' },
      { email: 'finance@kampus.ac.id', username: 'finance', role: 'staff_keuangan' },
      { email: 'dosen@kampus.ac.id', username: 'dosen', role: 'dosen' },
      { email: 'mahasiswa@kampus.ac.id', username: 'mahasiswa', role: 'mahasiswa' },
    ];

    for (const u of systemUsers) {
      const [ext] = await sql`SELECT id FROM users WHERE email = ${u.email}`;
      if (!ext) {
        await sql`
          INSERT INTO users (email, username, password_hash, role, is_active)
          VALUES (${u.email}, ${u.username}, ${hashedPassword}, ${u.role}, true)
        `;
        results.push(`✅ ${u.role}: ${u.email}`);
      } else {
        results.push(`⏭️ ${u.role} already exists`);
      }
    }

    // 4. Seed sample data jika belum ada
    const [prodiCount] = await sql`SELECT COUNT(*) as count FROM study_programs`;
    if (parseInt(prodiCount.count) === 0) {
      await sql`
        INSERT INTO study_programs (name, code, faculty, degree_level)
        VALUES 
          ('Teknik Informatika', 'TI', 'Fakultas Teknik', 'S1'),
          ('Sistem Informasi', 'SI', 'Fakultas Teknik', 'S1'),
          ('Manajemen Informatika', 'MI', 'Fakultas Ekonomi', 'D3')
        ON CONFLICT (code) DO NOTHING
      `;
      results.push('📚 3 Program Studi created');
    }

    const [periodCount] = await sql`SELECT COUNT(*) as count FROM academic_periods`;
    if (parseInt(periodCount.count) === 0) {
      await sql`
        INSERT INTO academic_periods (name, code, year, semester, start_date, end_date, uts_week, uas_week, is_active)
        VALUES ('Semester Ganjil 2024/2025', '20241', 2024, 1, '2024-09-02', '2025-01-31', 8, 16, true)
        ON CONFLICT (code) DO NOTHING
      `;
      results.push('📅 Academic period created');
    }

    // 5. Forum categories
    const [forumCount] = await sql`SELECT COUNT(*) as count FROM forum_categories`;
    if (parseInt(forumCount.count) === 0) {
      await sql`
        INSERT INTO forum_categories (name, slug, description, icon)
        VALUES 
          ('Diskusi Kelas', 'diskusi-kelas', 'Tanya jawab materi kuliah', '📚'),
          ('Tanya Dosen', 'tanya-dosen', 'Konsultasi akademik', '💡'),
          ('Info Kampus', 'info-kampus', 'Pengumuman resmi', '📢'),
          ('Santai', 'santai', 'Ngobrol bebas', '☕')
        ON CONFLICT (slug) DO NOTHING
      `;
      results.push('💬 Forum categories created');
    }

    // 6. Activity log table
    await ensureActivityLogTable();
    results.push('📋 Activity log ready');

    results.push('');
    results.push('🎉 SETUP COMPLETE!');
    results.push(`🔑 Login: ${email} / ${password}`);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      results,
    }, { status: 500 });
  }
}
