// lib/seed-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Local safe sql helper for seeding avoids prepared statements
async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const query = strings.reduce((acc, part, i) => {
    let valueStr = '';
    if (i < values.length) {
      const value = values[i];
      if (value === null || value === undefined) {
        valueStr = 'NULL';
      } else if (typeof value === 'string') {
        valueStr = `'${value.replace(/'/g, "''")}'`;
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        valueStr = `'${JSON.stringify(value)}'`;
      } else if (value instanceof Date) {
        valueStr = `'${value.toISOString()}'`;
      } else {
        valueStr = String(value);
      }
    }
    return acc + part + valueStr;
  }, '');
  return prisma.$executeRawUnsafe(query);
}

export async function seedSampleData() {
  console.log('🌱 Seeding sample data for ALIFA Institute...');
  try {
    // Program Studi
    await sql`
      INSERT INTO study_programs (name, code, faculty) 
      VALUES 
        ('Teknik Informatika', 'TI', 'Fakultas Teknik'),
        ('Sistem Informasi', 'SI', 'Fakultas Teknik'),
        ('Manajemen Informatika', 'MI', 'Fakultas Ekonomi')
      ON CONFLICT (code) DO NOTHING
    `;

    // Kurikulum
    await sql`
      INSERT INTO curricula (name, code, study_program_id, total_credits) 
      VALUES 
        ('Kurikulum TI 2024', 'TI2024', 1, 144),
        ('Kurikulum SI 2024', 'SI2024', 2, 144),
        ('Kurikulum MI 2024', 'MI2024', 3, 144)
      ON CONFLICT (code) DO NOTHING
    `;

    // Skala Nilai
    await sql`
      INSERT INTO grade_scales (curriculum_id, grade_char, grade_value, min_score, max_score, description) 
      VALUES 
        (1, 'A', 4.0, 85, 100, 'Sangat Baik'),
        (1, 'A-', 3.7, 80, 84, 'Baik Sekali'),
        (1, 'B+', 3.3, 75, 79, 'Baik Plus'),
        (1, 'B', 3.0, 70, 74, 'Baik'),
        (1, 'B-', 2.7, 65, 69, 'Cukup Baik'),
        (1, 'C+', 2.3, 60, 64, 'Cukup Plus'),
        (1, 'C', 2.0, 55, 59, 'Cukup'),
        (1, 'D', 1.0, 40, 54, 'Kurang'),
        (1, 'E', 0.0, 0, 39, 'Gagal')
      ON CONFLICT DO NOTHING
    `;

    // Periode Akademik
    await sql`
      INSERT INTO academic_periods (name, code, year, semester, start_date, end_date, uts_week, uas_week, is_active) 
      VALUES 
        ('Semester Ganjil 2024/2025', '20241', 2024, 1, '2024-09-02', '2025-01-31', 8, 16, true),
        ('Semester Genap 2024/2025', '20242', 2024, 2, '2025-02-03', '2025-06-27', 8, 16, false)
      ON CONFLICT (code) DO NOTHING
    `;

    // Users & Roles (sudah di-update via SQL script)
    // Pastikan data sudah sesuai role baru: super_admin, staff_akademik, staff_keuangan, dosen, mahasiswa

    // Dosen (sudah ada di Neon, tambahkan jika perlu)
    await sql`
      INSERT INTO lecturers (user_id, email, name, phone, photo_url, nidn, expertise, status) 
      SELECT 
        u.id,
        u.email,
        COALESCE(l.name, 'Dr. ' || u.username),
        COALESCE(l.phone, '0812345678'),
        NULL,
        COALESCE(l.nidn, 'NIDN-' || u.id),
        COALESCE(l.expertise, 'Bidang Keahlian'),
        'active'
      FROM users u
      LEFT JOIN lecturers l ON u.id = l.user_id
      WHERE u.role = 'dosen' AND l.user_id IS NULL
      ON CONFLICT (nidn) DO NOTHING
    `;

    // Mahasiswa (sudah ada di Neon, tambahkan jika perlu)
    await sql`
      INSERT INTO students (user_id, email, name, nim, status, year_entry, study_program_id) 
      SELECT 
        u.id,
        u.email,
        COALESCE(s.name, u.username),
        COALESCE(s.nim, '2024' || LPAD(u.id::text, 4, '0')),
        'active',
        2024,
        '00000000-0000-0000-0000-000000000000'::uuid
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.role = 'mahasiswa' AND s.user_id IS NULL
      ON CONFLICT (nim) DO NOTHING
    `;

    // Mata Kuliah
    await sql`
      INSERT INTO courses (code, name, credits, curriculum_id, semester) 
      VALUES 
        ('TI101', 'Pemrograman Dasar', 3, 1, 1),
        ('TI102', 'Algoritma dan Struktur Data', 3, 1, 1),
        ('TI201', 'Basis Data', 3, 1, 2),
        ('TI202', 'Pemrograman Web', 3, 1, 2),
        ('TI301', 'Kecerdasan Buatan', 3, 1, 3),
        ('TI302', 'Rekayasa Perangkat Lunak', 3, 1, 3)
      ON CONFLICT (code) DO NOTHING
    `;

    // Kelas
    await sql`
      INSERT INTO classes (course_id, academic_period_id, class_code, lecturer_id, schedule, max_students) 
      VALUES 
        (1, 1, 'A', 2, '{"day": "Senin", "time": "08:00-10:00", "room": "R301"}', 30),
        (1, 1, 'B', 3, '{"day": "Selasa", "time": "10:00-12:00", "room": "R302"}', 30),
        (2, 1, 'A', 2, '{"day": "Rabu", "time": "08:00-10:00", "room": "R303"}', 30)
      ON CONFLICT (course_id, academic_period_id, class_code) DO NOTHING
    `;

    // Forum Categories
    await sql`
      INSERT INTO forum_categories (name, slug, description, icon) 
      VALUES 
        ('Diskusi Kelas', 'diskusi-kelas', 'Tanya jawab materi kuliah', '📚'),
        ('Tanya Dosen', 'tanya-dosen', 'Konsultasi akademik', '💡'),
        ('Kolaborasi Proyek', 'kolaborasi', 'Diskusi tugas kelompok', '🤝'),
        ('Pengumuman Resmi', 'pengumuman', 'Info dari admin', '📢'),
        ('Ngobrol Santai', 'santai', 'Diskusi bebas', '☕')
      ON CONFLICT (slug) DO NOTHING
    `;

    console.log('✅ Sample data seeded successfully!');
  } catch (error) {
    console.error('❌ Sample data seeding error:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  seedSampleData().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}