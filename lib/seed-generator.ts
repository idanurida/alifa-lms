// lib/seed-generator.ts
// Generate realistic demo data untuk ALIFA LMS
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PROGRAM_STUDI = [
  { name: 'Teknik Informatika', code: 'TI', faculty: 'Fakultas Teknik' },
  { name: 'Sistem Informasi', code: 'SI', faculty: 'Fakultas Teknik' },
  { name: 'Manajemen', code: 'MJ', faculty: 'Fakultas Ekonomi' },
];

const DOSEN_NAMES = [
  'Dr. Ahmad Fauzi', 'Prof. Siti Nurhaliza', 'Dr. Budi Santoso', 'Dr. Dewi Lestari',
  'Prof. Eko Prasetyo', 'Dr. Fitri Handayani', 'Dr. Gunawan Wibowo', 'Prof. Haryati Kusuma',
];

const MAHASISWA_PREFIX = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hana',
  'Irfan', 'Joko', 'Kartika', 'Lina', 'Maya', 'Nanda', 'Oki', 'Putri',
  'Rudi', 'Sari', 'Tono', 'Umar', 'Vina', 'Wawan', 'Yanti', 'Zaki',
];

const MATA_KULIAH = [
  { code: 'TI101', name: 'Pemrograman Dasar', credits: 3, semester: 1 },
  { code: 'TI102', name: 'Algoritma & Struktur Data', credits: 3, semester: 1 },
  { code: 'TI103', name: 'Matematika Diskrit', credits: 3, semester: 1 },
  { code: 'TI201', name: 'Basis Data', credits: 4, semester: 2 },
  { code: 'TI202', name: 'Pemrograman Web', credits: 3, semester: 2 },
  { code: 'TI203', name: 'Sistem Operasi', credits: 3, semester: 2 },
  { code: 'TI301', name: 'Kecerdasan Buatan', credits: 4, semester: 3 },
  { code: 'TI302', name: 'Rekayasa Perangkat Lunak', credits: 4, semester: 3 },
  { code: 'TI303', name: 'Jaringan Komputer', credits: 3, semester: 3 },
  { code: 'TI401', name: 'Machine Learning', credits: 4, semester: 4 },
  { code: 'TI402', name: 'Keamanan Siber', credits: 3, semester: 4 },
  { code: 'TI403', name: 'Cloud Computing', credits: 3, semester: 4 },
];

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'alifa123';

export async function generateSeedData() {
  console.log('🌱 Generating realistic demo data...\n');

  // 1. Program Studi
  console.log('📚 Creating Program Studi...');
  const prodiMap: Record<string, number> = {};
  for (const p of PROGRAM_STUDI) {
    const prodi = await prisma.studyProgram.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    prodiMap[p.code] = prodi.id;
  }

  // 2. Kurikulum
  console.log('📋 Creating Kurikulum...');
  const kurikulumMap: Record<string, number> = {};
  for (const [code, id] of Object.entries(prodiMap)) {
    const kur = await prisma.curriculum.upsert({
      where: { code: `KUR-${code}-2024` },
      update: {},
      create: {
        name: `Kurikulum ${code} 2024`,
        code: `KUR-${code}-2024`,
        study_program_id: id,
        total_credits: 144,
        is_active: true,
      },
    });
    kurikulumMap[code] = kur.id;
  }

  // 3. Periode Akademik
  console.log('📅 Creating Academic Periods...');
  await prisma.academicPeriod.upsert({
    where: { code: '20241' },
    update: {},
    create: {
      name: 'Semester Ganjil 2024/2025',
      code: '20241',
      year: 2024,
      semester: 1,
      start_date: new Date('2024-09-02'),
      end_date: new Date('2025-01-31'),
      uts_week: 8,
      uas_week: 16,
      is_active: true,
    },
  });

  // 4. Users + Dosen
  console.log('👨‍🏫 Creating Dosen accounts...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (let i = 0; i < DOSEN_NAMES.length; i++) {
    const name = DOSEN_NAMES[i];
    const username = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 15);
    const email = `dosen${i + 1}@kampus.ac.id`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username,
        password_hash: passwordHash,
        role: 'dosen',
        is_active: true,
      },
    });

    await prisma.lecturer.upsert({
      where: { nidn: `NIDN-${String(i + 1).padStart(4, '0')}` },
      update: {},
      create: {
        user_id: user.id,
        email,
        name,
        nidn: `NIDN-${String(i + 1).padStart(4, '0')}`,
        expertise: ['AI', 'Database', 'Web Dev', 'Networking', 'Security', 'Cloud', 'Mobile', 'Data Science'][i],
        status: 'active',
        study_program_id: prodiMap['TI'],
      },
    });
  }

  // 5. Users + Mahasiswa
  console.log('👨‍🎓 Creating 50 Mahasiswa...');
  for (let i = 0; i < 50; i++) {
    const prefix = MAHASISWA_PREFIX[i % MAHASISWA_PREFIX.length];
    const name = `${prefix} ${['Pratama', 'Wijaya', 'Kusuma', 'Santoso', 'Nugroho', 'Saputra'][i % 6]}`;
    const username = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 15);
    const email = `mhs${i + 1}@kampus.ac.id`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username,
        password_hash: passwordHash,
        role: 'mahasiswa',
        is_active: true,
      },
    });

    await prisma.student.upsert({
      where: { nim: `2024${String(i + 1).padStart(4, '0')}` },
      update: {},
      create: {
        user_id: user.id,
        email,
        name,
        nim: `2024${String(i + 1).padStart(4, '0')}`,
        year_entry: 2024,
        status: 'active',
        study_program_num_id: prodiMap['TI'],
        current_semester: 1,
      },
    });
  }

  // 6. Mata Kuliah
  console.log('📖 Creating Mata Kuliah...');
  for (const mk of MATA_KULIAH) {
    await prisma.course.upsert({
      where: { code_curriculum_id: { code: mk.code, curriculum_id: kurikulumMap['TI'] } },
      update: {},
      create: {
        code: mk.code,
        name: mk.name,
        credits: mk.credits,
        curriculum_id: kurikulumMap['TI'],
        semester: mk.semester,
        is_active: true,
      },
    });
  }

  // 7. Kelas
  console.log('🏫 Creating Classes...');
  const courses = await prisma.course.findMany({ take: 8 });
  const lecturers = await prisma.lecturer.findMany({ take: 8 });
  const period = await prisma.academicPeriod.findFirst({ where: { is_active: true } });

  if (period) {
    for (let i = 0; i < courses.length; i++) {
      await prisma.class.upsert({
        where: {
          course_id_academic_period_id_class_code: {
            course_id: courses[i].id,
            academic_period_id: period.id,
            class_code: String.fromCharCode(65 + (i % 3)),
          },
        },
        update: {},
        create: {
          course_id: courses[i].id,
          academic_period_id: period.id,
          class_code: String.fromCharCode(65 + (i % 3)),
          lecturer_id: lecturers[i % lecturers.length].id,
          schedule: JSON.stringify({
            day: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][i % 5],
            time: '08:00-10:30',
            room: `R30${i + 1}`,
          }),
          max_students: 40,
        },
      });
    }
  }

  // 8. Forum Categories
  console.log('💬 Creating Forum Categories...');
  const categories = [
    { name: 'Diskusi Kelas', slug: 'diskusi-kelas', description: 'Tanya jawab materi kuliah', icon: '📚' },
    { name: 'Tanya Dosen', slug: 'tanya-dosen', description: 'Konsultasi akademik dengan dosen', icon: '💡' },
    { name: 'Info Kampus', slug: 'info-kampus', description: 'Pengumuman dan informasi resmi', icon: '📢' },
    { name: 'Lowongan', slug: 'lowongan', description: 'Info magang dan lowongan kerja', icon: '💼' },
    { name: 'Santai', slug: 'santai', description: 'Ngobrol bebas sesama mahasiswa', icon: '☕' },
  ];

  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('\n✅ Seed data generated successfully!');
  console.log('   Default password:', DEFAULT_PASSWORD);
  console.log('   Login: mahasiswa@kampus.ac.id / dosen@kampus.ac.id');
  console.log('   Total: 8 dosen, 50 mahasiswa, 12 MK, 8 kelas, 5 kategori forum\n');
}

// Run directly
generateSeedData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
