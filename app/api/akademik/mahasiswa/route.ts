// app/api/akademik/mahasiswa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['staff_akademik', 'super_admin'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
    }

    // Ambil data mahasiswa
    const mahasiswa = await sql`
      SELECT 
        m.id,
        m.nama,
        m.nim,
        m.email,
        p.nama as program_studi,
        m.semester_aktif as semester,
        m.status,
        m.tanggal_daftar
      FROM mahasiswa m
      LEFT JOIN program_studi p ON m.program_studi_id = p.id
      ORDER BY m.nama
    `;

    // Fallback ke table English
    if (!mahasiswa || mahasiswa.length === 0) {
      const studentsFallback = await sql`
        SELECT 
          s.id,
          s.name as nama,
          s.nim,
          s.email,
          sp.name as program_studi,
          s.current_semester as semester,
          s.status,
          s.created_at as tanggal_daftar
        FROM students s
        LEFT JOIN study_programs sp ON s.study_program_id = sp.id
        ORDER BY s.name
      `;
      return NextResponse.json({ success: true, data: studentsFallback });
    }

    return NextResponse.json({ 
      success: true, 
      data: mahasiswa 
    });
  } catch (error) {
    console.error('Error API Mahasiswa:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Gagal mengambil data mahasiswa' 
    }, { status: 500 });
  }
}