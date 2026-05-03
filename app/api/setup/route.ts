// app/api/setup/route.ts
// Database setup — dynamic import to avoid build-time Prisma issues
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const results: string[] = [];

  try {
    // Dynamic import to avoid build-time issues
    const { prisma } = await import('@/lib/prisma');

    // Test connection
    await prisma.$queryRawUnsafe('SELECT 1');
    results.push('✅ DB connected');

    // Create all tables one by one
    const tables = [
      { name: 'users', sql: `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL, is_active BOOLEAN DEFAULT true, last_login TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ)` },
      { name: 'study_programs', sql: `CREATE TABLE IF NOT EXISTS study_programs (id SERIAL PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL, faculty TEXT, degree_level TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'curricula', sql: `CREATE TABLE IF NOT EXISTS curricula (id SERIAL PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL, study_program_id INT NOT NULL REFERENCES study_programs(id), total_credits INT DEFAULT 144, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), visual_schema_url TEXT, reference_file_url TEXT)` },
      { name: 'grade_scales', sql: `CREATE TABLE IF NOT EXISTS grade_scales (id SERIAL PRIMARY KEY, curriculum_id INT NOT NULL REFERENCES curricula(id), grade_char TEXT NOT NULL, grade_value DECIMAL(3,2) NOT NULL, min_score INT NOT NULL, max_score INT, description TEXT, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'academic_periods', sql: `CREATE TABLE IF NOT EXISTS academic_periods (id SERIAL PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE NOT NULL, year INT NOT NULL, semester INT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, uts_week INT, uas_week INT, is_active BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'students', sql: `CREATE TABLE IF NOT EXISTS students (id SERIAL PRIMARY KEY, user_id INT UNIQUE REFERENCES users(id), email TEXT, name TEXT, nim TEXT UNIQUE NOT NULL, phone TEXT, photo_url TEXT, status TEXT DEFAULT 'active', year_entry INT NOT NULL, study_program_id UUID, created_at TIMESTAMPTZ DEFAULT NOW(), study_program_num_id INT REFERENCES study_programs(id), current_semester INT DEFAULT 1, total_credits INT DEFAULT 0)` },
      { name: 'lecturers', sql: `CREATE TABLE IF NOT EXISTS lecturers (id SERIAL PRIMARY KEY, user_id INT UNIQUE REFERENCES users(id), email TEXT, name TEXT, phone TEXT, photo_url TEXT, nidn TEXT UNIQUE NOT NULL, expertise TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW(), study_program_id INT REFERENCES study_programs(id))` },
      { name: 'courses', sql: `CREATE TABLE IF NOT EXISTS courses (id SERIAL PRIMARY KEY, code TEXT NOT NULL, name TEXT NOT NULL, credits INT NOT NULL, curriculum_id INT REFERENCES curricula(id), theory_credits INT DEFAULT 0, practical_credits INT DEFAULT 0, semester INT, prerequisites TEXT, description TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(code, curriculum_id))` },
      { name: 'classes', sql: `CREATE TABLE IF NOT EXISTS classes (id SERIAL PRIMARY KEY, course_id INT NOT NULL REFERENCES courses(id), academic_period_id INT NOT NULL REFERENCES academic_periods(id), class_code TEXT NOT NULL, lecturer_id INT REFERENCES lecturers(id), schedule JSONB NOT NULL DEFAULT '{}', max_students INT DEFAULT 40, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(course_id, academic_period_id, class_code))` },
      { name: 'lecturer_assignments', sql: `CREATE TABLE IF NOT EXISTS lecturer_assignments (id SERIAL PRIMARY KEY, lecturer_id INT NOT NULL REFERENCES lecturers(id), class_id INT NOT NULL REFERENCES classes(id), assignment_type TEXT NOT NULL, teaching_load INT DEFAULT 0, start_date DATE, end_date DATE, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'student_enrollments', sql: `CREATE TABLE IF NOT EXISTS student_enrollments (id SERIAL PRIMARY KEY, student_id INT NOT NULL REFERENCES students(id), class_id INT NOT NULL REFERENCES classes(id), enrollment_date TIMESTAMPTZ DEFAULT NOW(), status TEXT DEFAULT 'registered', final_score DECIMAL(5,2), final_grade TEXT, UNIQUE(student_id, class_id))` },
      { name: 'evaluation_components', sql: `CREATE TABLE IF NOT EXISTS evaluation_components (id SERIAL PRIMARY KEY, class_id INT NOT NULL REFERENCES classes(id), component_type TEXT NOT NULL, component_name TEXT NOT NULL, weight DECIMAL(5,2) NOT NULL, max_score DECIMAL(5,2) DEFAULT 100, deadline DATE, description TEXT, is_published BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'student_activities', sql: `CREATE TABLE IF NOT EXISTS student_activities (id SERIAL PRIMARY KEY, enrollment_id INT NOT NULL REFERENCES student_enrollments(id), activity_type TEXT NOT NULL, activity_date DATE NOT NULL, score DECIMAL(5,2), max_score DECIMAL(5,2) DEFAULT 100, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'learning_materials', sql: `CREATE TABLE IF NOT EXISTS learning_materials (id SERIAL PRIMARY KEY, class_id INT NOT NULL REFERENCES classes(id), title TEXT NOT NULL, material_type TEXT NOT NULL, file_path TEXT, content TEXT, week_number INT, is_published BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'attendances', sql: `CREATE TABLE IF NOT EXISTS attendances (id SERIAL PRIMARY KEY, class_id INT NOT NULL REFERENCES classes(id), meeting_number INT NOT NULL, meeting_date DATE NOT NULL, attendance_data JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(class_id, meeting_number))` },
      { name: 'payment_evidences', sql: `CREATE TABLE IF NOT EXISTS payment_evidences (id SERIAL PRIMARY KEY, student_id INT NOT NULL REFERENCES students(id), academic_period_id INT NOT NULL REFERENCES academic_periods(id), amount DECIMAL(10,2) NOT NULL, evidence_path TEXT NOT NULL, transfer_date DATE NOT NULL, bank_name TEXT, account_number TEXT, account_name TEXT, status TEXT DEFAULT 'pending', verified_by INT REFERENCES lecturers(id), verified_at TIMESTAMPTZ, notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'invoices', sql: `CREATE TABLE IF NOT EXISTS invoices (id SERIAL PRIMARY KEY, student_id INT NOT NULL REFERENCES students(id), academic_period_id INT NOT NULL REFERENCES academic_periods(id), amount DECIMAL(10,2) NOT NULL, due_date DATE NOT NULL, status TEXT DEFAULT 'unpaid', created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'student_documents', sql: `CREATE TABLE IF NOT EXISTS student_documents (id SERIAL PRIMARY KEY, student_id INT NOT NULL REFERENCES students(id), document_type TEXT NOT NULL, file_path TEXT NOT NULL, file_name TEXT, file_size INT, status TEXT DEFAULT 'pending', verified_by INT REFERENCES lecturers(id), verified_at TIMESTAMPTZ, uploaded_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'lecturer_documents', sql: `CREATE TABLE IF NOT EXISTS lecturer_documents (id SERIAL PRIMARY KEY, lecturer_id INT NOT NULL REFERENCES lecturers(id), document_type TEXT NOT NULL, file_path TEXT NOT NULL, file_name TEXT, status TEXT DEFAULT 'pending', expiration_date DATE, verified BOOLEAN DEFAULT false, uploaded_at TIMESTAMPTZ DEFAULT NOW(), verified_by INT REFERENCES lecturers(id))` },
      { name: 'forum_categories', sql: `CREATE TABLE IF NOT EXISTS forum_categories (id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, icon TEXT, sort_order INT DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'forum_threads', sql: `CREATE TABLE IF NOT EXISTS forum_threads (id SERIAL PRIMARY KEY, category_id INT NOT NULL REFERENCES forum_categories(id), user_id INT NOT NULL REFERENCES users(id), title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, is_pinned BOOLEAN DEFAULT false, is_locked BOOLEAN DEFAULT false, view_count INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'forum_posts', sql: `CREATE TABLE IF NOT EXISTS forum_posts (id SERIAL PRIMARY KEY, thread_id INT NOT NULL REFERENCES forum_threads(id), user_id INT NOT NULL REFERENCES users(id), content TEXT NOT NULL, is_first_post BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ)` },
      { name: 'krs_submissions', sql: `CREATE TABLE IF NOT EXISTS krs_submissions (id SERIAL PRIMARY KEY, mahasiswa_id INT NOT NULL REFERENCES students(id), semester TEXT NOT NULL, courses JSONB NOT NULL DEFAULT '[]', total_credits INT NOT NULL, status TEXT DEFAULT 'pending', notes TEXT, submitted_at TIMESTAMPTZ DEFAULT NOW())` },
      { name: 'activity_logs', sql: `CREATE TABLE IF NOT EXISTS activity_logs (id SERIAL PRIMARY KEY, user_id INT NOT NULL REFERENCES users(id), action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id INT, details TEXT, created_at TIMESTAMPTZ DEFAULT NOW())` },
    ];

    for (const t of tables) {
      try {
        await prisma.$executeRawUnsafe(t.sql);
        results.push(`✅ ${t.name}`);
      } catch (e: any) {
        results.push(`⚠️ ${t.name}: ${e.message?.slice(0, 80)}`);
      }
    }

    // Seed users
    const { default: bcrypt } = await import('bcryptjs');
    const password = process.env.ADMIN_SETUP_PASSWORD || 'alifa123';
    const hash = await bcrypt.hash(password, 12);

    const users = [
      { email: 'superadmin@alifa.ac.id', username: 'superadmin', role: 'super_admin' },
      { email: 'admin@kampus.ac.id', username: 'admin', role: 'staff_akademik' },
      { email: 'finance@kampus.ac.id', username: 'finance', role: 'staff_keuangan' },
      { email: 'dosen@kampus.ac.id', username: 'dosen', role: 'dosen' },
      { email: 'mahasiswa@kampus.ac.id', username: 'mahasiswa', role: 'mahasiswa' },
    ];

    for (const u of users) {
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO users (email, username, password_hash, role, is_active) VALUES ($1, $2, $3, $4, true) ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = $4`,
          u.email, u.username, hash, u.role
        );
        results.push(`👤 ${u.role} created`);
      } catch (e: any) {
        results.push(`⚠️ ${u.role}: ${e.message?.slice(0, 80)}`);
      }
    }

    // Seed study programs
    try {
      await prisma.$executeRawUnsafe(`INSERT INTO study_programs (name, code, faculty, degree_level) VALUES ('Teknik Informatika', 'TI', 'Fakultas Teknik', 'S1'), ('Sistem Informasi', 'SI', 'Fakultas Teknik', 'S1') ON CONFLICT (code) DO NOTHING`);
      results.push('📚 Study programs seeded');
    } catch (e: any) { results.push('⚠️ Prodi: ' + e.message?.slice(0, 80)); }

    // Seed academic period
    try {
      await prisma.$executeRawUnsafe(`INSERT INTO academic_periods (name, code, year, semester, start_date, end_date, uts_week, uas_week, is_active) VALUES ('Semester Ganjil 2024/2025', '20241', 2024, 1, '2024-09-02', '2025-01-31', 8, 16, true) ON CONFLICT (code) DO NOTHING`);
      results.push('📅 Academic period seeded');
    } catch (e: any) { results.push('⚠️ Period: ' + e.message?.slice(0, 80)); }

    // Seed forum categories
    try {
      await prisma.$executeRawUnsafe(`INSERT INTO forum_categories (name, slug, description, icon) VALUES ('Diskusi Kelas', 'diskusi-kelas', 'Tanya jawab materi', '📚'), ('Tanya Dosen', 'tanya-dosen', 'Konsultasi akademik', '💡'), ('Info Kampus', 'info-kampus', 'Pengumuman resmi', '📢'), ('Santai', 'santai', 'Ngobrol bebas', '☕') ON CONFLICT (slug) DO NOTHING`);
      results.push('💬 Forum categories seeded');
    } catch (e: any) { results.push('⚠️ Forum: ' + e.message?.slice(0, 80)); }

    results.push('\n🎉 DATABASE READY!');
    results.push(`🔑 superadmin@alifa.ac.id / ${password}`);
    results.push('⚠️ HAPUS /api/setup SETELAH INI!');

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, results }, { status: 500 });
  }
}
