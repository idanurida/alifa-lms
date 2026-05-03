// app/api/setup/route.ts
// ONE-TIME SETUP: Inisialisasi database + buat semua user
// Panggil SEKALI: GET /api/setup → HAPUS setelah selesai!
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

async function createTableIfNotExists() {
  // Create minimal tables needed for auth to work
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa',
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )`,
    `CREATE TABLE IF NOT EXISTS study_programs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      faculty VARCHAR(255),
      degree_level VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS academic_periods (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      year INT NOT NULL,
      semester INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      uts_week INT,
      uas_week INT,
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS forum_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      action VARCHAR(50) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT,
      details TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
  ];

  for (const q of queries) {
    try {
      await prisma.$executeRawUnsafe(q);
    } catch (e) {
      // Table might already exist
    }
  }
}

export async function GET() {
  const results: string[] = [];

  try {
    // Step 0: Test connection
    const [dbTest] = await sql`SELECT 1 as ok`;
    results.push('✅ Database connected');
  } catch {
    return NextResponse.json({
      success: false,
      error: 'DATABASE_URL not configured. Set it in Vercel Environment Variables.',
    }, { status: 500 });
  }

  try {
    // Step 1: Create tables
    await createTableIfNotExists();
    results.push('📋 Tables verified/created');

    // Step 2: Create users
    const password = process.env.ADMIN_SETUP_PASSWORD || 'alifa123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const users = [
      { email: 'superadmin@alifa.ac.id', username: 'superadmin', role: 'super_admin', label: 'Super Admin' },
      { email: 'admin@kampus.ac.id', username: 'admin', role: 'staff_akademik', label: 'Staff Akademik' },
      { email: 'finance@kampus.ac.id', username: 'finance', role: 'staff_keuangan', label: 'Staff Keuangan' },
      { email: 'dosen@kampus.ac.id', username: 'dosen', role: 'dosen', label: 'Dosen' },
      { email: 'mahasiswa@kampus.ac.id', username: 'mahasiswa', role: 'mahasiswa', label: 'Mahasiswa' },
    ];

    for (const u of users) {
      try {
        const [ext] = await sql`SELECT id FROM users WHERE email = ${u.email}`;
        if (ext) {
          await sql`UPDATE users SET password_hash = ${hashedPassword}, role = ${u.role}, is_active = true WHERE email = ${u.email}`;
          results.push(`🔑 ${u.label} password reset`);
        } else {
          await sql`INSERT INTO users (email, username, password_hash, role, is_active) VALUES (${u.email}, ${u.username}, ${hashedPassword}, ${u.role}, true)`;
          results.push(`👤 ${u.label} created: ${u.email}`);
        }
      } catch (e: any) {
        results.push(`⚠️ ${u.label}: ${e.message}`);
      }
    }

    // Step 3: Seed study programs
    const [spCount] = await sql`SELECT COUNT(*)::int as count FROM study_programs`;
    if (spCount.count === 0) {
      await sql`INSERT INTO study_programs (name, code, faculty, degree_level) VALUES ('Teknik Informatika', 'TI', 'Fakultas Teknik', 'S1') ON CONFLICT (code) DO NOTHING`;
      await sql`INSERT INTO study_programs (name, code, faculty, degree_level) VALUES ('Sistem Informasi', 'SI', 'Fakultas Teknik', 'S1') ON CONFLICT (code) DO NOTHING`;
      results.push('📚 Study programs created');
    }

    // Step 4: Seed academic period
    const [apCount] = await sql`SELECT COUNT(*)::int as count FROM academic_periods`;
    if (apCount.count === 0) {
      await sql`INSERT INTO academic_periods (name, code, year, semester, start_date, end_date, uts_week, uas_week, is_active) VALUES ('Semester Ganjil 2024/2025', '20241', 2024, 1, '2024-09-02', '2025-01-31', 8, 16, true) ON CONFLICT (code) DO NOTHING`;
      results.push('📅 Academic period created');
    }

    // Step 5: Forum categories
    const [fcCount] = await sql`SELECT COUNT(*)::int as count FROM forum_categories`;
    if (fcCount.count === 0) {
      await sql`INSERT INTO forum_categories (name, slug, description, icon) VALUES ('Diskusi Kelas', 'diskusi-kelas', 'Tanya jawab materi', '📚') ON CONFLICT (slug) DO NOTHING`;
      await sql`INSERT INTO forum_categories (name, slug, description, icon) VALUES ('Tanya Dosen', 'tanya-dosen', 'Konsultasi akademik', '💡') ON CONFLICT (slug) DO NOTHING`;
      await sql`INSERT INTO forum_categories (name, slug, description, icon) VALUES ('Info Kampus', 'info-kampus', 'Pengumuman resmi', '📢') ON CONFLICT (slug) DO NOTHING`;
      await sql`INSERT INTO forum_categories (name, slug, description, icon) VALUES ('Santai', 'santai', 'Ngobrol bebas', '☕') ON CONFLICT (slug) DO NOTHING`;
      results.push('💬 Forum categories created');
    }

    results.push('');
    results.push('🎉 SETUP COMPLETE!');
    results.push(`🔑 Login: superadmin@alifa.ac.id / ${password}`);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      results,
    }, { status: 500 });
  }
}
