// lib/schema.ts
import { sql } from './db';

export async function createCompleteSchema() {
  console.log('🏗️ Creating complete ALIFA Institute schema...');
  try {
    // 1. KURIKULUM & PROGRAM STUDI
    await sql`
      CREATE TABLE IF NOT EXISTS study_programs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        faculty VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS curricula (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        study_program_id INTEGER REFERENCES study_programs(id),
        total_credits INTEGER DEFAULT 144,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. SKALA NILAI
    await sql`
      CREATE TABLE IF NOT EXISTS grade_scales (
        id SERIAL PRIMARY KEY,
        curriculum_id INTEGER REFERENCES curricula(id),
        grade_char VARCHAR(5) NOT NULL,
        grade_value DECIMAL(3,2) NOT NULL,
        min_score INTEGER NOT NULL,
        max_score INTEGER,
        description VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. PERIODE AKADEMIK
    await sql`
      CREATE TABLE IF NOT EXISTS academic_periods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        year INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        uts_week INTEGER,
        uas_week INTEGER,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 4. USERS (sudah ada, hanya tambahkan constraint)
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'users_role_check'
        ) THEN
          ALTER TABLE users 
          ADD CONSTRAINT users_role_check 
          CHECK (role IN ('super_admin', 'staff_akademik', 'staff_keuangan', 'dosen', 'mahasiswa'));
        END IF;
      END $$;
    `;

    // 5. MAHASISWA (sudah ada, struktur ikuti Neon: name, email, nim, etc)
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        email VARCHAR(255),
        name VARCHAR(255),
        nim VARCHAR(50) UNIQUE,
        phone VARCHAR(20),
        photo_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active',
        year_entry INTEGER NOT NULL,
        study_program_id UUID, -- sesuai struktur Neon
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 6. DOSEN (sudah ada, struktur ikuti Neon)
    await sql`
      CREATE TABLE IF NOT EXISTS lecturers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        email VARCHAR(255),
        name VARCHAR(255),
        phone VARCHAR(20),
        photo_url VARCHAR(500),
        nidn VARCHAR(50) UNIQUE,
        expertise TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 7. MATA KULIAH
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        credits INTEGER NOT NULL,
        curriculum_id INTEGER REFERENCES curricula(id),
        semester INTEGER,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 8. KELAS KULIAH
    await sql`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        academic_period_id INTEGER REFERENCES academic_periods(id),
        class_code VARCHAR(50) NOT NULL,
        lecturer_id INTEGER REFERENCES lecturers(id),
        schedule JSONB NOT NULL,
        max_students INTEGER DEFAULT 40,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(course_id, academic_period_id, class_code)
      )
    `;

    // 9. PENUGASAN DOSEN (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS lecturer_assignments (
        id SERIAL PRIMARY KEY,
        lecturer_id INTEGER REFERENCES lecturers(id),
        class_id INTEGER REFERENCES classes(id),
        assignment_type VARCHAR(100) NOT NULL,
        teaching_load INTEGER DEFAULT 0,
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 10. ENROLLMENT MAHASISWA (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS student_enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        class_id INTEGER REFERENCES classes(id),
        enrollment_date TIMESTAMP DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'registered',
        final_score DECIMAL(5,2),
        final_grade VARCHAR(5),
        UNIQUE(student_id, class_id)
      )
    `;

    // 11. KOMPONEN EVALUASI (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS evaluation_components (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id),
        component_type VARCHAR(100) NOT NULL,
        component_name VARCHAR(255) NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        max_score DECIMAL(5,2) DEFAULT 100,
        deadline DATE,
        description TEXT,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 12. AKTIVITAS & NILAI (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS student_activities (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES student_enrollments(id),
        activity_type VARCHAR(100) NOT NULL,
        activity_date DATE NOT NULL,
        score DECIMAL(5,2),
        max_score DECIMAL(5,2) DEFAULT 100,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 13. MATERI PEMBELAJARAN (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS learning_materials (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id),
        title VARCHAR(255) NOT NULL,
        material_type VARCHAR(50) NOT NULL,
        file_path VARCHAR(500),
        content TEXT,
        week_number INTEGER,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 14. PRESENSI (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS attendances (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id),
        meeting_number INTEGER NOT NULL,
        meeting_date DATE NOT NULL,
        attendance_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(class_id, meeting_number)
      )
    `;

    // 15. BUKTI TRANSFER & PEMBAYARAN (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS payment_evidences (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        academic_period_id INTEGER REFERENCES academic_periods(id),
        amount DECIMAL(10,2) NOT NULL,
        evidence_path VARCHAR(500) NOT NULL,
        transfer_date DATE NOT NULL,
        bank_name VARCHAR(100),
        account_number VARCHAR(100),
        account_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        verified_by INTEGER REFERENCES lecturers(id),
        verified_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 16. INVOICES (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        academic_period_id INTEGER REFERENCES academic_periods(id),
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 17. DOCUMENTS (sudah ada)
    await sql`
      CREATE TABLE IF NOT EXISTS student_documents (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        document_type VARCHAR(100) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        file_size INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        verified_by INTEGER REFERENCES lecturers(id),
        verified_at TIMESTAMP,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lecturer_documents (
        id SERIAL PRIMARY KEY,
        lecturer_id INTEGER REFERENCES lecturers(id),
        document_type VARCHAR(100) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        expiration_date DATE,
        verified BOOLEAN DEFAULT false,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 18. FORUM (baru)
    await sql`
      CREATE TABLE IF NOT EXISTS forum_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS forum_threads (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES forum_categories(id),
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        is_pinned BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER REFERENCES forum_threads(id),
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        is_first_post BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `;

    console.log('✅ Complete schema created/updated!');
  } catch (error) {
    console.error('❌ Schema creation error:', error);
    throw error;
  }
}