// app/api/init-data/route.ts
// ONE-TIME: Tambah data sampel mahasiswa & dosen untuk demo
// Panggil sekali lalu hapus
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: string[] = [];

  try {
    // Get study program IDs
    const programs = await prisma.$queryRawUnsafe(`SELECT id, code FROM study_programs LIMIT 2`) as any[];
    const prodiId = programs[0]?.id || 1;

    // Add sample lecturers (dengan NIDN)
    const lecturers = [
      { name: 'Dr. Ahmad Fauzi', nidn: 'NIDN-0001', expertise: 'Kecerdasan Buatan' },
      { name: 'Dr. Siti Nurhaliza', nidn: 'NIDN-0002', expertise: 'Basis Data' },
      { name: 'Prof. Budi Santoso', nidn: 'NIDN-0003', expertise: 'Jaringan Komputer' },
    ];

    for (const l of lecturers) {
      try {
        const exists = await prisma.$queryRawUnsafe(`SELECT id FROM lecturers WHERE nidn = $1`, l.nidn) as any[];
        if (exists.length === 0) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO lecturers (name, nidn, expertise, status, study_program_id) VALUES ($1, $2, $3, 'active', $4)`,
            l.name, l.nidn, l.expertise, prodiId
          );
          results.push(`👨‍🏫 ${l.name} (${l.nidn})`);
        } else {
          results.push(`⏭️ ${l.nidn} already exists`);
        }
      } catch (e: any) {
        results.push(`⚠️ ${l.nidn}: ${e.message?.slice(0, 80)}`);
      }
    }

    // Add sample students (dengan NIM)
    const students = [
      { name: 'Andi Pratama', nim: '2024001', year: 2024 },
      { name: 'Budi Wijaya', nim: '2024002', year: 2024 },
      { name: 'Citra Kusuma', nim: '2024003', year: 2024 },
      { name: 'Dewi Santoso', nim: '2024004', year: 2024 },
      { name: 'Eko Nugroho', nim: '2024005', year: 2024 },
    ];

    for (const s of students) {
      try {
        const exists = await prisma.$queryRawUnsafe(`SELECT id FROM students WHERE nim = $1`, s.nim) as any[];
        if (exists.length === 0) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO students (name, nim, year_entry, status, study_program_num_id, current_semester) VALUES ($1, $2, $3, 'active', $4, 1)`,
            s.name, s.nim, s.year, prodiId
          );
          results.push(`👨‍🎓 ${s.name} (${s.nim})`);
        } else {
          results.push(`⏭️ ${s.nim} already exists`);
        }
      } catch (e: any) {
        results.push(`⚠️ ${s.nim}: ${e.message?.slice(0, 80)}`);
      }
    }

    results.push('');
    results.push('✅ DATA SIAP!');
    results.push('📋 Mahasiswa bisa aktivasi akun dengan NIM: 2024001 - 2024005');
    results.push('📋 Dosen bisa aktivasi akun dengan NIDN: NIDN-0001 - NIDN-0003');
    results.push('🔗 Registrasi: /auth/register');

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
